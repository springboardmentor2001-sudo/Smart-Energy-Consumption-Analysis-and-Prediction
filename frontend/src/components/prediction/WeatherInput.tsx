import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEnergyStore } from "@/lib/store";

interface WeatherInputProps {
  inputKey: "Temperature" | "Humidity" | "Occupancy" | "SquareFootage" | "RenewableEnergy";
  displayName: string;
  unit: string;
  min: number;
  max: number;
}

export function WeatherInput({
  inputKey,
  displayName,
  unit,
  min,
  max,
}: WeatherInputProps) {
  const { weather, setWeather } = useEnergyStore();
  const value = weather[inputKey];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      setWeather(inputKey, newValue);
    }
  };

  return (
    <div className="space-y-2" data-testid={`weather-input-${inputKey}`}>
      <Label htmlFor={inputKey} className="text-sm font-medium text-muted-foreground">
        {displayName}
      </Label>
      <div className="relative">
        <Input
          id={inputKey}
          type="number"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          className="pr-12 bg-card border-border"
          aria-describedby={`${inputKey}-unit`}
          data-testid={`input-${inputKey}`}
        />
        <span
          id={`${inputKey}-unit`}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none"
        >
          {unit}
        </span>
      </div>
    </div>
  );
}
