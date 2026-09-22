import { GoogleGenAI, Type, Schema } from "@google/genai";
import { JournalEntry, WeeklyInsight } from "../types";

const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

export const analyzeWeeklyMood = async (entries: JournalEntry[]): Promise<WeeklyInsight> => {
  const ai = getAiClient();
  
  if (entries.length === 0) {
    throw new Error("No entries to analyze.");
  }

  // Analyze last 10 entries to get a good vibe check
  const recentEntries = entries.slice(-10);

  const parts: any[] = [];

  parts.push({
    text: `Analyze the following journal entries from the past week. 
    The entries can be photos, text notes, or audio transcripts/recordings.
    Your goal is to determine the user's overall mood and provide specific, actionable life recommendations.
    
    If the mood is low/sad: Suggest comforting, nature-based, or low-energy therapeutic activities.
    If the mood is high/happy: Suggest social, high-energy, or celebration activities.
    
    Entries:`
  });

  recentEntries.forEach((entry, index) => {
    const dateStr = new Date(entry.timestamp).toDateString();
    
    // Add the context (Note + Date)
    let contextText = `Entry ${index + 1} (${dateStr}) [Type: ${entry.type}]: "${entry.note}"`;
    parts.push({ text: contextText });
    
    // Handle Image
    if (entry.type === 'photo' && entry.imageBase64) {
      try {
        const base64Data = entry.imageBase64.split(',')[1];
        if (base64Data) {
          parts.push({
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data
            }
          });
        }
      } catch (e) {
        console.warn("Failed to process image for entry", entry.id);
      }
    }

    // Handle Audio
    if (entry.type === 'audio' && entry.audioBase64) {
      try {
        const base64Data = entry.audioBase64.split(',')[1];
        // Use stored mediaMimeType or fallback to default for backwards compatibility
        const mimeType = entry.mediaMimeType || 'audio/webm';
        if (base64Data) {
          parts.push({
             inlineData: {
               mimeType: mimeType,
               data: base64Data
             }
          });
        }
      } catch (e) {
        console.warn("Failed to process audio for entry", entry.id);
      }
    }
  });

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      overallMood: { type: Type.STRING, description: "A short phrase describing the overall mood (e.g., 'Reflective and Calm', 'Energetic and Joyful')" },
      summary: { type: Type.STRING, description: "A 2-3 sentence summary of the week's emotional journey." },
      positivityScore: { type: Type.NUMBER, description: "A score from 0 to 100 indicating positivity level." },
      suggestedActivities: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            icon: { type: Type.STRING, description: "A single emoji representing the activity" },
            type: { type: Type.STRING, enum: ['active', 'relaxing', 'social'] }
          },
          required: ['title', 'description', 'icon', 'type']
        }
      }
    },
    required: ['overallMood', 'summary', 'positivityScore', 'suggestedActivities']
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: parts
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        systemInstruction: "You are an empathetic mental wellness companion. Analyze the multimedia context deeply."
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    const result = JSON.parse(text) as WeeklyInsight;
    result.generatedDate = Date.now();
    return result;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
