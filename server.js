import * as http from "http";
import { broadcastDevReady } from "@react-router/node";

const PORT = process.env.PORT || 10000;

async function main() {
  const build = await import("./build/server/index.js");
  
  const { default: app } = await import("./build/server/index.js");

  const server = http.createServer(async (req, res) => {
    try {
      const { fetch } = await import("./build/server/index.js");
      // Forward to react-router handler
      app(req, res);
    } catch (e) {
      console.error(e);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server listening on 0.0.0.0:${PORT}`);
  });
}

main().catch(console.error);