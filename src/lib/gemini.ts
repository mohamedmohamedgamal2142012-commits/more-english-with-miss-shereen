export async function sendGeminiMessage(text: string, lang: string): Promise<string> {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, lang }),
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  return data.reply || (lang === "ar" ? "عذراً، لم أتمكن من الإجابة على هذا السؤال." : "Sorry, I couldn't answer that question.");
}