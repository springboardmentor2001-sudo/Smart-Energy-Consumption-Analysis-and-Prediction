import React, { useEffect, useState } from 'react';
import { Zap, Clock, Calendar, Activity, Cpu } from 'lucide-react';
import KPICard from '../components/dashboard/KPICard';
import UsageChart from '../components/dashboard/UsageChart';
import EnergyPredictor from '../components/dashboard/EnergyPredictor';
import { getSummary, getDeviceUsage, getChartData } from '../services/api';

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [deviceData, setDeviceData] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryData, devices, charts] = await Promise.all([
                    getSummary(),
                    getDeviceUsage(),
                    getChartData()
                ]);
                setSummary(summaryData);
                setDeviceData(devices);
                setChartData(charts);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        
        // Refresh every 30s
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[500px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    const isPeakLoad = summary?.current_usage > 2.0;

    return (
        <div className="space-y-8 fade-in pb-10">
            {/* Hero Section */}
            <div className="relative rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-1 overflow-hidden">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl" />
                <div className="relative rounded-[22px] bg-background/40 p-8 backdrop-blur-xl border border-white/10 shadow-2xl">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                System Online
                            </span>
                            <h1 className="text-4xl font-bold tracking-tight text-foreground">
                                Welcome back, <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">Rahul</span>
                            </h1>
                            <p className="text-muted-foreground max-w-lg text-lg">
                                Your energy efficiency score is <span className="text-foreground font-semibold">{summary?.efficiency_score || 0}</span> today. 
                                {summary?.efficiency_score > 80 ? " Excellent work!" : " Consider optimizing usage."}
                            </p>
                        </div>

                        {/* Hero Stats */}
                        <div className="flex gap-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center min-w-[120px]">
                                <p className="text-sm text-muted-foreground mb-1">Efficiency Score</p>
                                <div className="text-3xl font-bold text-emerald-400">{summary?.efficiency_score || 0}</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center min-w-[120px]">
                                <p className="text-sm text-muted-foreground mb-1">Est. Cost (Today)</p>
                                <div className="text-3xl font-bold text-primary">₹{summary?.today_cost || 0}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alert Banner */}
            {isPeakLoad && (
                <div className="flex items-center justify-between rounded-xl border border-warning/20 bg-warning/10 px-6 py-4 text-warning animate-in slide-in-from-top-2 shadow-lg shadow-warning/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-warning/20 rounded-lg">
                            <Activity className="h-5 w-5 animate-pulse" />
                        </div>
                        <div>
                            <span className="font-bold block text-sm uppercase tracking-wide">Peak Load Detected</span>
                            <span className="text-sm opacity-90">Usage is continuously high ({summary?.current_usage} kW).</span>
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-warning/20 hover:bg-warning/30 text-xs font-bold rounded-lg transition-colors">
                        View Details
                    </button>
                </div>
            )}

            {/* KPI Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Current Power Usage"
                    value={summary?.current_usage || "0"}
                    unit="kW"
                    icon={Zap}
                    trend="down" // This could be dynamic based on comparison
                    trendValue="12"
                    className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20"
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
                    title="Est. Monthly Cost"
                    value={`₹${summary?.monthly_cost || 0}`}
                    unit=""
                    icon={Activity}
                    className="border-blue-500/20 bg-blue-500/5"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Large Chart */}
                <div className="lg:col-span-2 rounded-3xl glass-card p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
                    {/* Glow effect behind chart */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10 mb-8 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" />
                                Hourly Energy Usage
                            </h3>
                            <p className="text-sm text-muted-foreground">Real-time consumption (Last 24 Hours)</p>
                        </div>
                    </div>
                    <div className="relative z-10 h-[350px]">
                        <UsageChart data={chartData} type="area" />
                    </div>
                </div>

                {/* Side Panel: Device Breakdown */}
                <div className="rounded-3xl glass-card p-8 border border-white/5 shadow-xl flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-foreground mb-1">Device Breakdown</h3>
                        <p className="text-sm text-muted-foreground">Consumption by category (Est.)</p>
                    </div>
                    <div className="flex-1 min-h-[250px]">
                        <UsageChart data={deviceData} type="bar" />
                    </div>
                    <div className="mt-6 pt-6 border-t border-white/5">
                        <button className="w-full py-3 rounded-xl bg-secondary/50 hover:bg-secondary/80 text-sm font-medium transition-colors border border-white/5 flex items-center justify-center gap-2 group">
                            View Device Manager
                            <Clock className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <EnergyPredictor />
                </div>
                <div className="rounded-3xl glass-card p-1 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-0">
                    <div className="h-full w-full rounded-[20px] bg-background/60 backdrop-blur-xl p-6 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                            <Cpu className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">AI Insights Available</h3>
                            <p className="text-sm text-muted-foreground mt-2 max-w-[200px] mx-auto">
                                Analysis of your usage patterns suggests you could save by shifting load.
                            </p>
                        </div>
                        <button className="px-6 py-2 rounded-xl bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-opacity">
                            Chat with AI
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
