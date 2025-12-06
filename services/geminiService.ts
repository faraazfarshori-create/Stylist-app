import { GoogleGenAI } from "@google/genai";
import { OutfitStyle } from "../types";

const MODEL_NAME = 'gemini-2.5-flash-image';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Helper to convert Blob/File to Base64 string
 */
const fileToGenericBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Helper to strip base64 prefix if present in a string
 */
const cleanBase64 = (data: string): string => {
  if (data.includes(',')) {
    return data.split(',')[1];
  }
  return data;
}

export const generateOutfit = async (
  inputImageBase64: string,
  style: OutfitStyle
): Promise<string> => {
  try {
    const prompt = `
      Act as a high-end fashion stylist.
      I have uploaded an image of a specific clothing item.
      Create a complete, photorealistic "flat-lay" outfit grid image featuring this item.
      Style: ${style}.
      Include matching shoes, bag, and accessories appropriate for a ${style} look.
      Ensure the original item is the focal point.
      Background: Clean, neutral, high-quality studio lighting.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png', // Assuming PNG/JPEG, API handles standard types
              data: cleanBase64(inputImageBase64),
            },
          },
          { text: prompt },
        ],
      },
      config: {
        // Flat-lay usually looks good square or portrait. Let's go square.
        // Nano banana models don't support responseMimeType/responseSchema.
        // We rely on getting an image back in the parts.
      },
    });

    // Extract image
    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    }

    throw new Error("No image generated.");
  } catch (error) {
    console.error("Error generating outfit:", error);
    throw error;
  }
};

export const editOutfitImage = async (
  currentImageBase64: string,
  instruction: string
): Promise<string> => {
  try {
    const prompt = `
      Edit this outfit image based on the following instruction: "${instruction}".
      Maintain the flat-lay style and high photorealistic quality.
      Keep the items that don't need changing.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64(currentImageBase64),
            },
          },
          { text: prompt },
        ],
      },
    });

    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    }

    throw new Error("No edited image generated.");
  } catch (error) {
    console.error("Error editing outfit:", error);
    throw error;
  }
};
