import express from 'express';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { loadDB, saveDB } from './db.js';
import { startWhatsApp, onWhatsAppEvent, getStatus, getQR, sendWhatsAppMessage } from './whatsapp.js';
import { askAI } from './ai.js';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new IOServer(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json({ limit: '2mb' }));
app.use(express.static(path.resolve('public')));

// Init DB & stages (if empty)
function ensureStages() {
  const db = loadDB();
  if (!db.stages || db.stages.length === 0) {
    try {
      const sample = JSON.parse(fs.readFileSync(path.resolve('server/config.sample.json'), 'utf-8'));
      db.stages = sample.stages;
      saveDB(db);
    } catch {}
  }
}
ensureStages();

// Sockets
onWhatsAppEvent(async (event, payload) => {
  if (event === 'qr') {
    const png = await QRCode.toDataURL(payload.qr);
    io.emit('wa:qr', { dataUrl: png });
  } else if (event === 'ready') {
    io.emit('wa:ready', {});
  } else if (event === 'disconnected') {
    io.emit('wa:disconnected', payload);
  } else if (event === 'message') {
    // Upsert lead on inbound message
    const db = loadDB();
    let lead = db.leads.find(l => l.whatsappJid === payload.remoteJid);
    if (!lead) {
      // Create in Leads stage
      lead = {
        id: uuidv4(),
        stageId: 'leads',
        name: payload.pushName || 'Sin nombre',
        phone: payload.remoteJid.replace(/@s.whatsapp.net$/, ''),
        whatsappJid: payload.remoteJid,
        ubicacion: '',
        fechaEntrega: '',
        recarga: '',
        notas: '',
        distribuidorTipo: '',
        distribuidorId: '',
        chat: { internal: [], user: [] }
      };
      db.leads.push(lead);
      saveDB(db);
      io.emit('lead:new', lead);
    }
    // Append message preview
    lead.chat.user.push({ from: 'cliente', text: payload.body, at: Date.now() });
    saveDB(db);
    io.emit('lead:update', lead);
  }
});

// REST endpoints
app.get('/api/pipeline', (req,res) => {
  const db = loadDB();
  res.json({ stages: db.stages, leads: db.leads });
});

app.post('/api/leads', (req,res) => {
  const db = loadDB();
  const lead = { id: uuidv4(), chat: {internal:[], user:[]}, ...req.body };
  db.leads.push(lead);
  saveDB(db);
  io.emit('lead:new', lead);
  res.json(lead);
});

app.put('/api/leads/:id', (req,res) => {
  const db = loadDB();
  const idx = db.leads.findIndex(l => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  db.leads[idx] = { ...db.leads[idx], ...req.body };
  saveDB(db);
  io.emit('lead:update', db.leads[idx]);
  res.json(db.leads[idx]);
});

app.post('/api/leads/:id/move', (req,res) => {
  const { stageId } = req.body;
  const db = loadDB();
  const lead = db.leads.find(l => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'not found' });
  lead.stageId = stageId;
  saveDB(db);
  io.emit('lead:update', lead);
  res.json(lead);
});

// Internal chat (only DB)
app.post('/api/leads/:id/chat/internal', (req,res) => {
  const { text, from='equipo' } = req.body;
  const db = loadDB();
  const lead = db.leads.find(l => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'not found' });
  lead.chat.internal.push({ from, text, at: Date.now() });
  saveDB(db);
  io.emit('lead:update', lead);
  res.json({ ok: true });
});

// User chat -> WhatsApp (if connected)
app.post('/api/leads/:id/chat/user', async (req,res) => {
  const { text } = req.body;
  const db = loadDB();
  const lead = db.leads.find(l => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'not found' });
  if (!lead.whatsappJid) return res.status(400).json({ error: 'lead sin whatsappJid' });
  try {
    await sendWhatsAppMessage(lead.whatsappJid, text);
    lead.chat.user.push({ from: 'equipo', text, at: Date.now() });
    saveDB(db);
    io.emit('lead:update', lead);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Ask AI bound to stage
app.post('/api/leads/:id/ai', async (req,res) => {
  const { text } = req.body;
  const db = loadDB();
  const lead = db.leads.find(l => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'not found' });
  const answer = await askAI({ message: text, threadId: lead.id, stageId: lead.stageId });
  // Save into internal chat as "IA"
  lead.chat.internal.push({ from: 'IA', text: answer, at: Date.now() });
  saveDB(db);
  io.emit('lead:update', lead);
  res.json({ answer });
});

// WA status & QR
app.get('/api/wa/status', (req,res) => {
  res.json(getStatus());
});
app.post('/api/wa/start', async (req,res) => {
  startWhatsApp();
  res.json({ ok: true });
});
app.get('/api/wa/qr', async (req,res) => {
  const qr = getQR();
  if (!qr) return res.status(404).json({ error: 'no qr' });
  const png = await QRCode.toDataURL(qr);
  res.json({ dataUrl: png });
});

io.on('connection', (socket) => {
  socket.emit('hello', { ok: true });
});

server.listen(PORT, () => {
  console.log(`CRM Agua Bambú escuchando en http://localhost:${PORT}`);
  // lazy start WA
  startWhatsApp();
});
