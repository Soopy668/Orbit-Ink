import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { message } = await req.json();

  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is missing" },
      { status: 500 }
    );
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: message }],
          },
        ],
      }),
    }
  );

  const data = await response.json();

  const text =
    data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ||
    "No response returned.";

  return NextResponse.json({ text, raw: data });
}
