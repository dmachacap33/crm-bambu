import { makeWASocket, useMultiFileAuthState } from '@adiwajshing/baileys';
import { WebSocketServer } from 'ws';

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
  const sock = makeWASocket({ auth: state });
  sock.ev.on('creds.update', saveCreds);

  const wss = new WebSocketServer({ port: 4000 });
  wss.on('connection', ws => {
    ws.on('message', async data => {
      try {
        const msg = JSON.parse(data.toString());
        await sock.sendMessage(msg.to, { text: msg.text });
      } catch (err) {
        console.error('Error enviando mensaje', err);
      }
    });
  });

  sock.ev.on('messages.upsert', ({ messages }) => {
    for (const m of messages) {
      const text = m.message?.conversation;
      if (text) {
        wss.clients.forEach(client => {
          client.send(JSON.stringify({ from: m.key.remoteJid, text }));
        });
      }
    }
  });
}

start().catch(err => console.error('Fallo del servidor', err));
