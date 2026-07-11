import { GoogleGenAI, Type } from "@google/genai";
import { Question, SubScores } from "../src/types";

let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in the Secrets panel or .env file.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

interface EvaluationResult {
  transcription: string;
  subScores: SubScores;
  feedback: string;
  suggestions: string[];
}

/**
 * Evaluates a candidate's answer using Gemini AI.
 * Handles both typed text answers and voice answers (via base64 audio).
 */
export async function evaluateAnswer(
  question: Question,
  userAnswerText?: string,
  audioBase64?: string,
  audioMimeType?: string,
  audioDurationSeconds?: number
): Promise<EvaluationResult> {
  const ai = getGeminiClient();

  // Create prompt content explaining the task and expected strict grading standard
  const promptText = `
    You are an expert technical interviewer and communication coach.
    Evaluate the candidate's response to the following interview question:

    QUESTION:
    "${question.text}"

    QUESTION TYPE: ${question.type.toUpperCase()}
    JOB ROLE TARGET: ${question.jobRole}
    DIFFICULTY LEVEL: ${question.difficulty.toUpperCase()}

    IDEAL ANSWER REFERENCE:
    "${question.idealAnswer}"

    REQUIRED KEYWORDS:
    ${question.keywords.map(kw => `- "${kw}"`).join('\n')}

    INSTRUCTIONS:
    1. If typed text is provided, analyze the text.
    2. If base64 audio is provided, transcribe the audio first, and then analyze the transcribed text.
    3. Evaluate the answer objectively across five areas (scores must be integers between 0 and 100):
       - 'technical': Correctness and technical completeness relative to the ideal answer. (Max 100)
       - 'communication': Clarity, articulation, structured delivery, and tone. (Max 100)
       - 'grammar': Sentence structure, syntax, word selection, and spelling/transcription grammar. (Max 100)
       - 'confidence': Professional presence, decisiveness, and vocabulary of a qualified candidate. (Max 100)
       - 'keywordMatch': Percentage score indicating how many of the required keywords were successfully integrated, correctly explained, or conceptually covered. (Max 100)
    4. Provide constructive feedback (2-3 sentences) detailing strengths and weaknesses.
    5. List 2 to 4 specific, actionable bulleted suggestions for improvement.
  `;

  const contents: any[] = [];

  if (audioBase64 && audioMimeType) {
    console.log(`[AI Engine] Evaluating audio answer (${audioMimeType}, base64 length: ${audioBase64.length})`);
    contents.push({
      inlineData: {
        mimeType: audioMimeType,
        data: audioBase64
      }
    });
    contents.push({
      text: `${promptText}\nNOTE: Since audio was uploaded, transcribe the audio word-for-word and assign it to the 'transcription' property.`
    });
  } else {
    console.log(`[AI Engine] Evaluating typed text answer (${userAnswerText?.length || 0} characters)`);
    contents.push({
      text: `${promptText}\n\nCANDIDATE'S TYPED ANSWER:\n"${userAnswerText || ""}"`
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          transcription: {
            type: Type.STRING,
            description: "If audio was provided, this is the exact, complete word-for-word transcript. If text was provided, this is a clean, formatted copy of the typed response."
          },
          subScores: {
            type: Type.OBJECT,
            properties: {
              technical: { type: Type.INTEGER, description: "Correctness, technical accuracy, and domain competence (0-100)." },
              communication: { type: Type.INTEGER, description: "Structure, flow, pacing, and vocabulary clarity (0-100)." },
              grammar: { type: Type.INTEGER, description: "Syntactic and grammatical accuracy (0-100)." },
              confidence: { type: Type.INTEGER, description: "Presence, certainty, absence of filler words or self-doubt phrases (0-100)." },
              keywordMatch: { type: Type.INTEGER, description: "Degree to which the required keywords are matched or conceptually covered (0-100)." }
            },
            required: ["technical", "communication", "grammar", "confidence", "keywordMatch"]
          },
          feedback: {
            type: Type.STRING,
            description: "Professional, objective feedback pointing out specific technical or communication pros and cons (2-3 sentences)."
          },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Actionable, concrete recommendations to improve (e.g., 'Define the Pigeonhole Principle explicitly', 'Explain difference in transactions vs horizontal scaling')."
          }
        },
        required: ["transcription", "subScores", "feedback", "suggestions"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response received from the evaluation model.");
  }

  try {
    const result: EvaluationResult = JSON.parse(text.trim());
    return result;
  } catch (err) {
    console.error("[AI Engine] Failed to parse JSON response from Gemini:", text, err);
    throw new Error("Failed to parse evaluation report. Please try submitting again.");
  }
}

/**
 * Generates an adaptive, tailored follow-up question or adaptive next question based on the previous performance.
 */
export async function generateAdaptiveQuestion(
  sessionHistory: { questionText: string; answerText: string; score: number }[],
  jobRole: string,
  interviewType: string
): Promise<string> {
  const ai = getGeminiClient();

  const promptText = `
    You are an advanced adaptive interviewer. The candidate is undergoing a ${interviewType} interview for a ${jobRole} position.
    Here is the history of their previous questions and answers in this session:

    ${sessionHistory.map((h, i) => `
      Round ${i + 1}:
      Question: "${h.questionText}"
      Candidate Answer: "${h.answerText}"
      Score: ${h.score}/100
    `).join('\n')}

    TASK:
    Generate the next interview question.
    - If the candidate performed poorly (score < 70) on the last question, generate an encouraging, slightly simpler question to rebuild their confidence.
    - If the candidate performed exceptionally (score >= 85), generate a deeper, challenging follow-up question that drills into details of their previous answer, or asks a harder technical concept.
    - Otherwise, generate a standard relevant question appropriate for a ${jobRole} in a ${interviewType} context.

    Return ONLY the raw question string. Do not include any headers, preambles, or formatting. Just the question.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: promptText
  });

  return response.text?.trim() || "Can you expand further on your practical experience in this area?";
}

/**
 * Evaluates Python code using Gemini AI as a virtual execution engine
 */
export async function evaluatePythonCode(
  challengeTitle: string,
  code: string,
  testCases: any[]
): Promise<{
  allPassed: boolean;
  testResults: { input: string; expected: string; actual: string; passed: boolean }[];
  consoleLogs: string;
  feedback: string;
  subScores: SubScores;
}> {
  const ai = getGeminiClient();
  const promptText = `
    You are an automated code evaluation sandbox runner.
    Analyze and evaluate the following Python 3 code for the coding challenge "${challengeTitle}".
    
    SUBMITTED CODE:
    \`\`\`python
    ${code}
    \`\`\`
    
    UNIT TEST CASES:
    ${JSON.stringify(testCases, null, 2)}
    
    INSTRUCTIONS:
    1. Statically analyze and virtually execute the code for each test case.
    2. Determine whether the code runs successfully and returns the expected values.
    3. If there are syntax errors, runtime errors, or incorrect results, set 'passed' to false for those cases and explain why.
    4. Provide the simulated console/compiler outputs if any print statements are used, or explain any runtime tracebacks in 'consoleLogs'.
    5. Evaluate the answer objectively across five areas (scores must be integers between 0 and 100):
       - 'technical': Correctness and logical completeness (100 if all tests pass, lower if errors or bugs).
       - 'communication': Readability, formatting, and presence of helpful docstrings/comments.
       - 'grammar': Syntactic syntax correctness (100 if no syntax issues, lower if syntax errors exist).
       - 'confidence': Elegance, complexity (time/space efficiency), and direct correctness of the solution.
       - 'keywordMatch': Proper usage of key language structures (e.g., dict, lists, recursion, or standard libraries if needed).
    6. Return a valid JSON object matching the schema below.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: promptText,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          allPassed: { type: Type.BOOLEAN },
          testResults: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                input: { type: Type.STRING },
                expected: { type: Type.STRING },
                actual: { type: Type.STRING },
                passed: { type: Type.BOOLEAN }
              },
              required: ["input", "expected", "actual", "passed"]
            }
          },
          consoleLogs: { type: Type.STRING },
          feedback: { type: Type.STRING },
          subScores: {
            type: Type.OBJECT,
            properties: {
              technical: { type: Type.INTEGER },
              communication: { type: Type.INTEGER },
              grammar: { type: Type.INTEGER },
              confidence: { type: Type.INTEGER },
              keywordMatch: { type: Type.INTEGER }
            },
            required: ["technical", "communication", "grammar", "confidence", "keywordMatch"]
          }
        },
        required: ["allPassed", "testResults", "consoleLogs", "feedback", "subScores"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from virtual Python sandbox runner.");
  }

  return JSON.parse(text.trim());
}
