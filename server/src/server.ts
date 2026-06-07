import Fastify from "fastify";
import { env } from "./infrastructure/env";
import { db } from "./infrastructure/db/client";
import { urls } from "./infrastructure/db/schemas/urls";

const app = Fastify({ logger: true });

app.get("/health", async () => ({ status: "ok" }));

app.get("/urls", async () => {
  const allUrls = await db.select().from(urls);
  return { data: allUrls };
});

const port = env.PORT;

try {
  await app.listen({ port, host: "0.0.0.0" });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
