import React from 'react';
import { cn } from '../../lib/utils';

const KPICard = ({ title, value, unit, trend, trendValue, icon: Icon, className }) => {
    return (
        <div className={cn("rounded-xl border border-border bg-card p-6 shadow-sm", className)}>
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            </div>
            <div className="mt-4 flex items-baseline">
                <span className="text-2xl font-bold text-foreground">{value}</span>
                <span className="ml-1 text-sm text-muted-foreground">{unit}</span>
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-xs">
                    <span className={cn("font-medium", trend === 'up' ? "text-destructive" : "text-emerald-500")}>
                        {trend === 'up' ? '↑' : '↓'} {trendValue}%
                    </span>
                    <span className="ml-2 text-muted-foreground">vs last month</span>
                </div>
            )}
        </div>
    );
};

export default KPICard;
