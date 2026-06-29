import express from "express";
import { createRequestListener } from "@react-router/node";

const PORT = process.env.PORT || 10000;

const app = express();

app.use(express.static("build/client"));

const handler = await createRequestListener({
  build: () => import("./build/server/index.js"),
});

app.use(handler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on 0.0.0.0:${PORT}`);
});