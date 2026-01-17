import { useEffect, useRef, useState } from 'react';
import { supabase } from './supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { USE_REALTIME } from './supabaseConfig';

/**
 * Hook specifically for emergencies table with role-based filtering
 */
export const useEmergenciesRealtime = (
  refreshCallback: () => Promise<void>,
  role?: 'patient' | 'hospital' | 'ambulance',
  userId?: string
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    mountedRef.current = true;
    setError(null);

    // Initial load
    refreshCallback().catch(err => {
      console.error('❌ Initial data load failed:', err);
      if (err.message?.includes('fetch')) {
        console.error('');
        console.error('═══════════════════════════════════════════════');
        console.error('🔴 SUPABASE CONNECTION ERROR');
        console.error('═══════════════════════════════════════════════');
        console.error('Possible causes:');
        console.error('  1. Wrong API key (check /utils/supabase/info.tsx)');
        console.error('  2. Supabase project is paused');
        console.error('  3. Network connection issue');
        console.error('');
        console.error('👉 See /SUPABASE_KEY_FIX.md for detailed instructions');
        console.error('═══════════════════════════════════════════════');
        console.error('');
      }
    });

    // 🔴 REALTIME PAUSED - Skip subscription if disabled
    if (!USE_REALTIME) {
      console.log('⏸️  Emergency real-time PAUSED - Using polling fallback');
      // Use polling as fallback
      const interval = setInterval(() => {
        if (mountedRef.current) {
          refreshCallback();
        }
      }, 5000);

      return () => {
        mountedRef.current = false;
        clearInterval(interval);
      };
    }

    // Setup real-time subscription with retry logic
    const setupRealtime = () => {
      try {
        const channelName = `emergencies:${role}:${userId}:${Date.now()}`;
        console.log('🔌 Setting up real-time channel:', channelName);
        
        const channel = supabase.channel(channelName, {
          config: {
            broadcast: { self: false },
            presence: { key: userId || 'anonymous' },
          },
        });

        // Subscribe to all emergency changes
        channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'emergencies',
          },
          (payload) => {
            console.log('');
            console.log('🚨 EMERGENCY UPDATE DETECTED!');
            console.log('═══════════════════════════════════════');
            console.log('📊 Event:', payload.eventType);
            console.log('🆔 Emergency ID:', payload.new?.id || payload.old?.id);
            console.log('📦 Status:', payload.new?.status || payload.old?.status);
            console.log('═══════════════════════════════════════');
            console.log('');

            // Check if this update is relevant to current user
            let shouldRefresh = false;

            if (payload.eventType === 'INSERT') {
              // New emergency - relevant for hospitals and ambulances
              if (role === 'hospital' || role === 'ambulance') {
                shouldRefresh = true;
              }
              // For patients, only if it's their emergency
              if (role === 'patient' && payload.new.patient_id === userId) {
                shouldRefresh = true;
              }
            } else if (payload.eventType === 'UPDATE') {
              // Update - check if it's relevant to this user
              if (role === 'patient' && payload.new.patient_id === userId) {
                shouldRefresh = true;
              } else if (role === 'ambulance' && (payload.new.ambulance_id === userId || payload.new.status === 'pending')) {
                shouldRefresh = true;
              } else if (role === 'hospital') {
                shouldRefresh = true;
              }
            } else if (payload.eventType === 'DELETE') {
              // Deletion - refresh for all
              shouldRefresh = true;
            }

            if (shouldRefresh && mountedRef.current) {
              console.log('♻️  Refreshing emergency list...');
              refreshCallback();
            } else {
              console.log('⏭️  Update not relevant to current user, skipping refresh');
            }
          }
        );

        // Subscribe and track connection status
        channel.subscribe((status, err) => {
          console.log('📡 Real-time subscription status:', status);
          
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
            setError(null);
            retryCountRef.current = 0;
            console.log('✅ Real-time emergency subscription active');
            console.log('   Role:', role);
            console.log('   User ID:', userId);
          } else if (status === 'CHANNEL_ERROR') {
            setIsConnected(false);
            const errorMsg = err?.message || 'Channel connection error';
            console.warn('');
            console.warn('⚠️  Real-time channel error:', errorMsg);
            console.warn('   This is normal if real-time is not enabled in Supabase yet');
            console.warn('   Error details:', err);
            console.warn('   → Run: ALTER PUBLICATION supabase_realtime ADD TABLE emergencies;');
            console.warn('');
            
            // Don't retry on channel errors - fall back to polling immediately
            console.log('🔄 Falling back to polling mode (10s interval)');
            setIsConnected(false); // Mark as not connected but don't show errors
            setError(null); // Clear error to avoid alarming users
            
            // Fallback to polling
            const interval = setInterval(() => {
              if (mountedRef.current) {
                refreshCallback();
              }
            }, 10000);
            
            // Store interval for cleanup
            (channelRef as any).pollInterval = interval;
          } else if (status === 'TIMED_OUT') {
            setIsConnected(false);
            setError('Connection timed out');
            console.error('⏱️  Real-time connection timed out');
          } else if (status === 'CLOSED') {
            setIsConnected(false);
            console.log('🔌 Real-time connection closed');
          }
        });

        channelRef.current = channel;
      } catch (error) {
        console.error('❌ Failed to setup real-time subscription:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        setIsConnected(false);
      }
    };

    setupRealtime();

    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
      if (channelRef.current) {
        // Clear polling interval if it exists
        if ((channelRef as any).pollInterval) {
          clearInterval((channelRef as any).pollInterval);
        }
        supabase.removeChannel(channelRef.current);
        console.log('🔌 Unsubscribed from emergency real-time updates');
      }
    };
  }, [role, userId]);

  return { isConnected, error };
};
