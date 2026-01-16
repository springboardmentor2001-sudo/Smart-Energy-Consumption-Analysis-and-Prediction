import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useEnergyStore } from "@/lib/store";
import {
  Thermometer,
  Lightbulb,
  Tv,
  Monitor,
  Car,
  Droplets,
  Utensils,
  Refrigerator,
} from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";

interface ApplianceToggleProps {
  applianceKey: string;
  displayName: string;
  icon: string;
  category: string;
  defaultWattage: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Thermometer,
  Lightbulb,
  Tv,
  Monitor,
  Car,
  Droplets,
  Utensils,
  Refrigerator,
  WashingMachine: Droplets,
  CookingPot: Utensils,
};

export function ApplianceToggle({
  applianceKey,
  displayName,
  icon,
  category,
  defaultWattage,
}: ApplianceToggleProps) {
  const { appliances, setAppliance } = useEnergyStore();
  const isOn = appliances[applianceKey] === "on";
  const cardRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const IconComponent = iconMap[icon] || Lightbulb;

  const handleToggle = (checked: boolean) => {
    setAppliance(applianceKey, checked ? "on" : "off");
    
    if (iconRef.current) {
      gsap.fromTo(
        iconRef.current,
        { scale: 1 },
        {
          scale: checked ? 1.2 : 0.9,
          duration: 0.2,
          ease: "elastic.out(1, 0.5)",
          onComplete: () => {
            gsap.to(iconRef.current, {
              scale: 1,
              duration: 0.15,
              ease: "power2.out",
            });
          },
        }
      );
    }
  };

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    }
  }, []);

  const categoryColors: Record<string, string> = {
    hvac: "from-orange-500/20 to-red-500/20",
    lighting: "from-yellow-500/20 to-amber-500/20",
    appliance: "from-blue-500/20 to-cyan-500/20",
    electronics: "from-purple-500/20 to-pink-500/20",
  };

  return (
    <Card
      ref={cardRef}
      className={`relative overflow-visible p-4 transition-all duration-300 ${
        isOn
          ? "border-primary/50 shadow-lg shadow-primary/10"
          : "border-border/50"
      }`}
      data-testid={`toggle-card-${applianceKey}`}
    >
      {isOn && (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${
            categoryColors[category] || categoryColors.appliance
          } opacity-50 rounded-lg pointer-events-none`}
        />
      )}
      
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            ref={iconRef}
            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
              isOn
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <IconComponent className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <Label
              htmlFor={applianceKey}
              className={`font-medium cursor-pointer block truncate ${
                isOn ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {displayName}
            </Label>
            <span className="text-xs text-muted-foreground">
              ~{defaultWattage.toLocaleString()}W
            </span>
          </div>
        </div>
        
        <Switch
          id={applianceKey}
          checked={isOn}
          onCheckedChange={handleToggle}
          aria-label={`Toggle ${displayName}`}
          data-testid={`switch-${applianceKey}`}
        />
      </div>
    </Card>
  );
}
