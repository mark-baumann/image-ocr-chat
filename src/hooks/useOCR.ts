import { useState, useCallback } from "react";
import { createWorker } from "tesseract.js";

export type OCREngine = "tesseract" | "gpt4-vision" | "gemini-vision";

export interface OCREngineInfo {
  id: OCREngine;
  name: string;
  description: string;
  requiresApiKey: boolean;
  apiKeyType?: "openai" | "gemini";
}

export const OCR_ENGINES: OCREngineInfo[] = [
  {
    id: "tesseract",
    name: "Tesseract.js",
    description: "Lokal & kostenlos, mittlere Qualität",
    requiresApiKey: false,
  },
  {
    id: "gpt4-vision",
    name: "GPT-4 Vision",
    description: "Beste Qualität, nutzt OpenAI API Key",
    requiresApiKey: true,
    apiKeyType: "openai",
  },
  {
    id: "gemini-vision",
    name: "Google Gemini",
    description: "Sehr gute Qualität, kostenlose Nutzung möglich",
    requiresApiKey: true,
    apiKeyType: "gemini",
  },
];

export const useOCR = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState("");
  const [selectedEngine, setSelectedEngine] = useState<OCREngine>("tesseract");

  const processWithTesseract = async (imageFile: File) => {
    const worker = await createWorker("deu+eng", 1, {
      logger: (m) => {
        if (m.status === "recognizing text") {
          setProgress(m.progress * 100);
        }
      },
    });

    const { data: { text } } = await worker.recognize(imageFile);
    await worker.terminate();
    return text.trim();
  };

  const processWithGPT4Vision = async (imageBase64: string, apiKey: string) => {
    setProgress(30);
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Bitte lies und extrahiere ALLEN sichtbaren Text aus diesem Bild. Gib den kompletten Text zurück, den du sehen kannst - Überschriften, Absätze, Beschriftungen, alles. Formatiere den Text so, wie er im Bild erscheint. Antworte NUR mit dem extrahierten Text.",
              },
              {
                type: "image_url",
                image_url: { url: imageBase64 },
              },
            ],
          },
        ],
        max_tokens: 4000,
      }),
    });

    setProgress(80);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "GPT-4 Vision API Fehler");
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || "";
  };

  const processWithGeminiVision = async (imageBase64: string, apiKey: string) => {
    setProgress(30);
    
    // Extract base64 data without the prefix
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const mimeType = imageBase64.match(/^data:(image\/\w+);base64,/)?.[1] || "image/jpeg";
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Bitte lies und extrahiere ALLEN sichtbaren Text aus diesem Bild. Gib den kompletten Text zurück, den du sehen kannst - Überschriften, Absätze, Beschriftungen, alles. Formatiere den Text so, wie er im Bild erscheint. Antworte NUR mit dem extrahierten Text.",
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
      }),
    });

    setProgress(80);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Gemini Vision API Fehler");
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  };

  const processImage = useCallback(async (
    imageFile: File, 
    engine: OCREngine,
    apiKey?: string,
    imageBase64?: string,
    geminiApiKey?: string
  ) => {
    setIsProcessing(true);
    setProgress(0);
    setExtractedText("");

    try {
      let text = "";

      if (engine === "tesseract") {
        text = await processWithTesseract(imageFile);
      } else if (engine === "gpt4-vision") {
        if (!apiKey || !imageBase64) {
          throw new Error("OpenAI API Key erforderlich für GPT-4 Vision");
        }
        text = await processWithGPT4Vision(imageBase64, apiKey);
      } else if (engine === "gemini-vision") {
        if (!geminiApiKey || !imageBase64) {
          throw new Error("Gemini API Key erforderlich für Google Gemini");
        }
        text = await processWithGeminiVision(imageBase64, geminiApiKey);
      }

      setExtractedText(text || "Kein Text erkannt");
    } catch (error) {
      console.error("OCR Error:", error);
      setExtractedText(error instanceof Error ? `Fehler: ${error.message}` : "Fehler bei der Texterkennung.");
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  }, []);

  const reset = useCallback(() => {
    setExtractedText("");
    setProgress(0);
  }, []);

  return {
    isProcessing,
    progress,
    extractedText,
    processImage,
    reset,
    selectedEngine,
    setSelectedEngine,
  };
};
