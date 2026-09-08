// ===================================================
// EXAMES MODULE
// ===================================================
const Exames = {
  render() {
    const exames = getData('exames');
    return `
    <div class="section-header">
      <div>
        <h2>Exames</h2>
        <p>Solicitação e resultado de exames laboratoriais e de imagem</p>
      </div>
      <button class="btn btn-primary" onclick="Exames.openModal()">+ Solicitar Exame</button>
    </div>

    <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);">
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-icon blue">🔬</div></div>
        <div class="stat-value">${exames.length}</div>
        <div class="stat-label">Total de Exames</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-icon green">✅</div></div>
        <div class="stat-value">${exames.filter(e=>e.status==='Resultado Disponível').length}</div>
        <div class="stat-label">Com Resultado</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-icon orange">⏳</div></div>
        <div class="stat-value">${exames.filter(e=>e.status==='Aguardando').length}</div>
        <div class="stat-label">Aguardando Resultado</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>🔬 Lista de Exames</h3>
        <div style="display:flex;gap:10px;">
          <input type="text" class="search-input" placeholder="🔍 Buscar..." oninput="Exames.filter(this.value)" style="width:200px;">
          <select class="filter-select" onchange="Exames.filterStatus(this.value)">
            <option value="">Todos</option>
            <option value="Aguardando">Aguardando</option>
            <option value="Resultado Disponível">Com Resultado</option>
          </select>
        </div>
      </div>
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Paciente</th><th>Exame</th><th>Solicitado em</th><th>Profissional</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody id="exames-tbody">${this.renderRows(exames)}</tbody>
        </table>
      </div>
    </div>

    <!-- Modal Solicitar Exame -->
    <div id="modal-exame" class="modal-overlay" style="display:none;" onclick="if(event.target===this)this.style.display='none'">
      <div class="modal">
        <div class="modal-header">
          <h3>🔬 Solicitar Exame</h3>
          <div class="modal-close" onclick="document.getElementById('modal-exame').style.display='none'">✕</div>
        </div>
        <div class="modal-body">
          <div class="form-grid form-grid-2">
            <div class="form-group">
              <label>Paciente *</label>
              <select id="ex-paciente">
                <option value="">Selecione...</option>
                ${getData('pacientes').map(p=>`<option value="${p.id}">${p.nome}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Profissional Solicitante *</label>
              <select id="ex-profissional">
                ${getData('profissionais').map(p=>`<option value="${p.id}">${p.nome}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Tipo de Exame *</label>
              <select id="ex-tipo">
                <option>Hemograma Completo</option>
                <option>Glicemia em Jejum</option>
                <option>Hemoglobina Glicada (HbA1c)</option>
                <option>Colesterol Total e Frações</option>
                <option>Triglicerídeos</option>
                <option>Ureia e Creatinina</option>
                <option>Urina Tipo I (EAS)</option>
                <option>TSH / T4 Livre</option>
                <option>ECG</option>
                <option>Ultrassonografia Abdominal</option>
                <option>Ultrassonografia Obstétrica</option>
                <option>Raio-X Tórax</option>
                <option>Mamografia</option>
                <option>Papanicolau</option>
                <option>PSA Total</option>
                <option>Teste Rápido HIV</option>
                <option>Teste Rápido Sífilis</option>
                <option>Teste Rápido Hepatite B/C</option>
                <option>Cultura de Urina</option>
                <option>Parasitológico de Fezes</option>
              </select>
            </div>
            <div class="form-group">
              <label>Data de Solicitação *</label>
              <input type="date" id="ex-data" value="${new Date().toISOString().slice(0,10)}">
            </div>
            <div class="form-group" style="grid-column:span 2">
              <label>Observações / Indicação Clínica</label>
              <textarea id="ex-obs" placeholder="Indicação clínica para o exame..."></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('modal-exame').style.display='none'">Cancelar</button>
          <button class="btn btn-primary" onclick="Exames.salvar()">🔬 Solicitar Exame</button>
        </div>
      </div>
    </div>

    <!-- Modal Resultado -->
    <div id="modal-resultado" class="modal-overlay" style="display:none;" onclick="if(event.target===this)this.style.display='none'">
      <div class="modal">
        <div class="modal-header">
          <h3>📊 Registrar Resultado</h3>
          <div class="modal-close" onclick="document.getElementById('modal-resultado').style.display='none'">✕</div>
        </div>
        <div class="modal-body">
          <input type="hidden" id="resultado-id">
          <div class="form-grid">
            <div class="form-group">
              <label>Resultado *</label>
              <textarea id="resultado-texto" rows="6" placeholder="Digite o resultado do exame..."></textarea>
            </div>
            <div class="form-group">
              <label>Observações do Médico</label>
              <textarea id="resultado-obs" rows="3" placeholder="Interpretação e observações clínicas..."></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('modal-resultado').style.display='none'">Cancelar</button>
          <button class="btn btn-success" onclick="Exames.salvarResultado()">✅ Salvar Resultado</button>
        </div>
      </div>
    </div>
    `;
  },

  renderRows(exames) {
    if (!exames.length) return `<tr><td colspan="6"><div class="empty-state"><div class="icon">🔬</div><p>Nenhum exame solicitado</p></div></td></tr>`;
    return exames.map(e => {
      const pac = getData('pacientes').find(p=>p.id===e.pacienteId);
      const pro = getData('profissionais').find(p=>p.id===e.profissionalId);
      return `<tr>
        <td class="td-primary">${pac?pac.nome:'—'}</td>
        <td>${e.tipo}</td>
        <td>${formatDate(e.data)}</td>
        <td>${pro?pro.nome.split(' ').slice(0,2).join(' '):'—'}</td>
        <td>${getBadge(e.status==='Resultado Disponível'?'disponivel':e.status==='Aguardando'?'aguardando':'andamento', e.status)}</td>
        <td>
          <div style="display:flex;gap:6px;">
            ${e.status==='Aguardando'?`<button class="btn btn-success btn-xs" onclick="Exames.openResultado('${e.id}')">📊 Resultado</button>`:`<button class="btn btn-secondary btn-xs" onclick="Exames.verResultado('${e.id}')">👁️ Ver</button>`}
            <button class="btn btn-danger btn-xs" onclick="Exames.deletar('${e.id}')">🗑️</button>
          </div>
        </td>
      </tr>`;
    }).join('');
  },

  filter(q) {
    const all = getData('exames');
    const filtered = q ? all.filter(e => {
      const pac = getData('pacientes').find(p=>p.id===e.pacienteId);
      return (pac&&pac.nome.toLowerCase().includes(q.toLowerCase())) || e.tipo.toLowerCase().includes(q.toLowerCase());
    }) : all;
    document.getElementById('exames-tbody').innerHTML = this.renderRows(filtered);
  },

  filterStatus(s) {
    const all = getData('exames');
    document.getElementById('exames-tbody').innerHTML = this.renderRows(s?all.filter(e=>e.status===s):all);
  },

  openModal() { document.getElementById('modal-exame').style.display = 'flex'; },

  salvar() {
    const pac = document.getElementById('ex-paciente').value;
    const data = document.getElementById('ex-data').value;
    if (!pac || !data) { showToast('Preencha os campos obrigatórios!', 'error'); return; }
    addItem('exames', {
      id: generateId('EX'),
      pacienteId: pac,
      profissionalId: document.getElementById('ex-profissional').value,
      tipo: document.getElementById('ex-tipo').value,
      data,
      status: 'Aguardando',
      resultado: '',
      observacao: document.getElementById('ex-obs').value,
    });
    document.getElementById('modal-exame').style.display = 'none';
    showToast('Exame solicitado!', 'success');
    document.getElementById('exames-tbody').innerHTML = this.renderRows(getData('exames'));
  },

  openResultado(id) {
    document.getElementById('resultado-id').value = id;
    document.getElementById('resultado-texto').value = '';
    document.getElementById('resultado-obs').value = '';
    document.getElementById('modal-resultado').style.display = 'flex';
  },

  salvarResultado() {
    const id = document.getElementById('resultado-id').value;
    const resultado = document.getElementById('resultado-texto').value;
    if (!resultado) { showToast('Digite o resultado!', 'error'); return; }
    updateItem('exames', id, { status: 'Resultado Disponível', resultado, observacao: document.getElementById('resultado-obs').value });
    document.getElementById('modal-resultado').style.display = 'none';
    showToast('Resultado registrado!', 'success');
    document.getElementById('exames-tbody').innerHTML = this.renderRows(getData('exames'));
  },

  verResultado(id) {
    const ex = getData('exames').find(e=>e.id===id);
    if (!ex) return;
    const pac = getData('pacientes').find(p=>p.id===ex.pacienteId);
    showModal(`📊 Resultado — ${ex.tipo}`,
      `<div style="margin-bottom:12px;"><div style="font-size:12px;color:var(--text-muted)">Paciente</div><div style="font-size:15px;font-weight:600;color:var(--text-primary)">${pac?pac.nome:'—'}</div></div>
       <div style="padding:16px;background:var(--bg-card2);border-radius:8px;border:1px solid var(--border);margin-bottom:12px;">
         <pre style="font-family:'JetBrains Mono';font-size:12px;color:var(--text-secondary);white-space:pre-wrap">${ex.resultado}</pre>
       </div>
       ${ex.observacao?`<div style="padding:12px;background:rgba(0,180,216,0.06);border-radius:8px;border-left:3px solid var(--primary)"><div style="font-size:11px;color:var(--primary);font-weight:700">OBSERVAÇÕES MÉDICAS</div><div style="font-size:13px;color:var(--text-secondary);margin-top:4px">${ex.observacao}</div></div>`:''}`
    );
  },

  deletar(id) {
    if (confirm('Remover este exame?')) {
      deleteItem('exames', id);
      document.getElementById('exames-tbody').innerHTML = this.renderRows(getData('exames'));
      showToast('Exame removido.', 'info');
    }
  },

  afterRender() {}
};

// ===================================================
// PROCEDIMENTOS MODULE
// ===================================================
const Procedimentos = {
  render() {
    const procs = getData('procedimentos');
    return `
    <div class="section-header">
      <div>
        <h2>Procedimentos</h2>
        <p>Registro de procedimentos realizados na unidade de saúde</p>
      </div>
      <button class="btn btn-primary" onclick="Procedimentos.openModal()">+ Novo Procedimento</button>
    </div>

    <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);">
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-icon blue">🩺</div></div>
        <div class="stat-value">${procs.length}</div>
        <div class="stat-label">Procedimentos Realizados</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-icon green">👥</div></div>
        <div class="stat-value">${[...new Set(procs.map(p=>p.pacienteId))].length}</div>
        <div class="stat-label">Pacientes Atendidos</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-icon purple">📅</div></div>
        <div class="stat-value">${procs.filter(p=>p.data===new Date().toISOString().slice(0,10)).length}</div>
        <div class="stat-label">Hoje</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>🩺 Procedimentos</h3>
        <input type="text" class="search-input" placeholder="🔍 Buscar..." oninput="Procedimentos.filter(this.value)" style="width:200px;">
      </div>
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Paciente</th><th>Procedimento</th><th>Descrição</th><th>Data</th><th>Profissional</th><th>Ações</th></tr></thead>
          <tbody id="procs-tbody">${this.renderRows(procs)}</tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div id="modal-proc" class="modal-overlay" style="display:none;" onclick="if(event.target===this)this.style.display='none'">
      <div class="modal">
        <div class="modal-header">
          <h3>🩺 Novo Procedimento</h3>
          <div class="modal-close" onclick="document.getElementById('modal-proc').style.display='none'">✕</div>
        </div>
        <div class="modal-body">
          <div class="form-grid form-grid-2">
            <div class="form-group">
              <label>Paciente *</label>
              <select id="proc-paciente">
                <option value="">Selecione...</option>
                ${getData('pacientes').map(p=>`<option value="${p.id}">${p.nome}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Profissional *</label>
              <select id="proc-profissional">
                ${getData('profissionais').map(p=>`<option value="${p.id}">${p.nome}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Tipo de Procedimento *</label>
              <select id="proc-tipo">
                <option>Curativo Simples</option>
                <option>Curativo Complexo</option>
                <option>Inalação / Nebulização</option>
                <option>Injeção IM</option>
                <option>Injeção SC</option>
                <option>Punção Venosa</option>
                <option>Sondagem Vesical</option>
                <option>Aferição de PA</option>
                <option>Eletrocardiograma</option>
                <option>Teste do Pezinho</option>
                <option>Teste da Orelhinha</option>
                <option>Coleta de Material</option>
                <option>Suturas</option>
                <option>Retirada de Pontos</option>
                <option>Orientação Nutricional</option>
                <option>Outro</option>
              </select>
            </div>
            <div class="form-group">
              <label>Data *</label>
              <input type="date" id="proc-data" value="${new Date().toISOString().slice(0,10)}">
            </div>
            <div class="form-group" style="grid-column:span 2">
              <label>Descrição Detalhada</label>
              <textarea id="proc-desc" rows="3" placeholder="Descreva o procedimento realizado..."></textarea>
            </div>
            <div class="form-group">
              <label>Material Utilizado</label>
              <textarea id="proc-material" rows="2" placeholder="Liste os materiais usados..."></textarea>
            </div>
            <div class="form-group">
              <label>Observações</label>
              <textarea id="proc-obs" rows="2" placeholder="Observações pós-procedimento..."></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('modal-proc').style.display='none'">Cancelar</button>
          <button class="btn btn-primary" onclick="Procedimentos.salvar()">💾 Registrar</button>
        </div>
      </div>
    </div>
    `;
  },

  renderRows(procs) {
    if (!procs.length) return `<tr><td colspan="6"><div class="empty-state"><div class="icon">🩺</div><p>Nenhum procedimento registrado</p></div></td></tr>`;
    return procs.map(p => {
      const pac = getData('pacientes').find(x=>x.id===p.pacienteId);
      const pro = getData('profissionais').find(x=>x.id===p.profissionalId);
      return `<tr>
        <td class="td-primary">${pac?pac.nome:'—'}</td>
        <td><span class="badge andamento">${p.procedimento}</span></td>
        <td style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.descricao||'—'}</td>
        <td>${formatDate(p.data)}</td>
        <td>${pro?pro.nome.split(' ').slice(0,2).join(' '):'—'}</td>
        <td>
          <button class="btn btn-secondary btn-xs" onclick="Procedimentos.ver('${p.id}')">👁️ Ver</button>
          <button class="btn btn-danger btn-xs" onclick="Procedimentos.deletar('${p.id}')">🗑️</button>
        </td>
      </tr>`;
    }).join('');
  },

  filter(q) {
    const all = getData('procedimentos');
    const filtered = q ? all.filter(p => {
      const pac = getData('pacientes').find(x=>x.id===p.pacienteId);
      return (pac&&pac.nome.toLowerCase().includes(q.toLowerCase())) || p.procedimento.toLowerCase().includes(q.toLowerCase());
    }) : all;
    document.getElementById('procs-tbody').innerHTML = this.renderRows(filtered);
  },

  openModal() { document.getElementById('modal-proc').style.display = 'flex'; },

  salvar() {
    const pac = document.getElementById('proc-paciente').value;
    const data = document.getElementById('proc-data').value;
    if (!pac || !data) { showToast('Preencha os campos obrigatórios!', 'error'); return; }
    addItem('procedimentos', {
      id: generateId('PROC'),
      pacienteId: pac,
      profissionalId: document.getElementById('proc-profissional').value,
      procedimento: document.getElementById('proc-tipo').value,
      data,
      descricao: document.getElementById('proc-desc').value,
      material: document.getElementById('proc-material').value,
      observacao: document.getElementById('proc-obs').value,
    });
    document.getElementById('modal-proc').style.display = 'none';
    showToast('Procedimento registrado!', 'success');
    document.getElementById('procs-tbody').innerHTML = this.renderRows(getData('procedimentos'));
  },

  ver(id) {
    const p = getData('procedimentos').find(x=>x.id===id);
    if (!p) return;
    const pac = getData('pacientes').find(x=>x.id===p.pacienteId);
    const pro = getData('profissionais').find(x=>x.id===p.profissionalId);
    showModal(`🩺 ${p.procedimento}`, `
      <div class="info-grid" style="grid-template-columns:1fr 1fr;gap:12px;">
        <div class="info-item"><div class="info-label">Paciente</div><div class="info-value">${pac?pac.nome:'—'}</div></div>
        <div class="info-item"><div class="info-label">Data</div><div class="info-value">${formatDate(p.data)}</div></div>
        <div class="info-item"><div class="info-label">Profissional</div><div class="info-value">${pro?pro.nome:'—'}</div></div>
        <div class="info-item"><div class="info-label">Procedimento</div><div class="info-value">${p.procedimento}</div></div>
        ${p.descricao?`<div class="info-item" style="grid-column:span 2"><div class="info-label">Descrição</div><div class="info-value">${p.descricao}</div></div>`:''}
        ${p.material?`<div class="info-item" style="grid-column:span 2"><div class="info-label">Material</div><div class="info-value">${p.material}</div></div>`:''}
        ${p.observacao?`<div class="info-item" style="grid-column:span 2"><div class="info-label">Observações</div><div class="info-value">${p.observacao}</div></div>`:''}
      </div>
    `);
  },

  deletar(id) {
    if (confirm('Remover este registro?')) {
      deleteItem('procedimentos', id);
      document.getElementById('procs-tbody').innerHTML = this.renderRows(getData('procedimentos'));
      showToast('Removido.', 'info');
    }
  },

  afterRender() {}
};
