import { useState, useCallback } from "react";
import { createWorker } from "tesseract.js";

export const useOCR = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState("");

  const processImage = useCallback(async (imageFile: File) => {
    setIsProcessing(true);
    setProgress(0);
    setExtractedText("");

    try {
      const worker = await createWorker("deu+eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(m.progress * 100);
          }
        },
      });

      const { data: { text } } = await worker.recognize(imageFile);
      
      await worker.terminate();
      
      setExtractedText(text.trim());
    } catch (error) {
      console.error("OCR Error:", error);
      setExtractedText("Fehler bei der Texterkennung.");
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
  };
};
