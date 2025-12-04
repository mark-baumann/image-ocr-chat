import { useState, useCallback } from "react";
import { createWorker } from "tesseract.js";

export type OCREngine = "tesseract" | "gpt4-vision";

export interface OCREngineInfo {
  id: OCREngine;
  name: string;
  description: string;
  requiresApiKey: boolean;
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
    description: "Beste Qualität, nutzt API Key",
    requiresApiKey: true,
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
                text: "Extrahiere den gesamten Text aus diesem Bild. Gib NUR den extrahierten Text zurück, ohne Erklärungen oder Kommentare. Behalte die Formatierung und Zeilenumbrüche bei.",
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

  const processImage = useCallback(async (
    imageFile: File, 
    engine: OCREngine,
    apiKey?: string,
    imageBase64?: string
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
          throw new Error("API Key erforderlich für GPT-4 Vision");
        }
        text = await processWithGPT4Vision(imageBase64, apiKey);
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
