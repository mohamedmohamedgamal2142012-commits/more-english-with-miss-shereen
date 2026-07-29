import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash";

export async function POST(req: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
  }

  try {
    const { text, lang } = await req.json();
    const systemPrompt = lang === "ar"
      ? "أنت مساعد تعليمي ذكي لمادة اللغة الإنجليزية للمنهج المصري. أجب على أسئلة الطلاب باللغة العربية بشكل مفيد ومبسّط. إذا لم تتمكن من الإجابة، قل لا أستطيع الإجابة على هذا السؤال بعد."
      : "You are an intelligent English teaching assistant for the Egyptian curriculum. Answer student questions in English clearly and helpfully. If you cannot answer, say I am not able to answer that yet.";

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\nQuestion: ${text}` }] }],
        generationConfig: { temperature: 0.7, topP: 0.9, maxOutputTokens: 500 }
      }),
    });

    if (!geminiRes.ok) throw new Error(`Gemini API error: ${geminiRes.status}`);
    const data = await geminiRes.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || (lang === "ar" ? "عذراً، لم أتمكن من الإجابة على هذا السؤال." : "Sorry, I could not answer that.");
    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}