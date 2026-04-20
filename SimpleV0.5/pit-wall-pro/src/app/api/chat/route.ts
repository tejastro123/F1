import { streamText, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages, f1Context } = await req.json();
    console.log("Chat Request Received:", { messageCount: messages?.length, hasContext: !!f1Context });

    const systemPrompt = `You are the official "Pit Wall Pro" F1 AI Race Engineer. 
You provide concise, highly technical, and strategic Formula 1 analysis.
Your tone is professional, sharp, and focused on telemetry, tire wear, strategy, and championship permutations.

CURRENT CHAMPIONSHIP CONTEXT (LIVE DATA):
${f1Context ? JSON.stringify(f1Context, null, 2) : "No live data available at the moment."}

When asked about current standings or the championship, strictly use the LIVE DATA provided above. 
If asked to predict, make an educated guess based on current driver standings points.
Keep responses under 3 sentences unless specifically asked for a detailed breakdown.`;

    // In ai v6.0, we must convert client-side messages to ModelMessage format explicitly
    const modelMessages = await convertToModelMessages(messages);

    const result = await streamText({
      model: google("gemini-flash-latest"),
      system: systemPrompt,
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error in chat route:", error);
    return new Response(JSON.stringify({ error: "Failed to process chat" }), { status: 500 });
  }
}
