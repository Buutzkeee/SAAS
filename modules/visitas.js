// ===================================================
// VISITAS DOMICILIARES MODULE
// ===================================================
const Visitas = {
  render() {
    const visitas = getData('visitas');
    const pacientes = getData('pacientes');
    const hoje = new Date().toISOString().split('T')[0];

    const getPac = id => pacientes.find(p => p.id === id) || {};
    const hoje_count = visitas.filter(v => v.data === hoje).length;
    const agendadas = visitas.filter(v => v.status === 'Agendada').length;
    const realizadas = visitas.filter(v => v.status === 'Realizada').length;

    return `
    <div class="section-header">
      <div>
        <h2>Visitas Domiciliares</h2>
        <p>Registro e acompanhamento de visitas dos ACS às famílias</p>
      </div>
      <button class="btn btn-primary" onclick="Visitas.openModal()">🏘️ + Nova Visita</button>
    </div>

    <div class="stats-grid" style="grid-template-columns:repeat(4,1fr);">
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-icon blue">📅</div></div>
        <div class="stat-value">${hoje_count}</div>
        <div class="stat-label">Visitas Hoje</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-icon orange">⏳</div></div>
        <div class="stat-value">${agendadas}</div>
        <div class="stat-label">Agendadas</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-icon green">✅</div></div>
        <div class="stat-value">${realizadas}</div>
        <div class="stat-label">Realizadas</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header"><div class="stat-icon purple">🏘️</div></div>
        <div class="stat-value">${visitas.length}</div>
        <div class="stat-label">Total Registros</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>🏘️ Registros de Visitas</h3>
        <div style="display:flex;gap:10px;align-items:center;">
          <input type="text" class="search-input" placeholder="🔍 Buscar paciente ou agente..." 
            oninput="Visitas.filter(this.value)" style="width:240px;">
          <select class="filter-select" onchange="Visitas.filterStatus(this.value)" id="visitas-status-filter">
            <option value="">Todos os status</option>
            <option value="Agendada">Agendada</option>
            <option value="Realizada">Realizada</option>
            <option value="Não Realizada">Não Realizada</option>
          </select>
        </div>
      </div>
      <div id="visitas-table-container">
        ${Visitas.renderTable(visitas, pacientes)}
      </div>
    </div>`;
  },

  renderTable(visitas, pacientes) {
    const getPac = id => (pacientes || getData('pacientes')).find(p => p.id === id) || {};
    if (!visitas.length) return '<div class="empty-state"><div class="empty-icon">🏘️</div><p>Nenhuma visita registrada</p></div>';
    return `
    <table class="data-table" id="visitas-table">
      <thead>
        <tr>
          <th>Paciente</th>
          <th>Endereço</th>
          <th>ACS / Agente</th>
          <th>Data</th>
          <th>Motivo</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${visitas.map(v => {
          const pac = getPac(v.pacienteId);
          const statusMap = { 'Agendada': 'agendada', 'Realizada': 'realizada', 'Não Realizada': 'cancelado' };
          const badgeCls = statusMap[v.status] || 'andamento';
          return `
          <tr>
            <td>
              <div style="font-weight:600;color:var(--text-primary)">${pac.nome || v.pacienteId}</div>
              <div style="font-size:11px;color:var(--text-muted)">${pac.cpf || ''}</div>
            </td>
            <td style="font-size:12px;color:var(--text-secondary)">${pac.endereco || '—'}</td>
            <td>${v.agente || '—'}</td>
            <td>${formatDate(v.data)}</td>
            <td>${v.motivo || '—'}</td>
            <td><span class="badge ${badgeCls}">${v.status}</span></td>
            <td>
              <div style="display:flex;gap:6px;">
                <button class="btn-table-action" onclick="Visitas.view('${v.id}')" title="Ver detalhes">👁️</button>
                ${v.status === 'Agendada' ? `<button class="btn-table-action success" onclick="Visitas.realizar('${v.id}')" title="Registrar como realizada">✅</button>` : ''}
                <button class="btn-table-action danger" onclick="Visitas.delete('${v.id}')" title="Excluir">🗑️</button>
              </div>
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
  },

  filter(q) {
    const pacientes = getData('pacientes');
    let visitas = getData('visitas');
    if (q && q.length >= 2) {
      const ql = q.toLowerCase();
      visitas = visitas.filter(v => {
        const pac = pacientes.find(p => p.id === v.pacienteId) || {};
        return (pac.nome || '').toLowerCase().includes(ql) || (v.agente || '').toLowerCase().includes(ql) || (v.motivo || '').toLowerCase().includes(ql);
      });
    }
    const container = document.getElementById('visitas-table-container');
    if (container) container.innerHTML = Visitas.renderTable(visitas, pacientes);
  },

  filterStatus(status) {
    const pacientes = getData('pacientes');
    let visitas = getData('visitas');
    if (status) visitas = visitas.filter(v => v.status === status);
    const container = document.getElementById('visitas-table-container');
    if (container) container.innerHTML = Visitas.renderTable(visitas, pacientes);
  },

  view(id) {
    const v = getData('visitas').find(x => x.id === id);
    if (!v) return;
    const pac = getData('pacientes').find(p => p.id === v.pacienteId) || {};
    showModal('🏘️ Detalhes da Visita', `
      <div class="detail-grid">
        <div class="detail-item"><span class="detail-label">Paciente</span><span class="detail-value">${pac.nome || v.pacienteId}</span></div>
        <div class="detail-item"><span class="detail-label">Endereço</span><span class="detail-value">${pac.endereco || '—'}</span></div>
        <div class="detail-item"><span class="detail-label">Agente ACS</span><span class="detail-value">${v.agente}</span></div>
        <div class="detail-item"><span class="detail-label">Data</span><span class="detail-value">${formatDate(v.data)}</span></div>
        <div class="detail-item"><span class="detail-label">Motivo</span><span class="detail-value">${v.motivo}</span></div>
        <div class="detail-item"><span class="detail-label">Status</span><span class="detail-value">${v.status}</span></div>
        ${v.observacao ? `<div class="detail-item" style="grid-column:1/-1"><span class="detail-label">Observações</span><span class="detail-value">${v.observacao}</span></div>` : ''}
      </div>
    `);
  },

  realizar(id) {
    const obs = prompt('Observações da visita realizada (opcional):') || '';
    const visitas = getData('visitas');
    const idx = visitas.findIndex(v => v.id === id);
    if (idx < 0) return;
    visitas[idx].status = 'Realizada';
    visitas[idx].observacao = obs;
    setData('visitas', visitas);
    showToast('Visita registrada como realizada!', 'success');
    navigate('visitas');
  },

  delete(id) {
    showModal('Confirmar Exclusão', '<p>Deseja excluir este registro de visita? Esta ação não pode ser desfeita.</p>', () => {
      const visitas = getData('visitas').filter(v => v.id !== id);
      setData('visitas', visitas);
      closeModal();
      showToast('Visita excluída.', 'info');
      navigate('visitas');
    });
  },

  openModal() {
    const pacientes = getData('pacientes');
    showModal('🏘️ Nova Visita Domiciliar', `
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Paciente *</label>
          <select class="form-control" id="vis-pac" required>
            <option value="">Selecione o paciente...</option>
            ${pacientes.map(p => `<option value="${p.id}">${p.nome} — ${p.bairro}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Agente ACS *</label>
          <select class="form-control" id="vis-agente" required>
            <option value="">Selecione...</option>
            <option value="ACS001">ACS001 — Maria Eduarda</option>
            <option value="ACS002">ACS002 — José Santos</option>
            <option value="ACS003">ACS003 — Ana Claudia</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Data da Visita *</label>
          <input type="date" class="form-control" id="vis-data" value="${new Date().toISOString().split('T')[0]}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-control" id="vis-status">
            <option value="Agendada">Agendada</option>
            <option value="Realizada">Realizada</option>
          </select>
        </div>
        <div class="form-group" style="grid-column:1/-1">
          <label class="form-label">Motivo da Visita *</label>
          <input type="text" class="form-control" id="vis-motivo" placeholder="Ex: Acompanhamento HAS, Pré-natal domiciliar..." required>
        </div>
        <div class="form-group" style="grid-column:1/-1">
          <label class="form-label">Observações</label>
          <textarea class="form-control" id="vis-obs" rows="3" placeholder="PA, evolução, orientações realizadas..."></textarea>
        </div>
      </div>
    `, Visitas.save);
  },

  save() {
    const pac = document.getElementById('vis-pac')?.value;
    const agente = document.getElementById('vis-agente')?.value;
    const data = document.getElementById('vis-data')?.value;
    const motivo = document.getElementById('vis-motivo')?.value?.trim();
    const status = document.getElementById('vis-status')?.value;
    const obs = document.getElementById('vis-obs')?.value?.trim();

    if (!pac || !agente || !data || !motivo) {
      showToast('Preencha todos os campos obrigatórios.', 'error');
      return;
    }

    const visitas = getData('visitas');
    const newId = `VIS${String(visitas.length + 1).padStart(3, '0')}`;
    addItem('visitas', { id: newId, pacienteId: pac, agente, data, motivo, status, observacao: obs || '' });
    closeModal();
    showToast('Visita domiciliar registrada com sucesso!', 'success');
    navigate('visitas');
  }
};
