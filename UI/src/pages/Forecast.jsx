import React from 'react';
import EnergyPredictor from '../components/dashboard/EnergyPredictor';
import { Sparkles } from 'lucide-react';

const Forecast = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Sparkles className="h-8 w-8 text-primary" />
                    Energy Forecast
                </h1>
                <p className="text-muted-foreground text-lg">
                    Predict your future energy consumption based on environmental factors and usage patterns.
                </p>
            </div>

            <div className="grid gap-6">
                <EnergyPredictor />

                {/* Additional context or charts could go here in the future */}
                {/* Additional context or charts could go here in the future */}
                <div className="rounded-2xl border border-primary/20 bg-background/50 p-6 shadow-sm backdrop-blur-md transition-all hover:bg-background/80">
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                        <Sparkles className="h-5 w-5 text-primary" />
                        How it works
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                        Our AI model analyzes your inputs like <span className="font-medium text-foreground">temperature</span>, <span className="font-medium text-foreground">humidity</span>, and active <span className="font-medium text-foreground">devices</span> to estimate your energy usage for the next 24 hours. Adjust the parameters above to see how changes in your home environment might affect your bill.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Forecast;
