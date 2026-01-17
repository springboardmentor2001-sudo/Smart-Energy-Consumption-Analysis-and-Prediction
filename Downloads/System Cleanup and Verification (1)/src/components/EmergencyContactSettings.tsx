import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from '../context/AuthContext';
import { Phone, UserPlus, Trash2, Check, AlertCircle, Edit2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../utils/supabase/client';

interface EmergencyContact {
  id?: string;
  name: string;
  phone: string;
  relationship: string;
  priority: number; // 1 = primary, 2 = secondary, 3 = tertiary
  notifyViaSMS: boolean;
  notifyViaCall: boolean;
}

export const EmergencyContactSettings: React.FC = () => {
  const { user, profile } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newContact, setNewContact] = useState<EmergencyContact>({
    name: '',
    phone: '',
    relationship: '',
    priority: 1,
    notifyViaSMS: true,
    notifyViaCall: false,
  });

  // Load contacts from Supabase
  React.useEffect(() => {
    loadContacts();
  }, [user]);

  const loadContacts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: true });

      if (error) throw error;
      
      if (data) {
        setContacts(data);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      // If table doesn't exist, that's okay - user can still add contacts
    }
  };

  const addContact = async () => {
    if (!user) return;
    
    // Validation
    if (!newContact.name.trim()) {
      toast.error('Please enter contact name');
      return;
    }
    if (!newContact.phone.trim()) {
      toast.error('Please enter phone number');
      return;
    }
    if (!newContact.relationship.trim()) {
      toast.error('Please enter relationship');
      return;
    }

    // Phone validation (basic)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(newContact.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    // Max 5 contacts
    if (contacts.length >= 5) {
      toast.error('Maximum 5 emergency contacts allowed');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .insert([{
          user_id: user.id,
          name: newContact.name,
          phone: newContact.phone,
          relationship: newContact.relationship,
          priority: contacts.length + 1,
          notify_via_sms: newContact.notifyViaSMS,
          notify_via_call: newContact.notifyViaCall,
        }])
        .select();

      if (error) throw error;

      toast.success(`✅ ${newContact.name} added as emergency contact`);
      
      // Reset form
      setNewContact({
        name: '',
        phone: '',
        relationship: '',
        priority: 1,
        notifyViaSMS: true,
        notifyViaCall: false,
      });

      await loadContacts();
    } catch (error: any) {
      console.error('Error adding contact:', error);
      toast.error('Failed to add contact: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to remove this emergency contact?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      toast.success('Emergency contact removed');
      await loadContacts();
    } catch (error: any) {
      toast.error('Failed to remove contact: ' + error.message);
    }
  };

  const updateContactPriority = async (contactId: string, newPriority: number) => {
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .update({ priority: newPriority })
        .eq('id', contactId);

      if (error) throw error;

      await loadContacts();
    } catch (error: any) {
      toast.error('Failed to update priority: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-pink-600" />
            Emergency Contacts
          </CardTitle>
          <CardDescription>
            Add up to 5 contacts who will be notified automatically when you trigger an emergency SOS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Auto-Notification:</strong> When you press the SOS button, all contacts will receive:
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>📱 Instant SMS with your live location</li>
                <li>🔗 Real-time tracking link</li>
                <li>📞 Optional voice call for critical emergencies</li>
                <li>✅ Status updates at each stage</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Current Contacts */}
          {contacts.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Your Emergency Contacts</h3>
              {contacts.map((contact, index) => (
                <div
                  key={contact.id || index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        Priority {contact.priority}
                      </Badge>
                      <p className="font-medium">{contact.name}</p>
                    </div>
                    <p className="text-sm text-gray-600">{contact.phone}</p>
                    <p className="text-xs text-gray-500">{contact.relationship}</p>
                    <div className="flex gap-2 mt-2">
                      {contact.notifyViaSMS && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          📱 SMS
                        </Badge>
                      )}
                      {contact.notifyViaCall && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          📞 Call
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {index > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => contact.id && updateContactPriority(contact.id, index)}
                        title="Move up"
                      >
                        ↑
                      </Button>
                    )}
                    {index < contacts.length - 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => contact.id && updateContactPriority(contact.id, index + 2)}
                        title="Move down"
                      >
                        ↓
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => contact.id && deleteContact(contact.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Contact Form */}
          {contacts.length < 5 && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Add Emergency Contact
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact-name">Full Name *</Label>
                  <Input
                    id="contact-name"
                    placeholder="John Doe"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="contact-phone">Phone Number *</Label>
                  <Input
                    id="contact-phone"
                    placeholder="+1 (555) 123-4567"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="contact-relationship">Relationship *</Label>
                  <Input
                    id="contact-relationship"
                    placeholder="Spouse, Parent, Sibling, Friend..."
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notification Methods</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newContact.notifyViaSMS}
                        onChange={(e) => setNewContact({ ...newContact, notifyViaSMS: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">SMS</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newContact.notifyViaCall}
                        onChange={(e) => setNewContact({ ...newContact, notifyViaCall: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Voice Call (Critical Only)</span>
                    </label>
                  </div>
                </div>
              </div>

              <Button
                onClick={addContact}
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700"
              >
                {loading ? (
                  <span>Adding...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Add Emergency Contact
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Test Notification */}
          {contacts.length > 0 && (
            <div className="border-t pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  toast.info('Test notification sent to all contacts (simulated)');
                }}
                className="w-full"
              >
                📤 Send Test Notification
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
