import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function localAskApi(env) {
  return {
    name: "local-ask-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/ask")) return next();
        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.end();
          return;
        }
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        try {
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");

          // Mirror Vercel serverless env for local asks
          process.env.GROQ_API_KEY =
            process.env.GROQ_API_KEY || env.GROQ_API_KEY || "";
          process.env.OPENAI_API_KEY =
            process.env.OPENAI_API_KEY || env.OPENAI_API_KEY || "";

          const { default: handler } = await server.ssrLoadModule("/api/ask.js");
          const fakeRes = {
            statusCode: 200,
            headers: {},
            setHeader(k, v) {
              this.headers[k] = v;
            },
            status(code) {
              this.statusCode = code;
              return this;
            },
            json(payload) {
              res.statusCode = this.statusCode;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(payload));
              return this;
            },
            end() {
              res.statusCode = this.statusCode;
              res.end();
              return this;
            },
          };

          await handler({ method: "POST", body }, fakeRes);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              error: err?.message || "Local ask API failed.",
            })
          );
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), localAskApi(env)],
  };
});
