export const runtime = "edge";

export async function GET(req: Request) {
  let timerId: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection success
      controller.enqueue(
        `data: ${JSON.stringify({ type: "CONNECTION_ESTABLISHED", status: "LIVE" })}\n\n`
      );

      // Simulate a major event shortly after connecting
      setTimeout(() => {
        controller.enqueue(
          `data: ${JSON.stringify({
            type: "RACE_CONTROL_MESSAGE",
            flag: "YELLOW",
            message: "Incident in Sector 2 - Debris on track",
            timestamp: new Date().toISOString()
          })}\n\n`
        );
      }, 5000);

      setTimeout(() => {
        controller.enqueue(
          `data: ${JSON.stringify({
            type: "RACE_CONTROL_MESSAGE",
            flag: "GREEN",
            message: "Track Clear",
            timestamp: new Date().toISOString()
          })}\n\n`
        );
      }, 15000);

      // Send telemetry updates every 3 seconds
      let lap = 12;
      timerId = setInterval(() => {
        lap++;
        controller.enqueue(
          `data: ${JSON.stringify({
            type: "TELEMETRY_UPDATE",
            lap: lap,
            leaderPace: "1:32.450",
            timestamp: new Date().toISOString()
          })}\n\n`
        );
      }, 3000);
    },
    cancel() {
      clearInterval(timerId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
