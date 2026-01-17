import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PremiumBackground } from './PremiumBackground';
import { EmergencyWorkflow } from './EmergencyWorkflow';
import { NavigationMap } from './NavigationMap';
import { useEmergenciesRealtime } from '../utils/useRealtime';
import {
  getActiveEmergencies,
  getMyEmergencies,
  updateEmergencyStatus,
  updateLocation,
  assignEmergency,
  Emergency,
} from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Navigation, 
  AlertCircle, 
  Wifi, 
  WifiOff, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  CheckCircle 
} from 'lucide-react';
import { notificationService } from '../utils/notifications';

export const AmbulanceDashboard: React.FC = () => {
  const { profile, accessToken, refreshProfile } = useAuth();
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [watchId, setWatchId] = useState<number | null>(null);
  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(null);
  
  // PERSISTENCE: Use localStorage to keep track of the active emergency
  const [activeEmergencyId, setActiveEmergencyId] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && profile?.id) {
      return localStorage.getItem(`ambulance_${profile.id}_active_emergency`);
    }
    return null;
  });
  
  // Save active emergency ID to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && profile?.id) {
      if (activeEmergencyId) {
        localStorage.setItem(`ambulance_${profile.id}_active_emergency`, activeEmergencyId);
      } else {
        localStorage.removeItem(`ambulance_${profile.id}_active_emergency`);
      }
    }
  }, [activeEmergencyId, profile?.id]);

  // Define loadEmergencies function first before using it in hooks
  const loadEmergencies = async () => {
    if (!accessToken) return;
    try {
      console.log('🔄 Loading emergencies for ambulance:', profile?.id);
      
      // Store the current emergency before refreshing (to prevent losing it)
      const currentActiveEmergency = emergencies.find(e => 
        e.ambulanceId === profile?.id && 
        e.status !== 'completed' && 
        e.status !== 'cancelled'
      );
      
      // Fetch both active emergencies (for new requests) AND my emergencies (to keep current ones)
      const [activeResponse, myResponse] = await Promise.all([
        getActiveEmergencies(accessToken),
        getMyEmergencies(accessToken)
      ]);
      
      console.log('📡 Active emergencies response:', activeResponse);
      console.log('📡 My emergencies response:', myResponse);
      
      // Extract arrays and ensure they're valid
      const activeEmergencies = Array.isArray(activeResponse?.emergencies) ? activeResponse.emergencies : [];
      const myEmergencies = Array.isArray(myResponse?.emergencies) ? myResponse.emergencies : [];
      
      // WORKAROUND: Since backend getMyEmergencies has a bug (filters by patientId instead of ambulanceId),
      // we manually filter active emergencies to find ones assigned to us
      const myAssignedEmergencies = activeEmergencies.filter(e => 
        e.ambulanceId === profile?.id && 
        e.status !== 'completed' && 
        e.status !== 'cancelled'
      );
      
      console.log('🔍 WORKAROUND: Found my assigned emergencies from active list:', myAssignedEmergencies.length);
      
      // Combine both lists, removing duplicates by ID
      const emergencyMap = new Map<string, Emergency>();
      
      // Add backend "my emergencies" first (will be empty due to backend bug, but keep for when fixed)
      myEmergencies.forEach(e => emergencyMap.set(e.id, e));
      
      // Add manually filtered "my assigned" emergencies (WORKAROUND)
      myAssignedEmergencies.forEach(e => emergencyMap.set(e.id, e));
      
      // Add other active emergencies (for new requests)
      activeEmergencies.forEach(e => {
        if (!emergencyMap.has(e.id)) {
          emergencyMap.set(e.id, e);
        }
      });
      
      // CRITICAL: If we had an active emergency and it's not in the response, keep it!
      // This prevents losing the emergency when backend filters it out
      if (currentActiveEmergency && !emergencyMap.has(currentActiveEmergency.id)) {
        console.log('🛡️ PRESERVING active emergency that backend didn\'t return:', currentActiveEmergency.id);
        emergencyMap.set(currentActiveEmergency.id, currentActiveEmergency);
      }
      
      const combinedEmergencies = Array.from(emergencyMap.values());
      
      console.log('✅ Combined emergencies:', combinedEmergencies);
      console.log('🚑 My active emergency:', combinedEmergencies.find(e => 
        e.ambulanceId === profile?.id && 
        e.status !== 'completed' && 
        e.status !== 'cancelled'
      ));
      
      setEmergencies(combinedEmergencies);
      
      console.log('Loaded emergencies:', combinedEmergencies.length);
      console.log('My ambulance ID:', profile?.id);
    } catch (err: any) {
      console.error('❌ Error loading emergencies:', err);
      // Silently handle auth errors - user might need to re-login
      if (err.message?.includes('Unauthorized') || err.message?.includes('401')) {
        // Don't show error to user, just skip loading
        return;
      }
      console.error('Error loading emergencies:', err);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      // Initial position
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(newLocation);
          setLocationError('');
          console.log('✅ Got real location:', newLocation);

          // Update location in backend
          if (accessToken) {
            try {
              await updateLocation(newLocation, accessToken);
            } catch (err) {
              console.error('Error updating location:', err);
            }
          }
        },
        (error) => {
          // Silently use demo location without showing errors
          // This is expected behavior in environments like Figma Make
          const demoLocation = { latitude: 40.7128, longitude: -74.0060 };
          setLocation(demoLocation);
          setLocationError(''); // No error - demo mode is normal
          console.log('📍 Using demo location (New York):', demoLocation);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );

      // Watch position for continuous updates
      const id = navigator.geolocation.watchPosition(
        async (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(newLocation);
          setLocationError('');

          // Update location in backend
          if (accessToken) {
            try {
              await updateLocation(newLocation, accessToken);
            } catch (err) {
              console.error('Error updating location:', err);
            }
          }
        },
        () => {
          // Silently handle watch position errors
          // The initial position is already set and will be used
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 15000
        }
      );
      setWatchId(id);
    } else {
      // Browser doesn't support geolocation - use demo location
      const demoLocation = { latitude: 40.7128, longitude: -74.0060 };
      setLocation(demoLocation);
      setLocationError('');
      console.log('📍 Using demo location (browser does not support geolocation):', demoLocation);
    }
  };

  // Real-time updates for emergencies
  const { isConnected, error: realtimeError } = useEmergenciesRealtime(
    loadEmergencies,
    'ambulance',
    profile?.id
  );

  // Request notification permissions on mount
  useEffect(() => {
    // Request notification permission
    notificationService.requestPermission().then((granted) => {
      if (granted) {
        console.log('✅ Notification permission granted');
      } else {
        console.log('❌ Notification permission denied');
      }
    });
  }, []);

  // Monitor for new emergencies and send notifications
  useEffect(() => {
    // Only check if we have emergencies loaded
    if (emergencies.length === 0 || !profile?.id) return;

    const pendingEmergencies = emergencies.filter(
      (e) => e.status === 'pending' && !e.ambulanceId
    );

    // Store last count to detect new emergencies
    const lastCountKey = `ambulance_${profile.id}_last_emergency_count`;
    const lastCount = parseInt(localStorage.getItem(lastCountKey) || '0');

    if (pendingEmergencies.length > lastCount) {
      // New emergency detected!
      const newEmergencies = pendingEmergencies.slice(lastCount);
      
      newEmergencies.forEach((emergency) => {
        // Calculate distance if location is available
        let distance = 'Unknown distance';
        if (location) {
          const dist = calculateDistance(
            location.latitude,
            location.longitude,
            emergency.latitude,
            emergency.longitude
          );
          distance = `${dist.toFixed(2)} km away`;
        }

        // Send browser notification
        notificationService.sendAssignmentNotification(
          emergency.patientName,
          distance
        );

        console.log('🔔 NOTIFICATION SENT!');
        console.log('  Emergency:', emergency.id);
        console.log('  Patient:', emergency.patientName);
        console.log('  Distance:', distance);
      });
    }

    // Update stored count
    localStorage.setItem(lastCountKey, pendingEmergencies.length.toString());
  }, [emergencies, location, profile?.id]);

  useEffect(() => {
    getLocation();
    // Initial load is handled by useRealtime hook
    
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const handleStatusUpdate = async (emergencyId: string, status: Emergency['status']) => {
    if (!accessToken) return;
    setLoading(true);
    
    console.log('\n\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🚑 AMBULANCE STATUS UPDATE TRIGGERED');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Emergency ID:', emergencyId);
    console.log('New Status:', status);
    console.log('Current emergencies in state:', emergencies.length);
    
    // Store the current emergency before updating
    const currentEmergency = emergencies.find(e => e.id === emergencyId);
    console.log('📦 Current emergency object:', currentEmergency);
    
    try {
      // Optimistic update - immediately update local state
      setEmergencies(prev => {
        const updated = prev.map(e => 
          e.id === emergencyId ? { ...e, status } : e
        );
        console.log('✅ Optimistic update applied - new state:', updated);
        return updated;
      });

      const response = await updateEmergencyStatus(emergencyId, { status }, accessToken);
      console.log('📤 Backend status update response:', response);
      
      // Show success toast based on status
      const statusMessages: Record<string, string> = {
        'enroute': '🚑 Started journey to patient!',
        'enroute_to_hospital': '🏥 Patient picked up - heading to hospital!',
        'completed': '✓ Emergency completed successfully!'
      };
      
      toast.success(statusMessages[status] || 'Status updated');
      
      console.log('🔄 Now refreshing emergencies from server...');
      console.log('⚠️ PRESERVING CURRENT EMERGENCY DURING REFRESH');
      
      // CRITICAL: Store the updated emergency BEFORE refresh
      const updatedEmergency = { ...currentEmergency, status } as Emergency;
      
      // Refresh emergencies from server
      await loadEmergencies();
      
      // CRITICAL FIX: Wait a bit then check if emergency is still there
      setTimeout(() => {
        setEmergencies(prev => {
          const stillExists = prev.some(e => e.id === emergencyId);
          console.log('🔍 After refresh - emergency still exists?', stillExists);
          console.log('🔍 Current emergencies count:', prev.length);
          console.log('🔍 Current emergencies:', prev.map(e => ({ id: e.id, status: e.status, ambulanceId: e.ambulanceId })));
          
          if (!stillExists) {
            console.log('');
            console.log('⚠️⚠️⚠️ CRITICAL: Emergency disappeared after refresh! ⚠️⚠️⚠️');
            console.log('🛡️ RESTORING EMERGENCY TO STATE');
            console.log('Emergency that will be restored:', updatedEmergency);
            console.log('');
            // Restore with updated status
            return [...prev, updatedEmergency];
          }
          console.log('✅ Emergency persisted correctly');
          return prev;
        });
      }, 200);
      
      console.log('═══════════════════════════════════════════════════════════');
      console.log('✅ STATUS UPDATE COMPLETE');
      console.log('═══════════════════════════════════════════════════════════\n\n');
      
    } catch (err: any) {
      console.error('❌❌❌ ERROR UPDATING STATUS ❌❌❌');
      console.error(err);
      toast.error('Failed to update status: ' + err.message);
      // Revert optimistic update on error
      await loadEmergencies();
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (emergencyId: string) => {
    if (!accessToken || !profile?.id) return;
    setLoading(true);
    try {
      await assignEmergency(
        emergencyId,
        { 
          ambulanceId: profile.id,
          estimatedTime: 15
        },
        accessToken
      );
      toast.success('Emergency accepted! Navigate to patient location.');
      await loadEmergencies();
      await refreshProfile();
    } catch (err: any) {
      console.error('Error accepting emergency:', err);
      toast.error('Failed to accept emergency: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const myActiveEmergency = emergencies.find(
    (e) =>
      e.ambulanceId === profile?.id &&
      e.status !== 'completed' &&
      e.status !== 'cancelled'
  );

  // TEST MODE: Add button to create a test emergency for development
  const createTestEmergency = () => {
    const testEmergency = {
      id: crypto.randomUUID(),
      patientId: 'test-patient-' + Date.now(),
      patientName: 'John Doe (Test Patient)',
      patientPhone: '+1234567890',
      patientEmail: 'test@patient.com',
      latitude: 40.7580, // Times Square, NYC
      longitude: -73.9855,
      description: 'Test emergency - chest pain and difficulty breathing',
      status: 'pending',
      priority: 'urgent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existingEmergencies = JSON.parse(localStorage.getItem('emergencies') || '[]');
    existingEmergencies.push(testEmergency);
    localStorage.setItem('emergencies', JSON.stringify(existingEmergencies));
    
    console.log('🆕 TEST EMERGENCY CREATED!');
    console.log('Emergency ID:', testEmergency.id);
    console.log('Total emergencies in storage:', existingEmergencies.length);
    console.log('Full emergency object:', testEmergency);
    
    toast.success('✅ Test emergency created!');
    
    // Force immediate reload
    setTimeout(() => {
      loadEmergencies();
    }, 100);
  };

  // Manual refresh function
  const handleManualRefresh = () => {
    toast.info('🔄 Refreshing emergencies...');
    loadEmergencies();
  };

  const availableEmergencies = emergencies.filter(
    (e) => e.status === 'pending' && !e.ambulanceId
  );
  
  // Debug logging - enhanced to track patient_loaded status
  useEffect(() => {
    if (emergencies.length > 0) {
      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🚑 AMBULANCE DASHBOARD STATE DEBUG');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('Total emergencies loaded:', emergencies.length);
      console.log('My ambulance ID:', profile?.id);
      console.log('My ambulance vehicle:', profile?.vehicleNumber);
      
      const myActiveEmergency = emergencies.find(e => 
        e.ambulanceId === profile?.id && 
        e.status !== 'completed' && 
        e.status !== 'cancelled'
      );
      
      console.log('My active emergency:', myActiveEmergency);
      
      if (myActiveEmergency) {
        console.log('');
        console.log('📋 EMERGENCY DETAILS:');
        console.log('  - ID:', myActiveEmergency.id);
        console.log('  - Status:', myActiveEmergency.status);
        console.log('  - Patient:', myActiveEmergency.patientName);
        console.log('  - Awaiting confirmation?', myActiveEmergency.awaitingPatientConfirmation);
        console.log('  - Hospital assigned?', !!myActiveEmergency.hospital);
        console.log('');
        
        if (myActiveEmergency.status === 'patient_loaded') {
          console.log('🎯🎯🎯 PATIENT LOADED STATUS DETECTED! 🎯🎯🎯');
          console.log('The patient has confirmed arrival.');
          console.log('You should now see the "Start Journey to Hospital" button.');
          console.log('');
        }
        
        if (myActiveEmergency.status === 'arrived_at_scene' && myActiveEmergency.awaitingPatientConfirmation) {
          console.log('⏳ WAITING FOR PATIENT CONFIRMATION');
          console.log('Status: arrived_at_scene');
          console.log('Patient needs to confirm ambulance arrival.');
          console.log('');
        }
        
        if (myActiveEmergency.status === 'enroute_to_hospital') {
          console.log('🏥 EN ROUTE TO HOSPITAL');
          console.log('Status: enroute_to_hospital');
          console.log('Navigation should show route to hospital.');
          console.log('');
        }
      } else {
        console.log('❌ No active emergency found for this ambulance');
      }
      
      console.log('Available emergencies (unassigned):', availableEmergencies.length);
      console.log('All emergencies:', emergencies.map(e => ({
        id: e.id.substring(0, 20) + '...',
        status: e.status,
        ambulanceId: e.ambulanceId?.substring(0, 15) + '...',
        isMyEmergency: e.ambulanceId === profile?.id,
        awaitingConfirmation: e.awaitingPatientConfirmation,
        hasHospital: !!e.hospital
      })));
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
    } else {
      console.log('ℹ️ No emergencies loaded yet');
    }
  }, [emergencies, profile?.id, myActiveEmergency, availableEmergencies]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <PremiumBackground variant="ambulance">
      <div className="p-6 space-y-6 animate-slide-in-up">
        {/* Premium Welcome Header with Glassmorphism */}
        <div className="glass-card-strong rounded-3xl p-8 text-gray-900 dark:text-white shadow-premium-lg hover-lift overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-full filter blur-3xl -mr-32 -mt-32" />
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-4xl mb-2">
                  <span className="text-gradient-blue">Ambulance Unit: {profile?.vehicleNumber}</span>
                </h2>
                <p className="text-gray-600 dark:text-gray-300">Driver: {profile?.name}</p>
              </div>
              <div className="flex gap-2">
                {/* Manual Refresh Button */}
                <Button 
                  onClick={handleManualRefresh}
                  variant="outline"
                  size="sm"
                  className="bg-white/80 hover:bg-white border-gray-300"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                
                {/* Real-time Connection Indicator */}
                <Badge 
                  className={
                    isConnected 
                      ? 'bg-green-100 text-green-800 border-green-300 flex items-center gap-1.5' 
                      : 'bg-red-100 text-red-800 border-red-300 flex items-center gap-1.5'
                  }
                >
                  {isConnected ? (
                    <>
                      <Wifi className="w-3 h-3" />
                      <span>Live Updates</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3" />
                      <span>Offline</span>
                    </>
                  )}
                </Badge>
              </div>
            </div>
            
            {/* Real-time Error Display */}
            {realtimeError && !isConnected && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Real-time connection error:</strong> {realtimeError}
                  <br />
                  <span className="text-xs">The app will poll for updates every 10 seconds as a fallback.</span>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-blue-600" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Availability:</span>
              <Badge
                className={
                  profile?.status === 'available'
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-red-100 text-red-800 border-red-200'
                }
              >
                {profile?.status?.toUpperCase() || 'UNKNOWN'}
              </Badge>
            </div>

            {locationError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{locationError}</AlertDescription>
              </Alert>
            ) : location ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Current Location:</span>
                </p>
                <p className="text-sm text-gray-600">
                  Lat: {location.latitude.toFixed(6)}, Lon: {location.longitude.toFixed(6)}
                </p>
                <Button variant="outline" size="sm" onClick={getLocation}>
                  <Navigation className="w-4 h-4 mr-2" />
                  Refresh Location
                </Button>
              </div>
            ) : (
              <p className="text-gray-600">Getting your location...</p>
            )}
          </CardContent>
        </Card>

        {/* Active Assignment */}
        {myActiveEmergency && (
          <>
            {/* Emergency Workflow */}
            <EmergencyWorkflow
              emergency={myActiveEmergency}
              onStatusUpdate={async (status) => {
                await handleStatusUpdate(myActiveEmergency.id, status);
              }}
              currentLocation={location || undefined}
              accessToken={accessToken}
              onEmergencyUpdate={loadEmergencies}
            />

            {/* Navigation Map - Show route to patient or hospital based on status */}
            {location && (
              <>
                {/* Navigate to Patient (stages 1, 2 & 3: assigned, enroute, arrived_at_scene) */}
                {['assigned', 'enroute', 'arrived_at_scene'].includes(myActiveEmergency.status) && (
                  <NavigationMap
                    from={{
                      lat: location.latitude,
                      lng: location.longitude,
                      label: `Ambulance ${profile?.vehicleNumber}`
                    }}
                    to={{
                      lat: myActiveEmergency.latitude,
                      lng: myActiveEmergency.longitude,
                      label: `Patient: ${myActiveEmergency.patientName}`
                    }}
                    destinationType="patient"
                  />
                )}

                {/* Navigate to Hospital (stages 4 & 5: patient_loaded, enroute_to_hospital, arrived_at_hospital) */}
                {['patient_loaded', 'enroute_to_hospital', 'arrived_at_hospital'].includes(myActiveEmergency.status) && myActiveEmergency.hospital && (
                  <NavigationMap
                    from={{
                      lat: location.latitude,
                      lng: location.longitude,
                      label: `Ambulance ${profile?.vehicleNumber}`
                    }}
                    to={{
                      lat: myActiveEmergency.hospital.latitude,
                      lng: myActiveEmergency.hospital.longitude,
                      label: myActiveEmergency.hospital.name
                    }}
                    destinationType="hospital"
                  />
                )}
              </>
            )}
          </>
        )}

        {/* Available Emergency Requests */}
        {!myActiveEmergency && availableEmergencies.length > 0 && (
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-orange-700 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 animate-pulse" />
                🚨 Incoming Emergency Requests ({availableEmergencies.length})
              </CardTitle>
              <CardDescription className="text-orange-600">
                Accept a request to start responding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableEmergencies.map((emergency) => (
                <div
                  key={emergency.id}
                  className="bg-white rounded-lg p-4 border-2 border-orange-200 hover:border-orange-400 transition-all shadow-md hover:shadow-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-500 text-white animate-pulse">
                          🆘 EMERGENCY REQUEST
                        </Badge>
                        <Badge variant="outline" className="border-gray-300">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(emergency.createdAt).toLocaleTimeString()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="space-y-1">
                          <p className="flex items-center gap-2 text-gray-700">
                            <User className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">Patient:</span> {emergency.patientName}
                          </p>
                          <p className="flex items-center gap-2 text-gray-700">
                            <Phone className="w-4 h-4 text-green-600" />
                            <span className="font-medium">Contact:</span> {emergency.patientPhone}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="flex items-center gap-2 text-gray-700">
                            <MapPin className="w-4 h-4 text-red-600" />
                            <span className="font-medium">Location:</span>
                          </p>
                          <p className="text-xs text-gray-600 font-mono">
                            Lat: {emergency.latitude.toFixed(4)}<br />
                            Lon: {emergency.longitude.toFixed(4)}
                          </p>
                        </div>
                      </div>

                      {emergency.description && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Details:</span> {emergency.description}
                          </p>
                        </div>
                      )}

                      {location && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-2">
                          <p className="text-sm text-blue-900 font-medium">
                            📍 Distance from you: {calculateDistance(
                              location.latitude,
                              location.longitude,
                              emergency.latitude,
                              emergency.longitude
                            ).toFixed(2)} km
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <Button
                      onClick={() => handleAccept(emergency.id)}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
                      size="lg"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      ✅ Accept & Respond
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {!myActiveEmergency && availableEmergencies.length === 0 && (
          <Card className="border-gray-200">
            <CardContent className="py-8 text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600">No emergency requests at the moment</p>
              <p className="text-sm text-gray-500 mt-2">You'll be notified when a new emergency is reported</p>
              
              {/* DEV MODE: Test Emergency Button */}
              <div className="pt-4 border-t mt-4">
                <p className="text-xs text-gray-400 mb-3">🛠️ Development Mode</p>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={createTestEmergency}
                    variant="outline"
                    size="sm"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    + Create Test Emergency
                  </Button>
                  <Button
                    onClick={() => {
                      const emergencies = JSON.parse(localStorage.getItem('emergencies') || '[]');
                      console.log('');
                      console.log('═══════════════════════════════════════════════════════════');
                      console.log('🗄️ LOCALSTORAGE VIEWER');
                      console.log('═══════════════════════════════════════════════════════════');
                      console.log('Total emergencies in storage:', emergencies.length);
                      console.log('');
                      emergencies.forEach((e: any, i: number) => {
                        console.log(`Emergency #${i + 1}:`);
                        console.log('  ID:', e.id);
                        console.log('  Status:', e.status);
                        console.log('  Patient:', e.patientName);
                        console.log('  Ambulance ID:', e.ambulanceId || 'UNASSIGNED');
                        console.log('  Created:', e.createdAt);
                        console.log('');
                      });
                      console.log('═══════════════════════════════════════════════════════════');
                      console.log('');
                      toast.info(`Found ${emergencies.length} emergencies in storage. Check console!`);
                    }}
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    📊 View Storage
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Create test emergencies or view localStorage content
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>• Your location is automatically tracked and updated</p>
            <p>• Hospitals will assign emergencies to available ambulances</p>
            <p>• Update status as you respond to emergencies</p>
            <p>• Contact emergency dispatch: 911</p>
          </CardContent>
        </Card>
      </div>
    </PremiumBackground>
  );
};