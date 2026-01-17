import { supabase } from './supabase/client';
import { SUPABASE_ENABLED } from './supabaseConfig';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'hospital' | 'ambulance';
  phone?: string;
  hospitalName?: string;
  hospital_name?: string;
  hospital_address?: string;
  hospital_phone?: string;
  vehicleNumber?: string;
  vehicle_number?: string;
  status?: string;
  latitude?: number;
  longitude?: number;
  lastLocationUpdate?: string;
  last_location_update?: string;
  currentEmergency?: string;
  blood_group?: string;
  age?: number;
  medical_conditions?: string[];
  allergies?: string[];
}

export interface Emergency {
  id: string;
  patient_id: string;
  patientId?: string;
  patient_name: string;
  patientName?: string;
  patient_phone: string;
  patientPhone?: string;
  patientEmail?: string;
  latitude: number;
  longitude: number;
  description: string;
  status: 'pending' | 'assigned' | 'enroute' | 'arrived_at_scene' | 'patient_loaded' | 'enroute_to_hospital' | 'arrived_at_hospital' | 'completed' | 'cancelled';
  priority?: 'standard' | 'urgent' | 'critical';
  emergency_type?: 'cardiac' | 'accident' | 'respiratory' | 'trauma' | 'other';
  created_at: string;
  createdAt?: string;
  updated_at: string;
  updatedAt?: string;
  ambulance_id?: string;
  ambulanceId?: string;
  ambulanceContact?: string;
  hospital_id?: string;
  hospitalId?: string;
  assigned_at?: string;
  assignedAt?: string;
  completed_at?: string;
  completedAt?: string;
  estimated_time?: number;
  estimatedTime?: number;
  notes?: string;
  address?: string;
  
  // Hospital details (populated when assigned)
  hospital?: {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    latitude: number;
    longitude: number;
  };
  
  // New timeline fields
  enroute_at?: string;
  enrouteAt?: string;
  arrived_at_scene_at?: string;
  arrivedAtSceneAt?: string;
  patient_loaded_at?: string;
  patientLoadedAt?: string;
  enroute_to_hospital_at?: string;
  enrouteToHospitalAt?: string;
  arrived_at_hospital_at?: string;
  arrivedAtHospitalAt?: string;
  
  // Confirmation fields for patient verification
  patient_confirmed_arrival?: boolean;
  patientConfirmedArrival?: boolean;
  patient_confirmed_arrival_at?: string;
  patientConfirmedArrivalAt?: string;
  patient_confirmed_completion?: boolean;
  patientConfirmedCompletion?: boolean;
  patient_confirmed_completion_at?: string;
  patientConfirmedCompletionAt?: string;
  awaiting_patient_confirmation?: boolean;
  awaitingPatientConfirmation?: boolean;
}

export interface AnalyticsData {
  stats: {
    total: number;
    pending: number;
    assigned: number;
    enroute: number;
    arrived_at_scene: number;
    patient_loaded: number;
    enroute_to_hospital: number;
    arrived_at_hospital: number;
    completed: number;
    cancelled: number;
  };
  avgResponseTime: number;
  emergenciesByDay: Array<{ date: string; count: number }>;
}

// Helper function to convert snake_case to camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

// Authentication
export const signup = async (data: {
  email: string;
  password: string;
  role: 'patient' | 'hospital' | 'ambulance';
  name: string;
  phone?: string;
  hospitalName?: string;
  vehicleNumber?: string;
  bloodGroup?: string;
  age?: number;
}) => {
  // Sign up with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name,
        role: data.role,
        phone: data.phone,
        hospitalName: data.hospitalName,
        vehicleNumber: data.vehicleNumber,
      },
      emailRedirectTo: window.location.origin,
    }
  });
  
  if (authError) {
    throw new Error(authError.message);
  }
  
  if (!authData.user) {
    throw new Error('Failed to create user');
  }
  
  // Create user profile in public.users table
  const userProfile: any = {
    id: authData.user.id,
    email: data.email,
    name: data.name,
    phone: data.phone || '',
    role: data.role,
    status: data.role === 'ambulance' ? 'available' : 'offline',
  };

  // Add role-specific fields
  if (data.role === 'patient') {
    userProfile.blood_group = data.bloodGroup || 'O+';
    userProfile.age = data.age || 0;
  } else if (data.role === 'hospital') {
    userProfile.hospital_name = data.hospitalName || '';
    userProfile.hospital_address = '';
    userProfile.license_number = '';
  } else if (data.role === 'ambulance') {
    userProfile.vehicle_number = data.vehicleNumber || '';
    userProfile.driver_license = '';
  }

  // Insert profile using the newly created auth session
  // The RLS policy allows inserts where id = auth.uid()
  const { error: profileError } = await supabase
    .from('users')
    .insert([userProfile]);
  
  if (profileError) {
    console.error('Profile creation error:', profileError);
    
    // Try to clean up auth user if profile creation fails
    try {
      // Note: Can't delete auth user from client side
      // The profile will need to be created on first login
      console.warn('Profile creation failed. User will need to complete profile on login.');
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
    
    // Throw error so signup fails visibly
    throw new Error(`Failed to create user profile: ${profileError.message}`);
  }
  
  // Check if email confirmation is required
  if (authData.session === null) {
    throw new Error('CONFIRMATION_REQUIRED');
  }
  
  return { success: true, user: authData.user };
};

// Create Emergency
export const createEmergency = async (
  data: {
    latitude: number;
    longitude: number;
    description: string;
    patientName?: string;
    patientPhone?: string;
  },
  token: string
) => {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  // Get user profile for additional data
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  // Create emergency record
  const emergencyData = {
    patient_id: user.id,
    patient_name: data.patientName || profile?.name || user.user_metadata.name,
    patient_phone: data.patientPhone || profile?.phone || user.user_metadata.phone,
    latitude: data.latitude,
    longitude: data.longitude,
    description: data.description,
    status: 'pending',
    emergency_type: 'other',
  };

  const { data: emergency, error } = await supabase
    .from('emergencies')
    .insert([emergencyData])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🆘 NEW EMERGENCY CREATED BY PATIENT');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📋 Emergency ID:', emergency.id);
  console.log('👤 Patient:', emergency.patient_name);
  console.log('📞 Phone:', emergency.patient_phone);
  console.log('📍 Location:', emergency.latitude, emergency.longitude);
  console.log('📝 Description:', emergency.description);
  console.log('📊 Status:', emergency.status);
  console.log('');
  console.log('🚑 AMBULANCES SHOULD NOW SEE THIS EMERGENCY VIA REAL-TIME!');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  return { success: true, emergency: toCamelCase(emergency) };
};

// Get Active Emergencies
export const getActiveEmergencies = async (token: string) => {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  const role = user.user_metadata.role;
  let query = supabase.from('emergencies').select(`
    *,
    hospital:hospital_id (
      id,
      hospital_name,
      hospital_address,
      hospital_phone,
      latitude,
      longitude
    )
  `);

  if (role === 'patient') {
    // Patients see only their emergencies
    query = query.eq('patient_id', user.id);
  } else if (role === 'hospital') {
    // Hospitals see all active emergencies
    query = query.neq('status', 'completed').neq('status', 'cancelled');
  } else if (role === 'ambulance') {
    // Ambulances see their assigned emergencies OR pending ones
    query = query.or(`ambulance_id.eq.${user.id},status.eq.pending`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching emergencies:', error);
    throw new Error(error.message);
  }

  console.log('✅ Fetched emergencies:', data?.length || 0);
  return { success: true, emergencies: toCamelCase(data || []) };
};

// Get My Emergencies
export const getMyEmergencies = async (token: string) => {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  const role = user.user_metadata.role;
  let query = supabase.from('emergencies').select(`
    *,
    hospital:hospital_id (
      id,
      hospital_name,
      hospital_address,
      hospital_phone,
      latitude,
      longitude
    )
  `);

  if (role === 'patient') {
    query = query.eq('patient_id', user.id);
  } else if (role === 'ambulance') {
    query = query.eq('ambulance_id', user.id);
  } else if (role === 'hospital') {
    query = query.eq('hospital_id', user.id);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, emergencies: toCamelCase(data || []) };
};

// Assign Emergency
export const assignEmergency = async (
  emergencyId: string,
  data: {
    ambulanceId?: string;
    hospitalId?: string;
    estimatedTime?: number;
  },
  token: string
) => {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  const updates: any = {
    status: 'assigned',
    assigned_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (data.ambulanceId) updates.ambulance_id = data.ambulanceId;
  if (data.hospitalId) updates.hospital_id = data.hospitalId;
  if (data.estimatedTime) updates.estimated_time = data.estimatedTime;

  const { data: emergency, error } = await supabase
    .from('emergencies')
    .update(updates)
    .eq('id', emergencyId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, emergency: toCamelCase(emergency) };
};

// Update Emergency Status
export const updateEmergencyStatus = async (
  emergencyId: string,
  data: {
    status: Emergency['status'];
    notes?: string;
  },
  token: string
) => {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  // Get current emergency
  const { data: currentEmergency, error: fetchError } = await supabase
    .from('emergencies')
    .select('*')
    .eq('id', emergencyId)
    .single();

  if (fetchError || !currentEmergency) {
    throw new Error('Emergency not found');
  }

  const now = new Date().toISOString();
  const updates: any = {
    status: data.status,
    notes: data.notes,
    updated_at: now,
  };

  // Track timeline events
  if (data.status === 'enroute' && !currentEmergency.enroute_at) {
    updates.enroute_at = now;
  } else if (data.status === 'arrived_at_scene' && !currentEmergency.arrived_at_scene_at) {
    updates.arrived_at_scene_at = now;
    updates.awaiting_patient_confirmation = true;
  } else if (data.status === 'patient_loaded' && !currentEmergency.patient_loaded_at) {
    updates.patient_loaded_at = now;
  } else if (data.status === 'enroute_to_hospital' && !currentEmergency.enroute_to_hospital_at) {
    updates.enroute_to_hospital_at = now;
  } else if (data.status === 'arrived_at_hospital' && !currentEmergency.arrived_at_hospital_at) {
    updates.arrived_at_hospital_at = now;
    updates.awaiting_patient_confirmation = true;
  } else if (data.status === 'completed') {
    updates.completed_at = now;
    updates.awaiting_patient_confirmation = false;
  }

  const { data: emergency, error } = await supabase
    .from('emergencies')
    .update(updates)
    .eq('id', emergencyId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, emergency: toCamelCase(emergency) };
};

// Analytics
export const getAnalytics = async (token: string) => {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  // Get all emergencies
  const { data: emergencies, error } = await supabase
    .from('emergencies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const allEmergencies = emergencies || [];

  // Calculate stats
  const stats = {
    total: allEmergencies.length,
    pending: allEmergencies.filter((e: any) => e.status === 'pending').length,
    assigned: allEmergencies.filter((e: any) => e.status === 'assigned').length,
    enroute: allEmergencies.filter((e: any) => e.status === 'enroute').length,
    arrived_at_scene: allEmergencies.filter((e: any) => e.status === 'arrived_at_scene').length,
    patient_loaded: allEmergencies.filter((e: any) => e.status === 'patient_loaded').length,
    enroute_to_hospital: allEmergencies.filter((e: any) => e.status === 'enroute_to_hospital').length,
    arrived_at_hospital: allEmergencies.filter((e: any) => e.status === 'arrived_at_hospital').length,
    completed: allEmergencies.filter((e: any) => e.status === 'completed').length,
    cancelled: allEmergencies.filter((e: any) => e.status === 'cancelled').length,
  };

  // Calculate average response time
  const completedEmergencies = allEmergencies.filter((e: any) => e.status === 'completed' && e.assigned_at);
  const avgResponseTime = completedEmergencies.length > 0
    ? completedEmergencies.reduce((sum: number, e: any) => {
        const created = new Date(e.created_at).getTime();
        const assigned = new Date(e.assigned_at!).getTime();
        return sum + (assigned - created);
      }, 0) / completedEmergencies.length / 60000 // Convert to minutes
    : 0;

  // Group by day
  const emergenciesByDay: { [key: string]: number } = {};
  allEmergencies.forEach((e: any) => {
    const date = new Date(e.created_at).toISOString().split('T')[0];
    emergenciesByDay[date] = (emergenciesByDay[date] || 0) + 1;
  });

  const emergenciesByDayArray = Object.entries(emergenciesByDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7); // Last 7 days

  return {
    success: true,
    stats,
    avgResponseTime,
    emergenciesByDay: emergenciesByDayArray,
  };
};

// Profile
export const getProfile = async (token: string) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  // Try to get from database first
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profile) {
    return { 
      success: true, 
      profile: {
        ...toCamelCase(profile),
        role: profile.role,
        email: profile.email,
      }
    };
  }

  // Fallback to user metadata
  const fallbackProfile: User = {
    id: user.id,
    email: user.email!,
    name: user.user_metadata.name,
    role: user.user_metadata.role,
    phone: user.user_metadata.phone,
    hospitalName: user.user_metadata.hospitalName,
    vehicleNumber: user.user_metadata.vehicleNumber,
    status: user.user_metadata.role === 'ambulance' ? 'available' : 'active',
  };

  return { success: true, profile: fallbackProfile };
};

// Update Location
export const updateLocation = async (
  data: { latitude: number; longitude: number },
  token: string
) => {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('users')
    .update({
      latitude: data.latitude,
      longitude: data.longitude,
      last_location_update: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    console.error('Error updating location:', error);
    // Don't throw - non-critical
  }

  return { success: true };
};

// Get Available Ambulances
export const getAvailableAmbulances = async (token: string) => {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  const { data: ambulances, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'ambulance')
    .eq('status', 'available');

  if (error) {
    console.error('Error fetching ambulances:', error);
    return { success: true, ambulances: [] };
  }

  return { success: true, ambulances: toCamelCase(ambulances || []) };
};

// Patient confirmation for workflow verification
export const confirmEmergencyArrival = async (
  emergencyId: string,
  token: string
) => {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  const { data: emergency, error } = await supabase
    .from('emergencies')
    .update({
      patient_confirmed_arrival: true,
      patient_confirmed_arrival_at: new Date().toISOString(),
      awaiting_patient_confirmation: false,
      status: 'patient_loaded', // ✅ CRITICAL FIX: Update status to patient_loaded
      patient_loaded_at: new Date().toISOString(), // ✅ Add timestamp
      updated_at: new Date().toISOString(),
    })
    .eq('id', emergencyId)
    .eq('patient_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  console.log('✅ Patient confirmed ambulance arrival - Status updated to patient_loaded');
  console.log('Emergency ID:', emergencyId);
  console.log('New status:', emergency?.status);

  return { success: true, emergency: toCamelCase(emergency) };
};

export const confirmEmergencyCompletion = async (
  emergencyId: string,
  token: string
) => {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  const { data: emergency, error } = await supabase
    .from('emergencies')
    .update({
      patient_confirmed_completion: true,
      patient_confirmed_completion_at: new Date().toISOString(),
      awaiting_patient_confirmation: false,
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', emergencyId)
    .eq('patient_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, emergency: toCamelCase(emergency) };
};

// Hospital confirms on behalf of patient
export const hospitalConfirmation = async (
  emergencyId: string,
  confirmationType: 'arrival' | 'completion',
  token: string
) => {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  // Verify user is a hospital
  if (user.user_metadata.role !== 'hospital') {
    throw new Error('Unauthorized - only hospitals can use this endpoint');
  }

  const now = new Date().toISOString();
  const updates: any = {
    awaiting_patient_confirmation: false,
    updated_at: now,
  };

  if (confirmationType === 'arrival') {
    updates.patient_confirmed_arrival = true;
    updates.patient_confirmed_arrival_at = now;
    updates.status = 'patient_loaded'; // ✅ Update status when confirming arrival
    updates.patient_loaded_at = now;
  } else {
    updates.patient_confirmed_completion = true;
    updates.patient_confirmed_completion_at = now;
    updates.status = 'completed';
    updates.completed_at = now;
  }

  const { data: emergency, error } = await supabase
    .from('emergencies')
    .update(updates)
    .eq('id', emergencyId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  console.log('✅ Hospital confirmed on behalf of patient');
  console.log('Emergency ID:', emergencyId);
  console.log('Confirmation Type:', confirmationType);
  console.log('New status:', emergency?.status);

  return { success: true, emergency: toCamelCase(emergency) };
};

// Timeout advance when patient doesn't respond
export const timeoutAdvance = async (
  emergencyId: string,
  token: string
) => {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  // Get current emergency
  const { data: currentEmergency, error: fetchError } = await supabase
    .from('emergencies')
    .select('*')
    .eq('id', emergencyId)
    .single();

  if (fetchError || !currentEmergency) {
    throw new Error('Emergency not found');
  }

  const now = new Date().toISOString();
  let autoAdvanced = false;

  // Check if we're waiting for confirmation and enough time has passed
  if (currentEmergency.awaiting_patient_confirmation) {
    const lastUpdate = new Date(currentEmergency.updated_at).getTime();
    const timePassed = Date.now() - lastUpdate;
    const timeoutMinutes = 5; // 5 minute timeout

    if (timePassed > timeoutMinutes * 60 * 1000) {
      autoAdvanced = true;
      
      const updates: any = {
        awaiting_patient_confirmation: false,
        updated_at: now,
      };

      // Auto-advance based on current status
      if (currentEmergency.status === 'arrived_at_scene' && !currentEmergency.patient_confirmed_arrival) {
        updates.patient_confirmed_arrival = true;
        updates.patient_confirmed_arrival_at = now;
        updates.status = 'patient_loaded';
        updates.patient_loaded_at = now;
      } else if (currentEmergency.status === 'arrived_at_hospital' && !currentEmergency.patient_confirmed_completion) {
        updates.patient_confirmed_completion = true;
        updates.patient_confirmed_completion_at = now;
        updates.status = 'completed';
        updates.completed_at = now;
      }

      const { data: emergency, error } = await supabase
        .from('emergencies')
        .update(updates)
        .eq('id', emergencyId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, emergency: toCamelCase(emergency), autoAdvanced };
    }
  }

  return { success: true, emergency: toCamelCase(currentEmergency), autoAdvanced };
};