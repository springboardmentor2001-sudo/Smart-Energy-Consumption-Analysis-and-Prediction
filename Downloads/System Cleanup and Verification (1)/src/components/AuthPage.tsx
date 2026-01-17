import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { AlertCircle, Ambulance, Building2, User, Heart, Mail, Info } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from '../context/AuthContext';
import { signup } from '../utils/api';
import { SupabaseConnectionBanner } from './SupabaseConnectionBanner';

export const AuthPage: React.FC = () => {
  const { signIn } = useAuth();
  const [activeTab, setActiveTab] = useState('signin');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const [emailForResend, setEmailForResend] = useState('');

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up State
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'patient' | 'hospital' | 'ambulance'>('patient');
  const [hospitalName, setHospitalName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setShowResendConfirmation(false);
    setLoading(true);

    try {
      await signIn(signInEmail, signInPassword);
    } catch (err: any) {
      let errorMessage = err.message || err.error_description || 'Failed to sign in. Please check your credentials.';
      
      // Make error messages more user-friendly
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = "Invalid email or password. Don't have an account? Sign up to get started!";
      } else if (errorMessage.includes('Email not confirmed')) {
        setEmailForResend(signInEmail);
        setShowResendConfirmation(true);
        errorMessage = 'Your account needs to be confirmed. Please check your email or resend the confirmation link below.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const { supabase } = await import('../utils/supabase/client');
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailForResend,
      });
      
      if (error) throw error;
      
      setSuccess('Confirmation email sent! Please check your inbox and spam folder.');
      setShowResendConfirmation(false);
    } catch (err: any) {
      setError(err.message || 'Failed to resend confirmation email');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await signup({
        email: signUpEmail,
        password: signUpPassword,
        role,
        name,
        phone,
        hospitalName: role === 'hospital' ? hospitalName : undefined,
        vehicleNumber: role === 'ambulance' ? vehicleNumber : undefined,
      });

      setSuccess('Account created successfully! You can now sign in.');
      setActiveTab('signin');
      setSignInEmail(signUpEmail);
    } catch (err: any) {
      if (err.message === 'CONFIRMATION_REQUIRED') {
        setSuccess('Account created! Please check your email to confirm your account before signing in.');
        setActiveTab('signin');
        setSignInEmail(signUpEmail);
      } else {
        setError(err.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-600 to-red-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
            <h1 className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-red-600">ResQLink</h1>
          </div>
          <p className="text-gray-600">Smart Emergency Response System</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* Connection Status Banner */}
          <SupabaseConnectionBanner />

          <TabsContent value="signin">
            <Card className="border-pink-100 shadow-xl">
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Sign in to access your dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      required
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-green-200 bg-green-50 text-green-800">
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  {showResendConfirmation && (
                    <div className="space-y-2">
                      <Alert className="border-blue-200 bg-blue-50">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          <div className="space-y-2">
                            <p><strong>To start using ResQLink immediately:</strong></p>
                            <ol className="list-decimal list-inside space-y-1 text-sm">
                              <li>Go to your Supabase Dashboard</li>
                              <li>Navigate to Authentication → Providers</li>
                              <li>Click on Email provider</li>
                              <li>Uncheck "Confirm email"</li>
                              <li>Save and sign up again with a new email</li>
                            </ol>
                            <p className="text-sm mt-2">Or click below to resend the confirmation email:</p>
                          </div>
                        </AlertDescription>
                      </Alert>
                      <Button type="button" className="w-full" variant="outline" onClick={handleResendConfirmation} disabled={loading}>
                        <Mail className="w-4 h-4 mr-2" />
                        {loading ? 'Resending...' : 'Resend Confirmation Email'}
                      </Button>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="border-pink-100 shadow-xl">
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Join the ResQLink network</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <RadioGroup value={role} onValueChange={(v) => setRole(v as any)}>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="patient" id="patient" />
                        <Label htmlFor="patient" className="flex items-center gap-2 cursor-pointer flex-1">
                          <User className="w-4 h-4 text-blue-600" />
                          <div>
                            <div>Patient</div>
                            <div className="text-xs text-gray-500">Request emergency assistance</div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="hospital" id="hospital" />
                        <Label htmlFor="hospital" className="flex items-center gap-2 cursor-pointer flex-1">
                          <Building2 className="w-4 h-4 text-green-600" />
                          <div>
                            <div>Hospital</div>
                            <div className="text-xs text-gray-500">Receive and manage emergencies</div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="ambulance" id="ambulance" />
                        <Label htmlFor="ambulance" className="flex items-center gap-2 cursor-pointer flex-1">
                          <Ambulance className="w-4 h-4 text-red-600" />
                          <div>
                            <div>Ambulance</div>
                            <div className="text-xs text-gray-500">Respond to emergency calls</div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">{role === 'hospital' ? 'Contact Person Name' : 'Full Name'}</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  {role === 'hospital' && (
                    <div className="space-y-2">
                      <Label htmlFor="hospital-name">Hospital Name</Label>
                      <Input
                        id="hospital-name"
                        placeholder="City General Hospital"
                        value={hospitalName}
                        onChange={(e) => setHospitalName(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {role === 'ambulance' && (
                    <div className="space-y-2">
                      <Label htmlFor="vehicle-number">Vehicle Number</Label>
                      <Input
                        id="vehicle-number"
                        placeholder="AMB-1234"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};