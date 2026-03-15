export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Incoming request body:", body); // Check Vercel logs to see this!

    // 1. EXTRACT THE PROMPT (Handles multiple frontend styles)
    let userPrompt = "";
    if (typeof body.message === 'string') {
      userPrompt = body.message;
    } else if (Array.isArray(body.messages)) {
      // Get the text from the last message in the array
      const lastMsg = body.messages[body.messages.length - 1];
      userPrompt = typeof lastMsg === 'string' ? lastMsg : lastMsg.content;
    } else if (body.prompt) {
      userPrompt = body.prompt;
    }

    if (!userPrompt) {
      return NextResponse.json({ error: "No message found in request" }, { status: 400 });
    }

    // 2. CHECK API KEY
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not set in Vercel" }, { status: 500 });
    }

    // 3. CALL GEMINI
    const model = "gemini-1.5-flash";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userPrompt }] }],
        }),
      }
    );

    const data = await response.json();
    
    // Handle Gemini Errors (like invalid keys or safety filters)
    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";

    // 4. THE "CATCH-ALL" RESPONSE
    // We send back multiple fields so no matter what your frontend is coded to look for, it finds it.
    return NextResponse.json({ 
      text: text,           // Generic
      content: text,        // OpenAI/Vercel AI SDK style
      message: text,        // Custom style
      choices: [{ message: { content: text } }] // Legacy OpenAI style
    });

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
