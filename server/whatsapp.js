import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';

let sock = null;
let connectionState = { connected: false, qr: null };

const subscribers = new Set(); // functions to receive events

export function onWhatsAppEvent(fn){
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}
function emit(event, payload){
  for (const fn of subscribers) try { fn(event, payload); } catch {}
}

export async function startWhatsApp(){
  const { state, saveCreds } = await useMultiFileAuthState('tmp/baileys_auth');
  const { version } = await fetchLatestBaileysVersion();
  sock = makeWASocket({
    version,
    printQRInTerminal: false,
    auth: state,
    logger: pino({ level: 'silent' })
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      connectionState.qr = qr;
      emit('qr', { qr });
    }
    if (connection === 'open') {
      connectionState.connected = true;
      connectionState.qr = null;
      emit('ready', {});
    } else if (connection === 'close') {
      connectionState.connected = false;
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) {
        // auto-reconnect
        setTimeout(startWhatsApp, 2000);
      }
      emit('disconnected', { reason });
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    const up = m.messages && m.messages[0];
    if (!up || up.key.fromMe) return;
    const remoteJid = up.key.remoteJid;
    const pushName = up.pushName || '';
    const body =
      up.message?.conversation ||
      up.message?.extendedTextMessage?.text ||
      up.message?.imageMessage?.caption ||
      up.message?.videoMessage?.caption ||
      '';

    emit('message', { remoteJid, pushName, body, raw: up });
  });

  sock.ev.on('creds.update', saveCreds);
}

export function getStatus(){
  return { connected: connectionState.connected, hasQR: !!connectionState.qr };
}
export function getQR(){
  return connectionState.qr;
}
export async function sendWhatsAppMessage(jid, text){
  if (!sock) throw new Error('WA not initialized');
  await sock.sendMessage(jid, { text });
}
