// ===================================================
// PROFISSIONAIS MODULE
// ===================================================
const Profissionais = {
  render() {
    const profs = getData('profissionais');
    const medicos = profs.filter(p => p.cargo === 'Médico').length;
    const enfermeiros = profs.filter(p => p.cargo.includes('Enferm')).length;
    const acs = profs.filter(p => p.cargo.includes('Agente')).length;

    return `
    <div class="section-header">
      <div>
        <h2>Profissionais de Saúde</h2>
        <p>Equipe de saúde das UBSF de Umbuzeiro/PB</p>
      </div>
      <button class="btn btn-primary" onclick="Profissionais.openModal()">+ Cadastrar Profissional</button>
    </div>

    <div class="stats-grid" style="grid-template-columns:repeat(4,1fr);">
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-icon blue">👨‍⚕️</div></div>
        <div class="stat-value">${profs.length}</div>
        <div class="stat-label">Total Profissionais</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-icon green">🩺</div></div>
        <div class="stat-value">${medicos}</div>
        <div class="stat-label">Médicos</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-icon purple">💊</div></div>
        <div class="stat-value">${enfermeiros}</div>
        <div class="stat-label">Enfermeiros</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-icon orange">🏘️</div></div>
        <div class="stat-value">${acs}</div>
        <div class="stat-label">Agentes ACS</div>
      </div>
    </div>

    <div class="profs-grid" id="profs-grid">
      ${Profissionais.renderCards(profs)}
    </div>`;
  },

  renderCards(profs) {
    if (!profs.length) return '<div class="empty-state"><div class="empty-icon">👨‍⚕️</div><p>Nenhum profissional cadastrado</p></div>';
    const iconMap = { 'Médico': '🩺', 'Enfermeira': '💊', 'Enfermeiro': '💊', 'Agente Comunitário': '🏘️', 'Técnico': '🔬' };
    const colorMap = { 'Médico': 'blue', 'Enfermeira': 'green', 'Enfermeiro': 'green', 'Agente Comunitário': 'orange', 'Técnico': 'purple' };
    return profs.map(p => {
      const icon = iconMap[p.cargo] || '👤';
      const color = colorMap[p.cargo] || 'blue';
      const initials = p.nome.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase();
      const registro = p.crm ? `CRM: ${p.crm}` : p.coren ? `COREN: ${p.coren}` : `CNS: ${p.cns}`;
      return `
      <div class="prof-card" data-id="${p.id}">
        <div class="prof-card-top">
          <div class="prof-avatar ${color}">${initials}</div>
          <div class="prof-card-menu">
            <button class="btn-table-action" onclick="Profissionais.view('${p.id}')" title="Ver detalhes">👁️</button>
            <button class="btn-table-action danger" onclick="Profissionais.delete('${p.id}')" title="Excluir">🗑️</button>
          </div>
        </div>
        <div class="prof-name">${p.nome}</div>
        <div class="prof-cargo"><span class="stat-icon ${color}" style="width:18px;height:18px;font-size:11px;">${icon}</span> ${p.cargo}</div>
        <div class="prof-info-list">
          <div class="prof-info-item"><span>🏥</span> ${p.unidade}</div>
          <div class="prof-info-item"><span>📋</span> ${registro}</div>
          ${p.telefone ? `<div class="prof-info-item"><span>📞</span> ${p.telefone}</div>` : ''}
          ${p.email ? `<div class="prof-info-item"><span>✉️</span> ${p.email}</div>` : ''}
        </div>
      </div>`;
    }).join('');
  },

  view(id) {
    const p = getData('profissionais').find(x => x.id === id);
    if (!p) return;
    const agendamentos = getData('agendamentos').filter(a => a.profissionalId === id).length;
    showModal(`👨‍⚕️ ${p.nome}`, `
      <div class="detail-grid">
        <div class="detail-item"><span class="detail-label">Nome Completo</span><span class="detail-value">${p.nome}</span></div>
        <div class="detail-item"><span class="detail-label">Cargo</span><span class="detail-value">${p.cargo}</span></div>
        <div class="detail-item"><span class="detail-label">Especialidade</span><span class="detail-value">${p.especialidade || '—'}</span></div>
        <div class="detail-item"><span class="detail-label">Unidade</span><span class="detail-value">${p.unidade}</span></div>
        ${p.crm ? `<div class="detail-item"><span class="detail-label">CRM</span><span class="detail-value">${p.crm}</span></div>` : ''}
        ${p.coren ? `<div class="detail-item"><span class="detail-label">COREN</span><span class="detail-value">${p.coren}</span></div>` : ''}
        <div class="detail-item"><span class="detail-label">CPF</span><span class="detail-value">${p.cpf || '—'}</span></div>
        <div class="detail-item"><span class="detail-label">CNS</span><span class="detail-value">${p.cns || '—'}</span></div>
        <div class="detail-item"><span class="detail-label">Telefone</span><span class="detail-value">${p.telefone || '—'}</span></div>
        <div class="detail-item"><span class="detail-label">E-mail</span><span class="detail-value">${p.email || '—'}</span></div>
        <div class="detail-item"><span class="detail-label">Agendamentos</span><span class="detail-value">${agendamentos} consulta(s)</span></div>
      </div>
    `);
  },

  delete(id) {
    showModal('Confirmar Exclusão', '<p>Deseja remover este profissional do sistema? Os registros vinculados serão mantidos.</p>', () => {
      const profs = getData('profissionais').filter(p => p.id !== id);
      setData('profissionais', profs);
      closeModal();
      showToast('Profissional removido.', 'info');
      navigate('profissionais');
    });
  },

  openModal() {
    showModal('👨‍⚕️ Cadastrar Profissional', `
      <div class="form-grid">
        <div class="form-group" style="grid-column:1/-1">
          <label class="form-label">Nome Completo *</label>
          <input type="text" class="form-control" id="prf-nome" placeholder="Dr. Nome Sobrenome" required>
        </div>
        <div class="form-group">
          <label class="form-label">Cargo *</label>
          <select class="form-control" id="prf-cargo" onchange="Profissionais.toggleRegistro(this.value)" required>
            <option value="">Selecione...</option>
            <option value="Médico">Médico</option>
            <option value="Enfermeira">Enfermeira</option>
            <option value="Enfermeiro">Enfermeiro</option>
            <option value="Técnico de Enfermagem">Técnico de Enfermagem</option>
            <option value="Agente Comunitário">Agente Comunitário (ACS)</option>
            <option value="Dentista">Dentista</option>
            <option value="Psicólogo">Psicólogo</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Especialidade</label>
          <input type="text" class="form-control" id="prf-espec" placeholder="Clínica Geral, Pediatria...">
        </div>
        <div class="form-group" id="field-crm">
          <label class="form-label">CRM</label>
          <input type="text" class="form-control" id="prf-crm" placeholder="CRM-PB 12345">
        </div>
        <div class="form-group" id="field-coren" style="display:none">
          <label class="form-label">COREN</label>
          <input type="text" class="form-control" id="prf-coren" placeholder="COREN-PB 54321">
        </div>
        <div class="form-group">
          <label class="form-label">Unidade *</label>
          <select class="form-control" id="prf-unidade" required>
            <option value="">Selecione...</option>
            <option value="UBSF Centro">UBSF Centro</option>
            <option value="UBSF Cohab">UBSF Cohab</option>
            <option value="UBSF Rural">UBSF Rural</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">CPF *</label>
          <input type="text" class="form-control" id="prf-cpf" placeholder="000.000.000-00" required>
        </div>
        <div class="form-group">
          <label class="form-label">CNS</label>
          <input type="text" class="form-control" id="prf-cns" placeholder="700000000000000">
        </div>
        <div class="form-group">
          <label class="form-label">Telefone</label>
          <input type="text" class="form-control" id="prf-tel" placeholder="(83) 99999-9999">
        </div>
        <div class="form-group">
          <label class="form-label">E-mail</label>
          <input type="email" class="form-control" id="prf-email" placeholder="nome@saude.pb.gov.br">
        </div>
      </div>
    `, Profissionais.save);
  },

  toggleRegistro(cargo) {
    const crm = document.getElementById('field-crm');
    const coren = document.getElementById('field-coren');
    if (!crm || !coren) return;
    if (cargo === 'Médico' || cargo === 'Dentista') {
      crm.style.display = '';
      coren.style.display = 'none';
    } else if (cargo.includes('Enferme') || cargo.includes('Técnico')) {
      crm.style.display = 'none';
      coren.style.display = '';
    } else {
      crm.style.display = 'none';
      coren.style.display = 'none';
    }
  },

  save() {
    const nome = document.getElementById('prf-nome')?.value?.trim();
    const cargo = document.getElementById('prf-cargo')?.value;
    const unidade = document.getElementById('prf-unidade')?.value;
    const cpf = document.getElementById('prf-cpf')?.value?.trim();
    if (!nome || !cargo || !unidade || !cpf) {
      showToast('Preencha os campos obrigatórios.', 'error');
      return;
    }
    const profs = getData('profissionais');
    const newId = `PRO${String(profs.length + 1).padStart(3, '0')}`;
    addItem('profissionais', {
      id: newId,
      nome,
      cargo,
      especialidade: document.getElementById('prf-espec')?.value?.trim() || '',
      crm: document.getElementById('prf-crm')?.value?.trim() || '',
      coren: document.getElementById('prf-coren')?.value?.trim() || '',
      unidade,
      cpf,
      cns: document.getElementById('prf-cns')?.value?.trim() || '',
      telefone: document.getElementById('prf-tel')?.value?.trim() || '',
      email: document.getElementById('prf-email')?.value?.trim() || ''
    });
    closeModal();
    showToast('Profissional cadastrado com sucesso!', 'success');
    navigate('profissionais');
  }
};
