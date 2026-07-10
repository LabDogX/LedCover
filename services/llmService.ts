import { GoogleGenAI } from "@google/genai";
import { Platform, AIProvider, AppSettings } from "../types";
import { wechatPrompt } from "../prompts/wechatPrompt";
import { xhsPrompt } from "../prompts/xhsPrompt";
import { applyProviderDefaults, getProviderOption } from "../utils/aiProviders";

interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}

export const generateCoverHtml = async (
  topic: string, 
  platform: Platform,
  settings: AppSettings
): Promise<string> => {
  const resolvedSettings = applyProviderDefaults(settings);
  const providerOption = getProviderOption(resolvedSettings.provider);
  
  const systemPrompt = platform === Platform.WeChat ? wechatPrompt : xhsPrompt;

  const userPrompt = `
    Based on the System Instructions provided above, generate the HTML for the following topic:
    "${topic}"

    CRITICAL REQUIREMENTS:
    1. **Output Format**: Return ONLY the raw HTML string. NO markdown blocks (e.g., no \`\`\`html).
    2. **Styling**: Use **INLINE STYLES** (style="...") for ALL styling. Do NOT use Tailwind CSS classes.
    3. **Structure**: The root element MUST have explicit width and height in inline styles.
    4. **Content**: Do NOT include <html>, <head>, <body> tags or any scripts.
    5. **Language**: All text MUST be in Simplified Chinese (简体中文).
    6. **Colors**: Use standard hex colors (#ffffff, #0f172a, etc.) or rgba(). Avoid oklab or other modern color formats.
  `;

  const apiKey = resolvedSettings.apiKey?.trim() || "";
  const model = resolvedSettings.model?.trim() || providerOption.defaultModel;
  const baseUrl = resolvedSettings.baseUrl?.trim() || providerOption.defaultBaseUrl || "";

  if (providerOption.requiresApiKey && !apiKey) {
    throw new Error(`${providerOption.label} API Key 未配置。请在设置中输入您的 Key。`);
  }

  try {
    if (resolvedSettings.provider === AIProvider.Gemini) {
      return await callGemini(apiKey, model, systemPrompt, userPrompt);
    }

    return await callOpenAICompatible({
      apiKey,
      baseUrl,
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });
  } catch (error: any) {
    console.error(`${resolvedSettings.provider} API Error:`, error);
    throw new Error(error.message || "生成封面失败，请检查 API Key、模型名称、接口地址或网络连接。");
  }
};

async function callGemini(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model,
    contents: [
      { role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }
    ]
  });

  const text = response.text || "";
  return cleanOutput(text);
}

async function callOpenAICompatible({
  apiKey,
  baseUrl,
  model,
  messages,
}: {
  apiKey: string;
  baseUrl: string;
  model: string;
  messages: ChatMessage[];
}): Promise<string> {
  if (!baseUrl) {
    throw new Error("接口地址未配置。请在设置中填写 Base URL。");
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const response = await fetch(getChatCompletionsUrl(baseUrl), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      temperature: 1.1,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`${response.status} ${data.error?.message || response.statusText || '请求失败'}`);
  }

  const text = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || "";
  return cleanOutput(text);
}

function getChatCompletionsUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, '');

  if (trimmed.endsWith('/chat/completions')) {
    return trimmed;
  }

  return `${trimmed}/chat/completions`;
}

function cleanOutput(text: string): string {
  return text.replace(/```html/g, '').replace(/```/g, '').trim();
}
