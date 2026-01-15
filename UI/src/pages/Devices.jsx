import React, { useEffect, useState } from 'react';
import { getDeviceUsage } from '../services/api';
import { Power, Tv, Fan, Lightbulb, Smartphone, MoreHorizontal, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '../lib/utils';

// Helper to map device names to icons
const getDeviceIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('ac') || lowerName.includes('conditioner')) return Fan;
    if (lowerName.includes('tv') || lowerName.includes('television')) return Tv;
    if (lowerName.includes('light') || lowerName.includes('lamp')) return Lightbulb;
    if (lowerName.includes('fridge') || lowerName.includes('refrigerator')) return Power; // Fallback or specific icon if available
    return Power;
};

const DeviceCard = ({ device }) => {
    const [isOn, setIsOn] = useState(true); // Mock state
    const Icon = getDeviceIcon(device.name);

    const getTrendIcon = (trend) => {
        if (trend === 'up') return <ArrowUp className="h-4 w-4 text-red-500" />;
        if (trend === 'down') return <ArrowDown className="h-4 w-4 text-green-500" />;
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    };

    return (
        <div className={cn(
            "group relative overflow-hidden rounded-2xl glass-card p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
            isOn ? "border-primary/20 bg-primary/5" : "border-white/5"
        )}>
            {/* Active Pulse Background */}
            {isOn && (
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
            )}

            <div className="flex items-start justify-between relative z-10">
                <div className={cn(
                    "relative flex h-14 w-14 items-center justify-center rounded-2xl transition-colors",
                    isOn ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground"
                )}>
                    <Icon className="h-7 w-7" />
                    {isOn && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400 border-2 border-primary"></span>
                        </span>
                    )}
                </div>

                <button
                    onClick={() => setIsOn(!isOn)}
                    className={cn(
                        "relative h-7 w-12 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        isOn ? "bg-primary/90" : "bg-muted-foreground/30"
                    )}
                >
                    <span className={cn(
                        "block h-5 w-5 rounded-full bg-background shadow-sm transition-transform duration-300",
                        isOn ? "translate-x-6" : "translate-x-1"
                    )} />
                </button>
            </div>

            <div className="mt-6 relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-semibold text-lg text-foreground">{device.name}</h3>
                        <p className={cn("text-xs font-medium mt-1", isOn ? "text-primary" : "text-muted-foreground")}>
                            {isOn ? "Using Energy" : "Standby Mode"}
                        </p>
                    </div>
                    <span className="inline-flex items-center rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500 ring-1 ring-inset ring-green-500/20">
                        Health: Good
                    </span>
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tighter">{device.value}</span>
                    <span className="text-sm font-medium text-muted-foreground">kWh</span>
                </div>

                {/* Progress / Contribution Mock */}
                <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Contribution</span>
                        <span>15%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full w-[15%] rounded-full bg-primary" />
                    </div>
                </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    {getTrendIcon(device.trend)}
                    <span className="capitalize">{device.trend} trend</span>
                </div>
                <button className="text-xs font-medium text-primary hover:underline">
                    View Details
                </button>
            </div>
        </div>
    );
};

const Devices = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const data = await getDeviceUsage();
                setDevices(data);
            } catch (error) {
                console.error("Failed to load devices", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDevices();
    }, []);

    if (loading) return <div className="p-10 text-center">Loading devices...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Smartphone className="h-8 w-8 text-primary" />
                    Connected Devices
                </h1>
                <p className="text-muted-foreground text-lg">
                    Manage your smart home devices and monitor their real-time energy consumption.
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {devices.map((device, index) => (
                    <DeviceCard key={index} device={device} />
                ))}

                {/* Add New Device Card */}
                <button className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/25 bg-muted/50 p-6 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <div className="mb-4 rounded-full bg-background p-3 shadow-sm">
                        <MoreHorizontal className="h-6 w-6" />
                    </div>
                    <span className="font-medium">Add New Device</span>
                </button>
            </div>
        </div>
    );
};

export default Devices;
