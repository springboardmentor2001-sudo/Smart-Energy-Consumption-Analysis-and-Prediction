import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Zap,
  Brain,
  LineChart,
  Shield,
  Github,
  Mail,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Predictions",
    description:
      "Our machine learning model analyzes appliance usage patterns and environmental factors to provide accurate energy consumption predictions.",
  },
  {
    icon: LineChart,
    title: "Real-Time Analytics",
    description:
      "Track your energy usage over time with interactive charts and detailed breakdowns of power consumption by appliance category.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "All predictions are calculated locally and stored in your browser. Your data never leaves your device without your explicit consent.",
  },
];

const techStack = [
  "React + TypeScript",
  "Tailwind CSS",
  "Three.js",
  "GSAP Animations",
  "Recharts",
  "Gemini AI",
  "Node.js/Express",
  "Zustand",
];

export default function About() {
  return (
    <div className="min-h-screen pt-20 pb-12" data-testid="page-about">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-16">
        <section className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Smart Energy Management
            </span>
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            About SmartEnergy
          </h1>
          <p className="text-lg text-muted-foreground">
            SmartEnergy is an intelligent energy prediction platform that helps
            homeowners understand, predict, and optimize their electricity
            consumption. Using advanced machine learning and real-time data
            analysis, we empower you to make informed decisions about your energy
            usage.
          </p>
        </section>

        <section>
          <div className="text-center mb-12">
            <h2
              className="text-2xl md:text-3xl font-bold mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Key Features
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built with cutting-edge technology to deliver the best energy
              management experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="text-center"
                data-testid={`card-about-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <CardContent className="pt-8 pb-6">
                  <div className="inline-flex p-4 bg-primary/10 rounded-lg mb-4">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2
              className="text-2xl md:text-3xl font-bold mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              How It Works
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">1. Configure Your Appliances:</strong>{" "}
                Toggle the appliances you use in your home to simulate your
                typical energy consumption pattern.
              </p>
              <p>
                <strong className="text-foreground">2. Set Environmental Factors:</strong>{" "}
                Adjust temperature, humidity, and occupancy settings to reflect
                your current conditions.
              </p>
              <p>
                <strong className="text-foreground">3. Get Instant Predictions:</strong>{" "}
                Our AI model calculates your estimated power consumption in
                real-time, showing both total wattage and individual appliance
                contributions.
              </p>
              <p>
                <strong className="text-foreground">4. Chat with AI:</strong> Ask our
                Gemini-powered assistant for personalized energy-saving tips and
                recommendations.
              </p>
            </div>
          </div>

          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle>Technology Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 bg-background/80 rounded-md text-sm font-medium border border-border"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="bg-gradient-to-r from-primary/10 via-transparent to-primary/10 border-primary/20">
            <CardContent className="py-12">
              <div className="text-center max-w-2xl mx-auto">
                <h2
                  className="text-2xl md:text-3xl font-bold mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Ready to Start Saving?
                </h2>
                <p className="text-muted-foreground mb-8">
                  Begin your energy optimization journey today. Make your first
                  prediction and discover how much you could save.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/prediction">
                    <Button size="lg" className="gap-2" data-testid="button-about-predict">
                      Start Predicting
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/chatbot">
                    <Button variant="outline" size="lg" data-testid="button-about-chat">
                      Chat with AI
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="text-center">
          <h2
            className="text-xl font-semibold mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Connect With Us
          </h2>
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                data-testid="link-github"
              >
                <Github className="w-5 h-5" />
              </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a
                href="mailto:contact@smartenergy.app"
                aria-label="Email"
                data-testid="link-email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
