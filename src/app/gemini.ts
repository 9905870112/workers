import { Injectable } from '@angular/core';
import { GoogleGenAI } from "@google/genai";

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  async getLocationInfo(address: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide helpful navigation tips and nearby landmarks for this address in India: ${address}. Also, confirm if this looks like a valid residential or commercial area.`,
      config: {
        tools: [{ googleMaps: {} }]
      }
    });
    return response.text || 'No information available for this location.';
  }
}
