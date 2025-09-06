const state = {
  stages: [],
  leads: [],
  draggingId: null,
};

const socket = io();

socket.on('hello', () => {});
socket.on('wa:ready', () => {
  setWAStatus(true);
  hideQR();
});
socket.on('wa:disconnected', () => {
  setWAStatus(false);
});
socket.on('wa:qr', (payload) => {
  setWAStatus(false);
  showQR(payload.dataUrl);
});

socket.on('lead:new', (lead) => {
  state.leads.push(lead);
  render();
});
socket.on('lead:update', (lead) => {
  const idx = state.leads.findIndex(l => l.id === lead.id);
  if (idx !== -1) state.leads[idx] = lead; else state.leads.push(lead);
  render();
});

document.getElementById('btnConnect').addEventListener('click', async () => {
  await fetch('/api/wa/start', { method: 'POST' });
  const st = await (await fetch('/api/wa/status')).json();
  if (!st.connected) {
    const qr = await fetch('/api/wa/qr').then(r => r.ok ? r.json() : null).catch(() => null);
    if (qr && qr.dataUrl) showQR(qr.dataUrl); else showQR(); // real-time via socket too
  }
});
document.getElementById('closeQR').addEventListener('click', hideQR);

function setWAStatus(connected){
  const el = document.getElementById('waStatus');
  if (connected) {
    el.textContent = 'WhatsApp: conectado';
    el.className = 'ml-auto text-sm px-2 py-1 rounded-full bg-emerald-100 text-emerald-800';
  } else {
    el.textContent = 'WhatsApp: desconectado';
    el.className = 'ml-auto text-sm px-2 py-1 rounded-full bg-yellow-100 text-yellow-800';
  }
}

function showQR(dataUrl){
  const modal = document.getElementById('qrModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  const box = document.getElementById('qrBox');
  box.innerHTML = '';
  const img = document.createElement('img');
  img.alt = 'QR';
  if (dataUrl) img.src = dataUrl;
  box.appendChild(img);
}
function hideQR(){
  const modal = document.getElementById('qrModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

async function bootstrap(){
  const st = await (await fetch('/api/wa/status')).json();
  setWAStatus(st.connected);

  const data = await (await fetch('/api/pipeline')).json();
  state.stages = data.stages;
  state.leads = data.leads;
  render();
}

function render(){
  const root = document.getElementById('pipelines');
  root.innerHTML = '';
  state.stages.forEach(stage => {
    const col = document.createElement('div');
    col.className = 'stage bg-white rounded-2xl shadow-sm border border-slate-200 p-3 flex flex-col';
    col.dataset.stageId = stage.id;

    const header = document.createElement('div');
    header.className = 'flex items-center justify-between mb-2';
    header.innerHTML = \`
      <div class="font-semibold">\${stage.name}</div>
      <button class="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100" data-add>+ Lead</button>
    \`;
    col.appendChild(header);

    const list = document.createElement('div');
    list.className = 'flex-1 space-y-3';
    col.appendChild(list);

    // Drop zone
    list.addEventListener('dragover', e => {
      e.preventDefault();
      list.classList.add('ring-2','ring-emerald-300');
    });
    list.addEventListener('dragleave', e => {
      list.classList.remove('ring-2','ring-emerald-300');
    });
    list.addEventListener('drop', async e => {
      e.preventDefault();
      list.classList.remove('ring-2','ring-emerald-300');
      const id = state.draggingId;
      if (!id) return;
      await fetch(\`/api/leads/\${id}/move\`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ stageId: stage.id })
      });
    });

    // Cards
    state.leads.filter(l => l.stageId === stage.id).forEach(lead => {
      list.appendChild(renderCard(lead));
    });

    // Add button
    header.querySelector('[data-add]').addEventListener('click', async () => {
      const name = prompt('Nombre completo:');
      if (!name) return;
      const phone = prompt('Teléfono (solo dígitos):') || '';
      const body = {
        stageId: stage.id,
        name, phone, whatsappJid: phone ? phone + '@s.whatsapp.net' : ''
      };
      const created = await (await fetch('/api/leads', {
        method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(body)
      })).json();
    });

    root.appendChild(col);
  });
}

function renderCard(lead){
  const el = document.createElement('div');
  el.className = 'card bg-slate-50 rounded-xl border border-slate-200 p-3 shadow-sm';
  el.draggable = true;
  el.addEventListener('dragstart', () => state.draggingId = lead.id);
  el.addEventListener('dragend', () => state.draggingId = null);

  el.innerHTML = \`
    <div class="flex items-center justify-between">
      <div class="font-medium">\${lead.name}</div>
      <span class="text-xs text-slate-500">#\${lead.id.slice(0,6)}</span>
    </div>
    <div class="mt-1 text-sm text-slate-600">
      <div><span class="font-medium">Tel:</span> \${lead.phone || '—'}</div>
      <div class="grid grid-cols-2 gap-2 mt-2">
        <label class="text-xs">Recarga<input data-field="recarga" class="mt-1 w-full border rounded-lg px-2 py-1 text-sm" value="\${lead.recarga||''}"/></label>
        <label class="text-xs">Entrega<input data-field="fechaEntrega" class="mt-1 w-full border rounded-lg px-2 py-1 text-sm" value="\${lead.fechaEntrega||''}" placeholder="2025-09-06"/></label>
      </div>
      <label class="block text-xs mt-2">Ubicación
        <input data-field="ubicacion" class="mt-1 w-full border rounded-lg px-2 py-1 text-sm" value="\${lead.ubicacion||''}" placeholder="Barrio, referencia"/>
      </label>

      <div class="grid grid-cols-2 gap-2 mt-2">
        <label class="text-xs">Tipo distribuidor
          <select data-field="distribuidorTipo" class="mt-1 w-full border rounded-lg px-2 py-1 text-sm">
            <option value="">—</option>
            <option \${lead.distribuidorTipo==='Propio'?'selected':''}>Propio</option>
            <option \${lead.distribuidorTipo==='Tercerizado'?'selected':''}>Tercerizado</option>
            <option \${lead.distribuidorTipo==='Aliado'?'selected':''}>Aliado</option>
          </select>
        </label>
        <label class="text-xs">Asignar distribuidor
          <input data-field="distribuidorId" class="mt-1 w-full border rounded-lg px-2 py-1 text-sm" value="\${lead.distribuidorId||''}" placeholder="código/nombre"/>
        </label>
      </div>
    </div>

    <div class="mt-3">
      <div class="flex items-center gap-2 text-xs">
        <button data-tab="interno" class="tab px-2 py-1 rounded-lg bg-slate-800 text-white">Chat interno</button>
        <button data-tab="usuario" class="tab px-2 py-1 rounded-lg bg-slate-100">Chat con cliente</button>
        <button data-ai class="ml-auto px-2 py-1 rounded-lg bg-emerald-600 text-white">💡 IA</button>
      </div>
      <div class="mt-2 h-36 overflow-y-auto bg-white border rounded-lg p-2 space-y-1 text-sm" data-chat></div>
      <div class="mt-2 flex gap-2">
        <input data-input class="flex-1 border rounded-lg px-2 py-1 text-sm" placeholder="Escribe un mensaje..."/>
        <button data-send class="px-3 py-1 rounded-lg bg-slate-800 text-white">Enviar</button>
      </div>
    </div>
  \`;

  const chatBox = el.querySelector('[data-chat]');
  const input = el.querySelector('[data-input]');
  const btnSend = el.querySelector('[data-send]');
  const btnAI = el.querySelector('[data-ai]');
  let currentTab = 'interno';

  function paintMessages(){
    chatBox.innerHTML = '';
    const list = lead.chat[currentTab] || [];
    list.slice(-50).forEach(m => {
      const row = document.createElement('div');
      const who = m.from === 'equipo' ? '👤' : (m.from === 'IA' ? '🤖' : '🟢');
      row.textContent = who + ' ' + m.text;
      chatBox.appendChild(row);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  }
  paintMessages();

  el.querySelectorAll('.tab').forEach(t => {
    t.addEventListener('click', () => {
      el.querySelectorAll('.tab').forEach(b => {
        b.className = 'tab px-2 py-1 rounded-lg bg-slate-100';
      });
      t.className = 'tab px-2 py-1 rounded-lg bg-slate-800 text-white';
      currentTab = t.dataset.tab === 'usuario' ? 'user' : 'internal';
      paintMessages();
    });
  });

  // Persist inline fields
  el.querySelectorAll('[data-field]').forEach(inp => {
    inp.addEventListener('change', async () => {
      const body = {};
      body[inp.dataset.field] = inp.value;
      await fetch('/api/leads/' + lead.id, {
        method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body)
      });
    });
  });

  btnSend.addEventListener('click', async () => {
    const text = input.value.trim();
    if (!text) return;
    if (currentTab === 'internal') {
      await fetch('/api/leads/' + lead.id + '/chat/internal', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ text })
      });
    } else {
      await fetch('/api/leads/' + lead.id + '/chat/user', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ text })
      });
    }
    input.value='';
  });

  btnAI.addEventListener('click', async () => {
    const text = input.value.trim() || 'Ayúdame a gestionar este lead.';
    const res = await fetch('/api/leads/' + lead.id + '/ai', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ text })
    }).then(r => r.json());
    input.value='';
  });

  return el;
}

bootstrap();
