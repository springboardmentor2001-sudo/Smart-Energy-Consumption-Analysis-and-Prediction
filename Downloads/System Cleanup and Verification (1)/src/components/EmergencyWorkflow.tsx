import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, MapPin, Building2, CheckCircle, Navigation as NavigationIcon } from 'lucide-react';
import { Emergency } from '../utils/api';
import { TimeoutAdvanceButton } from './TimeoutAdvanceButton';

interface EmergencyWorkflowProps {
  emergency: Emergency;
  onStatusUpdate: (status: Emergency['status']) => void;
  currentLocation?: { latitude: number; longitude: number };
  accessToken?: string;
  onEmergencyUpdate?: () => void;
}

export const EmergencyWorkflow: React.FC<EmergencyWorkflowProps> = ({
  emergency,
  onStatusUpdate,
  currentLocation,
  accessToken,
  onEmergencyUpdate,
}) => {
  console.log('');
  console.log('🚨🚨🚨 EMERGENCY WORKFLOW COMPONENT RENDERING 🚨🚨🚨');
  console.log('Emergency object:', emergency);
  console.log('Emergency ID:', emergency?.id);
  console.log('Emergency Status:', emergency?.status);
  console.log('Emergency awaiting confirmation:', emergency?.awaitingPatientConfirmation);
  console.log('Current Location:', currentLocation);
  console.log('Has Access Token:', !!accessToken);
  console.log('');

  // Debug logging for timeline
  React.useEffect(() => {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 WORKFLOW TIMELINE DEBUG');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Current Emergency Status:', `"${emergency.status}"`);
    console.log('Status Type:', typeof emergency.status);
    console.log('Awaiting Patient Confirmation?', emergency.awaitingPatientConfirmation);
    console.log('Emergency ID:', emergency.id);
    
    const statusOrder = ['assigned', 'enroute', 'arrived_at_scene', 'patient_loaded', 'enroute_to_hospital', 'arrived_at_hospital', 'completed'];
    const currentIndex = statusOrder.indexOf(emergency.status);
    
    console.log('');
    console.log('Timeline Position:', currentIndex + 1, 'of', statusOrder.length);
    console.log('Current Index in Array:', currentIndex);
    console.log('');
    console.log('Timeline Stages Analysis:');
    console.log('');
    statusOrder.forEach((status, index) => {
      const isCompleted = currentIndex > index;
      const isCurrent = emergency.status === status;
      const state = isCompleted ? '✅ COMPLETED' : isCurrent ? '🔵 CURRENT' : '⚪ PENDING';
      const visual = isCompleted ? '[●✓●]' : isCurrent ? '[●→●]' : '[ ○ ]';
      console.log(`  ${visual} Stage ${index + 1}. ${status.padEnd(25)} ${state}`);
      if (isCurrent) {
        console.log(`       ↑ YOU ARE HERE (Index: ${index}, Current Index: ${currentIndex})`);
      }
    });
    console.log('');
    console.log('Visual Timeline:');
    const timeline = statusOrder.map((status, index) => {
      const isCompleted = currentIndex > index;
      const isCurrent = emergency.status === status;
      if (isCompleted) return '✅';
      if (isCurrent) return '🔵';
      return '⚪';
    }).join(' → ');
    console.log(`  ${timeline}`);
    console.log('');
    console.log('Expected UI State:');
    console.log(`  - Stages 1-${currentIndex}: Should show GREEN circle with ✓`);
    console.log(`  - Stage ${currentIndex + 1}: Should show BLUE pulsing circle with emoji`);
    console.log(`  - Stages ${currentIndex + 2}-7: Should show GRAY circle with emoji`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
  }, [emergency.status, emergency.awaitingPatientConfirmation, emergency.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'assigned':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'enroute':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'arrived_at_scene':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'patient_loaded':
      case 'enroute_to_hospital':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'arrived_at_hospital':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getNextStatus = (): { status: Emergency['status']; label: string; icon: React.ReactNode } | null => {
    switch (emergency.status) {
      case 'assigned':
        return { 
          status: 'enroute', 
          label: '🚑 Start Journey to Patient', 
          icon: <NavigationIcon className="w-4 h-4" /> 
        };
      case 'enroute':
        return { 
          status: 'arrived_at_scene', 
          label: '📍 Arrived at Patient Location', 
          icon: <MapPin className="w-4 h-4" /> 
        };
      case 'patient_loaded':
        return { 
          status: 'enroute_to_hospital', 
          label: '🏥 Start Journey to Hospital', 
          icon: <Building2 className="w-4 h-4" /> 
        };
      case 'enroute_to_hospital':
        return { 
          status: 'arrived_at_hospital', 
          label: '🏥 Arrived at Hospital', 
          icon: <CheckCircle className="w-4 h-4" /> 
        };
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus();

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
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
    <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-red-50 shadow-premium-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-gradient-red">🚨 Active Emergency</span>
          <Badge className={getStatusColor(emergency.status)}>
            {emergency.status.toUpperCase().replace('_', ' ')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Patient Info */}
        <div className="bg-white rounded-lg p-4 border-2 border-gray-200 space-y-2">
          <h3 className="font-medium text-gray-900">Patient Information</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-600">Name:</p>
              <p className="font-medium">{emergency.patientName}</p>
            </div>
            <div>
              <p className="text-gray-600">Phone:</p>
              <p className="font-medium">{emergency.patientPhone}</p>
            </div>
          </div>
          {emergency.description && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-gray-700">
                <strong>Details:</strong> {emergency.description}
              </p>
            </div>
          )}
        </div>

        {/* Hospital Info */}
        {emergency.hospital && (
          <div className="bg-white rounded-lg p-4 border-2 border-green-200 space-y-2">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-green-600" />
              Hospital Assigned
            </h3>
            <div className="text-sm">
              <p className="font-medium">{emergency.hospital.name}</p>
              <p className="text-gray-600">{emergency.hospital.address}</p>
              <p className="text-gray-600">Phone: {emergency.hospital.phone}</p>
            </div>
          </div>
        )}

        {/* Distance Info */}
        {currentLocation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-900">
                Distance to patient: {calculateDistance(
                  currentLocation.latitude,
                  currentLocation.longitude,
                  emergency.latitude,
                  emergency.longitude
                ).toFixed(2)} km
              </span>
            </div>
            {emergency.hospital && (emergency.status === 'patient_loaded' || emergency.status === 'enroute_to_hospital' || emergency.status === 'arrived_at_hospital') && (
              <div className="flex items-center gap-2 mt-2">
                <Building2 className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-900">
                  Distance to hospital: {calculateDistance(
                    currentLocation.latitude,
                    currentLocation.longitude,
                    emergency.hospital.latitude,
                    emergency.hospital.longitude
                  ).toFixed(2)} km
                </span>
              </div>
            )}
          </div>
        )}

        {/* Status Timeline */}
        <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Status Timeline (Complete Journey)
          </h3>
          
          {/* DEBUG INFO - Shows current status */}
          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
            <strong>Debug:</strong> Current Status = <code className="bg-white px-1 rounded">{emergency.status}</code>
            {emergency.awaitingPatientConfirmation && <span className="ml-2 text-yellow-700">⏳ Awaiting Confirmation</span>}
          </div>
          
          <div className="space-y-3">
            {[
              { status: 'assigned', label: '1. Emergency Assigned', icon: '🎯' },
              { status: 'enroute', label: '2. En Route to Patient', icon: '🚑' },
              { status: 'arrived_at_scene', label: '3. Arrived at Scene', icon: '📍', waitingFor: 'Patient Confirmation' },
              { status: 'patient_loaded', label: '4. Patient Loaded', icon: '✅' },
              { status: 'enroute_to_hospital', label: '5. Transporting to Hospital', icon: '🏥' },
              { status: 'arrived_at_hospital', label: '6. Arrived at Hospital', icon: '🏥', waitingFor: 'Final Confirmation' },
              { status: 'completed', label: '7. Emergency Completed', icon: '🎉' }
            ].map(({ status, label, icon, waitingFor }, index) => {
              const statusOrder = ['assigned', 'enroute', 'arrived_at_scene', 'patient_loaded', 'enroute_to_hospital', 'arrived_at_hospital', 'completed'];
              const currentIndex = statusOrder.indexOf(emergency.status);
              const thisIndex = statusOrder.indexOf(status);
              const isCompleted = currentIndex > thisIndex;
              const isCurrent = emergency.status === status;
              
              // Log each stage rendering
              if (isCurrent) {
                console.log(`🎯 Rendering CURRENT stage: ${label} (index ${thisIndex})`);
              }
              
              return (
                <div key={status} className="flex items-center gap-3">
                  {/* Circle indicator */}
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                    isCompleted 
                      ? 'bg-green-600 border-green-600 text-white' 
                      : isCurrent 
                        ? 'bg-blue-600 border-blue-600 animate-pulse text-white' 
                        : 'bg-gray-200 border-gray-300 text-gray-500'
                  }`}>
                    {isCompleted ? '✓' : icon}
                  </div>
                  
                  {/* Label */}
                  <div className="flex-1">
                    <span className={`text-sm block ${
                      isCompleted || isCurrent ? 'text-gray-900 font-medium' : 'text-gray-400'
                    }`}>
                      {label}
                      {/* Show debug state */}
                      <span className="ml-2 text-xs">
                        {isCompleted && <span className="text-green-600">[✓ Done]</span>}
                        {isCurrent && <span className="text-blue-600">[→ Now]</span>}
                        {!isCompleted && !isCurrent && <span className="text-gray-400">[○ Pending]</span>}
                      </span>
                    </span>
                    {isCurrent && waitingFor && emergency.awaitingPatientConfirmation && (
                      <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded mt-1 inline-block">
                        ⏳ Waiting: {waitingFor}
                      </span>
                    )}
                  </div>
                  
                  {/* Status badges */}
                  {isCompleted && !isCurrent && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  {isCurrent && (
                    <Badge className="bg-blue-600 text-white animate-pulse">CURRENT</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        {nextStatus && (
          <Button
            onClick={() => {
              console.log('');
              console.log('🔘🔘🔘 BUTTON CLICKED 🔘🔘🔘');
              console.log('Current Status:', emergency.status);
              console.log('Next Status to set:', nextStatus.status);
              console.log('Button Label:', nextStatus.label);
              console.log('Calling onStatusUpdate with:', nextStatus.status);
              console.log('');
              onStatusUpdate(nextStatus.status);
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
            size="lg"
          >
            {nextStatus.icon}
            <span className="ml-2">{nextStatus.label}</span>
          </Button>
        )}

        {/* Waiting for Patient Confirmation */}
        {emergency.awaitingPatientConfirmation && emergency.status === 'arrived_at_scene' && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-700" />
              <div className="flex-1">
                <p className="font-medium text-yellow-900">⏳ Waiting for Patient Confirmation</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Patient must confirm that help has arrived. Once confirmed, you can proceed to the hospital.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Timeout advance button for ambulance - arrived at scene */}
        {accessToken && emergency.status === 'arrived_at_scene' && emergency.awaitingPatientConfirmation && (
          <TimeoutAdvanceButton
            emergency={emergency}
            accessToken={accessToken}
            onSuccess={onEmergencyUpdate}
            variant="outline"
          />
        )}

        {/* Waiting for Completion Confirmation */}
        {emergency.awaitingPatientConfirmation && emergency.status === 'arrived_at_hospital' && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-700" />
              <div className="flex-1">
                <p className="font-medium text-yellow-900">⏳ Waiting for Completion Confirmation</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Patient or hospital must confirm safe delivery. Once confirmed, emergency will be marked complete.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Timeout advance button for ambulance - arrived at hospital */}
        {accessToken && emergency.status === 'arrived_at_hospital' && emergency.awaitingPatientConfirmation && (
          <TimeoutAdvanceButton
            emergency={emergency}
            accessToken={accessToken}
            onSuccess={onEmergencyUpdate}
            variant="outline"
          />
        )}

        {emergency.status === 'completed' && (
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <p className="text-green-900 font-medium">Emergency Completed Successfully</p>
            <p className="text-sm text-green-700 mt-1">Patient delivered to hospital</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};