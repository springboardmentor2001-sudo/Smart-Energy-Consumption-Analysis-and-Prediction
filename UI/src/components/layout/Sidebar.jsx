import React from 'react';
import { LayoutDashboard, Lightbulb, LineChart, Zap, FileText, Bot, Settings, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';

const Sidebar = ({ activePage, setActivePage, isCollapsed, setIsCollapsed, onLogout }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'devices', label: 'Devices', icon: Zap },
        { id: 'forecast', label: 'Forecast', icon: LineChart },
        { id: 'insights', label: 'Smart Insights', icon: Lightbulb },
        { id: 'reports', label: 'Reports', icon: FileText },
        { id: 'assistant', label: 'AI Assistant', icon: Bot },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside
            className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 glass border-r border-white/10 ${isCollapsed ? 'w-20' : 'w-64'
                } -translate-x-full sm:translate-x-0`}
        >
            <div className="flex h-full flex-col py-6 px-3">
                {/* Header / Logo */}
                <div className={`mb-10 flex items-center ${isCollapsed ? 'justify-center pl-0' : 'pl-2'}`}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shadow-sm shrink-0">
                        <Zap className="h-6 w-6 text-primary" />
                    </div>
                    {!isCollapsed && (
                        <span className="ml-3 self-center whitespace-nowrap text-xl font-bold tracking-tight text-foreground fade-in">
                            SmartEnergy
                        </span>
                    )}
                </div>

                {/* Menu Items */}
                <ul className="space-y-2 font-medium flex-1">
                    {menuItems.map((item) => (
                        <li key={item.id}>
                            <button
                                onClick={() => setActivePage(item.id)}
                                title={isCollapsed ? item.label : ''}
                                className={`group flex w-full items-center rounded-xl p-3 text-sm font-medium transition-all duration-200 ${activePage === item.id
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                                    } ${isCollapsed ? 'justify-center' : ''}`}
                            >
                                <item.icon
                                    className={`h-5 w-5 shrink-0 transition duration-200 ${activePage === item.id
                                        ? 'text-primary-foreground'
                                        : 'text-muted-foreground group-hover:text-primary'
                                        }`}
                                />
                                {!isCollapsed && (
                                    <span className="ml-3 fade-in">{item.label}</span>
                                )}
                                {!isCollapsed && activePage === item.id && (
                                    <div className="ml-auto h-2 w-2 rounded-full bg-white/40 shadow-sm"></div>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Energy Tip - Hide when collapsed */}
                {!isCollapsed && (
                    <div className="mt-auto fade-in">
                        <div className="rounded-2xl bg-primary/10 p-5 border border-primary/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-primary/20 blur-2xl group-hover:bg-primary/30 transition-colors"></div>
                            <h5 className="mb-2 text-sm font-semibold text-primary flex items-center gap-2">
                                <Lightbulb className="h-4 w-4" /> Energy Tip
                            </h5>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Adjusting your AC by just 1°C can save up to 6% on your energy bill this month.
                            </p>
                        </div>
                    </div>
                )}

                {/* Logout Button */}
                <div className="mt-2">
                    <button
                        onClick={onLogout}
                        title={isCollapsed ? 'Log Out' : ''}
                        className={`group flex w-full items-center rounded-xl p-3 text-sm font-medium transition-all duration-200 text-destructive hover:bg-destructive/10 ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <LogOut className="h-5 w-5 shrink-0 transition duration-200 group-hover:text-destructive" />
                        {!isCollapsed && (
                            <span className="ml-3 fade-in">Log Out</span>
                        )}
                    </button>
                </div>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="mt-4 flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
                >
                    {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
