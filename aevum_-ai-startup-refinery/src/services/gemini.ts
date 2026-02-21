import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "") {
    throw new Error("GEMINI_API_KEY is missing. Please select an API key using the 'Select API Key' button at the top.");
  }
  return new GoogleGenAI({ apiKey });
};

export const marketIntelligenceAgent = async (project: { name: string, description: string, problem?: string, target_users?: string, technology?: string }) => {
  console.log("Market Agent starting for:", project.name);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "You are an AI startup evaluator. Analyze the startup or hackathon project idea and provide a structured evaluation report.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            market_score: { type: Type.NUMBER, description: "Market Demand Score (1-10)" },
            innovation_score: { type: Type.NUMBER, description: "Innovation Score (1-10)" },
            target_users: { type: Type.ARRAY, items: { type: Type.STRING } },
            competitors: { type: Type.ARRAY, items: { type: Type.STRING } },
            risks: { type: Type.ARRAY, items: { type: Type.STRING } },
            verdict: { type: Type.STRING, description: "Short Verdict" },
            labels: { type: Type.ARRAY, items: { type: Type.STRING }, description: "System labels like 'High Potential', 'Crowded Market', etc." }
          },
          required: ["market_score", "innovation_score", "target_users", "competitors", "risks", "verdict", "labels"]
        }
      },
      contents: `Analyze the following startup idea:
      
      Idea: ${project.name} - ${project.description}
      Problem: ${project.problem || "Not specified"}
      Target Users: ${project.target_users || "Not specified"}
      Technology: ${project.technology || "Not specified"}`
    });
    clearTimeout(timeoutId);
    console.log("Market Agent response received");
    return JSON.parse(response.text || "{}");
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Market Agent Error:", error);
    return {
      market_score: 0,
      innovation_score: 0,
      target_users: [],
      competitors: [],
      risks: ["Analysis failed: " + (error instanceof Error ? error.message : String(error))],
      verdict: "System error during market analysis.",
      labels: ["Error"]
    };
  }
};

export const architectAgent = async (project: { name: string, description: string, technology?: string, repo_link?: string, project_structure?: string, readme?: string, commit_activity?: string }) => {
  console.log("Architect Agent starting for:", project.name);
  const hasRepo = project.repo_link && project.repo_link.startsWith('http');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout for architect
  
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "You are a senior software architect reviewing a project repository. Analyze the repository information, including file structure, README content, and commit activity, to provide a deep engineering review.",
        responseMimeType: "application/json",
        // Temporarily disable urlContext to see if it's causing issues
        // tools: hasRepo ? [{ urlContext: {} }] : [],
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tech_stack_detected: { type: Type.ARRAY, items: { type: Type.STRING } },
            architecture_score: { type: Type.NUMBER, description: "Architecture Score (1-10)" },
            missing_components: { type: Type.ARRAY, items: { type: Type.STRING } },
            scalability_risks: { type: Type.ARRAY, items: { type: Type.STRING } },
            security_risks: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            maturity_level: { type: Type.STRING, description: "Beginner Prototype, MVP Level, Scalable System, or Production Ready" },
            techTree: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                children: {
                  type: Type.ARRAY,
                  items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } }
                }
              }
            }
          },
          required: ["tech_stack_detected", "architecture_score", "missing_components", "scalability_risks", "security_risks", "improvements", "maturity_level", "techTree"]
        }
      },
      contents: `Analyze the following project architecture:
      
      Repository Name: ${project.name}
      GitHub Link: ${project.repo_link || "Not specified"}
      Project Description: ${project.description}
      Tech Stack Used: ${project.technology || "Not specified"}
      Project Structure: ${project.project_structure || "Not specified"}
      
      README Content:
      ${project.readme || "Not available"}
      
      Commit Activity:
      ${project.commit_activity || "Not available"}`
    });
    clearTimeout(timeoutId);
    console.log("Architect Agent response received");
    return JSON.parse(response.text || "{}");
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Architect Agent Error:", error);
    return {
      tech_stack_detected: [],
      architecture_score: 0,
      missing_components: ["Analysis failed: " + (error instanceof Error ? error.message : String(error))],
      scalability_risks: ["Analysis failed"],
      security_risks: ["Analysis failed"],
      improvements: [],
      maturity_level: "Unknown",
      techTree: { name: project.name, children: [] }
    };
  }
};

export const syntheticUserLab = async (name: string, description: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Simulate 3 diverse user personas interacting with this product:
      Product: ${name}
      Description: ${description}
      
      For each persona, provide:
      1. Persona Name/Role
      2. Initial Reaction
      3. Friction Points
      4. Usability Score (1-10)`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              persona: { type: Type.STRING },
              reaction: { type: Type.STRING },
              frictionPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              score: { type: Type.NUMBER }
            }
          }
        }
      }
    });
    clearTimeout(timeoutId);
    console.log("User Lab response received");
    return JSON.parse(response.text || "[]");
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("User Lab Error:", error);
    if (error instanceof Error) {
      console.error("Error Message:", error.message);
      console.error("Error Stack:", error.stack);
    }
    return [];
  }
};

export const rejectionDecoder = async (failureReason: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Decode this rejection or failure point into a roadmap for success:
      Failure/Rejection: ${failureReason}
      
      Provide:
      1. Root Cause Analysis
      2. Actionable Fixes
      3. Skill Gaps to Bridge`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rootCause: { type: Type.STRING },
            fixes: { type: Type.ARRAY, items: { type: Type.STRING } },
            skillGaps: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    clearTimeout(timeoutId);
    console.log("Rejection Decoder response received");
    return JSON.parse(response.text || "{}");
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Rejection Decoder Error:", error);
    if (error instanceof Error) {
      console.error("Error Message:", error.message);
    }
    return {
      rootCause: "System error during analysis: " + (error instanceof Error ? error.message : String(error)),
      fixes: ["Retry analysis"],
      skillGaps: ["System Error"]
    };
  }
};

export const survivalEngineAgent = async (marketResult: any, architectResult: any) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "You are an AI startup evaluation engine. Your job is to analyze project results from Idea Analysis and Architecture Analysis to calculate a final Survival Score and provide a strategic roadmap.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            survival_score: { type: Type.NUMBER, description: "Survival Score (0-100)" },
            risk_level: { type: Type.STRING, description: "Low, Medium, or High" },
            project_potential: { type: Type.STRING },
            key_weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            evolution_roadmap: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["survival_score", "risk_level", "project_potential", "key_weaknesses", "evolution_roadmap"]
        }
      },
      contents: `Analyze the following project results:
      
      Idea Analysis Result:
      Market Score: ${marketResult.market_score}
      Innovation Score: ${marketResult.innovation_score}
      Risks: ${marketResult.risks?.join(", ")}
      
      Architecture Analysis Result:
      Architecture Score: ${architectResult.architecture_score}
      Missing Components: ${architectResult.missing_components?.join(", ")}
      Scalability Risks: ${architectResult.scalability_risks?.join(", ")}`
    });
    clearTimeout(timeoutId);
    console.log("Survival Engine response received");
    return JSON.parse(response.text || "{}");
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Survival Engine Error:", error);
    if (error instanceof Error) {
      console.error("Error Message:", error.message);
    }
    return {
      survival_score: 0,
      risk_level: "High",
      project_potential: "Analysis failed: " + (error instanceof Error ? error.message : String(error)),
      key_weaknesses: ["System Error"],
      evolution_roadmap: ["Retry analysis"]
    };
  }
};
