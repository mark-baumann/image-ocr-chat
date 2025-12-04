import { Cpu, Sparkles, Zap } from "lucide-react";
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
  hasOpenAiKey: boolean;
  hasGeminiKey: boolean;
  disabled?: boolean;
}

const engineIcons: Record<OCREngine, React.ReactNode> = {
  tesseract: <Cpu className="w-4 h-4" />,
  "gpt4-vision": <Sparkles className="w-4 h-4" />,
  "gemini-vision": <Zap className="w-4 h-4" />,
};

export const OCREngineSelector = ({ 
  value, 
  onChange, 
  hasOpenAiKey,
  hasGeminiKey,
  disabled 
}: OCREngineSelectorProps) => {
  const hasRequiredKey = (engine: typeof OCR_ENGINES[number]) => {
    if (!engine.requiresApiKey) return true;
    if (engine.apiKeyType === "openai") return hasOpenAiKey;
    if (engine.apiKeyType === "gemini") return hasGeminiKey;
    return false;
  };

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
            const isDisabled = !hasRequiredKey(engine);
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
                      : engine.id === "gemini-vision"
                      ? "bg-blue-500/10 text-blue-500"
                      : "bg-secondary text-secondary-foreground"
                  )}>
                    {engineIcons[engine.id]}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{engine.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {engine.description}
                      {isDisabled && ` (${engine.apiKeyType === "gemini" ? "Gemini" : "OpenAI"} Key fehlt)`}
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
