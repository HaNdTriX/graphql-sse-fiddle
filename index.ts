import { createHandler } from "graphql-sse/lib/use/fetch"; // bun install graphql-sse
import { schema } from "./graphql";
import serveStatic from "serve-static-bun";
import { watch } from "fs";

// Create the GraphQL over SSE native fetch handler
const handler = createHandler({ schema });

async function buildClient(watchFiles: boolean) {
  console.log("Building client.ts");
  await Bun.build({
    entrypoints: ["./client.ts"],
    outdir: "./public",
  });
  if (watchFiles) {
    watch(import.meta.dir + "/client.ts", () => buildClient(false));
  }
}

await buildClient(true);

// Serve on `/graphql/stream` using the handler
const server = Bun.serve({
  port: 4000, // Listening to port 4000
  async fetch(req) {
    const uri = new URL(req.url);

    if (uri.pathname.endsWith("/graphql/stream")) {
      return handler(req);
    }

    if (uri.pathname === "/") {
      return new Response(await Bun.file("./index.html").bytes(), {
        headers: {
          "Content-Type": "text/html",
        },
      });
    }

    // Serve all files in the public directory
    return serveStatic("public")(req);
  },
});

console.log(`Listening on http://localhost:${server.port} ...`);
