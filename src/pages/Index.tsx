import { useState, useEffect } from "react";
import { ScanText, Sparkles, RotateCcw } from "lucide-react";
import { ImageDropzone } from "@/components/ImageDropzone";
import { ImagePreview } from "@/components/ImagePreview";
import { ExtractedText } from "@/components/ExtractedText";
import { ApiKeyInput } from "@/components/ApiKeyInput";
import { ChatInterface } from "@/components/ChatInterface";
import { OCREngineSelector } from "@/components/OCREngineSelector";
import { useOCR, OCR_ENGINES } from "@/hooks/useOCR";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("chatgpt-api-key") || "");
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem("gemini-api-key") || "");

  const { 
    isProcessing, 
    progress, 
    extractedText, 
    processImage, 
    reset,
    selectedEngine,
    setSelectedEngine,
  } = useOCR();

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("chatgpt-api-key", apiKey);
    }
  }, [apiKey]);

  useEffect(() => {
    if (geminiApiKey) {
      localStorage.setItem("gemini-api-key", geminiApiKey);
    }
  }, [geminiApiKey]);

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    
    // Convert to base64 for Vision APIs
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImageBase64(base64);
      processImage(file, selectedEngine, apiKey, base64, geminiApiKey);
    };
    reader.readAsDataURL(file);
  };

  const handleReprocess = () => {
    if (imageFile && imageBase64) {
      processImage(imageFile, selectedEngine, apiKey, imageBase64, geminiApiKey);
    }
  };

  const handleClear = () => {
    setImageFile(null);
    setImageUrl(null);
    setImageBase64(null);
    reset();
  };

  const handleEngineChange = (engine: typeof selectedEngine) => {
    setSelectedEngine(engine);
    // Auto-reprocess if image exists
    if (imageFile && imageBase64) {
      setTimeout(() => {
        processImage(imageFile, engine, apiKey, imageBase64, geminiApiKey);
      }, 100);
    }
  };

  const currentEngine = OCR_ENGINES.find(e => e.id === selectedEngine);

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
            {/* OCR Engine Selector */}
            <div className="glass rounded-xl p-4">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <OCREngineSelector
                    value={selectedEngine}
                    onChange={handleEngineChange}
                    hasOpenAiKey={!!apiKey}
                    hasGeminiKey={!!geminiApiKey}
                    disabled={isProcessing}
                  />
                </div>
                {imageFile && (
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleReprocess}
                    disabled={isProcessing}
                    title="Erneut verarbeiten"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

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

          {/* Right Column - API Keys & Chat */}
          <div className="space-y-6">
            <ApiKeyInput 
              apiKey={apiKey} 
              onApiKeyChange={setApiKey}
              label="OpenAI API Key"
              placeholder="sk-..."
              storageKey="openai"
            />
            <ApiKeyInput 
              apiKey={geminiApiKey} 
              onApiKeyChange={setGeminiApiKey}
              label="Google Gemini API Key"
              placeholder="AIza..."
              storageKey="gemini"
            />
            
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
            { icon: "🔍", title: "Multi-OCR", desc: "Tesseract, GPT-4 oder Gemini" },
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
