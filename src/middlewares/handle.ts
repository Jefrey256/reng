import { loadCommands } from "../loader";
import { extractMessage } from "./messages";

const handleCommands = (riko: any) => {
  const commands = loadCommands();
  console.log("Comandos carregados:", commands); // Verifique se os comandos estão sendo carregados corretamente

  riko.ev.on("messages.upsert", async (msg: any) => {
    const { isCommand, commandName, args, from, reng } = extractMessage(msg.messages[0]);

    if (!reng || !reng.key) {
      console.error("Mensagem inválida ou mal formatada");
      return;
    }

    if (isCommand) {
      const command = commands.get(commandName);
      if (!command) {
        await riko.sendMessage(from, { text: `Comando não encontrado: ${commandName}` }, { quoted: reng });
        return;
      }

      try {
        await command.handle({
          sendReply: async (message) => {
            await riko.sendMessage(from, { text: message }, { quoted: reng });
          },
          sendReact: async (emoji) => {
            await riko.sendMessage(from, { react: { text: emoji, key: reng.key } });
          },
          args,
          from,
        });
      } catch (error) {
        console.error("Erro ao executar o comando:", error);
        await riko.sendMessage(from, { text: `Erro ao executar o comando: ${commandName}` }, { quoted: reng });
      }
    }
  });
};

export default handleCommands;
