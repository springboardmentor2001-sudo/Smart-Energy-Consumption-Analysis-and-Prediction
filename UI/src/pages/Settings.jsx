import React, { useState, useEffect } from 'react';
import { User, Bell, Monitor, Save, Shield, Zap, Home, Moon, Sun, Smartphone, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { getSettings, saveSettings } from '../services/api';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null

    const [settings, setSettings] = useState({
        profile: {
            name: '',
            email: '',
            phone: '',
            role: 'User'
        },
        energy: {
            squareFootage: 0,
            occupants: 0,
            budgetLimit: 0,
            currency: 'INR',
            baseLoad: 0,
            electricityRate: 9 // Default
        },
        preferences: {
            theme: 'dark',
            notifications: true,
            emailReports: true,
            dataSharing: false,
            compactMode: false
        }
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const data = await getSettings();
        if (data) {
            setSettings(data);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setSaveStatus(null);
        const result = await saveSettings(settings);
        setLoading(false);
        
        if (result && !result.error) {
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
        } else {
            setSaveStatus('error');
        }
    };

    const updateNestedState = (section, key, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    };

    const tabs = [
        { id: 'profile', label: 'Energy Profile', icon: Zap },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'app', label: 'App Settings', icon: Monitor },
    ];

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-400">Settings & Control</h2>
                    <p className="text-muted-foreground">Manage your energy profile and application preferences</p>
                </div>
                <div className="flex items-center gap-3">
                    {saveStatus === 'success' && (
                        <span className="text-emerald-400 text-sm font-medium flex items-center gap-2 animate-in fade-in">
                            <CheckCircle className="h-4 w-4" /> Saved!
                        </span>
                    )}
                    <button 
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium shadow-lg hover:bg-primary/90 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading ? <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-3 space-y-2">
                    <div className="glass-card p-2 rounded-2xl">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                    activeTab === tab.id
                                        ? "bg-primary/10 text-primary shadow-sm"
                                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                )}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Quick Stats Card */}
                    <div className="glass-card p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Account Status</p>
                                <p className="text-sm font-semibold text-emerald-500">Pro Active</p>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground/80 leading-relaxed">
                            Your energy data is encrypted and backed up daily.
                        </p>
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-9">
                    <div className="glass-card p-6 rounded-2xl min-h-[500px]">
                        
                        {/* Energy Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-8 animate-fade-in-up">
                                <div>
                                    <h3 className="text-lg font-semibold mb-1">Household Configuration</h3>
                                    <p className="text-sm text-muted-foreground mb-6">Update these details to improve prediction accuracy.</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">Square Footage</label>
                                            <div className="relative">
                                                <Home className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <input 
                                                    type="number" 
                                                    value={settings.energy.squareFootage}
                                                    onChange={(e) => updateNestedState('energy', 'squareFootage', e.target.value)}
                                                    className="w-full bg-secondary/30 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">Number of Occupants</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <input 
                                                    type="number" 
                                                    value={settings.energy.occupants}
                                                    onChange={(e) => updateNestedState('energy', 'occupants', e.target.value)}
                                                    className="w-full bg-secondary/30 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">Monthly Budget Target (INR)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">₹</span>
                                                <input 
                                                    type="number" 
                                                    value={settings.energy.budgetLimit}
                                                    onChange={(e) => updateNestedState('energy', 'budgetLimit', e.target.value)}
                                                    className="w-full bg-secondary/30 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">Base Load (kWh)</label>
                                            <div className="relative">
                                                <Zap className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <input 
                                                    type="number" 
                                                    value={settings.energy.baseLoad}
                                                    onChange={(e) => updateNestedState('energy', 'baseLoad', e.target.value)}
                                                    className="w-full bg-secondary/30 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">Electricity Rate (Rs/Unit)</label>
                                            <div className="relative">
                                                <Zap className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <input 
                                                    type="number" 
                                                    step="0.1"
                                                    value={settings.energy.electricityRate}
                                                    onChange={(e) => updateNestedState('energy', 'electricityRate', e.target.value)}
                                                    className="w-full bg-secondary/30 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">Residential Scaling Factor</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">%</span>
                                                <input 
                                                    type="number" 
                                                    step="0.01"
                                                    value={settings.energy.residential_factor || 0.02}
                                                    onChange={(e) => updateNestedState('energy', 'residential_factor', e.target.value)}
                                                    className="w-full bg-secondary/30 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">Default: 0.02. Multiply raw industrial model output to match home usage.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-white/5" />

                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Device Inventory</h3>
                                    <div className="bg-secondary/20 rounded-xl p-4 border border-white/5">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-sm font-medium">Smart Devices Connected</span>
                                            <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded-md">8 Devices</span>
                                        </div>
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {[1,2,3,4].map(i => (
                                                <div key={i} className="h-8 w-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs text-muted-foreground">
                                                    <Zap className="h-3 w-3" />
                                                </div>
                                            ))}
                                            <div className="h-8 w-8 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-xs text-muted-foreground font-medium">+4</div>
                                        </div>
                                        <button className="mt-4 w-full py-2 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
                                            Manage Devices
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        { activeTab === 'notifications' && (
                            <div className="space-y-6 animate-fade-in-up">
                                <h3 className="text-lg font-semibold">Notification Preferences</h3>
                                
                                {[
                                    { id: 'notifications', label: 'Smart Anomaly Alerts', desc: 'Get notified when unusual power spikes are detected.', checked: settings.preferences.notifications },
                                    { id: 'emailReports', label: 'Weekly Summary Report', desc: 'Receive a weekly digest of your consumption stats.', checked: settings.preferences.emailReports },
                                    { id: 'budgetAlerts', label: 'Budget Threshold Warning', desc: 'Alert when you exceed 80% of your monthly budget.', checked: settings.preferences.budgetAlerts },
                                    { id: 'marketingEmails', label: 'Product Updates & Tips', desc: 'News about new features and energy saving tips.', checked: settings.preferences.marketingEmails },
                                ].map((item) => (
                                    <div key={item.id} className="flex items-start justify-between p-4 rounded-xl bg-secondary/10 border border-white/5 hover:bg-secondary/20 transition-colors">
                                        <div>
                                            <p className="font-medium text-sm text-foreground">{item.label}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                                        </div>
                                        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                            <input 
                                                type="checkbox" 
                                                name={item.id} 
                                                id={item.id} 
                                                checked={!!item.checked} 
                                                onChange={(e) => updateNestedState('preferences', item.id, e.target.checked)}
                                                className="peer toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full" 
                                            />
                                            <label htmlFor={item.id} className="toggle-label block overflow-hidden h-5 rounded-full bg-muted cursor-pointer peer-checked:bg-primary transition-colors duration-200"></label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* App Settings Tab */}
                        {activeTab === 'app' && (
                            <div className="space-y-8 animate-fade-in-up">
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Appearance</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <button 
                                            onClick={() => updateNestedState('preferences', 'theme', 'light')}
                                            className={cn("flex flex-col items-center gap-3 p-4 rounded-xl border transition-all group", 
                                                settings.preferences.theme === 'light' ? "border-primary bg-primary/5" : "border-white/10 hover:bg-white/5"
                                            )}
                                        >
                                            <div className="h-20 w-full rounded-lg bg-card border border-border shadow-sm group-hover:shadow-md transition-all flex items-center justify-center">
                                                <Sun className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">Light Mode</span>
                                        </button>
                                        <button 
                                            onClick={() => updateNestedState('preferences', 'theme', 'dark')}
                                            className={cn("flex flex-col items-center gap-3 p-4 rounded-xl border transition-all group", 
                                                settings.preferences.theme === 'dark' ? "border-primary bg-primary/5" : "border-white/10 hover:bg-white/5"
                                            )}
                                        >
                                            <div className="h-20 w-full rounded-lg bg-[#1a1b1e] border border-white/10 shadow-sm flex items-center justify-center">
                                                <Moon className="h-6 w-6 text-primary" />
                                            </div>
                                            <span className="text-xs font-bold text-primary">Dark Mode</span>
                                        </button>
                                        <button 
                                            onClick={() => updateNestedState('preferences', 'theme', 'system')}
                                            className={cn("flex flex-col items-center gap-3 p-4 rounded-xl border transition-all group", 
                                                settings.preferences.theme === 'system' ? "border-primary bg-primary/5" : "border-white/10 hover:bg-white/5"
                                            )}
                                        >
                                            <div className="h-20 w-full rounded-lg bg-gradient-to-br from-card to-[#1a1b1e] border border-border flex items-center justify-center">
                                                <Smartphone className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">System</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Display Options</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-muted-foreground">Compact Mode</span>
                                            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                                <input 
                                                    type="checkbox" 
                                                    checked={settings.preferences.compactMode}
                                                    onChange={(e) => updateNestedState('preferences', 'compactMode', e.target.checked)}
                                                    className="peer toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full" 
                                                />
                                                <label className="toggle-label block overflow-hidden h-5 rounded-full bg-muted cursor-pointer peer-checked:bg-primary transition-colors duration-200"></label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
