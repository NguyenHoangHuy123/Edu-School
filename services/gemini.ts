
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { EducationLevel, QuizQuestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const chatWithAI = async (
  message: string, 
  level: EducationLevel, 
  subject: string,
  history: { role: 'user' | 'assistant', content: string }[],
  imageB64?: string
) => {
  const modelName = 'gemini-3-flash-preview';
  
  const systemInstruction = `Bạn là một trợ lý giáo dục (EduAI) thông minh, tận tâm và thân thiện dành cho học sinh Việt Nam.
  Cấp học hiện tại: ${level}.
  Môn học hiện tại: ${subject}.
  
  NHIỆM VỤ CỦA BẠN:
  1. Nếu học sinh gửi ảnh bài tập: Hãy phân tích đề bài trong ảnh, giải thích các bước giải quyết một cách chi tiết. KHÔNG chỉ đưa ra đáp án cuối cùng, hãy dạy học sinh cách tư duy.
  2. Nếu là Cấp 1: Giải thích cực kỳ đơn giản, dùng hình ảnh ẩn dụ (ví dụ: quả táo, cái kẹo), khen ngợi nhiều để khích lệ.
  3. Nếu là Cấp 2: Giải thích rõ ràng, logic, bắt đầu đi sâu vào các công thức và khái niệm nền tảng.
  4. Nếu là Cấp 3: Giải thích chuyên sâu, học thuật, hỗ trợ tư duy phản biện, nhắc lại kiến thức liên quan và mẹo ôn thi.
  
  Luôn ưu tiên tính chính xác. Nếu cần thông tin cập nhật, hãy sử dụng công cụ tìm kiếm. Trả lời bằng tiếng Việt phong cách giáo dục hiện đại.`;

  const contents: any[] = history.map(h => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: h.content }]
  }));

  const userParts: any[] = [{ text: message }];
  if (imageB64) {
    userParts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageB64.split(',')[1] // Remove prefix
      }
    });
  }

  contents.push({
    role: 'user',
    parts: userParts
  });

  const response = await ai.models.generateContent({
    model: modelName,
    contents,
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }]
    }
  });

  return {
    text: response.text || "Xin lỗi, tôi gặp chút trục trặc khi phản hồi.",
    groundingSources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Nguồn tham khảo",
      uri: chunk.web?.uri || ""
    })).filter((c: any) => c.uri) || []
  };
};

export const generateQuiz = async (topic: string, level: EducationLevel): Promise<QuizQuestion[]> => {
  const modelName = 'gemini-3-flash-preview';
  
  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Hãy tạo 3 câu hỏi trắc nghiệm về chủ đề "${topic}" phù hợp với học sinh trình độ ${level}. 
    Mỗi câu hỏi có 4 lựa chọn, chỉ có 1 câu đúng duy nhất. 
    Cung cấp lời giải thích chi tiết cho đáp án đúng.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            correctAnswer: { type: Type.INTEGER, description: "Index of correct option (0-3)" },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse quiz JSON", e);
    return [];
  }
};

export const generateAudio = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Hãy đọc đoạn văn sau một cách truyền cảm và rõ ràng: ${text}` }] }],
    config: {
      responseModalities: ["AUDIO" as any],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

export function decodeBase64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
