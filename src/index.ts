import { reng } from "./connection";
import handleCommands from "./middlewares/handle";

async function main() {
  const riko = await reng(); // Inicializa o bot
  handleCommands(riko); // Passa o bot para o middleware de comandos
}

main();
