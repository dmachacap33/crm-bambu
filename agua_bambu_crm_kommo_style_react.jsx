import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

// ICONS (compact): single <Icon name="..."/> instead of many components
// Reduces canvas length; no external fetches.
type IconName =
  | "calendar" | "phone" | "map-pin" | "send" | "settings" | "db" | "download" | "upload"
  | "bot" | "users" | "plus" | "filter" | "msg" | "link" | "loader" | "arrow-right"
  | "shield" | "check" | "gauge" | "list";
const ICONS: Record<IconName, React.ReactNode> = {
  calendar: (<><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>),
  phone: (<path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3 6.07 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.33 1.7.62 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.14a2 2 0 0 1 2.11-.45c.8.29 1.64.5 2.5.62A2 2 0 0 1 22 16.92z"/>),
  "map-pin": (<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></>),
  send: (<><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>),
  settings: (<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .39 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-1.88-.39c-.5.2-1.03.31-1.58.31V21a2 2 0 1 1-4 0v-.09a3.6 3.6 0 0 0-3.4 1.06 2 2 0 1 1-2.83-2.83 3.6 3.6 0 0 0-1.06-3.4H3a2 2 0 1 1 0-4h.09a3.6 3.6 0 0 0 1.06-3.4A2 2 0 1 1 7.04 4.3 3.6 3.6 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a3.6 3.6 0 0 0 2.96 1.21A2 2 0 1 1 19.86 7a3.6 3.6 0 0 0 1.21 2.96c.38.43.6.98.6 1.54s-.22 1.12-.6 1.5z"/></>),
  db: (<><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></>),
  download: (<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>),
  upload: (<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>),
  bot: (<><rect x="4" y="8" width="16" height="10" rx="2"/><path d="M12 2v4"/><circle cx="12" cy="6" r="1"/><circle cx="9" cy="13" r="1"/><circle cx="15" cy="13" r="1"/></>),
  users: (<><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>),
  plus: (<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>),
  filter: (<polygon points="22 3 2 3 10 12 10 19 14 21 14 12 22 3"/>),
  msg: (<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>),
  link: (<><path d="M15 7h3a5 5 0 0 1 0 10h-3"/><path d="M9 17H6a5 5 0 0 1 0-10h3"/><line x1="8" y1="12" x2="16" y2="12"/></>),
  loader: (<path d="M21 12a9 9 0 1 1-9-9"/>),
  "arrow-right": (<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>),
  shield: (<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>),
  check: (<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>),
  gauge: (<><path d="M20.49 15a8 8 0 1 0-16.98 0"/><path d="M12 12v4"/><path d="M7 12l-2 3"/><path d="M17 12l2 3"/></>),
  list: (<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></>),
};
function Icon({ name, className }: { name: IconName; className?: string }){
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>{ICONS[name]}</svg>
  );
}

const DEFAULT_STAGES = [
  { id: "leads", name: "Leads", color: "bg-sky-100", aiSystemPrompt: "Capta nombre, ubicación y celular. Ofrece primera recarga de cortesía si aplica." },
  { id: "contactado", name: "Contactado", color: "bg-yellow-100", aiSystemPrompt: "Confirma dirección, fecha/horario, pago y si requiere dispenser." },
  { id: "cotizacion", name: "Cotización", color: "bg-violet-100", aiSystemPrompt: "Cotiza claro en Bs. Incluye delivery y condiciones." },
  { id: "en_camino", name: "En camino", color: "bg-emerald-100", aiSystemPrompt: "Coordina ruta con distribuidor y hora estimada." },
  { id: "entregado", name: "Entregado", color: "bg-green-100", aiSystemPrompt: "Agradece, confirma conformidad y propone recarga recurrente." },
  { id: "recurrente", name: "Recurrente", color: "bg-rose-100", aiSystemPrompt: "Gestiona calendario de recargas y recordatorios." },
] as const;

type StageId = typeof DEFAULT_STAGES[number]["id"];

type Lead = {
  id: string; name: string; phone: string; photoUrl?: string;
  ubicacion?: string; fechaEntrega?: string; recarga?: string; notes?: string;
  stageId: StageId; distributorId?: string; distributorType?: string;
  history: Array<{ ts:number; type:string; text:string; who:"equipo"|"cliente"|"ia"|"sistema" }>;
};

type Distributor = { id: string; name: string; phone: string; type: string; zone?: string };

type DB = { leads: Lead[]; distributors: Distributor[] };

const DISTRIBUTOR_TYPES = [
  { id: "propio", label: "Propio" },
  { id: "aliado", label: "Aliado" },
  { id: "tercero", label: "Tercero / App" },
] as const;

const SAMPLE_DISTRIBUTORS: Distributor[] = [
  { id: "d1", name: "Carlos Pérez", phone: "+59170000001", type: "propio", zone: "Centro" },
  { id: "d2", name: "María Gómez", phone: "+59170000002", type: "propio", zone: "Equipetrol" },
  { id: "d3", name: "Rappi #SCZ-14", phone: "+59170000003", type: "tercero", zone: "4to anillo" },
];

const CONFIG = {
  BUILDERBOT_BASE_URL: (window as any).ENV?.BUILDERBOT_BASE_URL || "http://localhost:3008",
  BUILDERBOT_API_KEY: (window as any).ENV?.BUILDERBOT_API_KEY || "",
  ASSISTANT_GATEWAY: (window as any).ENV?.ASSISTANT_GATEWAY || "http://localhost:3008",
};

const uid = () => Math.random().toString(36).slice(2);
const todayISO = () => new Date().toISOString().slice(0,10);

const loadDB = (): DB => {
  try {
    const raw = localStorage.getItem("agua_bambu_crm_db");
    if (!raw) return { leads: [], distributors: SAMPLE_DISTRIBUTORS };
    const parsed = JSON.parse(raw);
    return { leads: parsed.leads||[], distributors: parsed.distributors||SAMPLE_DISTRIBUTORS };
  } catch { return { leads: [], distributors: SAMPLE_DISTRIBUTORS }; }
};
const saveDB = (db: DB) => localStorage.setItem("agua_bambu_crm_db", JSON.stringify(db));

async function healthCheck(){
  try { const r = await fetch(`${CONFIG.BUILDERBOT_BASE_URL}/api/whatsapp/health`); return { ok: r.ok, info: await r.json().catch(()=>({})) }; }
  catch { return { ok:false }; }
}
async function sendWhatsApp(to:string, text:string, meta?:any){
  const r = await fetch(`${CONFIG.BUILDERBOT_BASE_URL}/api/whatsapp/send`, {
    method: "POST", headers: { "Content-Type": "application/json", ...(CONFIG.BUILDERBOT_API_KEY? { Authorization:`Bearer ${CONFIG.BUILDERBOT_API_KEY}` }: {}) }, body: JSON.stringify({ to, text, meta })
  });
  if (!r.ok) throw new Error("No se pudo enviar por WhatsApp");
  return r.json().catch(()=>({}));
}
async function aiComplete(stageId:StageId, systemPrompt:string, messages:Array<{role:"user"|"assistant";content:string}>, lead:Lead){
  const r = await fetch(`${CONFIG.ASSISTANT_GATEWAY}/api/assistant/complete`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ stageId, systemPrompt, messages, lead }) });
  if(!r.ok) throw new Error("IA no disponible");
  return (await r.json().catch(()=>({})))?.content || "";
}

function Avatar({ name, src, size=36 }: { name:string; src?:string; size?:number }){
  const initials = (name||"?").split(" ").map(s=>s[0]).slice(0,2).join("").toUpperCase();
  return (
    <div className="relative" style={{ width:size, height:size }}>
      {src? <img src={src} alt={name} className="w-full h-full rounded-full object-cover border"/> :
        <div className="w-full h-full rounded-full grid place-items-center text-white font-semibold" style={{background:"linear-gradient(135deg,#22c55e,#06b6d4)"}}>{initials}</div>}
    </div>
  );
}

export default function CRMKommoStyle(){
  const [db, setDb] = useState<DB>(()=> loadDB());
  const [filter, setFilter] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState<boolean|null>(null);
  const [listen, setListen] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard'|'pipeline'|'leads'|'chats'|'calendar'|'lists'>("pipeline");
  const [openChatLeadId, setOpenChatLeadId] = useState<string|null>(null);
  const [showDistributorModal, setShowDistributorModal] = useState<{open:boolean; leadId?:string}>({ open:false });
  const fileRef = useRef<HTMLInputElement|null>(null);

  useEffect(()=>{ saveDB(db); }, [db]);

  useEffect(()=>{
    if(!listen) return; const t = setInterval(async()=>{
      try{ const r = await fetch(`${CONFIG.BUILDERBOT_BASE_URL}/api/whatsapp/events/latest`); if(r.ok){ const ev = await r.json(); if(ev?.type==='new_contact' && ev.phone){ setDb(prev=>{ if(prev.leads.some(l=>l.phone===ev.phone)) return prev; const lead: Lead = { id: uid(), name: ev.name||'Nuevo contacto', phone: ev.phone, ubicacion: ev.location||'', stageId:'leads', history:[{ts:Date.now(), type:'evento', text:'Importado desde WhatsApp', who:'sistema'}] } as Lead; return { ...prev, leads:[lead, ...prev.leads] }; }); } } } catch{} }, 4000); return ()=> clearInterval(t);
  }, [listen]);

  const moveLead = (leadId:string, toStage:StageId)=> setDb(prev=> ({ ...prev, leads: prev.leads.map(l=> l.id===leadId? { ...l, stageId: toStage, history:[...l.history, { ts:Date.now(), type:'mov', text:`Movido a ${toStage}`, who:'sistema'}] } : l) }));
  const updateLead = (leadId:string, patch:Partial<Lead>)=> setDb(prev=> ({ ...prev, leads: prev.leads.map(l=> l.id===leadId? { ...l, ...patch } : l) }));
  const assignDistributor = (leadId:string, distributorId:string)=> { const d = db.distributors.find(x=> x.id===distributorId); if(!d) return; updateLead(leadId, { distributorId: d.id, distributorType: d.type }); };
  const addLead = (preset?:Partial<Lead>)=> setDb(prev=> ({ ...prev, leads: [ { id: uid(), name: preset?.name||'Lead sin nombre', phone: preset?.phone||'', photoUrl: preset?.photoUrl, ubicacion: preset?.ubicacion||'', recarga: preset?.recarga||'20L', fechaEntrega: preset?.fechaEntrega||todayISO(), stageId:'leads', history:[{ ts:Date.now(), type:'creacion', text:'Lead creado', who:'sistema' }] }, ...prev.leads ] }));
  const exportJSON = ()=> { const blob = new Blob([JSON.stringify(db,null,2)], {type:'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=`agua-bambu-crm-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url); };
  const importJSON = (e:React.ChangeEvent<HTMLInputElement>)=> { const f=e.target.files?.[0]; if(!f) return; const rd=new FileReader(); rd.onload=()=>{ try{ setDb(JSON.parse(String(rd.result))); }catch{ alert('JSON inválido'); } }; rd.readAsText(f); };

  const filteredLeads = useMemo(()=>{ const f=filter.trim().toLowerCase(); if(!f) return db.leads; return db.leads.filter(l=> [l.name,l.phone,l.ubicacion,l.recarga].filter(Boolean).some(v=> String(v).toLowerCase().includes(f))); }, [db.leads, filter]);
  const stages = DEFAULT_STAGES; // fixed list
  const selectedLead = useMemo(()=> db.leads.find(l=> l.id===openChatLeadId)||null, [db.leads, openChatLeadId]);

  async function onConnect(){ setConnecting(true); const h = await healthCheck(); setConnected(h.ok); setConnecting(false); }

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800">
      <div className="flex">
        <SidebarNav active={activeView} onChange={setActiveView} />
        <div className="flex-1 min-h-screen">
          <TopBar onAddLead={()=> addLead()} onConnect={onConnect} connecting={connecting} connected={connected} listen={listen} setListen={setListen} exportJSON={exportJSON} onOpenImport={()=> fileRef.current?.click()} />
          <div className="px-4 md:px-8 py-4">
            {activeView==='pipeline' && (<>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-full max-w-md">
                  <Input placeholder="Buscar por nombre, teléfono, ubicación, recarga…" value={filter} onChange={(e)=> setFilter(e.target.value)} />
                  <Icon name="filter" className="absolute right-3 top-2.5 h-5 w-5 opacity-60"/>
                </div>
                <Button variant="secondary" onClick={()=> addLead()} className="gap-2"><Icon name="plus" className="h-4 w-4"/> Nuevo lead</Button>
                <input type="file" ref={fileRef} className="hidden" accept="application/json" onChange={importJSON} />
              </div>
              <PipelineBoard stages={stages} leads={filteredLeads} distributors={db.distributors}
                onMove={moveLead} onUpdate={updateLead}
                onOpenDistributor={(leadId)=> setShowDistributorModal({ open:true, leadId })}
                onOpenLead={(id)=> setOpenChatLeadId(id)} />
              <DistributorsPanel distributors={db.distributors} onAdd={(d)=> setDb(prev=> ({...prev, distributors:[...prev.distributors, d]}))} />
            </>)}
            {activeView==='dashboard' && (<DashboardView stages={stages} leads={db.leads} />)}
            {activeView==='leads' && (<LeadsTable leads={filteredLeads} onOpen={(id)=> { setOpenChatLeadId(id); setActiveView('pipeline'); }} />)}
            {activeView==='chats' && (<ChatsInbox leads={db.leads} onOpen={(id)=> { setOpenChatLeadId(id); setActiveView('pipeline'); }} />)}
            {activeView==='calendar' && (<div className="text-sm text-slate-500">Calendario en construcción.</div>)}
            {activeView==='lists' && (<div className="text-sm text-slate-500">Listas y segmentos próximamente.</div>)}
          </div>
        </div>
      </div>

      <Dialog open={showDistributorModal.open} onOpenChange={(open)=> setShowDistributorModal({ open })}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Asignar distribuidor</DialogTitle></DialogHeader>
          {showDistributorModal.leadId && (
            <AssignDistributor db={db} leadId={showDistributorModal.leadId} onAssign={(id)=> { assignDistributor(showDistributorModal.leadId!, id); setShowDistributorModal({ open:false }); }} />
          )}
          <DialogFooter><Button variant="secondary" onClick={()=> setShowDistributorModal({ open:false })}>Cerrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedLead && (
        <ChatDrawer lead={selectedLead} stage={stages.find(s=> s.id===selectedLead.stageId)!} distributors={db.distributors}
          onClose={()=> setOpenChatLeadId(null)} onUpdate={(p)=> updateLead(selectedLead.id, p)} onMove={(to)=> moveLead(selectedLead.id, to)} onOpenDistributor={()=> setShowDistributorModal({ open:true, leadId: selectedLead.id })} />
      )}
    </div>
  );
}

function SidebarNav({ active, onChange }:{ active:string; onChange:(v:any)=>void }){
  const Item = ({ id, label, icon }: { id:any; label:string; icon: React.ReactNode }) => (
    <button onClick={()=> onChange(id)} className={`flex flex-col items-center gap-1 p-3 rounded-xl text-xs ${active===id? 'text-emerald-600 bg-white shadow' : 'text-slate-400 hover:text-slate-700'}`}>
      {icon}
      <span className="hidden md:block">{label}</span>
    </button>
  );
  return (
    <div className="w-16 md:w-24 bg-slate-100 border-r min-h-screen flex flex-col items-center py-4 gap-2">
      <div className="mb-4"><Avatar name="Agente" size={42} /></div>
      <Item id="dashboard" label="Panel" icon={<Icon name="gauge" className="h-6 w-6"/>} />
      <Item id="pipeline" label="Leads" icon={<Icon name="users" className="h-6 w-6"/>} />
      <Item id="chats" label="Chats" icon={<Icon name="msg" className="h-6 w-6"/>} />
      <Item id="calendar" label="Calendario" icon={<Icon name="calendar" className="h-6 w-6"/>} />
      <Item id="leads" label="Listas" icon={<Icon name="list" className="h-6 w-6"/>} />
    </div>
  );
}

function TopBar(props: { onAddLead: ()=>void; onConnect: ()=>void; connecting:boolean; connected:boolean|null; listen:boolean; setListen:(v:boolean)=>void; exportJSON:()=>void; onOpenImport:()=>void; }){
  const { onAddLead, onConnect, connecting, connected, listen, setListen, exportJSON, onOpenImport } = props;
  return (
    <div className="w-full bg-white border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl">Agua Bambú</div>
          <span className="text-sm text-slate-500">CRM Conversacional</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onAddLead} className="gap-2"><Icon name="plus" className="h-4 w-4"/> Lead</Button>
          <Button size="sm" variant="outline" onClick={exportJSON} className="gap-2"><Icon name="download" className="h-4 w-4"/> Exportar</Button>
          <Button size="sm" variant="outline" onClick={onOpenImport} className="gap-2"><Icon name="upload" className="h-4 w-4"/> Importar</Button>
          <div className="h-6 w-px bg-slate-200 mx-1"/>
          <Button size="sm" variant="outline" onClick={onConnect} disabled={connecting} className="gap-2">
            {connecting ? <Icon name="loader" className="h-4 w-4 animate-spin"/> : <Icon name="link" className="h-4 w-4"/>}
            {connected===null? 'Probar conexión' : connected? 'Conectado' : 'Sin conexión'}
          </Button>
          <div className="flex items-center gap-2 pl-2">
            <Switch id="listen" checked={listen} onCheckedChange={setListen} />
            <label htmlFor="listen" className="text-sm">Escuchar WhatsApp</label>
          </div>
        </div>
      </div>
    </div>
  );
}

function PipelineBoard(props:{ stages: typeof DEFAULT_STAGES; leads: Lead[]; distributors: Distributor[]; onMove:(leadId:string,toStage:StageId)=>void; onUpdate:(leadId:string,patch:Partial<Lead>)=>void; onOpenDistributor:(leadId:string)=>void; onOpenLead:(id:string)=>void; }){
  const { stages, leads, distributors, onMove, onUpdate, onOpenDistributor, onOpenLead } = props;
  const byStage = useMemo(()=>{ const m:Record<string,Lead[]> = {}; for(const s of stages) m[s.id]=[]; for(const l of leads) (m[l.stageId] ||= []).push(l); return m; }, [stages, leads]);
  const dragLeadId = useRef<string|null>(null);
  return (
    <div className="grid md:grid-cols-3 xl:grid-cols-6 gap-4">
      {stages.map(s=> (
        <div key={s.id} className="flex flex-col">
          <div className={`flex items-center justify-between mb-2 rounded-xl px-3 py-2 ${s.color}`}><div className="font-semibold">{s.name}</div><Badge variant="secondary">{byStage[s.id]?.length||0}</Badge></div>
          <div onDragOver={(e)=> { e.preventDefault(); e.dataTransfer.dropEffect='move'; }} onDrop={(e)=> { e.preventDefault(); const id=dragLeadId.current; dragLeadId.current=null; if(id) onMove(id, s.id); }} className="min-h-[60vh] rounded-2xl border bg-gradient-to-b from-white to-slate-50 p-2 space-y-3">
            {(byStage[s.id]||[]).map(l=> (
              <div key={l.id} draggable onDragStart={(e)=> { dragLeadId.current=l.id; e.dataTransfer.effectAllowed='move'; }} className="cursor-grab active:cursor-grabbing">
                <LeadCard lead={l} stage={s} distributors={distributors} onUpdate={(p)=> onUpdate(l.id, p)} onOpenDistributor={()=> onOpenDistributor(l.id)} onOpen={()=> onOpenLead(l.id)} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function LeadCard(props:{ lead:Lead; stage:{ id:StageId; name:string; aiSystemPrompt:string }; distributors:Distributor[]; onUpdate:(patch:Partial<Lead>)=>void; onOpenDistributor:()=>void; onOpen:()=>void; }){
  const { lead, stage, distributors, onUpdate, onOpenDistributor, onOpen } = props;
  const [tab, setTab] = useState<"equipo"|"cliente">("equipo");
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const distributor = useMemo(()=> distributors.find(d=> d.id===lead.distributorId), [distributors, lead.distributorId]);

  async function handleSend(){
    if(!msg.trim()) return; setSending(true);
    try{
      if(tab==='equipo'){ if(!distributor?.phone) throw new Error('Asigna un distribuidor con teléfono'); await sendWhatsApp(distributor.phone, msg, { leadId: lead.id, private:true }); onUpdate({ history:[...lead.history, { ts:Date.now(), type:'msg_equipo', text:msg, who:'equipo' }] }); }
      else { if(!lead.phone) throw new Error('Agrega el teléfono del cliente'); await sendWhatsApp(lead.phone, msg, { leadId: lead.id, stageId: stage.id }); onUpdate({ history:[...lead.history, { ts:Date.now(), type:'msg_cliente', text:msg, who:'equipo' }] }); }
      setMsg('');
    }catch(e:any){ alert(e?.message||'Error al enviar'); } finally{ setSending(false); }
  }
  async function handleSuggest(){ setSuggesting(true); try{ const content = await aiComplete(stage.id, stage.aiSystemPrompt, [ { role:'user', content:`Contexto del lead: ${JSON.stringify({ name: lead.name, phone: lead.phone, ubicacion: lead.ubicacion, recarga: lead.recarga, fechaEntrega: lead.fechaEntrega })}` } ], lead); setMsg(p=> (p? p+"\n" : "")+content); } catch(e:any){ alert(e?.message||'IA no disponible'); } finally{ setSuggesting(false); } }

  return (
    <Card onClick={onOpen} className="rounded-2xl border-slate-200 shadow hover:shadow-md transition group overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 px-3 py-2 flex items-center gap-2">
          <Avatar name={lead.name} src={lead.photoUrl} size={34} />
          <div className="font-semibold text-slate-900 truncate">{lead.name}</div>
          <div className="ml-auto text-xs text-slate-500 flex items-center gap-1"><Icon name="calendar" className="h-4 w-4"/>{lead.fechaEntrega||todayISO()}</div>
        </div>
        <div className="p-3">
          <div className="text-sm flex flex-wrap gap-x-4 gap-y-1 text-slate-600">
            <span className="inline-flex items-center gap-1"><Icon name="phone" className="h-4 w-4"/>{lead.phone||'—'}</span>
            <span className="inline-flex items-center gap-1"><Icon name="map-pin" className="h-4 w-4"/>{lead.ubicacion||'Ubicación'}</span>
            <span className="inline-flex items-center gap-1"><Icon name="shield" className="h-4 w-4"/>Recarga: {lead.recarga||'—'}</span>
          </div>
          <div className="mt-2 flex items-center gap-2">{lead.distributorId? <Badge className="bg-emerald-600">Asignado</Badge> : <Badge variant="secondary">Sin distribuidor</Badge>}{lead.notes? <Badge variant="secondary">Notas</Badge>: null}</div>
          <div className="mt-3" onClick={(e)=> e.stopPropagation()}>
            <Tabs value={tab} onValueChange={(v)=> setTab(v as any)}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="equipo" className="flex items-center gap-2"><Icon name="msg" className="h-4 w-4"/> Equipo</TabsTrigger>
                <TabsTrigger value="cliente" className="flex items-center gap-2"><Icon name="bot" className="h-4 w-4"/> Cliente</TabsTrigger>
              </TabsList>
              <TabsContent value="equipo" className="mt-2"><ChatBox value={msg} onChange={setMsg} onSuggest={handleSuggest} onSend={handleSend} sending={sending} suggesting={suggesting} stage={stage} /><div className="mt-2 text-xs text-slate-500">Toca la tarjeta para abrir la conversación completa.</div></TabsContent>
              <TabsContent value="cliente" className="mt-2"><ChatBox value={msg} onChange={setMsg} onSuggest={handleSuggest} onSend={handleSend} sending={sending} suggesting={suggesting} stage={stage} /></TabsContent>
            </Tabs>
          </div>
          <div className="mt-2 flex items-center gap-2"><Button size="sm" variant="outline" onClick={(e)=> { e.stopPropagation(); onOpenDistributor(); }} className="gap-2"><Icon name="users" className="h-4 w-4"/> Distribuidor</Button><InlineEdit lead={lead} onUpdate={(p)=> onUpdate(p)} /></div>
        </div>
      </CardContent>
    </Card>
  );
}

function InlineEdit({ lead, onUpdate }:{ lead:Lead; onUpdate:(patch:Partial<Lead>)=>void }){
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: lead.name||"", phone: lead.phone||"", photoUrl: lead.photoUrl||"", ubicacion: lead.ubicacion||"", fechaEntrega: lead.fechaEntrega||todayISO(), recarga: lead.recarga||"20L", notes: lead.notes||"" });
  useEffect(()=>{ setForm({ name: lead.name||"", phone: lead.phone||"", photoUrl: lead.photoUrl||"", ubicacion: lead.ubicacion||"", fechaEntrega: lead.fechaEntrega||todayISO(), recarga: lead.recarga||"20L", notes: lead.notes||"" }); }, [lead]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" variant="outline" onClick={()=> setOpen(true)} className="gap-2"><Icon name="settings" className="h-4 w-4"/> Editar</Button>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Editar lead</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div><label className="text-xs">Nombre completo</label><Input value={form.name} onChange={(e)=> setForm((p)=> ({...p, name: e.target.value}))} /></div>
          <div><label className="text-xs">Teléfono (WhatsApp)</label><Input value={form.phone} onChange={(e)=> setForm((p)=> ({...p, phone: e.target.value}))} /></div>
          <div><label className="text-xs">Foto (URL)</label><Input value={form.photoUrl} onChange={(e)=> setForm((p)=> ({...p, photoUrl: e.target.value}))} /></div>
          <div className="md:col-span-2">
            <label className="text-xs">Ubicación (dirección o lat,lng)</label>
            <Input value={form.ubicacion} onChange={(e)=> setForm((p)=> ({...p, ubicacion: e.target.value}))} />
            {form.ubicacion && (<a className="text-xs text-blue-600 inline-flex items-center gap-1 mt-1" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(form.ubicacion)}`} target="_blank" rel="noreferrer">Abrir en Maps <Icon name="arrow-right" className="h-3 w-3"/></a>)}
          </div>
          <div><label className="text-xs">Fecha de entrega</label><Input type="date" value={form.fechaEntrega} onChange={(e)=> setForm((p)=> ({...p, fechaEntrega: e.target.value}))} /></div>
          <div><label className="text-xs">Recarga</label>
            <Select value={form.recarga} onValueChange={(v)=> setForm((p)=> ({...p, recarga: v}))}>
              <SelectTrigger><SelectValue placeholder="Elige recarga"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="20L">Bidón 20L</SelectItem>
                <SelectItem value="10L">Bidón 10L</SelectItem>
                <SelectItem value="sachets">Sachets</SelectItem>
                <SelectItem value="destilada">Destilada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2"><label className="text-xs">Notas</label><Textarea rows={3} value={form.notes} onChange={(e)=> setForm((p)=> ({...p, notes: e.target.value}))} /></div>
        </div>
        <DialogFooter><Button variant="secondary" onClick={()=> setOpen(false)}>Cancelar</Button><Button onClick={()=> { onUpdate(form as Partial<Lead>); setOpen(false); }}>Guardar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ChatBox(props:{ value:string; onChange:(v:string)=>void; onSend:()=>void; onSuggest:()=>void; sending:boolean; suggesting:boolean; stage:{name:string} }){
  const { value, onChange, onSend, onSuggest, sending, suggesting, stage } = props;
  return (
    <div className="border rounded-xl p-2">
      <Textarea rows={3} placeholder={`Escribe aquí… (${stage.name})`} value={value} onChange={(e)=> onChange(e.target.value)} />
      <div className="flex items-center justify-between mt-2">
        <Button size="sm" variant="outline" onClick={onSuggest} disabled={suggesting} className="gap-2">{suggesting? <Icon name="loader" className="h-4 w-4 animate-spin"/> : <Icon name="bot" className="h-4 w-4"/>} Sugerir con IA</Button>
        <Button size="sm" onClick={onSend} disabled={sending || !value.trim()} className="gap-2">{sending? <Icon name="loader" className="h-4 w-4 animate-spin"/> : <Icon name="send" className="h-4 w-4"/>} Enviar</Button>
      </div>
    </div>
  );
}

function AssignDistributor({ db, leadId, onAssign }:{ db:DB; leadId:string; onAssign:(id:string)=>void }){
  const lead = db.leads.find(l=> l.id===leadId)!;
  const [type, setType] = useState<string>(lead.distributorType || DISTRIBUTOR_TYPES[0].id);
  const list = useMemo(()=> db.distributors.filter(d=> d.type===type), [db.distributors, type]);
  return (
    <div className="space-y-3">
      <div><label className="text-xs">Tipo de distribuidor</label>
        <Select value={type} onValueChange={setType}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{DISTRIBUTOR_TYPES.map(t=> <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent></Select>
      </div>
      <div><label className="text-xs">Selecciona distribuidor</label>
        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-auto">
          {list.map(d=> (
            <div key={d.id} className="border rounded-xl p-2 flex items-center justify-between">
              <div><div className="font-medium">{d.name}</div><div className="text-xs text-slate-500">{d.phone} · Zona {d.zone||'—'}</div></div>
              <Button size="sm" className="gap-2" onClick={()=> onAssign(d.id)}><Icon name="check" className="h-4 w-4"/> Asignar</Button>
            </div>
          ))}
          {list.length===0 && <div className="text-xs text-slate-500">No hay distribuidores de este tipo.</div>}
        </div>
      </div>
    </div>
  );
}

function DistributorsPanel({ distributors, onAdd }:{ distributors:Distributor[]; onAdd:(d:Distributor)=>void }){
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Distributor>>({ type: DISTRIBUTOR_TYPES[0].id });
  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-2"><Icon name="db" className="h-5 w-5"/><div className="font-semibold">Distribuidores</div><Button size="sm" variant="outline" className="ml-auto gap-2" onClick={()=> setOpen(true)}><Icon name="plus" className="h-4 w-4"/> Nuevo</Button></div>
      <div className="grid md:grid-cols-3 gap-2">
        {distributors.map(d=> (<div key={d.id} className="border rounded-xl p-3 bg-white"><div className="font-medium">{d.name}</div><div className="text-xs text-slate-500">{d.phone} · {d.type} · {d.zone||'—'}</div></div>))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nuevo distribuidor</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label className="text-xs">Nombre</label><Input value={form.name||""} onChange={(e)=> setForm((p)=> ({...p, name: e.target.value}))} /></div>
            <div><label className="text-xs">Teléfono</label><Input value={form.phone||""} onChange={(e)=> setForm((p)=> ({...p, phone: e.target.value}))} /></div>
            <div><label className="text-xs">Tipo</label>
              <Select value={form.type as string} onValueChange={(v)=> setForm((p)=> ({...p, type: v}))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{DISTRIBUTOR_TYPES.map(t=> <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent></Select>
            </div>
            <div><label className="text-xs">Zona</label><Input value={form.zone||""} onChange={(e)=> setForm((p)=> ({ ...p, zone: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="secondary" onClick={()=> setOpen(false)}>Cancelar</Button><Button onClick={()=> { if(!form.name||!form.phone) return alert('Completa nombre y teléfono'); onAdd({ id: uid(), name:String(form.name), phone:String(form.phone), type:String(form.type), zone: form.zone as any }); setOpen(false); }}>Guardar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ChatDrawer({ lead, stage, distributors, onClose, onUpdate, onMove, onOpenDistributor }:{ lead:Lead; stage:{id:StageId; name:string; aiSystemPrompt:string}; distributors:Distributor[]; onClose:()=>void; onUpdate:(p:Partial<Lead>)=>void; onMove:(s:StageId)=>void; onOpenDistributor:()=>void }){
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const ref = useRef<HTMLDivElement|null>(null);
  useEffect(()=>{ ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior:'smooth' }); }, [lead.history]);
  const distributor = useMemo(()=> distributors.find(d=> d.id===lead.distributorId), [distributors, lead.distributorId]);
  async function handleSend(to:'equipo'|'cliente'){
    if(!msg.trim()) return; setSending(true);
    try{ if(to==='equipo'){ if(!distributor?.phone) throw new Error('Asigna un distribuidor con teléfono'); await sendWhatsApp(distributor.phone, msg, { leadId: lead.id, private:true }); onUpdate({ history:[...lead.history, { ts:Date.now(), type:'msg_equipo', text:msg, who:'equipo' }] }); } else { if(!lead.phone) throw new Error('Agrega el teléfono del cliente'); await sendWhatsApp(lead.phone, msg, { leadId: lead.id, stageId: stage.id }); onUpdate({ history:[...lead.history, { ts:Date.now(), type:'msg_cliente', text:msg, who:'equipo' }] }); } setMsg(''); } catch(e:any){ alert(e?.message||'Error al enviar'); } finally{ setSending(false); }
  }
  async function handleSuggest(){ setSuggesting(true); try{ const content = await aiComplete(stage.id, stage.aiSystemPrompt, [ { role:'user', content:`Contexto del lead: ${JSON.stringify({ name: lead.name, phone: lead.phone, ubicacion: lead.ubicacion, recarga: lead.recarga, fechaEntrega: lead.fechaEntrega })}` } ], lead); setMsg(p=> (p? p+"\n" : "") + content); } catch(e:any){ alert(e?.message||'IA no disponible'); } finally{ setSuggesting(false); } }
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}/>
      <div className="absolute right-0 top-0 h-full w-full md:w-[980px] bg-white shadow-2xl">
        <div className="flex h-full">
          <div className="hidden md:flex w-72 border-r flex-col"><div className="px-4 py-3 font-semibold">Conversaciones</div><div className="px-3 space-y-2 overflow-auto"><div className="border rounded-xl p-2 flex items-center gap-2 bg-emerald-50"><Avatar name={lead.name} src={lead.photoUrl} /><div className="text-sm"><div className="font-medium line-clamp-1">{lead.name}</div><div className="text-xs text-slate-500">{lead.phone}</div></div></div></div></div>
          <div className="flex-1 flex flex-col">
            <div className="border-b px-4 py-3 flex items-center gap-3"><Button variant="outline" size="sm" onClick={onClose}>Cerrar</Button><Avatar name={lead.name} src={lead.photoUrl} /><div><div className="font-semibold">{lead.name}</div><div className="text-xs text-slate-500">{stage.name}</div></div><div className="ml-auto flex items-center gap-2"><Select value={lead.stageId} onValueChange={(v)=> onMove(v as StageId)}><SelectTrigger className="h-8"><SelectValue/></SelectTrigger><SelectContent>{DEFAULT_STAGES.map(s=> <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select><Button size="sm" variant="outline" onClick={onOpenDistributor}><Icon name="users" className="h-4 w-4"/> Distribuidor</Button></div></div>
            <div ref={ref} className="flex-1 overflow-auto px-4 py-3 space-y-2 bg-slate-50">{lead.history.map((h,i)=> (<div key={i} className={`max-w-[72%] ${h.who==='equipo' ? 'ml-auto' : h.who==='cliente' ? '' : 'mx-auto'}`}><div className={`rounded-2xl px-3 py-2 text-sm shadow ${h.who==='equipo' ? 'bg-emerald-600 text-white' : h.who==='cliente' ? 'bg-white' : 'bg-slate-200 text-slate-700'}`}>{h.text}</div><div className="text-[10px] text-slate-400 mt-1">{new Date(h.ts).toLocaleString()}</div></div>))}</div>
            <div className="border-t p-3"><div className="flex items-center gap-2"><Button size="sm" variant="outline" onClick={handleSuggest} disabled={suggesting} className="gap-2 w-32 justify-center">{suggesting? <Icon name="loader" className="h-4 w-4 animate-spin"/> : <Icon name="bot" className="h-4 w-4"/>} IA</Button><Textarea rows={1} value={msg} onChange={(e)=> setMsg(e.target.value)} placeholder="Escribe un mensaje…" className="resize-none" /><Button size="sm" onClick={()=> handleSend('cliente')} disabled={sending||!msg.trim()} className="gap-2">{sending? <Icon name="loader" className="h-4 w-4 animate-spin"/> : <Icon name="send" className="h-4 w-4"/>} Cliente</Button><Button size="sm" variant="outline" onClick={()=> handleSend('equipo')} disabled={sending||!msg.trim()} className="gap-2">{sending? <Icon name="loader" className="h-4 w-4 animate-spin"/> : <Icon name="send" className="h-4 w-4"/>} Equipo</Button></div></div>
          </div>
          <div className="w-80 border-l hidden md:block"><div className="px-4 py-3 font-semibold">Detalles</div><div className="px-4 space-y-3 text-sm"><div className="flex items-center gap-2"><Icon name="phone" className="h-4 w-4"/>{lead.phone||'—'}</div><div className="flex items-center gap-2"><Icon name="map-pin" className="h-4 w-4"/>{lead.ubicacion||'—'}</div><div className="flex items-center gap-2"><Icon name="calendar" className="h-4 w-4"/>{lead.fechaEntrega||todayISO()}</div><div className="flex items-center gap-2"><Icon name="shield" className="h-4 w-4"/>Recarga: {lead.recarga||'—'}</div><div><label className="text-xs">Notas</label><Textarea rows={4} value={lead.notes||''} onChange={(e)=> onUpdate({ notes: e.target.value })} /></div></div></div>
        </div>
      </div>
    </div>
  );
}

function DashboardView({ stages, leads }:{ stages: typeof DEFAULT_STAGES; leads: Lead[] }){
  const byStage = useMemo(()=> stages.map(s=> ({ ...s, count: leads.filter(l=> l.stageId===s.id).length })), [stages, leads]);
  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">{byStage.map(s=> (<Card key={s.id} className="rounded-2xl"><CardContent className="p-4"><div className="text-sm text-slate-500">{s.name}</div><div className="text-3xl font-bold">{s.count}</div></CardContent></Card>))}</div>
      <div className="mt-6"><Card className="rounded-2xl"><CardContent className="p-4"><div className="text-sm text-slate-500">Total de leads</div><div className="text-4xl font-bold">{leads.length}</div></CardContent></Card></div>
    </div>
  );
}

function LeadsTable({ leads, onOpen }:{ leads:Lead[]; onOpen:(id:string)=>void }){
  return (
    <div className="bg-white rounded-2xl border"><div className="p-3 font-semibold">Lista de usuarios</div><div className="divide-y">{leads.map(l=> (<button key={l.id} onClick={()=> onOpen(l.id)} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3"><Avatar name={l.name} src={l.photoUrl} /><div className="flex-1 min-w-0"><div className="font-medium truncate">{l.name}</div><div className="text-xs text-slate-500 truncate">{l.phone} · {l.ubicacion||'—'}</div></div><Badge variant="secondary">{l.stageId}</Badge></button>))}</div></div>
  );
}

function ChatsInbox({ leads, onOpen }:{ leads:Lead[]; onOpen:(id:string)=>void }){
  const recent = leads.slice(0,20);
  return (
    <div className="bg-white rounded-2xl border grid grid-cols-1 md:grid-cols-2">
      <div className="p-3 border-r font-semibold">Buzón</div>
      <div className="p-3 font-semibold">Vista previa</div>
      <div className="border-r divide-y">{recent.map(l=> (<button key={l.id} onClick={()=> onOpen(l.id)} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3"><Avatar name={l.name} src={l.photoUrl} /><div className="min-w-0"><div className="font-medium truncate">{l.name}</div><div className="text-xs text-slate-500 truncate">{l.history?.slice(-1)[0]?.text||'Sin mensajes'}</div></div></button>))}</div>
      <div className="p-4 text-sm text-slate-500">Selecciona un lead para ver la conversación completa.</div>
    </div>
  );
}

// --- Self-tests compactos ---
(function __tests__(){ try{ console.assert(/^\d{4}-\d{2}-\d{2}$/.test(todayISO()), 'todayISO'); const s=new Set(Array.from({length:5}, uid)); console.assert(s.size===5, 'uid unique'); console.assert(DEFAULT_STAGES.length>=4,'stages'); }catch(e){ console.warn('SelfTests:', e); } })();
