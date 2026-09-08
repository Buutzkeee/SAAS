// ===================================================
// CHAT UBSF MODULE
// ===================================================
const Chat = {
  activeConv: null,

  render() {
    const mensagens = getData('mensagens');
    const pacientes = getData('pacientes');
    const convs = pacientes.map(p => {
      const msgs = mensagens.filter(m => m.remetente === p.id || m.destinatario === p.id);
      const unread = msgs.filter(m => m.remetente === p.id && !m.lida).length;
      const last = msgs.length ? msgs[msgs.length - 1] : null;
      return { paciente: p, msgs, unread, last };
    }).filter(c => c.msgs.length > 0);

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
          <input type="text" id="chat-search-input"
            style="width:100%;background:var(--bg-card);border:1px solid var(--border);color:var(--text-primary);padding:8px 12px;border-radius:var(--radius-full);font-size:13px;outline:none;font-family:inherit;"
            placeholder="🔍 Buscar conversa..."
            oninput="Chat.filterConvs(this.value)">
        </div>
        <div id="chat-convs-list">
          ${this._renderConvList(convs)}
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

  _renderConvList(convs) {
    if (!convs.length) {
      return `<div class="empty-state" style="padding:40px">
        <div class="icon">💬</div>
        <h3>Sem conversas</h3>
        <p>Inicie uma nova conversa</p>
      </div>`;
    }
    return convs.map(c => `
      <div class="chat-conversation-item ${this.activeConv === c.paciente.id ? 'active' : ''}"
           onclick="Chat.openConv('${c.paciente.id}')"
           data-name="${c.paciente.nome.toLowerCase()}">
        <div class="chat-avatar">${c.paciente.nome[0]}</div>
        <div class="chat-conv-info">
          <div class="chat-conv-name">${c.paciente.nome.split(' ').slice(0, 2).join(' ')}</div>
          <div class="chat-conv-preview">${c.last ? c.last.texto.substring(0, 40) : '—'}</div>
        </div>
        ${c.unread > 0 ? `<div class="nav-badge">${c.unread}</div>` : ''}
      </div>
    `).join('');
  },

  filterConvs(q) {
    const mensagens = getData('mensagens');
    const pacientes = getData('pacientes');
    const ql = (q || '').toLowerCase().trim();

    let convs = pacientes.map(p => {
      const msgs = mensagens.filter(m => m.remetente === p.id || m.destinatario === p.id);
      const unread = msgs.filter(m => m.remetente === p.id && !m.lida).length;
      const last = msgs.length ? msgs[msgs.length - 1] : null;
      return { paciente: p, msgs, unread, last };
    }).filter(c => c.msgs.length > 0);

    if (ql) {
      convs = convs.filter(c =>
        c.paciente.nome.toLowerCase().includes(ql) ||
        (c.last && c.last.texto.toLowerCase().includes(ql))
      );
    }

    const list = document.getElementById('chat-convs-list');
    if (list) list.innerHTML = this._renderConvList(convs);
  },

  openConv(pacId) {
    this.activeConv = pacId;
    const pac = getData('pacientes').find(p => p.id === pacId);
    const mensagens = getData('mensagens').filter(m => m.remetente === pacId || m.destinatario === pacId);

    // Mark as read
    const all = getData('mensagens');
    all.forEach(m => { if (m.remetente === pacId) m.lida = true; });
    setData('mensagens', all);
    updateChatBadge();

    const area = document.getElementById('chat-main-area');
    if (!area) return;
    area.innerHTML = `
      <div class="chat-header">
        <div class="chat-avatar">${pac ? pac.nome[0] : '?'}</div>
        <div>
          <div style="font-size:14px;font-weight:700;color:var(--text-primary)">${pac ? pac.nome : '—'}</div>
          <div style="font-size:11px;color:var(--secondary)">● Online · ${pac ? pac.unidade : 'UBSF'}</div>
        </div>
        <div style="margin-left:auto;display:flex;gap:8px;">
          <button class="btn btn-secondary btn-xs" onclick="navigate('agendamento')">📅 Agendar</button>
          <button class="btn btn-secondary btn-xs" onclick="Chat.irParaProntuario('${pacId}')">📋 Prontuário</button>
        </div>
      </div>
      <div class="chat-messages" id="chat-msgs">
        ${mensagens.map(m => {
          const sent = m.remetente !== pacId;
          return `<div>
            <div class="chat-bubble ${sent ? 'sent' : 'received'}">${m.texto}<div class="chat-bubble-time">${formatTime(m.dataHora)}</div></div>
          </div>`;
        }).join('')}
      </div>
      <div class="chat-input-bar">
        <input class="chat-input" id="chat-input-field" placeholder="Digite sua mensagem..."
          onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();Chat.send('${pacId}')}">
        <button class="btn btn-primary" onclick="Chat.send('${pacId}')">➤ Enviar</button>
      </div>
    `;

    setTimeout(() => {
      const msgs = document.getElementById('chat-msgs');
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
      const inp = document.getElementById('chat-input-field');
      if (inp) inp.focus();
    }, 50);

    document.querySelectorAll('.chat-conversation-item').forEach(el => {
      el.classList.toggle('active', el.onclick && el.getAttribute('onclick') && el.getAttribute('onclick').includes(pacId));
    });
  },

  irParaProntuario(pacId) {
    navigate('historico');
    setTimeout(() => {
      const sel = document.querySelector('select[onchange*="loadPaciente"]');
      if (sel) {
        sel.value = pacId;
        Historico.loadPaciente(pacId);
      }
    }, 200);
  },

  send(pacId) {
    const field = document.getElementById('chat-input-field');
    const texto = field ? field.value.trim() : '';
    if (!texto) return;
    const pac = getData('pacientes').find(p => p.id === pacId);
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

  novaConversa() {
    const pacientes = getData('pacientes');
    showModal('💬 Nova Conversa', `
      <div class="form-group">
        <label>Selecione o paciente</label>
        <select id="nova-conv-pac" style="width:100%;background:var(--bg-card2);border:1px solid var(--border);color:var(--text-primary);padding:10px;border-radius:var(--radius-md);font-family:inherit;outline:none;">
          <option value="">Selecione...</option>
          ${pacientes.map(p => `<option value="${p.id}">${p.nome} — ${p.unidade}</option>`).join('')}
        </select>
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label>Mensagem inicial</label>
        <textarea id="nova-conv-msg" style="width:100%;background:var(--bg-card2);border:1px solid var(--border);color:var(--text-primary);padding:10px;border-radius:var(--radius-md);font-family:inherit;outline:none;min-height:80px;resize:vertical;" placeholder="Olá! Como posso ajudar?"></textarea>
      </div>
    `, () => {
      const pacId = document.getElementById('nova-conv-pac').value;
      const texto = document.getElementById('nova-conv-msg').value.trim();
      if (!pacId || !texto) { showToast('Preencha todos os campos!', 'error'); return; }
      const pac = getData('pacientes').find(p => p.id === pacId);
      addItem('mensagens', {
        id: generateId('MSG'),
        remetente: pac ? pac.unidade : 'UBSF',
        destinatario: pacId,
        texto,
        dataHora: new Date().toISOString(),
        lida: true
      });
      closeModal();
      Chat.activeConv = pacId;
      navigate('chat');
      showToast('Conversa iniciada!', 'success');
    });
  },

  afterRender() {
    if (this.activeConv) this.openConv(this.activeConv);
  }
};
