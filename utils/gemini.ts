
import { GoogleGenAI } from "@google/genai";
import { Message, Character, WorldState, AIResponse, Language } from "../types";
import { GET_SYSTEM_PROMPT, WORLD_MAP } from "../constants";

// Initialize the Gemini AI Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to safely parse JSON from AI response
const safeParseJSON = (text: string, currentWorldState: WorldState): AIResponse => {
  try {
    // 1. Remove Markdown code blocks if present
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // 2. Locate the first '{' and last '}' to strip distinct intro/outro text
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }

    const parsed = JSON.parse(cleanText);

    // 3. Validate essential fields (Fail-safe)
    return {
      narrative: parsed.narrative || "The visions are clouded...",
      hp_change: typeof parsed.hp_change === 'number' ? parsed.hp_change : 0,
      will_change: typeof parsed.will_change === 'number' ? parsed.will_change : 0,
      xp_reward: typeof parsed.xp_reward === 'number' ? parsed.xp_reward : 0,
      world_state: parsed.world_state || currentWorldState,
      new_inventory: parsed.new_inventory || null,
      new_companion: parsed.new_companion || null,
      dice_request: parsed.dice_request || null,
      suggested_actions: Array.isArray(parsed.suggested_actions) ? parsed.suggested_actions : []
    };

  } catch (e) {
    console.warn("JSON Parse Failed, attempting manual recovery or fallback:", e);
    
    // Fallback response so the game doesn't crash
    return {
       narrative: "The whispers of causality are indistinct... (AI Error)",
       hp_change: 0,
       will_change: 0,
       world_state: currentWorldState,
       new_inventory: null,
       new_companion: null,
       dice_request: null,
       suggested_actions: ["Look around", "Check status"]
    };
  }
};

export async function generateDMResponse(
  lastMessage: string,
  history: Message[],
  character: Character,
  worldState: WorldState,
  lang: Language
): Promise<AIResponse> {
  
  const locName = WORLD_MAP.find(n => n.id === character.currentLocationId)?.name || "Unknown";
  
  const partyInfo = character.party.length > 0 
    ? character.party.map(c => `${c.name} (${c.class})`).join(', ') 
    : "None";

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

  const contents = history.map(msg => ({
    role: msg.sender === 'DM' ? 'model' : 'user',
    parts: [{ text: msg.sender === 'System' ? `[SYSTEM EVENT]: ${msg.text}` : msg.text }]
  }));

  contents.push({
    role: 'user',
    parts: [{ text: context }]
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: GET_SYSTEM_PROMPT(lang),
        responseMimeType: 'application/json',
        temperature: 1 
      }
    });
    
    const text = response.text || "{}";
    return safeParseJSON(text, worldState);

  } catch (e) {
    console.error("Gemini Brain Error:", e);
    return safeParseJSON("{}", worldState);
  }
}

export async function generateIntro(character: Character, lang: Language): Promise<AIResponse> {
    const introPrompt = `Initialize story. The player is ${character.name}, a level 1 ${character.class}. 
    Describe the scene: They are resting at a small campfire near a dark forest, but something is watching. 
    Set world_state to 'BONFIRE' initially.
    IMPORTANT: Write the story in ${lang === 'ID' ? 'Indonesian' : 'English'}.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: introPrompt,
            config: {
                systemInstruction: GET_SYSTEM_PROMPT(lang),
                responseMimeType: 'application/json'
            }
        });

        const text = response.text || "{}";
        return safeParseJSON(text, 'BONFIRE');
    } catch (e) {
        console.error("Intro Generation Error:", e);
        return safeParseJSON("{}", 'PHYSICAL');
    }
}
