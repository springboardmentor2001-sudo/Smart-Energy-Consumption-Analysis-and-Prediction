import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, Lightbulb, LineChart, Zap, FileText, Bot, Settings, Bell, User, Sun, Moon, LogOut, ChevronDown, CheckCircle } from 'lucide-react';

const Navbar = ({ activePage, setActivePage, onLogout, isDarkMode, toggleTheme }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'devices', label: 'Devices', icon: Zap },
        { id: 'forecast', label: 'Forecast', icon: LineChart },
        { id: 'insights', label: 'Insights', icon: Lightbulb },
        { id: 'reports', label: 'Reports', icon: FileText },
        { id: 'assistant', label: 'Assistant', icon: Bot },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="sticky top-0 z-50 w-full glass border-b border-white/10 shadow-sm">
            <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
                
                {/* Logo Section */}
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
                        <Zap className="h-5 w-5" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-foreground hidden sm:block">
                        SmartEnergy
                    </span>
                </div>

                {/* Navigation Links (Center) */}
                <div className="hidden md:flex items-center gap-1 mx-4 overflow-x-auto">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActivePage(item.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                activePage === item.id
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                            }`}
                        >
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    {/* Theme Toggle */}
                    <button 
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>

                    {/* Notifications */}
                    <button className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-background"></span>
                    </button>

                    <div className="h-6 w-px bg-border/50 mx-1"></div>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={profileRef}>
                        <button 
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 pl-1 group focus:outline-none"
                        >
                            <div className="hidden lg:block text-right">
                                <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">Rahul Rai</p>
                                <p className="text-xs text-muted-foreground">Admin</p>
                            </div>
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-sm ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                                <span className="text-sm font-bold">RR</span>
                            </div>
                            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-card/95 backdrop-blur-2xl border border-white/10 shadow-2xl animate-fade-in-up overflow-hidden ring-1 ring-black/5">
                                <div className="p-4 border-b border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-lg font-bold">
                                            RR
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground">Rahul Rai</p>
                                            <p className="text-xs text-muted-foreground">rahul@infosys.com</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md w-fit">
                                        <CheckCircle className="h-3 w-3" />
                                        <span>Pro Account Active</span>
                                    </div>
                                </div>
                                
                                <div className="p-2 space-y-1">
                                    <button 
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
                                        onClick={() => { setActivePage('settings'); setIsProfileOpen(false); }}
                                    >
                                        <User className="h-4 w-4" />
                                        Profile Settings
                                    </button>
                                    <button 
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
                                        onClick={() => { setActivePage('settings'); setIsProfileOpen(false); }}
                                    >
                                        <Settings className="h-4 w-4" />
                                        Preferences
                                    </button>
                                </div>

                                <div className="p-2 border-t border-border/50">
                                    <button 
                                        onClick={onLogout}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Log Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Mobile Nav Scroller (Visible on small screens) */}
            <div className="md:hidden border-t border-white/5 overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-2 p-2 px-4 min-w-max">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActivePage(item.id)}
                            className={`flex flex-col items-center justify-center gap-1 min-w-[64px] py-2 rounded-lg text-xs font-medium transition-all ${
                                activePage === item.id
                                    ? 'text-primary'
                                    : 'text-muted-foreground'
                            }`}
                        >
                            <div className={`p-1.5 rounded-lg ${activePage === item.id ? 'bg-primary/10' : 'bg-transparent'}`}>
                                <item.icon className="h-5 w-5" />
                            </div>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
