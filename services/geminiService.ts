import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisReport } from '../types';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    overallScore: {
      type: Type.NUMBER,
      description: "A single overall score for the user flow from 1 to 10, where 10 is excellent."
    },
    generalAnalysis: {
      type: Type.STRING,
      description: "A high-level summary of the user flow's strengths and weaknesses. Written in a professional, encouraging tone. Use plain text only (no markdown, no bolding/bullets)."
    },
    positivePoints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of 2-3 specific things the user flow does well."
    },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "A short, actionable headline for the recommendation." },
          description: { type: Type.STRING, description: "A detailed explanation of the issue and the proposed solution." },
          screenIndex: { type: Type.INTEGER, description: "The 0-based index of the screen this recommendation applies to." },
          impact: { type: Type.STRING, description: "Estimated impact of implementing this change. One of: High, Medium, Low." },
          effort: { type: Type.STRING, description: "Estimated effort to implement this change. One of: High, Medium, Low." },
        },
        required: ["title", "description", "screenIndex", "impact", "effort"]
      }
    },
    benchmarks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING, description: "A well-known company or app that exemplifies a good solution to a related problem." },
          description: { type: Type.STRING, description: "A brief description of how that company solves the problem well." }
        },
        required: ["company", "description"]
      }
    },
    accessibilityReport: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "A clear, concise name for the accessibility issue (e.g., 'Low Contrast Text')." },
            description: { type: Type.STRING, description: "A detailed explanation of why this is an issue and who it affects." },
            recommendation: { type: Type.STRING, description: "A concrete suggestion on how to fix the issue." },
            screenIndex: { type: Type.INTEGER, description: "The 0-based index of the screen this issue applies to." },
            severity: { type: Type.STRING, description: "The severity of the issue. One of: Critical, Serious, Moderate, Minor." },
        },
        required: ["title", "description", "recommendation", "screenIndex", "severity"]
      }
    }
  },
  required: ["overallScore", "generalAnalysis", "positivePoints", "recommendations", "benchmarks", "accessibilityReport"]
};

const PERSONA_PROMPTS: Record<string, string> = {
  'standard': "Act as a world-class Product Designer. Provide a balanced analysis focusing on usability, visual hierarchy, and interaction design best practices.",
  'conversion': "Act as a Growth Product Manager. Focus intensely on friction points, conversion optimization, call-to-action clarity, and user motivation. Be critical of anything that slows the user down.",
  'accessibility': "Act as a Certified Accessibility Specialist. Prioritize WCAG 2.1 AA compliance. Focus on color contrast, touch targets, semantic structure, and potential screen reader issues.",
  'copy': "Act as a UX Writer and Content Strategist. Focus on the clarity, tone, and conciseness of the text. Identify jargon, ambiguity, and opportunities for better microcopy.",
};

export const analyzeFlow = async (
  files: File[],
  objective: string,
  sourceType: 'images' | 'video',
  persona: string = 'standard',
  refinement?: { previousReport: AnalysisReport; userFeedback: string; }
): Promise<AnalysisReport> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API key is missing. Please set the API_KEY environment variable.");
  }

  // Initialize inside the function to use the environment variable securely and robustly
  const ai = new GoogleGenAI({ apiKey });

  const imageParts = await Promise.all(files.map(fileToGenerativePart));

  let prompt: string;
  const personaInstruction = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS['standard'];

  if (refinement) {
    prompt = `${personaInstruction} You previously provided the following UX analysis (in JSON format):

"""json
${JSON.stringify(refinement.previousReport)}
"""

The user's original goal was: "${objective}".

Now, the user has provided the following feedback on your analysis:

"${refinement.userFeedback}"

Please provide a new, refined analysis based on this feedback. Update your previous recommendations, scores, accessibility findings, and insights as necessary to address the user's comments. Maintain the same JSON schema for your response. Your new analysis should be a complete replacement for the old one, incorporating the feedback directly into your insights.`;
  } else {
     const sourceDescription = sourceType === 'video' 
      ? 'The flow is presented in sequential frames extracted from a video recording of a user session.' 
      : 'The flow is presented in a series of static screenshots.';
      
    prompt = `My main goal is to: "${objective}". Based on this goal, please provide a comprehensive and deep UX/UI analysis of the user flow using your advanced reasoning capabilities. ${sourceDescription} The flow proceeds in the order the images are provided. 
    
    ${personaInstruction} Your analysis should be structured according to the JSON schema provided. Ensure your analysis is insightful and your recommendations are concrete, actionable, and specific to the visual evidence.
    
    In the accessibilityReport section, perform a thorough accessibility analysis of the screens based on WCAG 2.1 AA principles. Identify issues related to color contrast, alternative text for images, touch target sizes, form labeling, and semantic structure. Provide a list of accessibility issues with a severity rating.`;
  }


  const contents = {
      parts: [
          { text: prompt },
          ...imageParts
      ]
  };

  const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Upgraded to Gemini 3 Pro
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.2,
        // Increased thinking budget for Gemini 3 Pro
        thinkingConfig: { thinkingBudget: 16384 } 
      },
  });

  try {
    const jsonString = response.text.trim();
    const result: AnalysisReport = JSON.parse(jsonString);
    return result;
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    console.error("Raw response text:", response.text);
    throw new Error("The AI returned an invalid analysis format. Please try again.");
  }
};