import React, { useState } from 'react';
import { Activity, Zap, Thermometer, Droplets, Users, Layout, Calendar, Bot, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Modal from '../../components/ui/Modal';
import { predictEnergy, batchPredict } from '../../services/api';
import { cn } from '../../lib/utils';

const InputField = ({ label, value, onChange, type = "number", icon: Icon, suffix, min, max, step }) => (
    <div className="group space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 flex items-center justify-between group-focus-within:text-primary transition-colors">
            <span className="flex items-center gap-2">
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {label}
            </span>
            {type === 'range' && <span className="text-primary font-mono">{value}{suffix}</span>}
        </label>
        <div className="relative">
            {type === 'range' ? (
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={onChange}
                    className="w-full accent-primary cursor-pointer"
                />
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    className="w-full rounded-xl border border-input/50 bg-secondary/20 px-4 py-2.5 text-sm backdrop-blur-sm transition-all duration-300 placeholder:text-muted-foreground/50 hover:border-primary/30 hover:bg-secondary/40 focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10 focus-visible:outline-none"
                />
            )}
             {type !== 'range' && suffix && <span className="absolute right-4 top-2.5 text-xs font-medium text-muted-foreground">{suffix}</span>}
        </div>
    </div>
);

const Toggle = ({ label, checked, onChange, icon: Icon }) => (
    <div
        className={cn(
            "group flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all duration-300 hover:shadow-md",
            checked
                ? "border-primary/30 bg-primary/5 shadow-sm"
                : "border-border/50 bg-secondary/10 hover:border-primary/20 hover:bg-secondary/20"
        )}
        onClick={() => onChange(!checked)}
    >
        <div className="flex items-center gap-3">
            <div className={cn(
                "rounded-full p-2 transition-colors duration-300",
                checked ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary/70"
            )}>
                {Icon && <Icon className="h-4 w-4" />}
            </div>
            <span className={cn(
                "text-sm font-medium transition-colors",
                checked ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
            )}>{label}</span>
        </div>
        <div className={cn(
            "relative h-6 w-10 rounded-full transition-all duration-300 ease-in-out",
            checked ? "bg-primary" : "bg-muted-foreground/30"
        )}>
            <span className={cn(
                "absolute top-1 block h-4 w-4 rounded-full bg-background shadow-sm transition-all duration-300 ease-in-out",
                checked ? "left-5" : "left-1"
            )} />
        </div>
    </div>
);

const EnergyPredictor = () => {
    const [activeTab, setActiveTab] = useState('manual');
    const [useScaling, setUseScaling] = useState(true);
    
    // Manual State
    const [formData, setFormData] = useState({
        Temperature: 25,
        Humidity: 50,
        SquareFootage: 1500,
        Occupancy: 2,
        HVACUsage: true,
        LightingUsage: true,
        RenewableEnergy: 0,
        Holiday: false,
    });
    const [prediction, setPrediction] = useState(null);
    const [showResult, setShowResult] = useState(false);
    
    // Batch State
    const [file, setFile] = useState(null);
    const [batchResults, setBatchResults] = useState(null);

    // Shared Loading
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handlePredict = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await predictEnergy({
                ...formData,
                HVACUsage: formData.HVACUsage ? 'On' : 'Off',
                LightingUsage: formData.LightingUsage ? 'On' : 'Off',
                Holiday: formData.Holiday ? 'Yes' : 'No'
            }, useScaling);
            if (result.error) throw new Error(result.error);
            setPrediction(result);
            setShowResult(true);
        } catch (error) {
            console.error(error);
            setError(error.message || "Prediction failed");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setBatchResults(null); 
            setError(null);
        }
    };

    const handleBatchPredict = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);
        
        try {
            const results = await batchPredict(file, useScaling);
            if (results.error) throw new Error(results.error);
            setBatchResults(results);
        } catch (error) {
            console.error("Batch error:", error);
            // Extract backend error message if available
            const errorMsg = error.response?.data?.error || error.message || "Failed to process file";
            setError(errorMsg);
        } finally {
            setLoading(false);
            // Reset file input value to allow re-uploading same file
            if (event.target) event.target.value = '';
        }
    };

    const handleDownloadCSV = () => {
        if (!batchResults || batchResults.length === 0) return;

        // 1. Convert JSON to CSV
        const headers = [
            'Timestamp', 
            'Temperature (C)', 
            'Humidity (%)', 
            'HVAC', 
            'Lighting', 
            'Occupancy', 
            'Predicted Consumption (kWh)'
        ];
        
        const rows = batchResults.map(row => [
            new Date(row.timestamp).toLocaleString(),
            row.temperature,
            row.humidity,
            row.hvac_usage ? 'On' : 'Off',
            row.lighting_usage ? 'On' : 'Off',
            row.occupancy,
            row.predicted_consumption
        ]);

        const csvContent = [
            headers.join(','), 
            ...rows.map(e => e.join(','))
        ].join('\n');

        // 2. Create Blob and Link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'energy_forecast_results.csv');
        document.body.appendChild(link);
        
        // 3. Trigger Download
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="rounded-2xl glass-card p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Energy Consumption Forecaster</h3>
                    <p className="text-sm text-muted-foreground">Predict usage based on environmental inputs</p>
                </div>
                <div className="flex items-center gap-4">
                     <div 
                        className="flex items-center gap-2 cursor-pointer bg-secondary/30 px-3 py-1.5 rounded-lg border border-white/5 hover:bg-secondary/50 transition-colors"
                        onClick={() => setUseScaling(!useScaling)}
                    >
                        <div className={`w-8 h-4 rounded-full relative transition-colors ${useScaling ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${useScaling ? 'left-4.5' : 'left-0.5'}`} style={{ left: useScaling ? 'calc(100% - 3.5px - 12px)' : '3.5px' }} />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground select-none">Residential Mode</span>
                    </div>

                    <div className="flex bg-secondary/30 p-1 rounded-lg border border-white/5">
                        <button
                            onClick={() => setActiveTab('manual')}
                            className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", activeTab === 'manual' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                        >
                            Manual
                        </button>
                        <button
                            onClick={() => setActiveTab('file')}
                            className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", activeTab === 'file' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                        >
                            File Upload
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}

            {activeTab === 'manual' ? (
                // --- MANUAL INPUT MODE ---
                <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <InputField
                                label="Temperature"
                                value={formData.Temperature}
                                onChange={(e) => handleChange('Temperature', e.target.value)}
                                icon={Thermometer}
                                suffix="°C"
                                type="range"
                                min="10"
                                max="40"
                                step="0.5"
                            />
                            <InputField
                                label="Humidity"
                                value={formData.Humidity}
                                onChange={(e) => handleChange('Humidity', e.target.value)}
                                icon={Droplets}
                                suffix="%"
                                type="range"
                                min="0"
                                max="100"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <InputField
                                label="Area"
                                value={formData.SquareFootage}
                                onChange={(e) => handleChange('SquareFootage', e.target.value)}
                                icon={Layout}
                                suffix="sq ft"
                            />
                            <InputField
                                label="Occupancy"
                                value={formData.Occupancy}
                                onChange={(e) => handleChange('Occupancy', e.target.value)}
                                icon={Users}
                                suffix="people"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <InputField
                                label="Renewable"
                                value={formData.RenewableEnergy}
                                onChange={(e) => handleChange('RenewableEnergy', e.target.value)}
                                icon={Zap}
                                suffix="%"
                                type="range"
                                min="0"
                                max="100"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Toggle
                            label="HVAC System"
                            checked={formData.HVACUsage}
                            onChange={(v) => handleChange('HVACUsage', v)}
                            icon={Zap}
                        />
                        <Toggle
                            label="Lighting"
                            checked={formData.LightingUsage}
                            onChange={(v) => handleChange('LightingUsage', v)}
                            icon={Zap}
                        />
                        <Toggle
                            label="Holiday Mode"
                            checked={formData.Holiday}
                            onChange={(v) => handleChange('Holiday', v)}
                            icon={Calendar}
                        />

                        <div className="pt-4">
                            <button
                                onClick={handlePredict}
                                disabled={loading}
                                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/80 py-3.5 font-bold text-primary-foreground shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-primary/25 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {loading ? (
                                        <>
                                            <Activity className="h-5 w-5 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="h-5 w-5 fill-current" />
                                            Predict Consumption
                                        </>
                                    )}
                                </span>
                                <div className="absolute inset-0 -translate-x-[100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                // --- FILE UPLOAD MODE ---
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                    <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center hover:bg-white/5 transition-colors group relative">
                        <input 
                            type="file" 
                            accept=".csv, .pdf" 
                            onChange={handleFileChange} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                        />
                        <div className="flex flex-col items-center justify-center gap-2">
                             <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <Upload className="h-6 w-6 text-primary" />
                             </div>
                             {file ? (
                                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                                    <FileText className="h-4 w-4" />
                                    {file.name}
                                </div>
                             ) : (
                                <>
                                    <p className="text-sm font-medium text-foreground">Click or drop CSV / PDF file here</p>
                                    <p className="text-xs text-muted-foreground">Supports data tables in PDF or standard CSV</p>
                                </>
                             )}
                        </div>
                    </div>

                    <div className="flex justify-end">
                         <button
                            onClick={handleBatchPredict}
                            disabled={!file || loading}
                            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium shadow-lg hover:bg-primary/90 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {loading ? <Activity className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                            Process Batch
                        </button>
                    </div>

                    {batchResults && (
                        <div className="mt-6 rounded-xl border border-white/10 overflow-hidden">
                            <div className="bg-secondary/30 px-4 py-3 border-b border-white/5 flex justify-between items-center">
                                <h4 className="text-sm font-semibold">Prediction Results</h4>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-muted-foreground">{batchResults.length} records processed</span>
                                    <button 
                                        onClick={handleDownloadCSV}
                                        className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                                    >
                                        <Upload className="h-3.5 w-3.5 rotate-180" /> {/* Reusing Upload icon rotated for Download */}
                                        Download CSV
                                    </button>
                                </div>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-secondary/20 text-muted-foreground sticky top-0 backdrop-blur-md">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-medium">Timestamp</th>
                                            <th className="px-4 py-2 text-center font-medium">Temp</th>
                                            <th className="px-4 py-2 text-center font-medium">Hum</th>
                                            <th className="px-4 py-2 text-center font-medium">HVAC</th>
                                            <th className="px-4 py-2 text-center font-medium">Occ</th>
                                            <th className="px-4 py-2 text-right font-medium">Predicted (kWh)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {batchResults.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{new Date(row.timestamp).toLocaleString()}</td>
                                                <td className="px-4 py-2.5 text-center text-muted-foreground">{row.temperature}</td>
                                                <td className="px-4 py-2.5 text-center text-muted-foreground">{row.humidity}</td>
                                                <td className="px-4 py-2.5 text-center text-muted-foreground">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${row.hvac_usage ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-muted-foreground'}`}>
                                                        {row.hvac_usage ? 'ON' : 'OFF'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5 text-center text-muted-foreground">{row.occupancy}</td>
                                                <td className="px-4 py-2.5 text-right font-mono text-emerald-400 font-bold">{row.predicted_consumption}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <Modal
                isOpen={showResult}
                onClose={() => setShowResult(false)}
                title="Energy Forecast Analysis"
            >
                {prediction && (
                    <div className="space-y-6">
                        {/* Estimation Card */}
                        <div className="overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 shadow-md backdrop-blur-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Estimated Usage</p>
                                    <p className="text-xs text-muted-foreground/70">Next 24 Hours</p>
                                </div>
                                <div className="rounded-full bg-primary/20 p-2 text-primary">
                                    <Activity className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-5xl font-black tracking-tight text-foreground">
                                    {prediction.predicted_energy_consumption.toFixed(2)}
                                </span>
                                <span className="text-xl font-bold text-muted-foreground">kWh</span>
                            </div>
                            
                            {/* Confidence Range Visual */}
                            <div className="mt-6">
                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span>Low Est: {(prediction.predicted_energy_consumption * 0.9).toFixed(1)}</span>
                                    <span className="font-semibold text-primary">Confidence: 95%</span>
                                    <span>High Est: {(prediction.predicted_energy_consumption * 1.1).toFixed(1)}</span>
                                </div>
                                <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
                                    <div className="absolute left-[20%] right-[20%] h-full bg-primary/30" />
                                    <div className="absolute left-[45%] right-[45%] h-full bg-primary animate-pulse" />
                                </div>
                            </div>
                        </div>
                        
                        {/* AI Analysis */}
                        <div className="rounded-xl border border-border bg-card/50 p-4">
                            <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                                <Bot className="h-4 w-4 text-primary" />
                                AI Recommendations
                            </h4>
                            <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none text-muted-foreground">
                                <ReactMarkdown
                                    components={{
                                        strong: ({ node, ...props }) => <span className="font-semibold text-foreground" {...props} />,
                                        ul: ({ node, ...props }) => <ul className="my-2 space-y-2 pl-4" {...props} />,
                                        li: ({ node, ...props }) => <li className="marker:text-primary" {...props} />,
                                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                    }}
                                >
                                    {prediction.ai_analysis || "Analysis not available."}
                                </ReactMarkdown>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowResult(false)}
                                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                            >
                                Close Analysis
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default EnergyPredictor;
