export interface Command {
    name: string; // Nome do comando
    description: string; // Descrição do comando
    usage?: string; // Como usar o comando (opcional)
    handle: (context: CommandContext) => Promise<void>; // Lógica do comando
}

export interface CommandContext {
    sendReply: (message: string) => Promise<void>; // Envia resposta ao chat
    sendReact: (emoji: string) => Promise<void>; // Reage com emoji
    args: string[]; // Argumentos fornecidos pelo usuário
    from: string; // ID do usuário que enviou a mensagem
}
