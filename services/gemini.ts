
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, SwimSession, ChatMessage, SwimmingLevel, DrylandExercise } from "../types";

export class GeminiService {
  constructor() {}

  private calculateBMI(profile: UserProfile): number {
    if (!profile.height || !profile.weight) return 0;
    return parseFloat((profile.weight / ((profile.height/100) * (profile.height/100))).toFixed(1));
  }

  private getLevelSpecificInstructions(level: SwimmingLevel): string {
    switch (level) {
      case SwimmingLevel.BEGINNER:
        return "The user is a BEGINNER. Focus heavily on fundamental stroke mechanics, proper breathing techniques, and water comfort. Keep advice simple, highly encouraging, and prioritize safety and 'form over speed'. Avoid overly dense technical jargon unless explaining it simply.";
      case SwimmingLevel.COMPETITIVE:
        return "The user is a COMPETITIVE swimmer. Focus on interval training, specific sets (e.g., threshold, VO2 max), stroke efficiency (SWOLF), turns, and race starts. Use technical swimming terminology (catch, pull-through, streamline, hypoxic) and suggest drills that improve speed and endurance.";
      case SwimmingLevel.ELITE:
        return "The user is an ELITE athlete. Provide high-level technical analysis, focusing on micro-adjustments in stroke cycle, taper strategies, physiological recovery, and advanced race tactics. Address fatigue patterns, volume management, and high-performance psychological coaching. Use advanced terminology without hesitation.";
      default:
        return "Provide balanced, professional swimming advice suitable for their profile.";
    }
  }

  async getAiCoachResponse(
    profile: UserProfile,
    sessions: SwimSession[],
    message: string,
    history: ChatMessage[]
  ): Promise<string> {
    const levelInstructions = this.getLevelSpecificInstructions(profile.swimmingLevel);
    const bmi = this.calculateBMI(profile);
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          role: 'user',
          parts: [{
            text: `You are "Coach Blue", a world-class swimming coach. 
            USER PROFILE: 
            - Name: ${profile.name}
            - Age: ${profile.age}
            - Gender: ${profile.gender}
            - Height: ${profile.height}cm
            - Weight: ${profile.weight}kg (BMI: ${bmi})
            - Swimming Level: ${profile.swimmingLevel}
            
            LEVEL-SPECIFIC PERSONA:
            ${levelInstructions}

            RECENT DATA: ${JSON.stringify(sessions.slice(-5))}
            
            INSTRUCTIONS:
            - Give advice that is DIRECTLY relevant to a ${profile.swimmingLevel} swimmer.
            - If they ask about improvement, relate it to their recent pace/distance data and physical profile.
            - Be concise, professional, and motivating.
            - Never mention you are an AI; act fully as Coach Blue.

            User Message: ${message}`
          }]
        }
      ],
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    });

    return response.text || "I'm sorry, I couldn't process that. Let's focus on your next lap!";
  }

  async getPerformanceInsights(profile: UserProfile, sessions: SwimSession[]): Promise<string> {
    if (sessions.length === 0) return "Start logging your swims to see performance insights!";

    const levelContext = this.getLevelSpecificInstructions(profile.swimmingLevel);
    const bmi = this.calculateBMI(profile);

    const prompt = `Analyze these swimming sessions through the lens of an expert coach for a ${profile.swimmingLevel} swimmer:
    User Metrics: ${profile.height}cm, ${profile.weight}kg, BMI: ${bmi}.
    Sessions: ${JSON.stringify(sessions)}
    
    CONTEXT FOR ANALYSIS:
    ${levelContext}

    GOAL:
    Provide 3 concise, bulleted insights about their performance. 
    1. One insight on consistency or volume.
    2. One insight on pace trends (looking at seconds/100m).
    3. One actionable recommendation specifically tailored for a ${profile.swimmingLevel} athlete.
    
    Format as short, impactful bullet points.`;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return response.text || "Keep up the great work! Your consistency is your strength.";
  }

  async getQuickSessionFeedback(profile: UserProfile, session: SwimSession): Promise<string> {
    const prompt = `You are "Coach Blue". A ${profile.swimmingLevel} swimmer named ${profile.name} (${profile.weight}kg) just finished a swim: ${session.distance}m of ${session.stroke} in ${Math.floor(session.time/60)}m ${session.time%60}s. 
    They reported feeling ${session.feeling} after the session.
    Give a one-sentence, context-aware, highly encouraging compliment or technical tip based on this specific session and their recovery state. Be brief (under 15 words).`;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return response.text?.trim() || "Great work in the pool today!";
  }

  async getNutritionAdvice(profile: UserProfile, goal: string, customTargetWeight?: number): Promise<string> {
    const bmi = this.calculateBMI(profile);
    const isWeightLoss = goal === 'Weight Loss';
    const targetWeightText = isWeightLoss && customTargetWeight 
      ? `Their DESIRED TARGET WEIGHT is ${customTargetWeight}kg (Current: ${profile.weight}kg).` 
      : '';

    const prompt = `Act as a swimming nutritionist for ${profile.name}, a ${profile.age}-year-old ${profile.swimmingLevel} swimmer.
    USER METRICS: ${profile.height}cm, ${profile.weight}kg, BMI: ${bmi}.
    USER GOAL: ${goal}.
    ${targetWeightText}

    Provide a concise daily nutrition and supplement plan. Include:
    - **Diet Plan Focus**: Specific breakdown of meals (Pre-swim, Post-swim, Main meals) optimized for ${goal}.
    - **Supplement Recommendations**: Suggest safe, effective supplements for a ${profile.swimmingLevel} swimmer (e.g., electrolytes, protein, omega-3, etc.) specifically aiding in ${goal}.
    - **Hydration Strategy**: Specific tips for pool-side hydration.
    - **Caloric Insight**: Briefly mention if they should be in a deficit, surplus, or maintenance based on their ${goal} and ${targetWeightText ? 'target weight' : 'current profile'}.

    Tailor the complexity to their level (${profile.swimmingLevel}).
    Format using Markdown bolding for categories but keep it short, professional, and friendly.`;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    return response.text || "Focus on complex carbs and lean protein!";
  }

  async getDrylandWorkout(profile: UserProfile, goal: string): Promise<DrylandExercise[]> {
    const bmi = this.calculateBMI(profile);
    const prompt = `Generate a 15-20 minute dryland (out of pool) workout for ${profile.name}, a ${profile.swimmingLevel} swimmer.
    USER METRICS: ${profile.height}cm, ${profile.weight}kg, BMI: ${bmi}.
    WORKOUT FOCUS/GOAL: ${goal}.
    List 4-5 exercises with sets, reps, and a brief description.
    For each exercise, provide a detailed step-by-step guide (as an array of strings).
    Also provide a videoUrl that is a valid YouTube search link for that specific exercise (e.g. "https://www.youtube.com/results?search_query=swimming+dryland+exercise+name").
    Ensure exercises are appropriate for a ${profile.swimmingLevel} level athlete.`;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Name of the exercise' },
              sets: { type: Type.STRING, description: 'Number of sets' },
              reps: { type: Type.STRING, description: 'Number of reps or duration' },
              description: { type: Type.STRING, description: 'Summary of the exercise' },
              benefit: { type: Type.STRING, description: 'Swimming specific benefit' },
              focusArea: { type: Type.STRING, description: 'Target muscle group' },
              restTime: { type: Type.INTEGER, description: 'Rest time in seconds' },
              steps: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: 'Detailed instructions to perform the exercise correctly'
              },
              videoUrl: { type: Type.STRING, description: 'A YouTube search link for this exercise' }
            },
            required: ['name', 'sets', 'reps', 'description', 'benefit', 'focusArea', 'restTime', 'steps', 'videoUrl'],
          }
        }
      }
    });

    try {
      return JSON.parse(response.text?.trim() || '[]');
    } catch (e) {
      console.error("Failed to parse workout JSON", e);
      return [];
    }
  }
}

export const geminiService = new GeminiService();
