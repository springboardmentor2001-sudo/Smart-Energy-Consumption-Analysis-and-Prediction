import React from 'react';
import { cn } from '../../lib/utils';

const KPICard = ({ title, value, unit, trend, trendValue, icon: Icon, className }) => {
    return (
        <div className={cn(
            "group relative overflow-hidden rounded-2xl glass-card p-6 transition-all duration-300 hover:bg-primary/5",
            className
        )}>
            {/* Background Decor */}
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-all group-hover:bg-primary/20" />

            <div className="relative z-10 flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">{title}</h3>
                {Icon && <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Icon className="h-4 w-4" />
                </div>}
            </div>

            <div className="relative z-10 mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight text-foreground">{value}</span>
                <span className="text-sm font-medium text-muted-foreground">{unit}</span>
            </div>

            {trend && (
                <div className="relative z-10 mt-4 flex items-center text-xs font-medium">
                    <span className={cn(
                        "flex items-center gap-0.5 rounded-full px-2 py-0.5",
                        trend === 'up'
                            ? "bg-destructive/10 text-destructive"
                            : "bg-emerald-500/10 text-emerald-500"
                    )}>
                        {trend === 'up' ? '↑' : '↓'} {trendValue}%
                    </span>
                    <span className="ml-2 text-muted-foreground/70">vs last month</span>
                </div>
            )}
        </div>
    );
};

export default KPICard;
