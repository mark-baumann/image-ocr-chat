import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImagePreviewProps {
  imageUrl: string;
  onClear: () => void;
}

export const ImagePreview = ({ imageUrl, onClear }: ImagePreviewProps) => {
  return (
    <div className="relative group rounded-xl overflow-hidden border border-border animate-fade-in">
      <img 
        src={imageUrl} 
        alt="Hochgeladenes Bild" 
        className="w-full h-auto max-h-[300px] object-contain bg-muted/30"
      />
      <Button
        variant="destructive"
        size="icon"
        onClick={onClear}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};
