import { Check, ChevronDown, Cpu, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OCR_ENGINES, type OCREngine } from "@/hooks/useOCR";
import { cn } from "@/lib/utils";

interface OCREngineSelectorProps {
  value: OCREngine;
  onChange: (engine: OCREngine) => void;
  hasApiKey: boolean;
  disabled?: boolean;
}

const engineIcons: Record<OCREngine, React.ReactNode> = {
  tesseract: <Cpu className="w-4 h-4" />,
  "gpt4-vision": <Sparkles className="w-4 h-4" />,
};

export const OCREngineSelector = ({ 
  value, 
  onChange, 
  hasApiKey,
  disabled 
}: OCREngineSelectorProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">OCR Engine</label>
      <Select 
        value={value} 
        onValueChange={(v) => onChange(v as OCREngine)}
        disabled={disabled}
      >
        <SelectTrigger className="w-full bg-card border-border">
          <SelectValue placeholder="Engine auswählen" />
        </SelectTrigger>
        <SelectContent className="bg-card border-border z-50">
          {OCR_ENGINES.map((engine) => {
            const isDisabled = engine.requiresApiKey && !hasApiKey;
            return (
              <SelectItem 
                key={engine.id} 
                value={engine.id}
                disabled={isDisabled}
                className={cn(
                  "cursor-pointer",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-1.5 rounded-md",
                    engine.id === "gpt4-vision" 
                      ? "bg-primary/10 text-primary" 
                      : "bg-secondary text-secondary-foreground"
                  )}>
                    {engineIcons[engine.id]}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{engine.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {engine.description}
                      {isDisabled && " (API Key fehlt)"}
                    </span>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};
