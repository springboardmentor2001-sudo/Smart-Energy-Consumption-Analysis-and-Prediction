/**
 * Twilio SMS and Call Service for Emergency Notifications
 * 
 * Setup Instructions:
 * 1. Sign up at https://www.twilio.com/
 * 2. Get Account SID, Auth Token, and Phone Number
 * 3. Replace the placeholders below with your credentials
 */

// Twilio Configuration
const TWILIO_CONFIG = {
  accountSid: 'YOUR_TWILIO_ACCOUNT_SID', // Replace with your Twilio Account SID
  authToken: 'YOUR_TWILIO_AUTH_TOKEN',   // Replace with your Twilio Auth Token
  phoneNumber: '+1234567890',             // Replace with your Twilio Phone Number
};

interface SMSParams {
  to: string;
  message: string;
}

interface CallParams {
  to: string;
  message: string;
}

/**
 * Send SMS via Twilio
 */
export const sendSMS = async ({ to, message }: SMSParams): Promise<boolean> => {
  try {
    // In production, this should be a server-side API call to protect credentials
    // For now, we'll use a mock response and log the message
    
    console.log('📱 SMS Notification:', {
      to,
      message,
      timestamp: new Date().toISOString(),
    });

    // TODO: Replace with actual Twilio API call
    // const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + 
    //   TWILIO_CONFIG.accountSid + '/Messages.json', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': 'Basic ' + btoa(TWILIO_CONFIG.accountSid + ':' + TWILIO_CONFIG.authToken),
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //   },
    //   body: new URLSearchParams({
    //     To: to,
    //     From: TWILIO_CONFIG.phoneNumber,
    //     Body: message,
    //   }),
    // });

    // Simulate success
    return true;
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return false;
  }
};

/**
 * Make automated voice call via Twilio
 */
export const makeCall = async ({ to, message }: CallParams): Promise<boolean> => {
  try {
    console.log('📞 Voice Call:', {
      to,
      message,
      timestamp: new Date().toISOString(),
    });

    // TODO: Replace with actual Twilio API call
    // const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + 
    //   TWILIO_CONFIG.accountSid + '/Calls.json', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': 'Basic ' + btoa(TWILIO_CONFIG.accountSid + ':' + TWILIO_CONFIG.authToken),
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //   },
    //   body: new URLSearchParams({
    //     To: to,
    //     From: TWILIO_CONFIG.phoneNumber,
    //     Url: 'https://your-server.com/voice-message?text=' + encodeURIComponent(message),
    //   }),
    // });

    return true;
  } catch (error) {
    console.error('Failed to make call:', error);
    return false;
  }
};

/**
 * Emergency notification templates
 */
export const NOTIFICATION_TEMPLATES = {
  emergencyTriggered: (patientName: string, trackingLink: string) => 
    `🚨 EMERGENCY ALERT: ${patientName} has triggered an SOS alert. Track their location in real-time: ${trackingLink}`,
  
  ambulanceAssigned: (patientName: string, vehicleNumber: string, eta: number) =>
    `🚑 Ambulance ${vehicleNumber} has been assigned to ${patientName}. ETA: ${eta} minutes.`,
  
  ambulanceEnroute: (patientName: string, eta: number) =>
    `🚑 Ambulance is on the way to ${patientName}. ETA: ${eta} minutes.`,
  
  ambulanceArrived: (patientName: string, location: string) =>
    `✅ Ambulance has arrived at ${patientName}'s location: ${location}`,
  
  patientPickedUp: (patientName: string, hospitalName: string) =>
    `🏥 ${patientName} has been picked up and is being transported to ${hospitalName}.`,
  
  arrivedAtHospital: (patientName: string, hospitalName: string) =>
    `🏥 ${patientName} has arrived at ${hospitalName} and is receiving care.`,
  
  emergencyCompleted: (patientName: string) =>
    `✅ Emergency response for ${patientName} has been completed successfully.`,
};

/**
 * Send notification to all emergency contacts
 */
export const notifyEmergencyContacts = async (
  contacts: Array<{ name: string; phone: string; relationship: string }>,
  message: string,
  includeCall: boolean = false
): Promise<{ sms: number; calls: number; failed: number }> => {
  const results = {
    sms: 0,
    calls: 0,
    failed: 0,
  };

  for (const contact of contacts) {
    // Send SMS
    const smsSuccess = await sendSMS({
      to: contact.phone,
      message: `[ResQLink Emergency] ${message}`,
    });

    if (smsSuccess) {
      results.sms++;
    } else {
      results.failed++;
    }

    // Make call if requested (for critical emergencies)
    if (includeCall) {
      const callSuccess = await makeCall({
        to: contact.phone,
        message,
      });

      if (callSuccess) {
        results.calls++;
      }
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
};

/**
 * Generate public tracking link
 */
export const generateTrackingLink = (emergencyId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/track/${emergencyId}`;
};
