import { app } from "./app";
import { env } from "./env";

app
  .listen({
    port: env.SERVER_PORT,
    host: env.SERVER_HOST,
  })
  .then(() => {
    console.log("Pacinho server is running! 🚀");
  });
