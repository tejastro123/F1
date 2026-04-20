import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { f1Context } = await req.json();

    const systemPrompt = `You are the official "Pit Wall Pro" F1 AI Strategy Engine. 
Based on the following LIVE F1 standings and telemetry data, generate exactly 5 distinct strategic insights.
The insights should cover predictions, qualifying/pace analysis, driver comparisons, and strategy.
Make it sound highly technical, using numbers, percentages, and F1 terminology.
If no context is provided, generate plausible insights for the 2026 season.

LIVE CONTEXT:
${f1Context ? JSON.stringify(f1Context, null, 2) : "No live data available."}`;

    const result = await generateObject({
      model: google("gemini-flash-latest"),
      system: systemPrompt,
      schema: z.object({
        insights: z.array(
          z.object({
            type: z.enum(["prediction", "analysis", "comparison", "strategy"]),
            title: z.string().describe("A short, catchy title with an emoji (e.g., 🏆 Championship Prediction)"),
            content: z.string().describe("The detailed 2-3 sentence technical insight."),
            confidence: z.number().min(0).max(100).describe("A confidence score out of 100"),
          })
        ).length(5)
      }),
      prompt: "Generate the latest race insights.",
    });

    return new Response(JSON.stringify(result.object), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating insights:", error);
    return new Response(JSON.stringify({ error: "Failed to generate insights" }), { status: 500 });
  }
}
