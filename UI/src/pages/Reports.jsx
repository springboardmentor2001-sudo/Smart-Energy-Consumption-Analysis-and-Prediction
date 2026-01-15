import React from 'react';
import { FileText, Download, DollarSign, PieChart as PieChartIcon, Calendar } from 'lucide-react';
import KPICard from '../components/dashboard/KPICard';

const Reports = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <FileText className="h-8 w-8 text-primary" />
                    Reports & Billing
                </h1>
                <p className="text-muted-foreground text-lg">
                    View your monthly summaries, estimated costs, and export data.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                 <KPICard
                    title="Estimated Bill (Month)"
                    value="$142.50"
                    unit=""
                    icon={DollarSign}
                    trend="up"
                    trendValue="5"
                    className="border-primary/20 bg-primary/5"
                />
                 <KPICard
                    title="Total Consumption"
                    value="950"
                    unit="kWh"
                    icon={PieChartIcon}
                />
                 <KPICard
                    title="Billing Cycle"
                    value="12"
                    unit="Says left"
                    icon={Calendar}
                    trend="stable"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Visual Breakdown Placeholder */}
                <div className="col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm min-h-[300px] flex flex-col">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Cost Distribution</h3>
                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-muted rounded-lg bg-muted/20">
                        <p className="text-muted-foreground">Chart: Cost Breakdown by Device Category</p>
                    </div>
                </div>

                {/* Export Options */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm h-fit">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Export Reports</h3>
                    <div className="space-y-3">
                        <button className="flex w-full items-center justify-between rounded-lg border border-border bg-background p-3 hover:bg-muted transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="rounded-md bg-red-100 p-2 text-red-600">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-sm">Monthly Report (PDF)</p>
                                    <p className="text-xs text-muted-foreground">December 2025</p>
                                </div>
                            </div>
                            <Download className="h-4 w-4 text-muted-foreground" />
                        </button>

                        <button className="flex w-full items-center justify-between rounded-lg border border-border bg-background p-3 hover:bg-muted transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="rounded-md bg-green-100 p-2 text-green-600">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-sm">Raw Data (CSV)</p>
                                    <p className="text-xs text-muted-foreground">Last 30 Days</p>
                                </div>
                            </div>
                            <Download className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
