import { useState } from "react";
import { Key, Eye, EyeOff, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  label?: string;
  placeholder?: string;
  storageKey?: string;
}

export const ApiKeyInput = ({ 
  apiKey, 
  onApiKeyChange,
  label = "ChatGPT API Key",
  placeholder = "sk-...",
  storageKey = "openai"
}: ApiKeyInputProps) => {
  const [showKey, setShowKey] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onApiKeyChange(tempKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const isValid = storageKey === "gemini" 
    ? tempKey.startsWith("AIza") && tempKey.length > 20
    : tempKey.startsWith("sk-") && tempKey.length > 20;

  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Key className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type={showKey ? "text" : "password"}
            value={tempKey}
            onChange={(e) => setTempKey(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "pr-10 font-mono text-sm",
              isValid && "border-primary/50"
            )}
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <Button 
          onClick={handleSave}
          disabled={!isValid}
          className="gap-2"
          variant={saved ? "default" : "secondary"}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              Gespeichert
            </>
          ) : (
            "Speichern"
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Dein API Key wird lokal im Browser gespeichert.
      </p>
    </div>
  );
};
