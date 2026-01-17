import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { User } from '../utils/api';

interface AuthContextType {
  user: any | null;
  profile: User | null;
  accessToken: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (token: string) => {
    try {
      // Use user metadata directly (no edge function needed)
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user?.user_metadata) {
        setProfile({
          id: user.id,
          email: user.email!,
          name: user.user_metadata.name,
          role: user.user_metadata.role,
          phone: user.user_metadata.phone,
          hospitalName: user.user_metadata.hospitalName,
          vehicleNumber: user.user_metadata.vehicleNumber,
          status: user.user_metadata.role === 'ambulance' ? 'available' : 'active',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (session && !error) {
        setUser(session.user);
        setAccessToken(session.access_token);
        await fetchProfile(session.access_token);
        return session.access_token;
      } else {
        // Refresh failed, sign out
        await signOut();
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      await signOut();
    }
    return null;
  };

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session && !error) {
        setUser(session.user);
        setAccessToken(session.access_token);
        await fetchProfile(session.access_token);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        setAccessToken(session?.access_token ?? null);
        if (session?.access_token) {
          await fetchProfile(session.access_token);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to sign in');
      }
      
      if (!data.session) {
        throw new Error('No session returned. Please check your credentials.');
      }
      
      if (data.session) {
        setUser(data.user);
        setAccessToken(data.session.access_token);
        await fetchProfile(data.session.access_token);
      }
    } catch (error: any) {
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setAccessToken(null);
  };

  const refreshProfile = async () => {
    if (accessToken) {
      await fetchProfile(accessToken);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, accessToken, loading, signIn, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};