import { useCallback, useState, useEffect } from "react";
import { Upload, Image as ImageIcon, Clipboard } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
  onImageSelect: (file: File) => void;
  isProcessing: boolean;
}

export const ImageDropzone = ({ onImageSelect, isProcessing }: ImageDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith("image/")) {
      onImageSelect(file);
    }
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) handleFile(file);
        }
      }
    }
  }, [handleFile]);

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "relative group cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300",
        "flex flex-col items-center justify-center gap-4 p-8 min-h-[200px]",
        isDragging 
          ? "border-primary bg-primary/5 scale-[1.02]" 
          : "border-border hover:border-primary/50 hover:bg-muted/50",
        isProcessing && "pointer-events-none opacity-50"
      )}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isProcessing}
      />
      
      <div className={cn(
        "p-4 rounded-full bg-primary/10 transition-transform duration-300",
        "group-hover:scale-110 group-hover:bg-primary/20"
      )}>
        {isDragging ? (
          <ImageIcon className="w-8 h-8 text-primary" />
        ) : (
          <Upload className="w-8 h-8 text-primary" />
        )}
      </div>
      
      <div className="text-center space-y-2">
        <p className="font-medium text-foreground">
          {isDragging ? "Bild hier ablegen" : "Bild hochladen"}
        </p>
        <p className="text-sm text-muted-foreground">
          Drag & Drop, klicken oder
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-sm font-mono">
          <Clipboard className="w-3.5 h-3.5" />
          STRG + V
        </div>
      </div>
    </div>
  );
};
