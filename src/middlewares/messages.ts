
import makeWASocket, { downloadMediaMessage } from "baileys"
import { PREFIX } from "../config"
import fs from "fs";
import { writeFile } from "fs/promises";
import pino, { Logger } from "pino";
import { getMediaContent } from "../exports/dowMedia";
import path from "path";
import { proto } from "baileys";
export const extractMessage = (reng: any) => {
    // Verificação de que reng está definido e possui uma estrutura válida
    if (!reng || !reng.message) {
      console.error("Detalhes da mensagem não encontrados ou estão mal formatados");
      return {
        media: undefined,
        mentions: [],
        fullMessage: "",
        from: "Desconhecido",
        fromUser: "Desconhecido",
        isCommand: false,
        commandName: "",
        args: [],
        userName: "Desconhecido",
         userRole: "membro",
        participant: null,
      };
    }

  
    // Captura todas as possíveis fontes de texto (mensagem simples, legenda ou texto citado)
    const textMessage = reng.message?.conversation || ""; // Mensagem simples
    const extendedTextMessage = reng.message?.extendedTextMessage?.text ||
    reng.message?.extendedTextMessage?.text || ""; // Texto estendido
    const imageTextMessage = reng.message?.imageMessage?.caption || ""; // Legenda da imagem
    const videoTextMessage = reng.message?.videoMessage?.caption || ""; // Legenda do vídeo
    const quotedMessage =
      reng.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation || ""; // Texto citado
  
    // Compõe o fullMessage a partir da prioridade (texto direto > legenda > citado)
    const fullMessage =
      textMessage || extendedTextMessage || imageTextMessage || videoTextMessage || quotedMessage;
  
    // Extrai menções de pessoas mencionadas na mensagem
    const mentions = reng.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
    // Extrai o nome do usuário ou identificador
    const fromUser = reng.key?.participant?.split("@")[0] || reng.key?.remoteJid?.split("@")[0];
      const userName = reng.pushName || fromUser;
    //
    //
    const fromUserAdm = reng.key?.participant 
    ? reng.key?.participant.split('@')[0]  // Se for de um grupo, usa o participant
    : reng.key?.remoteJid.split('@')[0];   // Se for de um canal ou PV, usa o remoteJid

    //
    const groupId = reng.key?.remoteJid || null;
    //
    
    // Extrai o identificador do remetente
    const from = reng.key?.remoteJid || "Remetente desconhecido";
    
    // Extrai o nome de exibição do usuário
    //const userName = reng?.pushName || "Usuário Desconhecido";
    const phoneNumber = reng?.key?.participant?.replace(   
      /:[0-9][0-9]|:[0-9]/g,
      "");
    
    // Verifica se a mensagem é um comando (com base no prefixo)
    const isCommand = fullMessage.startsWith(PREFIX);
  
    // Extrai o nome do comando e argumentos
    const commandName = isCommand ? fullMessage.slice(PREFIX.length).split(" ")[0] : "";
    const args = isCommand ? fullMessage.slice(PREFIX.length).split(" ").slice(1) : [];
    const key = reng.key || null;
    const quotedKey = reng?.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
    //
    const quoted = reng.message?.extendedTextMessage?.contextInfo?.quotedMessage || 
               reng.message?.imageMessage?.contextInfo?.quotedMessage ||
               reng.message?.videoMessage?.contextInfo?.quotedMessage ||
               reng.message?.audioMessage?.contextInfo?.quotedMessage ||
               reng.message?.documentMessage?.contextInfo?.quotedMessage;
               

    //
    //
    const messageContent = reng.message?.extendedTextMessage?.text || 
    reng.message?.text
    //
  
    // Verificação de mídia (direta ou marcada)
    const media =
      reng.message?.imageMessage ||
      reng.message?.videoMessage ||
      reng.message?.audioMessage ||
      reng.message?.stickerMessage ||
      reng.message?.documentMessage ||
      reng.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
      reng.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage ||
      reng.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage ||
      reng.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage ||
      reng.message?.extendedTextMessage?.contextInfo?.quotedMessage?.documentMessage ||

      reng.message?.key?.contextInfo?.quotedMessage||

      undefined;
  
    return {
      reng,
      messageContent,
      key,
      quoted,
      quotedKey,
      media,
      mentions,
      fullMessage,
      from,
      phoneNumber,
      fromUser,
      isCommand,
      commandName,
      args,
      textMessage,
      userName,
      groupId,
      participant: reng.key?.participant || reng.key?.remoteJid,
    };
    console.log(`ola: ${phoneNumber}`)



  };

  
export function setupMessagingServices(riko, from, reng) {
  
    const enviarTexto = async (texto) => {
      try {
        await riko.sendMessage(from, { text: texto }, { quoted: reng });
      } catch (error) {
        console.error('Erro ao enviar texto:', error);
      }
    };
  
    const enviarAudioGravacao = async (arquivo) => {
      try {
        await riko.sendMessage(from, {
          audio: fs.readFileSync(arquivo),
          mimetype: "audio/mp4",
          ptt: true,
        }, { quoted: reng });
      } catch (error) {
        console.error('Erro ao enviar áudio:', error);
      }
    };
  
  
  
  
  const enviarImagem = async (arquivo, text) => {
    try {
      // Verifica se 'arquivo' é uma URL (string que começa com 'http')
      if (typeof arquivo === 'string' && arquivo.startsWith('http')) {
        // Envia a imagem diretamente pela URL
        await riko.sendMessage(from, {
          image: { url: arquivo }, // Envia a imagem pela URL
          caption: text
        }, { quoted: reng });
      } else if (Buffer.isBuffer(arquivo)) {
        // Se 'arquivo' for um Buffer (dados binários da imagem)
        await riko.sendMessage(from, {
          image: arquivo,  // Envia a imagem a partir do Buffer
          caption: text
        }, { quoted: reng });
      } else if (typeof arquivo === 'string') {
        // Se 'arquivo' for um caminho local, lê o arquivo diretamente
        if (fs.existsSync(arquivo)) {
          // Lê o arquivo de imagem como Buffer
          const imageBuffer = fs.readFileSync(arquivo);
  
          // Envia a imagem a partir do Buffer
          await riko.sendMessage(from, {
            image: imageBuffer,  // Envia a imagem a partir do Buffer
            caption: text
          }, { quoted: reng });
        } else {
          console.error('Arquivo não encontrado:', arquivo);
        }
      } else {
        console.error('O arquivo ou URL não é válido:', arquivo);
      }
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
    }
  };
  
    
  
  
    const enviarVideo = async (arquivo, text) => {
      try {
        await riko.sendMessage(from, {
          video: fs.readFileSync(arquivo),
          caption: text,
          mimetype: "video/mp4"
        }, { quoted: reng });
      } catch (error) {
        console.error('Erro ao enviar vídeo:', error);
      }
    };
  
    const enviarDocumento = async (arquivo, text) => {
      try {
        await riko.sendMessage(from, {
          document: fs.readFileSync(arquivo),
          caption: text
        }, { quoted: reng });
      } catch (error) {
        console.error('Erro ao enviar documento:', error);
      }
    };
  
    const enviarSticker = async (arquivo) => {
      try {
        await riko.sendMessage(from, {
          sticker: fs.readFileSync(arquivo)
        }, { quoted: reng });
      } catch (error) {
        console.error('Erro ao enviar sticker:', error);
      }
    };
  
    const enviarLocalizacao = async (latitude, longitude, text) => {
      try {
        await riko.sendMessage(from, {
          location: { latitude, longitude, caption: text }
        }, { quoted: reng });
      } catch (error) {
        console.error('Erro ao enviar localização:', error);
      }
    };
  
    const enviarContato = async (numero, nome) => {
      try {
        await riko.sendMessage(from, {
          contact: {
            phone: numero,
            name: { formattedName: nome }
          }
        }, { quoted: reng });
      } catch (error) {
        console.error('Erro ao enviar contato:', error);
      }
    };
  
    //console.log('from:', from);
    //console.log('reng:', reng);
  
    return {
      enviarTexto,
      enviarAudioGravacao,
      enviarImagem,
      enviarVideo,
      enviarDocumento,
      enviarSticker,
      enviarLocalizacao,
      enviarContato
    };
  }
  
