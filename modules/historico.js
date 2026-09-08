// ===================================================
// HISTÓRICO CLÍNICO MODULE
// ===================================================
const Historico = {
  render() {
    return `
    <div class="section-header">
      <div>
        <h2>Histórico Clínico</h2>
        <p>Prontuário eletrônico e registros de atendimento</p>
      </div>
      <button class="btn btn-primary" onclick="Historico.openModal()">+ Novo Registro</button>
    </div>

    <div class="action-row" style="margin-bottom:24px;">
      <div style="position:relative">
        <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted)">🔍</span>
        <select class="filter-select" style="padding-left:34px;min-width:280px;" onchange="Historico.loadPaciente(this.value)">
          <option value="">Selecione um paciente para ver o prontuário</option>
          ${getData('pacientes').map(p=>`<option value="${p.id}">${p.nome} — CPF: ${p.cpf}</option>`).join('')}
        </select>
      </div>
      <div class="spacer"></div>
      <select class="filter-select" onchange="Historico.filterTipo(this.value)">
        <option value="">Todos os tipos</option>
        <option>Consulta</option>
        <option>Pré-natal</option>
        <option>Urgência</option>
        <option>Preventivo</option>
      </select>
    </div>

    <div id="paciente-banner" style="display:none;margin-bottom:20px;"></div>

    <div id="prontuario-container">
      <div class="empty-state" style="padding:60px">
        <div class="icon">📋</div>
        <h3>Selecione um paciente</h3>
        <p>para visualizar o prontuário eletrônico</p>
      </div>
    </div>

    <!-- Modal Novo Registro -->
    <div id="modal-historico" class="modal-overlay" style="display:none;" onclick="if(event.target===this)this.style.display='none'">
      <div class="modal" style="max-width:780px;">
        <div class="modal-header">
          <h3>📋 Novo Registro Clínico</h3>
          <div class="modal-close" onclick="document.getElementById('modal-historico').style.display='none'">✕</div>
        </div>
        <div class="modal-body">
          <div class="form-grid form-grid-2">
            <div class="form-group">
              <label>Paciente *</label>
              <select id="hc-paciente">
                <option value="">Selecione...</option>
                ${getData('pacientes').map(p=>`<option value="${p.id}">${p.nome}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Profissional *</label>
              <select id="hc-profissional">
                ${getData('profissionais').map(p=>`<option value="${p.id}">${p.nome}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Data *</label>
              <input type="date" id="hc-data" value="${new Date().toISOString().slice(0,10)}">
            </div>
            <div class="form-group">
              <label>Tipo de Atendimento</label>
              <select id="hc-tipo">
                <option>Consulta</option>
                <option>Retorno</option>
                <option>Pré-natal</option>
                <option>Urgência</option>
                <option>Preventivo</option>
                <option>Odontológico</option>
                <option>Saúde Mental</option>
              </select>
            </div>
            <div class="form-group" style="grid-column:span 2">
              <label>Queixa Principal</label>
              <input type="text" id="hc-queixa" placeholder="Descreva a queixa principal do paciente...">
            </div>
            <div class="form-group" style="grid-column:span 2">
              <label>Anamnese / Histórico</label>
              <textarea id="hc-anamnese" rows="4" placeholder="Dados da anamnese, sinais vitais, evolução..."></textarea>
            </div>
            <div class="form-group">
              <label>Diagnóstico (CID)</label>
              <input type="text" id="hc-diag" placeholder="Ex: Hipertensão Arterial Sistêmica">
            </div>
            <div class="form-group">
              <label>CID-10</label>
              <input type="text" id="hc-cid" placeholder="Ex: I10">
            </div>
            <div class="form-group" style="grid-column:span 2">
              <label>Conduta / Plano Terapêutico</label>
              <textarea id="hc-conduta" rows="3" placeholder="Condutas adotadas, encaminhamentos, orientações..."></textarea>
            </div>
            <div class="form-group" style="grid-column:span 2">
              <label>Prescrição Médica</label>
              <textarea id="hc-prescricao" rows="4" placeholder="Medicamentos prescritos, dosagem e posologia..."></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('modal-historico').style.display='none'">Cancelar</button>
          <button class="btn btn-primary" onclick="Historico.salvar()">💾 Salvar Registro</button>
        </div>
      </div>
    </div>
    `;
  },

  loadPaciente(pacId) {
    const banner = document.getElementById('paciente-banner');
    const container = document.getElementById('prontuario-container');
    if (!pacId) {
      banner.style.display = 'none';
      container.innerHTML = '<div class="empty-state" style="padding:60px"><div class="icon">📋</div><h3>Selecione um paciente</h3></div>';
      return;
    }
    const pac = getData('pacientes').find(p=>p.id===pacId);
    const historicos = getData('historico').filter(h=>h.pacienteId===pacId);
    const vacinas = getData('vacinas').filter(v=>v.pacienteId===pacId);
    const exames = getData('exames').filter(e=>e.pacienteId===pacId);
    const idade = pac ? calcIdade(pac.dataNasc) : 0;

    banner.style.display = 'block';
    banner.innerHTML = `
      <div class="card" style="border-color:var(--primary-glow);">
        <div class="card-body">
          <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
            <div style="width:56px;height:56px;background:linear-gradient(135deg,var(--primary),var(--accent));border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#fff;flex-shrink:0;">
              ${pac?pac.nome[0]:'?'}
            </div>
            <div style="flex:1;">
              <div style="font-size:18px;font-weight:800;color:var(--text-primary)">${pac?pac.nome:'—'}</div>
              <div style="font-size:13px;color:var(--text-muted);margin-top:2px">CNS: ${pac?pac.cns:'—'} · CPF: ${pac?pac.cpf:'—'}</div>
            </div>
            <div class="info-grid" style="grid-template-columns:repeat(4,1fr);gap:16px;">
              <div class="info-item"><div class="info-label">Idade</div><div class="info-value">${idade} anos</div></div>
              <div class="info-item"><div class="info-label">Sexo</div><div class="info-value">${pac?pac.sexo==='F'?'Feminino':'Masculino':'—'}</div></div>
              <div class="info-item"><div class="info-label">Unidade</div><div class="info-value">${pac?pac.unidade:'—'}</div></div>
              <div class="info-item"><div class="info-label">Telefone</div><div class="info-value">${pac?pac.telefone:'—'}</div></div>
            </div>
            <div style="display:flex;gap:8px;flex-shrink:0;">
              <span class="badge andamento">💉 ${vacinas.length} vacinas</span>
              <span class="badge disponivel">🔬 ${exames.length} exames</span>
              <span class="badge confirmado">📋 ${historicos.length} consultas</span>
            </div>
          </div>
        </div>
      </div>
    `;

    if (!historicos.length) {
      container.innerHTML = '<div class="empty-state" style="padding:40px"><div class="icon">📭</div><h3>Nenhum registro clínico</h3><p>Clique em "+ Novo Registro" para adicionar</p></div>';
      return;
    }

    container.innerHTML = `
      <div class="timeline">
        ${[...historicos].reverse().map(h => {
          const pro = getData('profissionais').find(p=>p.id===h.profissionalId);
          return `
          <div class="timeline-item">
            <div class="timeline-line">
              <div class="timeline-dot"></div>
              <div class="timeline-connector"></div>
            </div>
            <div class="timeline-content">
              <div class="timeline-meta">
                <span class="timeline-date">📅 ${formatDate(h.data)}</span>
                <span class="timeline-type">${h.tipo}</span>
                <span style="font-size:11px;color:var(--text-muted)">👨‍⚕️ ${pro?pro.nome:'—'}</span>
                ${h.cid?`<span class="badge andamento">CID: ${h.cid}</span>`:''}
              </div>
              ${h.queixa?`<div style="margin-bottom:10px;"><span style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Queixa:</span><div style="font-size:13.5px;color:var(--text-primary);margin-top:3px">${h.queixa}</div></div>`:''}
              ${h.anamnese?`<div style="margin-bottom:10px;"><span style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Anamnese:</span><div style="font-size:13px;color:var(--text-secondary);margin-top:3px;white-space:pre-line">${h.anamnese}</div></div>`:''}
              ${h.diagnostico?`<div style="margin-bottom:10px;padding:10px;background:rgba(0,180,216,0.06);border-radius:8px;border-left:3px solid var(--primary)"><span style="font-size:11px;color:var(--primary);font-weight:700">DIAGNÓSTICO:</span><div style="font-size:13.5px;color:var(--text-primary);font-weight:600;margin-top:3px">${h.diagnostico}</div></div>`:''}
              ${h.conduta?`<div style="margin-bottom:10px;"><span style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Conduta:</span><div style="font-size:13px;color:var(--text-secondary);margin-top:3px;white-space:pre-line">${h.conduta}</div></div>`:''}
              ${h.prescricao?`<div style="padding:10px;background:rgba(6,214,160,0.05);border-radius:8px;border-left:3px solid var(--secondary)"><span style="font-size:11px;color:var(--secondary);font-weight:700">💊 PRESCRIÇÃO:</span><pre style="font-family:'JetBrains Mono';font-size:12px;color:var(--text-secondary);margin-top:6px;white-space:pre-wrap">${h.prescricao}</pre></div>`:''}
            </div>
          </div>`;
        }).join('')}
      </div>
    `;
  },

  filterTipo(tipo) {
    // reload with filter
  },

  openModal() { document.getElementById('modal-historico').style.display = 'flex'; },

  salvar() {
    const pac = document.getElementById('hc-paciente').value;
    const pro = document.getElementById('hc-profissional').value;
    const data = document.getElementById('hc-data').value;
    if (!pac || !data) { showToast('Preencha os campos obrigatórios!', 'error'); return; }
    addItem('historico', {
      id: generateId('HC'),
      pacienteId: pac,
      profissionalId: pro,
      data,
      tipo: document.getElementById('hc-tipo').value,
      queixa: document.getElementById('hc-queixa').value,
      anamnese: document.getElementById('hc-anamnese').value,
      diagnostico: document.getElementById('hc-diag').value,
      cid: document.getElementById('hc-cid').value,
      conduta: document.getElementById('hc-conduta').value,
      prescricao: document.getElementById('hc-prescricao').value,
    });
    document.getElementById('modal-historico').style.display = 'none';
    showToast('Registro clínico salvo!', 'success');
    this.loadPaciente(pac);
  },

  afterRender() {}
};
