import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ExtractedTextProps {
  text: string;
  isLoading: boolean;
  progress: number;
}

export const ExtractedText = ({ text, isLoading, progress }: ExtractedTextProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-6 space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Text wird extrahiert...</h3>
          <span className="text-sm text-muted-foreground font-mono">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Analysiere Bild mit OCR...
        </p>
      </div>
    );
  }

  if (!text) return null;

  return (
    <div className="glass rounded-xl p-6 space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Extrahierter Text</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 px-3 gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-primary" />
              <span className="text-primary">Kopiert</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Kopieren</span>
            </>
          )}
        </Button>
      </div>
      <div className="bg-muted/50 rounded-lg p-4 max-h-[200px] overflow-y-auto">
        <p className="text-sm font-mono whitespace-pre-wrap text-foreground/90 leading-relaxed">
          {text || "Kein Text erkannt"}
        </p>
      </div>
    </div>
  );
};
