import React from 'react';
import { LayoutDashboard, Lightbulb, LineChart, Zap, FileText, Bot, Settings } from 'lucide-react';

const Sidebar = ({ activePage, setActivePage }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'devices', label: 'Devices', icon: Zap },
        { id: 'forecast', label: 'Forecast', icon: LineChart },
        { id: 'insights', label: 'Smart Insights', icon: Lightbulb }, // Fixed icon name
        { id: 'reports', label: 'Reports', icon: FileText },
        { id: 'assistant', label: 'AI Assistant', icon: Bot },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full transition-transform sm:translate-x-0 border-r border-border bg-card">
            <div className="flex h-full flex-col overflow-y-auto py-5 px-3">
                <div className="mb-10 flex items-center pl-2.5">
                    <Zap className="mr-3 h-8 w-8 text-primary" />
                    <span className="self-center whitespace-nowrap text-xl font-semibold text-foreground">
                        SmartEnergy
                    </span>
                </div>
                <ul className="space-y-2 font-medium">
                    {menuItems.map((item) => (
                        <li key={item.id}>
                            <button
                                onClick={() => setActivePage(item.id)}
                                className={`group flex w-full items-center rounded-lg p-2 text-foreground hover:bg-muted ${activePage === item.id ? 'bg-muted' : ''
                                    }`}
                            >
                                <item.icon
                                    className={`h-5 w-5 transition duration-75 ${activePage === item.id
                                        ? 'text-primary'
                                        : 'text-muted-foreground group-hover:text-foreground'
                                        }`}
                                />
                                <span className="ml-3">{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
                <div className="mt-auto px-2">
                    <div className="rounded-lg bg-primary/10 p-4">
                        <h5 className="mb-2 text-sm font-medium text-primary">Energy Saving Tip</h5>
                        <p className="mb-3 text-xs text-muted-foreground">Adjust AC temperature to 24°C to save 6% energy.</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
