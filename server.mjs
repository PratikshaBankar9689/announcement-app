import express from "express";
import { createRequestHandler } from "@react-router/node";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.static("build/client"));

app.all("*", createRequestHandler({
  build: () => import("./build/server/index.js"),
}));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on 0.0.0.0:${PORT}`);
});