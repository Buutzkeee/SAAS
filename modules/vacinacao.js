// ===================================================
// VACINAÇÃO MODULE
// ===================================================
const Vacinacao = {
  render() {
    const vacinas = getData('vacinas');
    const campanhas = getData('campanhas');

    return `
    <div class="section-header">
      <div>
        <h2>Vacinação</h2>
        <p>Carteira de vacinação, doses aplicadas e campanhas</p>
      </div>
      <button class="btn btn-primary" onclick="Vacinacao.openModal()">+ Registrar Dose</button>
    </div>

    <div class="stats-grid" style="grid-template-columns:repeat(4,1fr);">
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-icon green">💉</div></div>
        <div class="stat-value">${vacinas.length}</div>
        <div class="stat-label">Total de Doses</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-icon blue">📋</div></div>
        <div class="stat-value">${[...new Set(vacinas.map(v=>v.pacienteId))].length}</div>
        <div class="stat-label">Pacientes Vacinados</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-icon purple">🏥</div></div>
        <div class="stat-value">${campanhas.filter(c=>c.status==='Em andamento').length}</div>
        <div class="stat-label">Campanhas Ativas</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-icon orange">🌡️</div></div>
        <div class="stat-value">${[...new Set(vacinas.map(v=>v.vacina))].length}</div>
        <div class="stat-label">Tipos de Vacina</div>
      </div>
    </div>

    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab(this,'tab-doses')">💉 Doses Aplicadas</button>
      <button class="tab-btn" onclick="switchTab(this,'tab-campanhas')">📢 Campanhas</button>
      <button class="tab-btn" onclick="switchTab(this,'tab-carteira')">📋 Por Paciente</button>
    </div>

    <div id="tab-doses" class="tab-panel active">
      <div class="card">
        <div class="card-header">
          <h3>Histórico de Doses</h3>
          <input type="text" class="search-input" placeholder="🔍 Buscar..." oninput="Vacinacao.filterDoses(this.value)">
        </div>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>Paciente</th><th>Vacina</th><th>Dose</th><th>Data</th><th>Lote</th><th>Fabricante</th><th>Local</th><th>Profissional</th></tr></thead>
            <tbody id="doses-tbody">
              ${this.renderDosesRows(vacinas)}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div id="tab-campanhas" class="tab-panel">
      <div class="grid-auto">
        ${campanhas.map(c => `
          <div class="card">
            <div class="card-header">
              <h3>${c.nome}</h3>
              <span class="badge ${c.status==='Em andamento'?'andamento':'encerrada'}">${c.status}</span>
            </div>
            <div class="card-body">
              <div class="info-grid" style="grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">
                <div class="info-item"><div class="info-label">Início</div><div class="info-value">${formatDate(c.inicio)}</div></div>
                <div class="info-item"><div class="info-label">Fim</div><div class="info-value">${formatDate(c.fim)}</div></div>
                <div class="info-item" style="grid-column:span 2"><div class="info-label">Público-alvo</div><div class="info-value">${c.publico}</div></div>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-bottom:6px;">
                <span><strong style="color:var(--secondary)">${c.aplicadas}</strong> aplicadas</span>
                <span>Meta: <strong style="color:var(--text-primary)">${c.meta}</strong></span>
              </div>
              <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(100,(c.aplicadas/c.meta*100)).toFixed(0)}%"></div></div>
              <div style="text-align:right;font-size:11px;color:var(--text-muted);margin-top:4px;">${(c.aplicadas/c.meta*100).toFixed(1)}% da meta</div>
            </div>
          </div>
        `).join('')}
        <div class="card" style="border-style:dashed;cursor:pointer;display:flex;align-items:center;justify-content:center;min-height:200px;" onclick="Vacinacao.novaCampanha()">
          <div class="empty-state" style="padding:20px">
            <div class="icon">➕</div>
            <h3>Nova Campanha</h3>
          </div>
        </div>
      </div>
    </div>

    <div id="tab-carteira" class="tab-panel">
      <div class="action-row">
        <select class="filter-select" onchange="Vacinacao.filterPaciente(this.value)">
          <option value="">Selecione um paciente</option>
          ${getData('pacientes').map(p=>`<option value="${p.id}">${p.nome}</option>`).join('')}
        </select>
      </div>
      <div id="carteira-container">
        <div class="empty-state"><div class="icon">💉</div><h3>Selecione um paciente</h3><p>para ver a carteira de vacinação</p></div>
      </div>
    </div>

    <!-- Modal Registrar Dose -->
    <div id="modal-vacina" class="modal-overlay" style="display:none;" onclick="if(event.target===this)this.style.display='none'">
      <div class="modal">
        <div class="modal-header">
          <h3>💉 Registrar Dose de Vacina</h3>
          <div class="modal-close" onclick="document.getElementById('modal-vacina').style.display='none'">✕</div>
        </div>
        <div class="modal-body">
          <div class="form-grid form-grid-2">
            <div class="form-group">
              <label>Paciente *</label>
              <select id="vac-paciente">
                <option value="">Selecione...</option>
                ${getData('pacientes').map(p=>`<option value="${p.id}">${p.nome}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Vacina *</label>
              <select id="vac-vacina">
                <option>Influenza</option>
                <option>COVID-19</option>
                <option>Hepatite B</option>
                <option>Febre Amarela</option>
                <option>Tríplice Viral (SCR)</option>
                <option>Varicela</option>
                <option>HPV</option>
                <option>Meningocócica</option>
                <option>Pneumocócica</option>
                <option>dT (Dupla Adulto)</option>
                <option>dTpa (Tríplice Bacteriana)</option>
                <option>BCG</option>
                <option>Poliomielite</option>
                <option>Rotavírus</option>
                <option>Dengue</option>
              </select>
            </div>
            <div class="form-group">
              <label>Dose</label>
              <select id="vac-dose">
                <option>Dose única</option>
                <option>1ª Dose</option>
                <option>2ª Dose</option>
                <option>3ª Dose</option>
                <option>Reforço</option>
                <option>2º Reforço</option>
              </select>
            </div>
            <div class="form-group">
              <label>Data de Aplicação *</label>
              <input type="date" id="vac-data" value="${new Date().toISOString().slice(0,10)}">
            </div>
            <div class="form-group">
              <label>Nº do Lote</label>
              <input type="text" id="vac-lote" placeholder="Ex: LOT2026-001">
            </div>
            <div class="form-group">
              <label>Fabricante</label>
              <select id="vac-fabricante">
                <option>Butantan</option>
                <option>Fiocruz</option>
                <option>GSK</option>
                <option>MSD</option>
                <option>Pfizer</option>
                <option>Sanofi</option>
                <option>Bio-Manguinhos</option>
                <option>Outro</option>
              </select>
            </div>
            <div class="form-group">
              <label>Profissional</label>
              <select id="vac-profissional">
                ${getData('profissionais').map(p=>`<option value="${p.id}">${p.nome}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Local de Aplicação</label>
              <select id="vac-local">
                <option>UBSF Centro</option>
                <option>UBSF Cohab</option>
                <option>UBSF Rural</option>
                <option>Domicílio</option>
                <option>Escola</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('modal-vacina').style.display='none'">Cancelar</button>
          <button class="btn btn-success" onclick="Vacinacao.salvar()">💉 Registrar Dose</button>
        </div>
      </div>
    </div>
    `;
  },

  renderDosesRows(vacinas) {
    if (!vacinas.length) return `<tr><td colspan="8"><div class="empty-state"><div class="icon">💉</div><p>Nenhuma dose registrada</p></div></td></tr>`;
    return vacinas.map(v => {
      const pac = getData('pacientes').find(p=>p.id===v.pacienteId);
      const pro = getData('profissionais').find(p=>p.id===v.profissionalId);
      return `<tr>
        <td class="td-primary">${pac?pac.nome:'—'}</td>
        <td>${v.vacina}</td>
        <td><span class="badge andamento">${v.dose}</span></td>
        <td>${formatDate(v.data)}</td>
        <td><code style="font-family:'JetBrains Mono';font-size:11px;color:var(--text-muted)">${v.lote||'—'}</code></td>
        <td>${v.fabricante}</td>
        <td>${v.local}</td>
        <td>${pro?pro.nome.split(' ').slice(0,2).join(' '):'—'}</td>
      </tr>`;
    }).join('');
  },

  filterDoses(q) {
    const all = getData('vacinas');
    const filtered = q ? all.filter(v => {
      const pac = getData('pacientes').find(p=>p.id===v.pacienteId);
      return (pac&&pac.nome.toLowerCase().includes(q.toLowerCase())) || v.vacina.toLowerCase().includes(q.toLowerCase());
    }) : all;
    document.getElementById('doses-tbody').innerHTML = this.renderDosesRows(filtered);
  },

  filterPaciente(pacId) {
    const container = document.getElementById('carteira-container');
    if (!pacId) return;
    const vacinas = getData('vacinas').filter(v=>v.pacienteId===pacId);
    const pac = getData('pacientes').find(p=>p.id===pacId);
    if (!vacinas.length) {
      container.innerHTML = `<div class="empty-state"><div class="icon">📋</div><h3>${pac?pac.nome:''}</h3><p>Nenhuma vacina registrada para este paciente</p></div>`;
      return;
    }
    container.innerHTML = `<div class="vaccine-grid">${vacinas.map(v=>`
      <div class="vaccine-card">
        <div class="vaccine-card-header">
          <div class="vaccine-icon">💉</div>
          <div>
            <div class="vaccine-name">${v.vacina}</div>
            <div class="vaccine-dose">${v.dose}</div>
          </div>
        </div>
        <div class="info-grid" style="grid-template-columns:1fr 1fr;gap:8px;">
          <div class="info-item"><div class="info-label">Data</div><div class="info-value">${formatDate(v.data)}</div></div>
          <div class="info-item"><div class="info-label">Lote</div><div class="info-value" style="font-size:12px">${v.lote||'—'}</div></div>
          <div class="info-item"><div class="info-label">Fabricante</div><div class="info-value">${v.fabricante}</div></div>
          <div class="info-item"><div class="info-label">Local</div><div class="info-value">${v.local}</div></div>
        </div>
      </div>
    `).join('')}</div>`;
  },

  openModal() { document.getElementById('modal-vacina').style.display = 'flex'; },

  salvar() {
    const pac = document.getElementById('vac-paciente').value;
    const vacina = document.getElementById('vac-vacina').value;
    const dose = document.getElementById('vac-dose').value;
    const data = document.getElementById('vac-data').value;
    if (!pac || !data) { showToast('Preencha os campos obrigatórios!', 'error'); return; }
    addItem('vacinas', {
      id: generateId('VAC'),
      pacienteId: pac,
      vacina, dose, data,
      lote: document.getElementById('vac-lote').value,
      fabricante: document.getElementById('vac-fabricante').value,
      profissionalId: document.getElementById('vac-profissional').value,
      local: document.getElementById('vac-local').value
    });
    document.getElementById('modal-vacina').style.display = 'none';
    showToast('Dose registrada com sucesso!', 'success');
    document.getElementById('doses-tbody').innerHTML = this.renderDosesRows(getData('vacinas'));
  },

  novaCampanha() { showToast('Funcionalidade em desenvolvimento!', 'info'); },

  afterRender() {}
};
