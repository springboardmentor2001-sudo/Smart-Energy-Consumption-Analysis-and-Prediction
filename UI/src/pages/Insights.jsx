import React, { useState } from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, Leaf } from 'lucide-react';

const InsightCard = ({ title, description, type, icon: Icon }) => (
    <div className="flex items-start gap-4 rounded-2xl glass-card p-5 shadow-sm transition-all hover:scale-[1.01]">
        <div className={`rounded-full p-2 ${type === 'warning' ? 'bg-amber-100 text-amber-600' :
                type === 'success' ? 'bg-green-100 text-green-600' :
                    'bg-blue-100 text-blue-600'
            }`}>
            <Icon className="h-5 w-5" />
        </div>
        <div>
            <h4 className="font-semibold text-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    </div>
);

const Insights = () => {
    const [showScoreDetails, setShowScoreDetails] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Lightbulb className="h-8 w-8 text-primary" />
                    Smart Insights
                </h1>
                <p className="text-muted-foreground text-lg">
                    AI-powered analysis to help you optimize consumption and save costs.
                </p>
            </div>

            {/* Efficiency Score */}
            <div className="grid gap-6 md:grid-cols-3">
                <div
                    onClick={() => setShowScoreDetails(!showScoreDetails)}
                    className="col-span-1 cursor-pointer overflow-hidden rounded-xl border border-border bg-gradient-to-br from-primary/10 to-primary/5 p-6 shadow-sm border-primary/20 transition-all hover:shadow-md hover:scale-[1.02] group"
                >
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="relative mb-4 flex h-32 w-32 items-center justify-center">
                            <svg className="absolute h-full w-full rotate-[-90deg]" viewBox="0 0 100 100">
                                <circle className="stroke-muted text-muted/20" strokeWidth="10" fill="transparent" r="40" cx="50" cy="50" />
                                <circle
                                    className="stroke-primary text-primary transition-all duration-1000 ease-out group-hover:stroke-emerald-400"
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                    strokeDasharray="251.2"
                                    strokeDashoffset={251.2 * (1 - 0.85)}
                                    fill="transparent"
                                    r="40"
                                    cx="50"
                                    cy="50"
                                />
                            </svg>
                            <div className="flex flex-col items-center">
                                <span className="block text-4xl font-bold text-foreground">85</span>
                                <span className="text-xs text-muted-foreground">/ 100</span>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">Efficiency Score</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                            Good job! You are more efficient than 72% of similar homes.
                        </p>

                        <div className={`grid transition-all duration-300 ${showScoreDetails ? 'grid-rows-[1fr] mt-4 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                            <div className="overflow-hidden">
                                <ul className="space-y-2 text-left text-sm text-muted-foreground border-t border-border pt-3">
                                    <li className="flex justify-between"><span>Appliance Health</span> <span className="text-emerald-500">90/100</span></li>
                                    <li className="flex justify-between"><span>Peak Usage</span> <span className="text-amber-500">65/100</span></li>
                                    <li className="flex justify-between"><span>Always On</span> <span className="text-primary">80/100</span></li>
                                </ul>
                            </div>
                        </div>

                        <span className="mt-3 text-xs font-medium text-primary opacity-60 group-hover:opacity-100 transition-opacity">
                            {showScoreDetails ? "Click to hide" : "Click for details"}
                        </span>
                    </div>
                </div>

                <div className="col-span-2 space-y-4">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        Anomalies & Alerts
                    </h3>
                    <div className="grid gap-4">
                        <InsightCard
                            type="warning"
                            icon={AlertTriangle}
                            title="Unusual High Usage at Night"
                            description="HVAC usage was 30% higher than average between 2 AM and 4 AM last night."
                        />
                        <InsightCard
                            type="success"
                            icon={CheckCircle}
                            title="Optimization Success"
                            description="Reducing thermostat by 1°C yesterday saved approximately 2.1 kWh."
                        />
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-4 pt-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-500" />
                    Smart Recommendations
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <InsightCard
                        type="info"
                        icon={TrendingUp}
                        title="Shift Load to Off-Peak"
                        description="Running your washing machine after 9 PM could save you ~$12/month."
                    />
                    <InsightCard
                        type="info"
                        icon={Lightbulb}
                        title="Lighting Efficiency"
                        description="You have 3 lights frequently left on in the 'Living Room' when unoccupied."
                    />
                </div>
            </div>
        </div>
    );
};

export default Insights;
