import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { EnergyOrb } from "@/components/three/EnergyOrb";
import { ArrowRight, BarChart3, MessageSquare, Zap } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const features = [
  {
    icon: Zap,
    title: "Smart Predictions",
    description: "AI-powered energy consumption forecasting based on your appliance usage patterns.",
  },
  {
    icon: MessageSquare,
    title: "AI Assistant",
    description: "Chat with our Gemini-powered assistant for personalized energy-saving tips.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Visualize your energy consumption trends and identify optimization opportunities.",
  },
];

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-text > *",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: "power3.out" }
      );

      gsap.fromTo(
        ".feature-card",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.6,
          delay: 0.5,
          ease: "power2.out",
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="min-h-screen pt-16">
      <section className="min-h-[calc(100vh-4rem)] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="hero-text space-y-6 text-center lg:text-left">
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
                data-testid="text-hero-title"
              >
                Predict & Optimize Your{" "}
                <span className="text-primary">Energy Usage</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
                Harness the power of AI to understand, predict, and reduce your
                home energy consumption. Make smarter decisions, save money, and
                reduce your carbon footprint.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/forecast">
                  <Button size="lg" className="w-full sm:w-auto gap-2" data-testid="button-forecast-link">
                    Future Forecast
                    <Zap className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/chatbot">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto gap-2"
                    data-testid="button-chat-ai"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Chat with AI
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative h-[400px] lg:h-[500px] order-first lg:order-last">
              <EnergyOrb className="absolute inset-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      <section
        className="py-24 bg-gradient-to-b from-transparent to-muted/30"
        data-testid="section-features"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Intelligent Energy Management
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform combines machine learning with real-time data to give
              you unprecedented control over your energy consumption.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="feature-card group p-6 rounded-lg bg-card border border-border hover-elevate"
                data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-12 border border-primary/20">
            <h2
              className="text-2xl md:text-3xl font-bold mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ready to Reduce Your Energy Bill?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Start tracking your energy usage today and discover how small
              changes can lead to significant savings.
            </p>
            <Link href="/forecast">
              <Button size="lg" className="gap-2" data-testid="button-get-started">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
