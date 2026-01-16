import { useRef, useEffect, useCallback, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { useEnergyStore } from "@/lib/store";
import { Bot, Trash2, Loader2, BarChart, Calendar as CalendarIcon, Clock, Thermometer, Droplets, Brain } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { ChatMessage as ChatMessageType } from "@shared/models/chat";

export default function Chatbot() {
  const {
    chatMessages,
    addChatMessage,
    updateLastChatMessage,
    clearChatMessages,
    currentPrediction,
    appliances,
    isLoading,
    setIsLoading,
    addForecast,
    explanations,
    addExplanation
  } = useEnergyStore();

  const [guidedStep, setGuidedStep] = useState<"none" | "date" | "hour" | "weather">("none");
  const [forecastParams, setForecastParams] = useState({
    date: new Date().toISOString().split('T')[0],
    hour: "12",
    temperature: 22,
    humidity: 50
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const isStreamingRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  const triggerForecast = async (params: typeof forecastParams) => {
    setIsLoading(true);
    try {
      const { apiRequest } = await import("@/lib/api");
      const res = await apiRequest("POST", "/forecast", {
        Timestamp: `${params.date} ${params.hour}:00:00`,
        Temperature: params.temperature,
        Humidity: params.humidity,
        SquareFootage: 1500, // Default for demo
        BuildingType: "Residential"
      });

      if (res.ok) {
        const data = await res.json();
        const explanation_id = `forecast_${params.date.replace(/-/g, '')}_${params.hour}`;
        
        addForecast({
          id: Math.random().toString(36).substring(7),
          timestamp: Date.now(),
          forecastTimestamp: `${params.date} ${params.hour}:00:00`,
          response: { ...data, explanation_id },
          request: params
        });

        // Store a mock explanation for "Explanation Mode"
        const explanationText = `This forecast of ${data.forecast_value} kWh for ${params.date} at ${params.hour}:00 is influenced by:
- **Historical Baseline**: Similar ${new Date(params.date).toLocaleDateString('en-US', { weekday: 'long' })}s usually show a ${params.hour > "17" ? "peak" : "mid-day"} consumption pattern.
- **Environmental Factors**: A temperature of ${params.temperature}°C suggests ${params.temperature > 25 ? "increased cooling load" : "moderate HVAC usage"}.
- **Trend Analysis**: Usage is trending ${data.comparison_last_week} compared to the previous 7-day average.`;
        
        addExplanation(explanation_id, explanationText);

        const botMsg: ChatMessageType = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `📊 **Forecast Ready!**\n\nPredicted Energy: **${data.forecast_value} ${data.unit}**\nConfidence: ${data.confidence_range[0]} - ${data.confidence_range[1]} kWh\n\nI've updated your Dashboard with this new data.`,
          timestamp: Date.now().toString(),
          explanation_id: explanation_id
        };
        addChatMessage(botMsg);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setGuidedStep("none");
    }
  };

  const handleSendMessage = async (content: string) => {
    if (isLoading || isStreamingRef.current) return;

    const userMessage: ChatMessageType = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: Date.now().toString(),
    };

    addChatMessage(userMessage);
    setIsLoading(true);
    isStreamingRef.current = true;

    const assistantMessage: ChatMessageType = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: Date.now().toString(),
    };
    addChatMessage(assistantMessage);

    try {
      const { apiRequest } = await import("@/lib/api");
      const response = await apiRequest("POST", "/chat", {
        message: content,
        context: { currentPrediction, appliances },
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent += parsed.content;
                updateLastChatMessage(fullContent);
                scrollToBottom();
              }
            } catch {
              fullContent += data;
              updateLastChatMessage(fullContent);
              scrollToBottom();
            }
          }
        }
      }
    } catch (error) {
      updateLastChatMessage("I encountered an issue. Please try again.");
    } finally {
      setIsLoading(false);
      isStreamingRef.current = false;
    }
  };

  const handleExplain = (explanation_id: string) => {
    const text = explanations[explanation_id] || "No explanation available for this prediction.";
    const explainMsg: ChatMessageType = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `🧠 **Prediction Analysis**\n\n${text}`,
      timestamp: Date.now().toString()
    };
    addChatMessage(explainMsg);
  };

  return (
    <div className="min-h-screen pt-20 pb-6" data-testid="page-chatbot">
      <div className="max-w-4xl mx-auto px-4 md:px-8 h-[calc(100vh-6rem)] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
              AI Energy Assistant
            </h1>
            <p className="text-muted-foreground">Interactive Prediction & Forecasting Guide</p>
          </div>
          {chatMessages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearChatMessages} className="text-muted-foreground">
              <Trash2 className="w-4 h-4 mr-1" /> Clear
            </Button>
          )}
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea ref={scrollRef} className="flex-1 p-4">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <Bot className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">How can I help you today?</h3>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button 
                    onClick={() => {
                      addChatMessage({ id: crypto.randomUUID(), role: 'user', content: '📊 Predict Energy Consumption', timestamp: Date.now().toString() });
                      setGuidedStep("date");
                    }}
                    className="hover-elevate"
                  >
                    <BarChart className="w-4 h-4 mr-2" />
                    Predict Energy Consumption
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {chatMessages.map((message, index) => (
                  <div key={message.id} className="space-y-2">
                    <ChatMessage
                      message={message}
                      isStreaming={isStreamingRef.current && index === chatMessages.length - 1 && message.role === "assistant"}
                    />
                    {message.role === 'assistant' && message.explanation_id && (
                      <div className="pl-12">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleExplain(message.explanation_id!)}
                          className="hover-elevate text-xs"
                        >
                          <Brain className="w-3 h-3 mr-2" />
                          Explain this prediction
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {guidedStep !== "none" && (
                  <div className="flex justify-start">
                    <Card className="max-w-[80%] p-4 bg-muted/50 border-primary/20">
                      <div className="space-y-4">
                        {guidedStep === "date" && (
                          <>
                            <div className="flex items-center gap-2 font-medium">
                              <CalendarIcon className="w-4 h-4 text-primary" />
                              Step 1: Select Forecast Date
                            </div>
                            <Input 
                              type="date" 
                              value={forecastParams.date}
                              onChange={(e) => setForecastParams(prev => ({ ...prev, date: e.target.value }))}
                              min={new Date().toISOString().split('T')[0]}
                            />
                            <Button onClick={() => setGuidedStep("hour")} className="w-full">Next</Button>
                          </>
                        )}
                        {guidedStep === "hour" && (
                          <>
                            <div className="flex items-center gap-2 font-medium">
                              <Clock className="w-4 h-4 text-primary" />
                              Step 2: Select Target Hour
                            </div>
                            <Select 
                              value={forecastParams.hour} 
                              onValueChange={(val) => setForecastParams(prev => ({ ...prev, hour: val }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select hour" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 24 }).map((_, i) => (
                                  <SelectItem key={i} value={i.toString()}>{i}:00</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button onClick={() => setGuidedStep("weather")} className="w-full">Next</Button>
                          </>
                        )}
                        {guidedStep === "weather" && (
                          <>
                            <div className="flex items-center gap-2 font-medium">
                              <Thermometer className="w-4 h-4 text-primary" />
                              Step 3: Environmental Details (Optional)
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                                  <Thermometer className="w-2 h-2" /> Temp (°C)
                                </label>
                                <Input 
                                  type="number" 
                                  value={forecastParams.temperature}
                                  onChange={(e) => setForecastParams(prev => ({ ...prev, temperature: parseInt(e.target.value) }))}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                                  <Droplets className="w-2 h-2" /> Humidity (%)
                                </label>
                                <Input 
                                  type="number" 
                                  value={forecastParams.humidity}
                                  onChange={(e) => setForecastParams(prev => ({ ...prev, humidity: parseInt(e.target.value) }))}
                                />
                              </div>
                            </div>
                            <Button 
                              onClick={() => triggerForecast(forecastParams)} 
                              className="w-full"
                              disabled={isLoading}
                            >
                              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Forecast"}
                            </Button>
                          </>
                        )}
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="border-t border-border p-4">
            <ChatInput onSend={handleSendMessage} isLoading={isLoading} disabled={isStreamingRef.current || guidedStep !== "none"} />
          </div>
        </Card>
      </div>
    </div>
  );
}
