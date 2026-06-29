import { createRequestHandler } from "@react-router/node";
import * as build from "./build/server/index.js";
import http from "http";

const handler = createRequestHandler(build);

const server = http.createServer((req, res) => {
  handler(req, res);
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on 0.0.0.0:${PORT}`);
});