export const runtime = "edge";

export async function GET(req: Request) {
  let timerId: ReturnType<typeof setInterval>;

  let isClosed = false;
  const timeouts: ReturnType<typeof setTimeout>[] = [];

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: any) => {
        if (!isClosed) {
          try {
            controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
          } catch (e) {
            isClosed = true;
          }
        }
      };

      // Send initial connection success
      send({ type: "CONNECTION_ESTABLISHED", status: "LIVE" });

      // Simulate a major event shortly after connecting
      timeouts.push(setTimeout(() => {
        send({
          type: "RACE_CONTROL_MESSAGE",
          flag: "YELLOW",
          message: "Incident in Sector 2 - Debris on track",
          timestamp: new Date().toISOString()
        });
      }, 5000));

      timeouts.push(setTimeout(() => {
        send({
          type: "RACE_CONTROL_MESSAGE",
          flag: "GREEN",
          message: "Track Clear",
          timestamp: new Date().toISOString()
        });
      }, 15000));

      // Send telemetry updates every 3 seconds
      let lap = 12;
      timerId = setInterval(() => {
        lap++;
        send({
          type: "TELEMETRY_UPDATE",
          lap: lap,
          leaderPace: "1:32.450",
          timestamp: new Date().toISOString()
        });
      }, 3000);
    },
    cancel() {
      isClosed = true;
      clearInterval(timerId);
      timeouts.forEach(clearTimeout);
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
