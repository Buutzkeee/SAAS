// ===================================================
// CHAT UBSF MODULE
// ===================================================
const Chat = {
  activeConv: null,

  render() {
    const mensagens = getData('mensagens');
    const pacientes = getData('pacientes');
    // Group conversations by patient
    const convs = pacientes.map(p => {
      const msgs = mensagens.filter(m => m.remetente===p.id || m.destinatario===p.id);
      const unread = msgs.filter(m=>m.remetente===p.id&&!m.lida).length;
      const last = msgs.length ? msgs[msgs.length-1] : null;
      return { paciente: p, msgs, unread, last };
    }).filter(c => c.msgs.length > 0);

    // Add placeholder new conversations
    return `
    <div class="section-header">
      <div>
        <h2>Chat UBSF</h2>
        <p>Comunicação direta entre pacientes e unidades de saúde</p>
      </div>
      <button class="btn btn-primary" onclick="Chat.novaConversa()">+ Nova Conversa</button>
    </div>

    <div class="chat-layout">
      <div class="chat-sidebar">
        <div style="padding:12px;border-bottom:1px solid var(--border);">
          <input type="text" style="width:100%;background:var(--bg-card);border:1px solid var(--border);color:var(--text-primary);padding:8px 12px;border-radius:var(--radius-full);font-size:13px;outline:none;font-family:inherit;" placeholder="🔍 Buscar conversa..." oninput="Chat.filterConvs(this.value)">
        </div>
        <div id="chat-convs-list">
          ${convs.length ? convs.map(c => `
            <div class="chat-conversation-item ${this.activeConv===c.paciente.id?'active':''}" onclick="Chat.openConv('${c.paciente.id}')">
              <div class="chat-avatar">${c.paciente.nome[0]}</div>
              <div class="chat-conv-info">
                <div class="chat-conv-name">${c.paciente.nome.split(' ').slice(0,2).join(' ')}</div>
                <div class="chat-conv-preview">${c.last?c.last.texto:'—'}</div>
              </div>
              ${c.unread>0?`<div class="nav-badge">${c.unread}</div>`:''}
            </div>
          `).join('') : `
            <div class="empty-state" style="padding:40px">
              <div class="icon">💬</div>
              <h3>Sem conversas</h3>
              <p>Inicie uma nova conversa</p>
            </div>
          `}
        </div>
      </div>

      <div class="chat-main" id="chat-main-area">
        <div class="empty-state" style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <div class="icon">💬</div>
          <h3>Selecione uma conversa</h3>
          <p>ou inicie uma nova conversa com um paciente</p>
        </div>
      </div>
    </div>
    `;
  },

  openConv(pacId) {
    this.activeConv = pacId;
    const pac = getData('pacientes').find(p=>p.id===pacId);
    const mensagens = getData('mensagens').filter(m=>m.remetente===pacId||m.destinatario===pacId);

    // Mark as read
    const all = getData('mensagens');
    all.forEach(m => { if (m.remetente===pacId) m.lida = true; });
    setData('mensagens', all);

    const area = document.getElementById('chat-main-area');
    if (!area) return;
    area.innerHTML = `
      <div class="chat-header">
        <div class="chat-avatar">${pac?pac.nome[0]:'?'}</div>
        <div>
          <div style="font-size:14px;font-weight:700;color:var(--text-primary)">${pac?pac.nome:'—'}</div>
          <div style="font-size:11px;color:var(--secondary)">● Online · ${pac?pac.unidade:'UBSF'}</div>
        </div>
        <div style="margin-left:auto;display:flex;gap:8px;">
          <button class="btn btn-secondary btn-xs" onclick="navigate('agendamento')">📅 Agendar</button>
          <button class="btn btn-secondary btn-xs" onclick="Historico.loadPacienteAndGo('${pacId}')">📋 Prontuário</button>
        </div>
      </div>
      <div class="chat-messages" id="chat-msgs">
        ${mensagens.map(m => {
          const sent = m.remetente !== pacId;
          return `<div>
            <div class="chat-bubble ${sent?'sent':'received'}">${m.texto}<div class="chat-bubble-time">${formatTime(m.dataHora)}</div></div>
          </div>`;
        }).join('')}
      </div>
      <div class="chat-input-bar">
        <input class="chat-input" id="chat-input-field" placeholder="Digite sua mensagem..." onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();Chat.send('${pacId}')}">
        <button class="btn btn-primary" onclick="Chat.send('${pacId}')">➤ Enviar</button>
      </div>
    `;

    // Scroll to bottom
    setTimeout(() => {
      const msgs = document.getElementById('chat-msgs');
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
    }, 50);

    // Update sidebar active state
    document.querySelectorAll('.chat-conversation-item').forEach(el => el.classList.remove('active'));
  },

  send(pacId) {
    const field = document.getElementById('chat-input-field');
    const texto = field ? field.value.trim() : '';
    if (!texto) return;
    const pac = getData('pacientes').find(p=>p.id===pacId);
    const unidade = pac ? pac.unidade : 'UBSF';
    addItem('mensagens', {
      id: generateId('MSG'),
      remetente: unidade,
      destinatario: pacId,
      texto,
      dataHora: new Date().toISOString(),
      lida: true
    });
    field.value = '';
    const msgs = document.getElementById('chat-msgs');
    if (msgs) {
      const div = document.createElement('div');
      div.innerHTML = `<div class="chat-bubble sent">${texto}<div class="chat-bubble-time">${formatTime(new Date().toISOString())}</div></div>`;
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    }
    showToast('Mensagem enviada!', 'success');
  },

  filterConvs(q) {
    // simple filter
  },

  novaConversa() {
    const pacientes = getData('pacientes');
    showModal('💬 Nova Conversa', `
      <div class="form-group">
        <label>Selecione o paciente</label>
        <select id="nova-conv-pac" style="width:100%;background:var(--bg-card2);border:1px solid var(--border);color:var(--text-primary);padding:10px;border-radius:var(--radius-md);font-family:inherit;outline:none;">
          <option value="">Selecione...</option>
          ${pacientes.map(p=>`<option value="${p.id}">${p.nome}</option>`).join('')}
        </select>
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label>Mensagem inicial</label>
        <textarea id="nova-conv-msg" style="width:100%;background:var(--bg-card2);border:1px solid var(--border);color:var(--text-primary);padding:10px;border-radius:var(--radius-md);font-family:inherit;outline:none;min-height:80px;resize:vertical;" placeholder="Olá! Como posso ajudar?"></textarea>
      </div>
    `, () => {
      const pacId = document.getElementById('nova-conv-pac').value;
      const texto = document.getElementById('nova-conv-msg').value;
      if (!pacId || !texto) { showToast('Preencha os campos!', 'error'); return; }
      const pac = getData('pacientes').find(p=>p.id===pacId);
      addItem('mensagens', {
        id: generateId('MSG'),
        remetente: pac?pac.unidade:'UBSF',
        destinatario: pacId,
        texto,
        dataHora: new Date().toISOString(),
        lida: true
      });
      closeModal();
      navigate('chat');
      showToast('Conversa iniciada!', 'success');
    });
  },

  afterRender() {
    if (this.activeConv) this.openConv(this.activeConv);
  }
};

// ===================================================
// VISITAS DOMICILIARES MODULE
// ===================================================
const Visitas = {
  render() {
    const visitas = getData('visitas');
    return `
    <div class="section-header">
      <div>
        <h2>Visitas Domiciliares</h2>
        <p>Agendamento e registro de visitas dos agentes comunitários</p>
      </div>
      <button class="btn btn-primary" onclick="Visitas.openModal()">+ Nova Visita</button>
    </div>

    <div class="stats-grid" style="grid-template-columns:repeat(4,1fr);">
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-icon blue">🏠</div></div>
        <div class="stat-value">${visitas.length}</div>
        <div class="stat-label">Total de Visitas</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-icon green">✅</div></div>
        <div class="stat-value">${visitas.filter(v=>v.status==='Realizada').length}</div>
        <div class="stat-label">Realizadas</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-icon orange">📅</div></div>
        <div class="stat-value">${visitas.filter(v=>v.status==='Agendada').length}</div>
        <div class="stat-label">Agendadas</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-icon purple">👥</div></div>
        <div class="stat-value">${[...new Set(visitas.map(v=>v.agente))].length}</div>
        <div class="stat-label">Agentes Ativos</div>
      </div>
    </div>

    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab(this,'tab-visitas-lista')">📋 Lista de Visitas</button>
      <button class="tab-btn" onclick="switchTab(this,'tab-visitas-mapa')">🗺️ Por Agente</button>
    </div>

    <div id="tab-visitas-lista" class="tab-panel active">
      <div class="card">
        <div class="card-header">
          <h3>Registro de Visitas</h3>
          <div style="display:flex;gap:10px;">
            <select class="filter-select" onchange="Visitas.filterStatus(this.value)">
              <option value="">Todos Status</option>
              <option value="Agendada">Agendada</option>
              <option value="Realizada">Realizada</option>
              <option value="Não Realizada">Não Realizada</option>
            </select>
          </div>
        </div>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>Paciente</th><th>Agente</th><th>Data</th><th>Motivo</th><th>Status</th><th>Observação</th><th>Ações</th></tr></thead>
            <tbody id="visitas-tbody">${this.renderRows(visitas)}</tbody>
          </table>
        </div>
      </div>
    </div>

    <div id="tab-visitas-mapa" class="tab-panel">
      <div class="grid-auto">
        ${['ACS001','ACS002','ACS003'].map(acs => {
          const acsVisitas = visitas.filter(v=>v.agente===acs);
          return `
          <div class="card">
            <div class="card-header">
              <h3>👤 ${acs}</h3>
              <span class="badge andamento">${acsVisitas.length} visitas</span>
            </div>
            <div class="card-body" style="padding:0;">
              ${acsVisitas.map(v => {
                const pac = getData('pacientes').find(p=>p.id===v.pacienteId);
                return `<div style="display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.04);">
                  <div style="font-size:18px">${v.status==='Realizada'?'✅':'📅'}</div>
                  <div style="flex:1;">
                    <div style="font-size:13px;font-weight:600;color:var(--text-primary)">${pac?pac.nome.split(' ').slice(0,2).join(' '):'—'}</div>
                    <div style="font-size:11px;color:var(--text-muted)">${v.motivo} · ${formatDate(v.data)}</div>
                  </div>
                  ${getBadge(v.status==='Realizada'?'realizada':v.status==='Agendada'?'agendada':'cancelado', v.status)}
                </div>`;
              }).join('') || '<div class="empty-state" style="padding:20px"><p>Sem visitas</p></div>'}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- Modal -->
    <div id="modal-visita" class="modal-overlay" style="display:none;" onclick="if(event.target===this)this.style.display='none'">
      <div class="modal">
        <div class="modal-header">
          <h3>🏠 Agendar Visita Domiciliar</h3>
          <div class="modal-close" onclick="document.getElementById('modal-visita').style.display='none'">✕</div>
        </div>
        <div class="modal-body">
          <div class="form-grid form-grid-2">
            <div class="form-group">
              <label>Paciente *</label>
              <select id="vis-paciente">
                <option value="">Selecione...</option>
                ${getData('pacientes').map(p=>`<option value="${p.id}">${p.nome} — ${p.bairro}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Agente Comunitário</label>
              <select id="vis-agente">
                <option value="ACS001">ACS001 — Maria Eduarda</option>
                <option value="ACS002">ACS002 — João Carlos</option>
                <option value="ACS003">ACS003 — Ana Paula</option>
              </select>
            </div>
            <div class="form-group">
              <label>Data da Visita *</label>
              <input type="date" id="vis-data" value="${new Date().toISOString().slice(0,10)}">
            </div>
            <div class="form-group">
              <label>Status</label>
              <select id="vis-status">
                <option>Agendada</option>
                <option>Realizada</option>
              </select>
            </div>
            <div class="form-group" style="grid-column:span 2">
              <label>Motivo da Visita</label>
              <select id="vis-motivo">
                <option>Acompanhamento HAS</option>
                <option>Acompanhamento DM</option>
                <option>Pré-natal domiciliar</option>
                <option>Visita pós-alta hospitalar</option>
                <option>Cadastramento SIAB</option>
                <option>Busca ativa</option>
                <option>Acompanhamento saúde mental</option>
                <option>Visita de rotina</option>
                <option>Outro</option>
              </select>
            </div>
            <div class="form-group" style="grid-column:span 2">
              <label>Observações / Relato da Visita</label>
              <textarea id="vis-obs" rows="4" placeholder="Descreva o que foi observado durante a visita..."></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('modal-visita').style.display='none'">Cancelar</button>
          <button class="btn btn-primary" onclick="Visitas.salvar()">🏠 Agendar Visita</button>
        </div>
      </div>
    </div>
    `;
  },

  renderRows(visitas) {
    if (!visitas.length) return `<tr><td colspan="7"><div class="empty-state"><div class="icon">🏠</div><p>Nenhuma visita registrada</p></div></td></tr>`;
    return visitas.map(v => {
      const pac = getData('pacientes').find(p=>p.id===v.pacienteId);
      return `<tr>
        <td class="td-primary">${pac?pac.nome:'—'}</td>
        <td>${v.agente}</td>
        <td>${formatDate(v.data)}</td>
        <td>${v.motivo}</td>
        <td>${getBadge(v.status==='Realizada'?'realizada':v.status==='Agendada'?'agendada':'cancelado', v.status)}</td>
        <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${v.observacao||'—'}</td>
        <td>
          <div style="display:flex;gap:6px;">
            ${v.status==='Agendada'?`<button class="btn btn-success btn-xs" onclick="Visitas.realize('${v.id}')">✅ Realizar</button>`:''}
            <button class="btn btn-danger btn-xs" onclick="Visitas.deletar('${v.id}')">🗑️</button>
          </div>
        </td>
      </tr>`;
    }).join('');
  },

  filterStatus(s) {
    const all = getData('visitas');
    document.getElementById('visitas-tbody').innerHTML = this.renderRows(s?all.filter(v=>v.status===s):all);
  },

  openModal() { document.getElementById('modal-visita').style.display = 'flex'; },

  salvar() {
    const pac = document.getElementById('vis-paciente').value;
    const data = document.getElementById('vis-data').value;
    if (!pac || !data) { showToast('Preencha os campos obrigatórios!', 'error'); return; }
    addItem('visitas', {
      id: generateId('VIS'),
      pacienteId: pac,
      agente: document.getElementById('vis-agente').value,
      data,
      motivo: document.getElementById('vis-motivo').value,
      observacao: document.getElementById('vis-obs').value,
      status: document.getElementById('vis-status').value,
    });
    document.getElementById('modal-visita').style.display = 'none';
    showToast('Visita agendada!', 'success');
    document.getElementById('visitas-tbody').innerHTML = this.renderRows(getData('visitas'));
  },

  realize(id) {
    const obs = prompt('Registre as observações da visita realizada:');
    if (obs === null) return;
    updateItem('visitas', id, { status: 'Realizada', observacao: obs });
    document.getElementById('visitas-tbody').innerHTML = this.renderRows(getData('visitas'));
    showToast('Visita registrada como realizada!', 'success');
  },

  deletar(id) {
    if (confirm('Remover esta visita?')) {
      deleteItem('visitas', id);
      document.getElementById('visitas-tbody').innerHTML = this.renderRows(getData('visitas'));
      showToast('Visita removida.', 'info');
    }
  },

  afterRender() {}
};
