
import React, { useEffect, useState } from 'react';
import { Zap, Clock, Calendar, Activity, Cpu } from 'lucide-react';
import KPICard from '../components/dashboard/KPICard';
import UsageChart from '../components/dashboard/UsageChart';
import { getSummary, getDeviceUsage } from '../services/api';

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [deviceData, setDeviceData] = useState([]);
    const [loading, setLoading] = useState(true);

    const hourlyData = [
        { name: '00:00', value: 0.8 }, { name: '04:00', value: 0.5 },
        { name: '08:00', value: 2.1 }, { name: '12:00', value: 3.5 },
        { name: '16:00', value: 2.8 }, { name: '20:00', value: 4.2 },
        { name: '23:59', value: 1.5 },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryData, devices] = await Promise.all([
                    getSummary(),
                    getDeviceUsage()
                ]);
                setSummary(summaryData);
                setDeviceData(devices);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
                // Optionally set error state here
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-10 text-center">Loading dashboard...</div>;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Current Power Usage"
                    value={summary?.current_usage || "0"}
                    unit="kW"
                    icon={Zap}
                    trend="down"
                    trendValue="12"
                />
                <KPICard
                    title="Today's Consumption"
                    value={summary?.today_consumption || "0"}
                    unit="kWh"
                    icon={Clock}
                    trend="up"
                    trendValue="5"
                />
                <KPICard
                    title="Monthly Consumption"
                    value={summary?.monthly_consumption || "0"}
                    unit="kWh"
                    icon={Calendar}
                    trend="up"
                    trendValue="2.1"
                />
                <KPICard
                    title="Predicted (24h)"
                    value={summary?.predicted_24h || "0"}
                    unit="kWh"
                    icon={Activity}
                    className="border-primary/50 bg-primary/5"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border border-border bg-card p-6">
                    <h3 className="mb-4 text-lg font-semibold text-foreground">Hourly Energy Usage</h3>
                    <UsageChart data={hourlyData} type="area" />
                </div>
                <div className="col-span-3 rounded-xl border border-border bg-card p-6">
                    <h3 className="mb-4 text-lg font-semibold text-foreground">Device Breakdown</h3>
                    <UsageChart data={deviceData} type="bar" />
                </div>
            </div>

            {/* Quick Action / Ask AI */}
            <div className="flex justify-end">
                <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 shadow-lg transition-all">
                    <Cpu className="h-4 w-4" />
                    Ask AI about today's usage
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
