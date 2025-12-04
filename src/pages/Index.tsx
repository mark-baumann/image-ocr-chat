import { useState, useEffect } from "react";
import { ScanText, Sparkles } from "lucide-react";
import { ImageDropzone } from "@/components/ImageDropzone";
import { ImagePreview } from "@/components/ImagePreview";
import { ExtractedText } from "@/components/ExtractedText";
import { ApiKeyInput } from "@/components/ApiKeyInput";
import { ChatInterface } from "@/components/ChatInterface";
import { useOCR } from "@/hooks/useOCR";

const Index = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("chatgpt-api-key") || "");

  const { isProcessing, progress, extractedText, processImage, reset } = useOCR();

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("chatgpt-api-key", apiKey);
    }
  }, [apiKey]);

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    
    // Convert to base64 for GPT-4 Vision
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    processImage(file);
  };

  const handleClear = () => {
    setImageFile(null);
    setImageUrl(null);
    setImageBase64(null);
    reset();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <ScanText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Image <span className="gradient-text">OCR</span> Chat
              </h1>
              <p className="text-sm text-muted-foreground">
                Text extrahieren & mit AI chatten
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Image & OCR */}
          <div className="space-y-6">
            {!imageUrl ? (
              <ImageDropzone 
                onImageSelect={handleImageSelect} 
                isProcessing={isProcessing} 
              />
            ) : (
              <ImagePreview imageUrl={imageUrl} onClear={handleClear} />
            )}
            
            <ExtractedText 
              text={extractedText} 
              isLoading={isProcessing} 
              progress={progress} 
            />
          </div>

          {/* Right Column - API Key & Chat */}
          <div className="space-y-6">
            <ApiKeyInput apiKey={apiKey} onApiKeyChange={setApiKey} />
            
            <ChatInterface 
              apiKey={apiKey} 
              imageBase64={imageBase64}
              extractedText={extractedText}
            />
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid sm:grid-cols-3 gap-6">
          {[
            { icon: "📋", title: "STRG+V", desc: "Bilder direkt einfügen" },
            { icon: "🔍", title: "OCR", desc: "Deutsche & englische Texterkennung" },
            { icon: "💬", title: "AI Chat", desc: "Mit GPT-4 Vision über Bilder chatten" },
          ].map((feature) => (
            <div key={feature.title} className="glass rounded-xl p-5 text-center space-y-2 hover:border-primary/30 transition-colors">
              <span className="text-3xl">{feature.icon}</span>
              <h3 className="font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Floating Decoration */}
      <div className="fixed bottom-4 right-4 p-3 glass rounded-full animate-pulse-glow">
        <Sparkles className="w-5 h-5 text-primary" />
      </div>
    </div>
  );
};

export default Index;
