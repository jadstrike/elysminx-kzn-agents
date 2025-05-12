import { useState } from "react";

export interface GeminiResponse {
  candidates?: any[];
  [key: string]: any;
}

export function useGemini(userKey: string | null, userModel: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<GeminiResponse | null>(null);

  const callGemini = async (
    prompt: string,
    opts?: { model?: string; key?: string }
  ) => {
    setLoading(true);
    setError(null);
    setResponse(null);
    const apiKey = opts?.key || userKey;
    const model = opts?.model || userModel || "gemini-1.5-pro";
    if (!apiKey || !model) {
      setError("Missing Gemini API key or model.");
      setLoading(false);
      return;
    }
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const body = {
        contents: [{ parts: [{ text: prompt }] }],
      };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.error?.message || "Gemini API error");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setResponse(data);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return { callGemini, loading, error, response };
}
