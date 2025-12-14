import { GoogleGenAI } from "@google/genai";
import { Message, Character, WorldState, AIResponse } from "../types";
import { SYSTEM_PROMPT, WORLD_MAP } from "../constants";

// Initialize the Gemini AI Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateDMResponse(
  lastMessage: string,
  history: Message[],
  character: Character,
  worldState: WorldState
): Promise<AIResponse> {
  
  // Find location name
  const locName = WORLD_MAP.find(n => n.id === character.currentLocationId)?.name || "Unknown";
  
  // Format party for context
  const partyInfo = character.party.length > 0 
    ? character.party.map(c => `${c.name} (${c.class})`).join(', ') 
    : "None";

  // 1. Construct the Context
  const context = `
    [CURRENT STATE]
    LOCATION: ${locName}
    HP: ${character.hp}/${character.maxHp}
    WILL: ${character.will}/${character.maxWill}
    WORLD_STATE: ${worldState}
    PARTY: ${partyInfo}
    INVENTORY: ${character.inventory.map(i => i.name).join(', ')}
    GOLD: ${character.gold}
    PLAYER INPUT: "${lastMessage}"
  `;

  // 2. Map history to API content format
  const contents = history.map(msg => ({
    role: msg.sender === 'DM' ? 'model' : 'user',
    parts: [{ text: msg.sender === 'System' ? `[SYSTEM EVENT]: ${msg.text}` : msg.text }]
  }));

  // 3. Add the current turn
  contents.push({
    role: 'user',
    parts: [{ text: context }]
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 1 // High creativity for surreal descriptions
      }
    });
    
    // 4. Parse JSON Response
    const text = response.text || "{}";
    // Sanitize in case model adds markdown blocks
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanText);

  } catch (e) {
    console.error("Gemini Brain Error:", e);
    return {
       narrative: "The whispers of causality fade into static... (Connection severed. Please try again.)",
       hp_change: 0,
       will_change: 0,
       world_state: worldState,
       new_inventory: null,
       new_companion: null,
       dice_request: null,
       suggested_actions: []
    };
  }
}

export async function generateIntro(character: Character): Promise<AIResponse> {
    const introPrompt = `Initialize story. The player is ${character.name}, a level 1 ${character.class}. 
    Describe the scene: They are resting at a small campfire near a dark forest, but something is watching. 
    Set world_state to 'BONFIRE' initially.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: introPrompt,
            config: {
                systemInstruction: SYSTEM_PROMPT,
                responseMimeType: 'application/json'
            }
        });

        const text = response.text || "{}";
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (e) {
        console.error("Intro Generation Error:", e);
        return {
            narrative: "You stand in the void. Waiting for the light...",
            hp_change: 0,
            will_change: 0,
            world_state: 'PHYSICAL',
            new_inventory: null,
            new_companion: null,
            dice_request: null,
            suggested_actions: []
        };
    }
}