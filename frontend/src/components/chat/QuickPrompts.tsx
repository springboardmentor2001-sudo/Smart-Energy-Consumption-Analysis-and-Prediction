import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Sparkles, Zap, Leaf, HelpCircle } from "lucide-react";

const prompts = [
  {
    text: "How does HVAC affect energy?",
    icon: Sparkles,
  },
  {
    text: "Explain my current prediction",
    icon: Zap,
  },
  {
    text: "Tips to save power",
    icon: Leaf,
  },
  {
    text: "What should I turn off?",
    icon: HelpCircle,
  },
];

interface QuickPromptsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export function QuickPrompts({ onSelect, disabled }: QuickPromptsProps) {
  return (
    <ScrollArea className="w-full" data-testid="quick-prompts">
      <div className="flex gap-2 pb-2">
        {prompts.map((prompt) => (
          <Button
            key={prompt.text}
            variant="outline"
            size="sm"
            onClick={() => onSelect(prompt.text)}
            disabled={disabled}
            className="flex-shrink-0 gap-2"
            data-testid={`prompt-${prompt.text.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <prompt.icon className="w-3 h-3" />
            {prompt.text}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
