import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, RotateCcw, Send, PlayCircle, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function SpeechInput() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [prediction, setPrediction] = useState<any>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        toast({
          title: "Speech Error",
          description: `Error: ${event.error}. Please check your microphone permissions.`,
          variant: "destructive",
        });
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      setPrediction(null);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error("Start error:", err);
      }
    }
  };

  const extractMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await apiRequest("POST", "/api/extract-speech", { text });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.status === "VALID") {
        setPrediction(data);
        toast({
          title: "Extraction Successful",
          description: "Data extracted and prediction generated.",
        });
      } else {
        toast({
          title: "Extraction Failed",
          description: data.message || "Could not find relevant parameters in your speech.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process speech. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleProcess = () => {
    if (!transcript.trim()) return;
    extractMutation.mutate(transcript);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Voice Prediction</h1>
            <p className="text-muted-foreground mt-1">
              Speak naturally to input building details and get energy forecasts.
            </p>
          </div>
          <Button variant="outline" onClick={() => setLocation("/upload-predict")}>
            Switch to Manual
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="relative overflow-hidden border-primary/20 bg-background/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-primary" />
                Speech Input
              </CardTitle>
              <CardDescription>
                Click the microphone and state your parameters.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="min-h-[150px] p-4 rounded-lg bg-muted/30 border border-border/50 relative">
                <AnimatePresence mode="wait">
                  {transcript ? (
                    <motion.p
                      key="transcript"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-lg leading-relaxed"
                    >
                      {transcript}
                    </motion.p>
                  ) : (
                    <motion.p
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-muted-foreground italic"
                    >
                      {isListening ? "Listening..." : 'Example: "The temperature is 22 degrees and building type is residential"'}
                    </motion.p>
                  )}
                </AnimatePresence>
                {isListening && (
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [4, 12, 4] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                        className="w-1 bg-primary rounded-full"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="lg"
                  className={`flex-1 gap-2 ${isListening ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"}`}
                  onClick={toggleListening}
                  data-testid="button-toggle-speech"
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-5 h-5" /> Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" /> Start Recording
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTranscript("")}
                  title="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full gap-2"
                disabled={!transcript || isListening || extractMutation.isPending}
                onClick={handleProcess}
                data-testid="button-process-speech"
              >
                {extractMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Analyze & Predict
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-primary/20 bg-background/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Prediction Result
              </CardTitle>
              <CardDescription>
                AI-extracted parameters and model output.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {prediction ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
                      <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Predicted Consumption</div>
                      <div className="text-4xl font-bold text-primary mt-1">
                        {prediction.prediction.toFixed(2)} <span className="text-xl">Watts</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase">Extracted Details</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(prediction.params).map(([key, value]: [string, any]) => (
                          <div key={key} className="p-2 rounded-lg bg-muted/50 border border-border/50">
                            <div className="text-xs text-muted-foreground">{key}</div>
                            <div className="font-medium">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[250px] text-center p-6 border-2 border-dashed border-border rounded-xl">
                    <PlayCircle className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">
                      Analysis results will appear here after you record and process your speech.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
