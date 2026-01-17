import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Prefix for all routes
const PREFIX = '';

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Sign up new user
app.post(`${PREFIX}/signup`, async (c) => {
  try {
    const { email, password, role, name, phone, hospitalName, vehicleNumber } = await c.req.json();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name, 
        role,
        phone,
        hospitalName,
        vehicleNumber,
        createdAt: new Date().toISOString()
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Error during user signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role,
      phone,
      hospitalName,
      vehicleNumber,
      status: role === 'ambulance' ? 'available' : 'active',
      createdAt: new Date().toISOString()
    });

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log(`Server error during signup: ${error}`);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// ============================================
// EMERGENCY ROUTES
// ============================================

// Create emergency request
app.post(`${PREFIX}/emergency`, async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized - Please log in' }, 401);
    }

    const { latitude, longitude, description, patientName, patientPhone } = await c.req.json();

    const emergencyId = `emergency:${Date.now()}:${user.id}`;
    const emergency = {
      id: emergencyId,
      patientId: user.id,
      patientName: patientName || user.user_metadata.name,
      patientPhone: patientPhone || user.user_metadata.phone,
      patientEmail: user.email,
      latitude,
      longitude,
      description,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(emergencyId, emergency);
    
    // Add to active emergencies list
    const activeEmergencies = await kv.get('emergencies:active') || [];
    activeEmergencies.push(emergencyId);
    await kv.set('emergencies:active', activeEmergencies);

    console.log(`Emergency created: ${emergencyId} for user ${user.id}`);
    return c.json({ success: true, emergency });
  } catch (error) {
    console.log(`Error creating emergency: ${error}`);
    return c.json({ error: 'Failed to create emergency request' }, 500);
  }
});

// Get all active emergencies (for hospitals and ambulances)
app.get(`${PREFIX}/emergencies/active`, async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized - Please log in' }, 401);
    }

    const role = user.user_metadata.role;
    if (role !== 'hospital' && role !== 'ambulance') {
      return c.json({ error: 'Access denied - Only hospitals and ambulances can view emergencies' }, 403);
    }

    const emergencyIds = await kv.get('emergencies:active') || [];
    const emergencies = [];

    for (const id of emergencyIds) {
      const emergency = await kv.get(id);
      if (emergency && emergency.status !== 'completed' && emergency.status !== 'cancelled') {
        emergencies.push(emergency);
      }
    }

    return c.json({ success: true, emergencies });
  } catch (error) {
    console.log(`Error fetching active emergencies: ${error}`);
    return c.json({ error: 'Failed to fetch emergencies' }, 500);
  }
});

// Get user's emergencies (for patients)
app.get(`${PREFIX}/emergencies/my`, async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized - Please log in' }, 401);
    }

    const role = user.user_metadata.role;
    const allEmergencies = await kv.getByPrefix('emergency:');
    
    // Filter based on user role - different users see different emergencies
    let userEmergencies;
    
    if (role === 'patient') {
      // Patients see their own emergency requests
      userEmergencies = allEmergencies.filter(e => e.patientId === user.id);
      console.log(`[Patient ${user.id}] Found ${userEmergencies.length} emergencies`);
    } else if (role === 'ambulance') {
      // Ambulances see emergencies assigned to them
      userEmergencies = allEmergencies.filter(e => e.ambulanceId === user.id);
      console.log(`[Ambulance ${user.id}] Found ${userEmergencies.length} assigned emergencies`);
    } else if (role === 'hospital') {
      // Hospitals see emergencies they're handling
      userEmergencies = allEmergencies.filter(e => e.hospitalId === user.id);
      console.log(`[Hospital ${user.id}] Found ${userEmergencies.length} emergencies`);
    } else {
      userEmergencies = [];
      console.log(`[Unknown role ${role}] Returning empty emergencies`);
    }
    
    userEmergencies = userEmergencies.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ success: true, emergencies: userEmergencies });
  } catch (error) {
    console.log(`Error fetching user emergencies: ${error}`);
    return c.json({ error: 'Failed to fetch emergencies' }, 500);
  }
});

// Assign emergency to ambulance
app.post(`${PREFIX}/emergency/:id/assign`, async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized - Please log in' }, 401);
    }

    const emergencyId = c.req.param('id');
    const { ambulanceId, hospitalId, estimatedTime } = await c.req.json();

    const emergency = await kv.get(emergencyId);
    if (!emergency) {
      return c.json({ error: 'Emergency not found' }, 404);
    }

    emergency.status = 'assigned';
    emergency.ambulanceId = ambulanceId || user.id;
    emergency.hospitalId = hospitalId || user.id;
    emergency.assignedAt = new Date().toISOString();
    emergency.estimatedTime = estimatedTime;
    emergency.updatedAt = new Date().toISOString();

    await kv.set(emergencyId, emergency);

    // Update ambulance status
    const ambulanceUserId = ambulanceId || user.id;
    const ambulanceProfile = await kv.get(`user:${ambulanceUserId}`);
    if (ambulanceProfile) {
      ambulanceProfile.status = 'busy';
      ambulanceProfile.currentEmergency = emergencyId;
      await kv.set(`user:${ambulanceUserId}`, ambulanceProfile);
    }

    console.log(`Emergency ${emergencyId} assigned to ambulance ${ambulanceUserId}`);
    return c.json({ success: true, emergency });
  } catch (error) {
    console.log(`Error assigning emergency: ${error}`);
    return c.json({ error: 'Failed to assign emergency' }, 500);
  }
});

// Update emergency status
app.patch(`${PREFIX}/emergency/:id/status`, async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized - Please log in' }, 401);
    }

    const emergencyId = c.req.param('id');
    const { status, notes } = await c.req.json();

    const emergency = await kv.get(emergencyId);
    if (!emergency) {
      return c.json({ error: 'Emergency not found' }, 404);
    }

    const previousStatus = emergency.status;
    emergency.status = status;
    emergency.updatedAt = new Date().toISOString();
    if (notes) emergency.notes = notes;
    
    // Set timeline timestamps
    if (status === 'enroute' && !emergency.enrouteAt) {
      emergency.enrouteAt = new Date().toISOString();
    }
    if (status === 'arrived_at_scene' && !emergency.arrivedAtSceneAt) {
      emergency.arrivedAtSceneAt = new Date().toISOString();
      // CRITICAL: Set awaiting confirmation flag when ambulance arrives
      emergency.awaitingPatientConfirmation = true;
      console.log(`🚨 Emergency ${emergencyId}: Ambulance arrived at scene - awaiting patient confirmation`);
    }
    if (status === 'patient_loaded' && !emergency.patientLoadedAt) {
      emergency.patientLoadedAt = new Date().toISOString();
      // Clear confirmation flag after patient is loaded
      emergency.awaitingPatientConfirmation = false;
    }
    if (status === 'enroute_to_hospital' && !emergency.enrouteToHospitalAt) {
      emergency.enrouteToHospitalAt = new Date().toISOString();
    }
    if (status === 'arrived_at_hospital' && !emergency.arrivedAtHospitalAt) {
      emergency.arrivedAtHospitalAt = new Date().toISOString();
      // CRITICAL: Set awaiting confirmation flag when arriving at hospital
      emergency.awaitingPatientConfirmation = true;
      console.log(`🏥 Emergency ${emergencyId}: Ambulance arrived at hospital - awaiting completion confirmation`);
    }
    
    if (status === 'completed' || status === 'cancelled') {
      emergency.completedAt = new Date().toISOString();
      emergency.awaitingPatientConfirmation = false;
      
      // Remove from active emergencies
      const activeEmergencies = await kv.get('emergencies:active') || [];
      const updatedActive = activeEmergencies.filter(id => id !== emergencyId);
      await kv.set('emergencies:active', updatedActive);

      // Update ambulance status to available
      if (emergency.ambulanceId) {
        const ambulanceProfile = await kv.get(`user:${emergency.ambulanceId}`);
        if (ambulanceProfile) {
          ambulanceProfile.status = 'available';
          ambulanceProfile.currentEmergency = null;
          await kv.set(`user:${emergency.ambulanceId}`, ambulanceProfile);
        }
      }
    }

    await kv.set(emergencyId, emergency);

    console.log(`Emergency ${emergencyId} status updated: ${previousStatus} → ${status}${emergency.awaitingPatientConfirmation ? ' (awaiting confirmation)' : ''}`);
    return c.json({ success: true, emergency });
  } catch (error) {
    console.log(`Error updating emergency status: ${error}`);
    return c.json({ error: 'Failed to update emergency status' }, 500);
  }
});

// ============================================
// ANALYTICS ROUTES
// ============================================

// Get analytics data
app.get(`${PREFIX}/analytics`, async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized - Please log in' }, 401);
    }

    const role = user.user_metadata.role;
    if (role !== 'hospital') {
      return c.json({ error: 'Access denied - Only hospitals can view analytics' }, 403);
    }

    const allEmergencies = await kv.getByPrefix('emergency:');
    
    const stats = {
      total: allEmergencies.length,
      pending: allEmergencies.filter(e => e.status === 'pending').length,
      assigned: allEmergencies.filter(e => e.status === 'assigned').length,
      enroute: allEmergencies.filter(e => e.status === 'enroute').length,
      arrived_at_scene: allEmergencies.filter(e => e.status === 'arrived_at_scene').length,
      patient_loaded: allEmergencies.filter(e => e.status === 'patient_loaded').length,
      enroute_to_hospital: allEmergencies.filter(e => e.status === 'enroute_to_hospital').length,
      arrived_at_hospital: allEmergencies.filter(e => e.status === 'arrived_at_hospital').length,
      completed: allEmergencies.filter(e => e.status === 'completed').length,
      cancelled: allEmergencies.filter(e => e.status === 'cancelled').length,
    };

    // Calculate average response time
    const completedEmergencies = allEmergencies.filter(e => e.status === 'completed' && e.assignedAt && e.completedAt);
    const responseTimes = completedEmergencies.map(e => {
      const assigned = new Date(e.assignedAt).getTime();
      const completed = new Date(e.completedAt).getTime();
      return (completed - assigned) / (1000 * 60); // minutes
    });
    
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;

    // Get emergencies by day (last 7 days)
    const now = new Date();
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];
      const count = allEmergencies.filter(e => e.createdAt.startsWith(dayStr)).length;
      last7Days.push({ date: dayStr, count });
    }

    return c.json({ 
      success: true, 
      stats,
      avgResponseTime: Math.round(avgResponseTime),
      emergenciesByDay: last7Days
    });
  } catch (error) {
    console.log(`Error fetching analytics: ${error}`);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

// ============================================
// USER PROFILE ROUTES
// ============================================

// Get user profile
app.get(`${PREFIX}/profile`, async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized - Please log in' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json({ success: true, profile });
  } catch (error) {
    console.log(`Error fetching profile: ${error}`);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Update ambulance location
app.post(`${PREFIX}/location/update`, async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized - Please log in' }, 401);
    }

    const { latitude, longitude } = await c.req.json();

    const profile = await kv.get(`user:${user.id}`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    profile.latitude = latitude;
    profile.longitude = longitude;
    profile.lastLocationUpdate = new Date().toISOString();

    await kv.set(`user:${user.id}`, profile);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error updating location: ${error}`);
    return c.json({ error: 'Failed to update location' }, 500);
  }
});

// Get available ambulances
app.get(`${PREFIX}/ambulances/available`, async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized - Please log in' }, 401);
    }

    const allUsers = await kv.getByPrefix('user:');
    const availableAmbulances = allUsers.filter(u => 
      u.role === 'ambulance' && u.status === 'available'
    );

    return c.json({ success: true, ambulances: availableAmbulances });
  } catch (error) {
    console.log(`Error fetching available ambulances: ${error}`);
    return c.json({ error: 'Failed to fetch ambulances' }, 500);
  }
});

// Health check
app.get(`${PREFIX}/health`, (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// PATIENT CONFIRMATION ROUTES
// ============================================

// Patient confirms ambulance arrival at scene
app.post(`${PREFIX}/emergency/:id/confirm-arrival`, async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized - Please log in' }, 401);
    }

    const emergencyId = c.req.param('id');
    const emergency = await kv.get(emergencyId);
    
    if (!emergency) {
      return c.json({ error: 'Emergency not found' }, 404);
    }

    if (emergency.patientId !== user.id) {
      return c.json({ error: 'Access denied - You can only confirm your own emergencies' }, 403);
    }

    emergency.patientConfirmedArrival = true;
    emergency.patientConfirmedArrivalAt = new Date().toISOString();
    emergency.awaitingPatientConfirmation = false;
    emergency.updatedAt = new Date().toISOString();

    await kv.set(emergencyId, emergency);

    console.log(`✅ Emergency ${emergencyId}: Patient confirmed ambulance arrival`);
    return c.json({ success: true, emergency });
  } catch (error) {
    console.log(`Error confirming arrival: ${error}`);
    return c.json({ error: 'Failed to confirm arrival' }, 500);
  }
});

// Patient confirms emergency completion at hospital
app.post(`${PREFIX}/emergency/:id/confirm-completion`, async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized - Please log in' }, 401);
    }

    const emergencyId = c.req.param('id');
    const emergency = await kv.get(emergencyId);
    
    if (!emergency) {
      return c.json({ error: 'Emergency not found' }, 404);
    }

    if (emergency.patientId !== user.id) {
      return c.json({ error: 'Access denied - You can only confirm your own emergencies' }, 403);
    }

    emergency.patientConfirmedCompletion = true;
    emergency.patientConfirmedCompletionAt = new Date().toISOString();
    emergency.awaitingPatientConfirmation = false;
    emergency.updatedAt = new Date().toISOString();

    await kv.set(emergencyId, emergency);

    console.log(`✅ Emergency ${emergencyId}: Patient confirmed completion at hospital`);
    return c.json({ success: true, emergency });
  } catch (error) {
    console.log(`Error confirming completion: ${error}`);
    return c.json({ error: 'Failed to confirm completion' }, 500);
  }
});

// Hospital confirms on behalf of patient (backup confirmation)
app.post(`${PREFIX}/emergency/:id/hospital-confirm`, async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized - Please log in' }, 401);
    }

    if (user.user_metadata.role !== 'hospital') {
      return c.json({ error: 'Access denied - Only hospitals can use this endpoint' }, 403);
    }

    const emergencyId = c.req.param('id');
    const { confirmationType } = await c.req.json();
    
    const emergency = await kv.get(emergencyId);
    
    if (!emergency) {
      return c.json({ error: 'Emergency not found' }, 404);
    }

    if (confirmationType === 'arrival') {
      emergency.patientConfirmedArrival = true;
      emergency.patientConfirmedArrivalAt = new Date().toISOString();
      console.log(`🏥 Emergency ${emergencyId}: Hospital confirmed arrival on behalf of patient`);
    } else if (confirmationType === 'completion') {
      emergency.patientConfirmedCompletion = true;
      emergency.patientConfirmedCompletionAt = new Date().toISOString();
      console.log(`🏥 Emergency ${emergencyId}: Hospital confirmed completion on behalf of patient`);
    }

    emergency.awaitingPatientConfirmation = false;
    emergency.updatedAt = new Date().toISOString();

    await kv.set(emergencyId, emergency);

    return c.json({ success: true, emergency });
  } catch (error) {
    console.log(`Error with hospital confirmation: ${error}`);
    return c.json({ error: 'Failed to process confirmation' }, 500);
  }
});

// Timeout advance when patient doesn't respond
app.post(`${PREFIX}/emergency/:id/timeout-advance`, async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized - Please log in' }, 401);
    }

    const emergencyId = c.req.param('id');
    const emergency = await kv.get(emergencyId);
    
    if (!emergency) {
      return c.json({ error: 'Emergency not found' }, 404);
    }

    // Only allow timeout advance if actually waiting for confirmation
    if (!emergency.awaitingPatientConfirmation) {
      return c.json({ 
        success: true, 
        emergency,
        autoAdvanced: false,
        message: 'Not awaiting confirmation'
      });
    }

    // Auto-advance the status
    let autoAdvanced = false;
    
    if (emergency.status === 'arrived_at_scene') {
      emergency.status = 'patient_loaded';
      emergency.patientLoadedAt = new Date().toISOString();
      autoAdvanced = true;
      console.log(`⏱️ Emergency ${emergencyId}: Auto-advanced from arrived_at_scene to patient_loaded (timeout)`);
    } else if (emergency.status === 'arrived_at_hospital') {
      emergency.status = 'completed';
      emergency.completedAt = new Date().toISOString();
      autoAdvanced = true;
      console.log(`⏱️ Emergency ${emergencyId}: Auto-advanced from arrived_at_hospital to completed (timeout)`);
      
      // Cleanup for completed emergency
      const activeEmergencies = await kv.get('emergencies:active') || [];
      const updatedActive = activeEmergencies.filter(id => id !== emergencyId);
      await kv.set('emergencies:active', updatedActive);

      if (emergency.ambulanceId) {
        const ambulanceProfile = await kv.get(`user:${emergency.ambulanceId}`);
        if (ambulanceProfile) {
          ambulanceProfile.status = 'available';
          ambulanceProfile.currentEmergency = null;
          await kv.set(`user:${emergency.ambulanceId}`, ambulanceProfile);
        }
      }
    }

    emergency.awaitingPatientConfirmation = false;
    emergency.updatedAt = new Date().toISOString();

    await kv.set(emergencyId, emergency);

    return c.json({ success: true, emergency, autoAdvanced });
  } catch (error) {
    console.log(`Error with timeout advance: ${error}`);
    return c.json({ error: 'Failed to process timeout advance' }, 500);
  }
});

Deno.serve(app.fetch);