
import { GoogleGenAI } from "@google/genai";

export const getEncouragement = async (status: 'won' | 'lost', score: number): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const prompt = status === 'won' 
      ? `The player won the Kuromi-themed game with a score of ${score}! Write a sassy, cool, yet secretly proud message (under 15 words) using emojis like 😈, 🖤, 💅. Sound like a mischievous but cool character.`
      : `The player lost the Kuromi-themed game. Write a slightly sassy but encouraging 'tough love' message (under 15 words) to get them to try again. Use emojis like 💢, 😈, 🎀.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.9,
      }
    });

    return response.text || (status === 'won' ? "Not bad, I guess... You're actually pretty good! 😈🖤" : "Get up! You're better than that, dummy! 💢🎀");
  } catch (error) {
    console.error("Gemini Error:", error);
    return status === 'won' ? "You ruled the night! 👑🖤" : "Even the best trip up. Again! 😈✨";
  }
};
