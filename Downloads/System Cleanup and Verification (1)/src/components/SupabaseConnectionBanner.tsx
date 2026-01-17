import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, CheckCircle, Database, ExternalLink, Wand2 } from 'lucide-react';
import { Button } from './ui/button';
import { publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';
import { SupabaseSetupWizard } from './SupabaseSetupWizard';

export function SupabaseConnectionBanner() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      // Check if key format is wrong
      if (publicAnonKey.startsWith('sb_publishable_')) {
        setConnectionStatus('error');
        setErrorMessage('Wrong API key type (using publishable key instead of anon key)');
        return;
      }

      // Try a simple query to verify connection
      try {
        const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        
        if (error) {
          setConnectionStatus('error');
          setErrorMessage(error.message);
        } else {
          setConnectionStatus('connected');
        }
      } catch (err) {
        setConnectionStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    checkConnection();
  }, []);

  // Don't show banner if connection is good
  if (connectionStatus === 'connected') {
    return null;
  }

  // Show checking status briefly
  if (connectionStatus === 'checking') {
    return null; // Or show a loading state if needed
  }

  // Show error banner
  return (
    <>
      <Alert className="mb-6 bg-red-50 border-red-200">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <AlertDescription>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Supabase Connection Required
              </div>
              <p className="text-sm text-red-800 mb-3">
                {errorMessage || 'Unable to connect to database'}
              </p>
              <div className="text-xs text-red-700 space-y-1">
                <p><strong>You're using the wrong API key type:</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-0.5">
                  <li>Currently: <code className="bg-red-100 px-1 rounded">sb_publishable_*</code> (Stripe key)</li>
                  <li>Need: <code className="bg-red-100 px-1 rounded">eyJ*</code> (Supabase anon key)</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                onClick={() => setShowWizard(true)}
                className="bg-pink-600 hover:bg-pink-700 text-white whitespace-nowrap"
              >
                <Wand2 className="w-3 h-3 mr-1" />
                Setup Wizard
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open('https://supabase.com/dashboard/project/slwuctsdhqwdjwmyxsjn/settings/api', '_blank')}
                className="whitespace-nowrap border-red-300 text-red-700 hover:bg-red-50"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Get Key
              </Button>
            </div>
          </div>
          <div className="mt-3 p-3 bg-white rounded border border-red-200">
            <p className="text-xs text-red-900">
              💡 <strong>Quick Fix:</strong> Click "Setup Wizard" above for step-by-step instructions to get your anon key from Supabase.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      <SupabaseSetupWizard open={showWizard} onClose={() => setShowWizard(false)} />
    </>
  );
}