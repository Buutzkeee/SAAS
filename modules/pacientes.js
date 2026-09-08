// ===================================================
// PACIENTES MODULE
// ===================================================
const Pacientes = {
  _editId: null,

  render() {
    const pacientes = getData('pacientes');
    return `
    <div class="section-header">
      <div>
        <h2>Pacientes</h2>
        <p>Cadastro completo da população adscrita</p>
      </div>
      <button class="btn btn-primary" onclick="Pacientes.openModal()">+ Cadastrar Paciente</button>
    </div>

    <div class="stats-grid" style="grid-template-columns:repeat(4,1fr);">
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-icon blue">👥</div></div>
        <div class="stat-value">${pacientes.length}</div>
        <div class="stat-label">Total Cadastrados</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-icon green">👩</div></div>
        <div class="stat-value">${pacientes.filter(p=>p.sexo==='F').length}</div>
        <div class="stat-label">Feminino</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-icon purple">👨</div></div>
        <div class="stat-value">${pacientes.filter(p=>p.sexo==='M').length}</div>
        <div class="stat-label">Masculino</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-icon orange">🏘️</div></div>
        <div class="stat-value">${pacientes.filter(p=>p.zona==='Rural').length}</div>
        <div class="stat-label">Zona Rural</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>👥 Lista de Pacientes</h3>
        <div style="display:flex;gap:10px;align-items:center;">
          <input type="text" class="search-input" placeholder="🔍 Buscar por nome, CPF ou CNS..." oninput="Pacientes.filter(this.value)" style="width:260px;">
          <select class="filter-select" onchange="Pacientes.filterUnidade(this.value)">
            <option value="">Todas Unidades</option>
            <option>UBSF Centro</option>
            <option>UBSF Cohab</option>
            <option>UBSF Rural</option>
          </select>
        </div>
      </div>
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Nome</th><th>CPF</th><th>CNS</th><th>Idade</th><th>Sexo</th><th>Bairro</th><th>Unidade</th><th>Telefone</th><th>Ações</th></tr></thead>
          <tbody id="pacientes-tbody">${this.renderRows(pacientes)}</tbody>
        </table>
      </div>
    </div>

    <!-- Modal Cadastro / Edição -->
    <div id="modal-paciente" class="modal-overlay" style="display:none;" onclick="if(event.target===this)this.style.display='none'">
      <div class="modal" style="max-width:780px;">
        <div class="modal-header">
          <h3 id="modal-paciente-title">👤 Cadastrar Paciente</h3>
          <div class="modal-close" onclick="document.getElementById('modal-paciente').style.display='none'">✕</div>
        </div>
        <div class="modal-body">
          <div class="alert info">📌 Campos marcados com * são obrigatórios para o prontuário eletrônico.</div>
          <div class="form-grid form-grid-2">
            <div class="form-group" style="grid-column:span 2">
              <label>Nome Completo *</label>
              <input type="text" id="pac-nome" placeholder="Nome completo do paciente">
            </div>
            <div class="form-group">
              <label>CPF *</label>
              <input type="text" id="pac-cpf" placeholder="000.000.000-00">
            </div>
            <div class="form-group">
              <label>CNS (Cartão Nacional de Saúde)</label>
              <input type="text" id="pac-cns" placeholder="700 000 000 000 000">
            </div>
            <div class="form-group">
              <label>Data de Nascimento *</label>
              <input type="date" id="pac-nascimento">
            </div>
            <div class="form-group">
              <label>Sexo *</label>
              <select id="pac-sexo">
                <option value="F">Feminino</option>
                <option value="M">Masculino</option>
              </select>
            </div>
            <div class="form-group">
              <label>Telefone</label>
              <input type="text" id="pac-telefone" placeholder="(83) 99999-9999">
            </div>
            <div class="form-group">
              <label>Zona</label>
              <select id="pac-zona">
                <option value="Urbana">Urbana</option>
                <option value="Rural">Rural</option>
              </select>
            </div>
            <div class="form-group" style="grid-column:span 2">
              <label>Endereço Completo</label>
              <input type="text" id="pac-endereco" placeholder="Rua, número, complemento">
            </div>
            <div class="form-group">
              <label>Bairro / Localidade</label>
              <input type="text" id="pac-bairro" placeholder="Bairro ou sítio">
            </div>
            <div class="form-group">
              <label>Unidade de Saúde</label>
              <select id="pac-unidade">
                <option>UBSF Centro</option>
                <option>UBSF Cohab</option>
                <option>UBSF Rural</option>
              </select>
            </div>
            <div class="form-group">
              <label>Agente Comunitário</label>
              <select id="pac-agente">
                <option value="ACS001">ACS001 — Maria Eduarda</option>
                <option value="ACS002">ACS002 — João Carlos</option>
                <option value="ACS003">ACS003 — Ana Paula</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('modal-paciente').style.display='none'">Cancelar</button>
          <button class="btn btn-primary" onclick="Pacientes.salvar()">💾 Salvar Paciente</button>
        </div>
      </div>
    </div>

    <!-- Modal Detalhes -->
    <div id="modal-pac-detail" class="modal-overlay" style="display:none;" onclick="if(event.target===this)this.style.display='none'">
      <div class="modal" style="max-width:700px;">
        <div class="modal-header">
          <h3 id="pac-detail-title">Prontuário</h3>
          <div class="modal-close" onclick="document.getElementById('modal-pac-detail').style.display='none'">✕</div>
        </div>
        <div class="modal-body" id="pac-detail-body"></div>
      </div>
    </div>
    `;
  },

  renderRows(pacientes) {
    if (!pacientes.length) return `<tr><td colspan="9"><div class="empty-state"><div class="icon">👥</div><p>Nenhum paciente cadastrado</p></div></td></tr>`;
    return pacientes.map(p => {
      const idade = calcIdade(p.dataNasc);
      return `<tr>
        <td class="td-primary">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:30px;height:30px;background:linear-gradient(135deg,var(--primary),var(--accent));border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0;">${p.nome[0]}</div>
            ${p.nome}
          </div>
        </td>
        <td><code style="font-family:'JetBrains Mono';font-size:12px">${p.cpf}</code></td>
        <td><code style="font-family:'JetBrains Mono';font-size:11px;color:var(--text-muted)">${p.cns||'—'}</code></td>
        <td>${idade} anos</td>
        <td>${p.sexo==='F'?'👩 F':'👨 M'}</td>
        <td>${p.bairro}</td>
        <td><span class="badge andamento">${p.unidade}</span></td>
        <td>${p.telefone||'—'}</td>
        <td>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-secondary btn-xs" onclick="Pacientes.ver('${p.id}')" title="Ver Prontuário">👁️</button>
            <button class="btn btn-secondary btn-xs" onclick="Pacientes.editar('${p.id}')" title="Editar Cadastro">✏️</button>
            <button class="btn btn-secondary btn-xs" onclick="navigate('historico',{pacId:'${p.id}'})" title="Histórico Clínico">📋</button>
            <button class="btn btn-danger btn-xs" onclick="Pacientes.deletar('${p.id}')" title="Excluir">🗑️</button>
          </div>
        </td>
      </tr>`;
    }).join('');
  },

  filter(q) {
    const all = getData('pacientes');
    const filtered = q ? all.filter(p =>
      p.nome.toLowerCase().includes(q.toLowerCase()) ||
      p.cpf.includes(q) ||
      (p.cns && p.cns.includes(q))
    ) : all;
    document.getElementById('pacientes-tbody').innerHTML = this.renderRows(filtered);
  },

  filterUnidade(u) {
    const all = getData('pacientes');
    document.getElementById('pacientes-tbody').innerHTML = this.renderRows(u?all.filter(p=>p.unidade===u):all);
  },

  openModal() {
    this._editId = null;
    const titleEl = document.getElementById('modal-paciente-title');
    if (titleEl) titleEl.textContent = '👤 Cadastrar Paciente';
    
    document.getElementById('pac-nome').value = '';
    document.getElementById('pac-cpf').value = '';
    document.getElementById('pac-cns').value = '';
    document.getElementById('pac-nascimento').value = '';
    document.getElementById('pac-sexo').value = 'F';
    document.getElementById('pac-telefone').value = '';
    document.getElementById('pac-zona').value = 'Urbana';
    document.getElementById('pac-endereco').value = '';
    document.getElementById('pac-bairro').value = '';
    document.getElementById('pac-unidade').value = 'UBSF Centro';
    document.getElementById('pac-agente').value = 'ACS001';

    document.getElementById('modal-paciente').style.display = 'flex';
  },

  editar(id) {
    const p = getData('pacientes').find(x => x.id === id);
    if (!p) return;

    this._editId = id;
    const titleEl = document.getElementById('modal-paciente-title');
    if (titleEl) titleEl.textContent = '✏️ Editar Paciente — ' + p.nome;

    document.getElementById('pac-nome').value = p.nome || '';
    document.getElementById('pac-cpf').value = p.cpf || '';
    document.getElementById('pac-cns').value = p.cns || '';
    document.getElementById('pac-nascimento').value = p.dataNasc || '';
    document.getElementById('pac-sexo').value = p.sexo || 'F';
    document.getElementById('pac-telefone').value = p.telefone || '';
    document.getElementById('pac-zona').value = p.zona || 'Urbana';
    document.getElementById('pac-endereco').value = p.endereco || '';
    document.getElementById('pac-bairro').value = p.bairro || '';
    document.getElementById('pac-unidade').value = p.unidade || 'UBSF Centro';
    document.getElementById('pac-agente').value = p.agente || 'ACS001';

    document.getElementById('modal-paciente').style.display = 'flex';
  },

  salvar() {
    const nome = document.getElementById('pac-nome').value?.trim();
    const cpf = document.getElementById('pac-cpf').value?.trim();
    const nasc = document.getElementById('pac-nascimento').value;
    const sexo = document.getElementById('pac-sexo').value;
    if (!nome || !cpf || !nasc) {
      showToast('Preencha os campos obrigatórios!', 'error');
      return;
    }

    const payload = {
      nome,
      cpf,
      cns: document.getElementById('pac-cns').value?.trim() || '',
      dataNasc: nasc,
      sexo,
      telefone: document.getElementById('pac-telefone').value?.trim() || '',
      endereco: document.getElementById('pac-endereco').value?.trim() || '',
      bairro: document.getElementById('pac-bairro').value?.trim() || '',
      zona: document.getElementById('pac-zona').value || 'Urbana',
      unidade: document.getElementById('pac-unidade').value || 'UBSF Centro',
      agente: document.getElementById('pac-agente').value || 'ACS001',
    };

    if (this._editId) {
      updateItem('pacientes', this._editId, payload);
      showToast('Paciente atualizado com sucesso!', 'success');
      this._editId = null;
    } else {
      addItem('pacientes', {
        id: generateId('P'),
        ...payload,
        foto: null
      });
      showToast('Paciente cadastrado com sucesso!', 'success');
    }

    document.getElementById('modal-paciente').style.display = 'none';
    document.getElementById('pacientes-tbody').innerHTML = this.renderRows(getData('pacientes'));
  },

  ver(id) {
    const p = getData('pacientes').find(x=>x.id===id);
    if (!p) return;
    const historicos = getData('historico').filter(h=>h.pacienteId===id);
    const vacinas = getData('vacinas').filter(v=>v.pacienteId===id);
    const exames = getData('exames').filter(e=>e.pacienteId===id);
    const agendamentos = getData('agendamentos').filter(a=>a.pacienteId===id);
    document.getElementById('pac-detail-title').textContent = p.nome;
    document.getElementById('pac-detail-body').innerHTML = `
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;padding:16px;background:var(--bg-card2);border-radius:var(--radius-md);border:1px solid var(--border);">
        <div style="width:60px;height:60px;background:linear-gradient(135deg,var(--primary),var(--accent));border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:#fff;">${p.nome[0]}</div>
        <div>
          <div style="font-size:18px;font-weight:800;color:var(--text-primary)">${p.nome}</div>
          <div style="font-size:12px;color:var(--text-muted)">CNS: ${p.cns||'—'} · CPF: ${p.cpf}</div>
          <div style="display:flex;gap:6px;margin-top:6px;">
            <span class="badge andamento">${p.unidade}</span>
            <span class="badge ${p.zona==='Rural'?'aguardando':'confirmado'}">${p.zona}</span>
          </div>
        </div>
      </div>
      <div class="info-grid" style="margin-bottom:20px;">
        <div class="info-item"><div class="info-label">Idade</div><div class="info-value">${calcIdade(p.dataNasc)} anos</div></div>
        <div class="info-item"><div class="info-label">Nascimento</div><div class="info-value">${formatDate(p.dataNasc)}</div></div>
        <div class="info-item"><div class="info-label">Sexo</div><div class="info-value">${p.sexo==='F'?'Feminino':'Masculino'}</div></div>
        <div class="info-item"><div class="info-label">Telefone</div><div class="info-value">${p.telefone||'—'}</div></div>
        <div class="info-item" style="grid-column:span 2"><div class="info-label">Endereço</div><div class="info-value">${p.endereco||'—'}, ${p.bairro}</div></div>
        <div class="info-item"><div class="info-label">Agente</div><div class="info-value">${p.agente}</div></div>
      </div>
      <div class="stats-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:12px;">
        <div class="stat-card"><div class="stat-value" style="font-size:24px">${historicos.length}</div><div class="stat-label">Consultas</div></div>
        <div class="stat-card"><div class="stat-value" style="font-size:24px">${vacinas.length}</div><div class="stat-label">Vacinas</div></div>
        <div class="stat-card"><div class="stat-value" style="font-size:24px">${exames.length}</div><div class="stat-label">Exames</div></div>
        <div class="stat-card"><div class="stat-value" style="font-size:24px">${agendamentos.length}</div><div class="stat-label">Agendamentos</div></div>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px;">
        <button class="btn btn-secondary btn-sm" onclick="Pacientes.editar('${p.id}'); document.getElementById('modal-pac-detail').style.display='none';">✏️ Editar Dados</button>
        <button class="btn btn-primary btn-sm" onclick="document.getElementById('modal-pac-detail').style.display='none'; navigate('historico',{pacId:'${p.id}'})">📋 Abrir Prontuário</button>
      </div>
    `;
    document.getElementById('modal-pac-detail').style.display = 'flex';
  },

  deletar(id) {
    showModal('Confirmar Exclusão', '<p>Deseja remover este paciente do cadastro municipal? Esta ação não pode ser desfeita.</p>', () => {
      deleteItem('pacientes', id);
      closeModal();
      document.getElementById('pacientes-tbody').innerHTML = this.renderRows(getData('pacientes'));
      showToast('Paciente removido com sucesso.', 'info');
    });
  },

  afterRender() {}
};
