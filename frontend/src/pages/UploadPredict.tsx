import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Loader2, AlertCircle, CheckCircle2, Mic, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function UploadPredict() {
  const [, setLocation] = useLocation();
  const [isSpeechMode, setIsSpeechMode] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prediction, setPrediction] = useState<number | "null" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "application/pdf" || selectedFile.type === "text/plain") {
        setFile(selectedFile);
        setError(null);
        setPrediction(null);
      } else {
        toast({
          variant: "destructive",
          title: "Unsupported file type",
          description: "Please upload a .pdf or .txt file.",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setPrediction(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { API_BASE_URL } = await import("@/lib/api");
      const url = `${API_BASE_URL}/api/extract-validate`;
      
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (data.status === "VALID") {
        setPrediction(data.prediction);
        toast({
          title: "Success",
          description: "Data extracted and prediction generated.",
        });
      } else {
        setPrediction(null);
        setError(data.message || "Uploaded file does not match the required input format or parameters could not be extracted.");
      }
    } catch (err) {
      setError("An error occurred during processing. Please try again.");
      toast({
        variant: "destructive",
        title: "Processing failed",
        description: "Could not connect to the server.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-background">
      <div className="max-w-4xl mx-auto px-4 md:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Predict Consumption</h1>
            <p className="text-muted-foreground text-lg mb-4">
              Choose your input method: upload a document or use voice commands.
            </p>
          </div>
          
          <Card className="p-4 bg-primary/5 border-primary/20 shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" />
                <Label htmlFor="input-mode" className="font-semibold">Speech Input</Label>
              </div>
              <Switch
                id="input-mode"
                checked={isSpeechMode}
                onCheckedChange={(checked) => {
                  setIsSpeechMode(checked);
                  if (checked) setLocation("/speech-input");
                }}
              />
            </div>
          </Card>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg border border-border/50 max-w-2xl">
          <h3 className="font-semibold text-sm mb-2 text-foreground">Required Input Parameters:</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <strong>Temperature:</strong> e.g., "22°C" or "22 Degrees"
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <strong>Humidity:</strong> e.g., "50%" or "50 Percent"
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <strong>Square Footage:</strong> e.g., "1500 sq ft"
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <strong>Building Type:</strong> "Residential" or "Commercial"
            </li>
          </ul>
        </div>

        <Card className="border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 transition-colors bg-card/50">
          <CardContent className="pt-10 pb-10 flex flex-col items-center justify-center space-y-4">
            <div 
              className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-2 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-10 h-10 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-xl font-medium">
                {file ? file.name : "Drag and drop your file here"}
              </p>
              <p className="text-sm text-muted-foreground">
                Only PDF or TXT files up to 10MB
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.txt"
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="mt-4"
            >
              <FileText className="w-4 h-4 mr-2" />
              {file ? "Change File" : "Select File"}
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            size="lg"
            className="w-full max-w-xs font-semibold py-6 text-lg"
            onClick={handleUpload}
            disabled={!file || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Predicting...
              </>
            ) : (
              "Extract & Predict"
            )}
          </Button>
        </div>

        {(prediction !== null || error) && (
          <Card className={cn(
            "border-2 transition-all duration-500",
            prediction !== null && prediction !== "null" ? "border-primary/50 bg-primary/5" : "border-destructive/50 bg-destructive/5"
          )}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {prediction !== null && prediction !== "null" ? (
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-destructive" />
                )}
                Prediction Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center py-6">
                <p className="text-sm uppercase tracking-widest text-muted-foreground font-bold mb-2">Predicted Value</p>
                <p className={cn(
                  "text-6xl font-black",
                  prediction !== null && prediction !== "null" ? "text-primary" : "text-destructive"
                )}>
                  {prediction === "null" ? "null" : prediction}
                </p>
              </div>
              {error && (
                <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-center font-medium">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
