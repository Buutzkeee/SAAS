// ===================================================
// AGENDAMENTO MODULE
// ===================================================
const Agendamento = {
  currentDate: new Date(),
  selectedDate: new Date().toISOString().slice(0, 10),

  render() {
    return `
    <div class="section-header">
      <div>
        <h2>Agendamento</h2>
        <p>Gestão de consultas médicas, enfermagem e atendimentos da rede</p>
      </div>
      <button class="btn btn-primary" onclick="Agendamento.openModal()">📅 + Novo Agendamento</button>
    </div>

    <div class="grid-2" style="gap:20px;margin-bottom:24px;">
      <div class="card">
        <div class="card-header">
          <h3>🗓️ Calendário Mensal</h3>
          <div style="display:flex;gap:8px;align-items:center;">
            <button class="btn btn-secondary btn-xs" onclick="Agendamento.prevMonth()">‹</button>
            <span id="cal-month-label" style="font-size:13px;font-weight:600;min-width:120px;text-align:center;"></span>
            <button class="btn btn-secondary btn-xs" onclick="Agendamento.nextMonth()">›</button>
          </div>
        </div>
        <div class="card-body">
          <div id="calendar-container"></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <div>
            <h3>⏰ Agenda do Dia</h3>
            <span id="agenda-dia-label" class="badge andamento" style="margin-top:4px;display:inline-block;"></span>
          </div>
          <button class="btn btn-secondary btn-xs" onclick="Agendamento.openModal(Agendamento.selectedDate)">+ Agendar neste dia</button>
        </div>
        <div class="card-body" style="padding:0;" id="agenda-dia-container">
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>📋 Todos os Agendamentos</h3>
        <div style="display:flex;gap:10px;align-items:center;">
          <input type="text" class="search-input" placeholder="🔍 Buscar paciente..." oninput="Agendamento.filterTable(this.value)" style="width:220px;">
          <select class="filter-select" onchange="Agendamento.filterStatus(this.value)">
            <option value="">Todos Status</option>
            <option value="Confirmado">Confirmado</option>
            <option value="Aguardando">Aguardando</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
      </div>
      <div class="table-wrapper">
        <table id="agendamentos-table">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Profissional</th>
              <th>Data</th>
              <th>Hora</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody id="agendamentos-tbody"></tbody>
        </table>
      </div>
    </div>
    `;
  },

  afterRender() {
    this.renderCalendar();
    this.renderTable(getData('agendamentos'));
    this.renderAgendaDia(this.selectedDate);
  },

  renderCalendar() {
    const d = this.currentDate;
    const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const labelEl = document.getElementById('cal-month-label');
    if (labelEl) labelEl.textContent = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;

    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1).getDay();
    const daysInMonth = new Date(d.getFullYear(), d.getMonth()+1, 0).getDate();
    const agendamentos = getData('agendamentos');
    const hoje = new Date().toISOString().slice(0,10);

    const dayNames = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
    let html = '<div class="calendar-grid">';
    dayNames.forEach(dn => html += `<div class="cal-day-header">${dn}</div>`);

    for(let i=0;i<firstDay;i++) html += '<div class="cal-day other-month"></div>';
    for(let day=1;day<=daysInMonth;day++) {
      const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const count = agendamentos.filter(a => a.data === dateStr && a.status !== 'Cancelado').length;
      const isToday = dateStr === hoje;
      const isSelected = dateStr === this.selectedDate;

      html += `<div class="cal-day${isToday?' today':''}${count>0?' has-events':''}${isSelected?' active-day':''}" onclick="Agendamento.selectDate('${dateStr}')" title="${dateStr}: ${count} agendamento(s)">
        <span>${day}</span>
        ${count > 0 ? `<div style="font-size:9px;font-weight:700;color:var(--primary);margin-top:2px;">${count} cons.</div>` : ''}
      </div>`;
    }
    html += '</div>';
    const calContainer = document.getElementById('calendar-container');
    if (calContainer) calContainer.innerHTML = html;
  },

  selectDate(dateStr) {
    this.selectedDate = dateStr;
    this.renderCalendar();
    this.renderAgendaDia(dateStr);
  },

  renderAgendaDia(dateStr) {
    this.selectedDate = dateStr;
    const agendamentos = getData('agendamentos').filter(a=>a.data===dateStr);
    const label = document.getElementById('agenda-dia-label');
    const container = document.getElementById('agenda-dia-container');
    if (!label || !container) return;
    label.textContent = formatDate(dateStr);

    if (agendamentos.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding:40px">
          <div class="icon">📭</div>
          <h3>Sem agendamentos</h3>
          <p>Nenhuma consulta marcada para ${formatDate(dateStr)}</p>
          <button class="btn btn-secondary btn-xs" style="margin-top:10px" onclick="Agendamento.openModal('${dateStr}')">+ Agendar Consulta</button>
        </div>`;
      return;
    }

    // Sort by hour
    agendamentos.sort((a,b) => (a.hora || '').localeCompare(b.hora || ''));

    container.innerHTML = agendamentos.map(ag => {
      const pac = getData('pacientes').find(p=>p.id===ag.pacienteId);
      const pro = getData('profissionais').find(p=>p.id===ag.profissionalId);
      return `<div style="display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);">
        <div style="font-size:18px;font-weight:800;color:var(--primary);min-width:56px;font-family:'JetBrains Mono',monospace;">${ag.hora}</div>
        <div style="flex:1;">
          <div style="font-size:13.5px;font-weight:600;color:var(--text-primary)">${pac?pac.nome:'—'}</div>
          <div style="font-size:11.5px;color:var(--text-muted)">${ag.tipo} · ${pro?pro.nome:'—'}</div>
        </div>
        ${getBadge(ag.status)}
        <div style="display:flex;gap:4px;">
          ${ag.status !== 'Confirmado' ? `<button class="btn btn-secondary btn-xs" title="Confirmar" onclick="Agendamento.confirm('${ag.id}')">✔</button>` : ''}
          ${ag.status !== 'Cancelado' ? `<button class="btn btn-danger btn-xs" title="Cancelar" onclick="Agendamento.cancel('${ag.id}')">✕</button>` : ''}
        </div>
      </div>`;
    }).join('');
  },

  renderTable(agendamentos) {
    const tbody = document.getElementById('agendamentos-tbody');
    if (!tbody) return;
    if (!agendamentos.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="icon">📅</div><p>Nenhum agendamento encontrado</p></div></td></tr>`;
      return;
    }

    tbody.innerHTML = agendamentos.map(ag => {
      const pac = getData('pacientes').find(p=>p.id===ag.pacienteId);
      const pro = getData('profissionais').find(p=>p.id===ag.profissionalId);
      return `<tr>
        <td class="td-primary">${pac?pac.nome:'—'}</td>
        <td>${pro?pro.nome:'—'}</td>
        <td>${formatDate(ag.data)}</td>
        <td><code style="font-family:'JetBrains Mono';font-size:12px">${ag.hora}</code></td>
        <td>${ag.tipo}</td>
        <td>${getBadge(ag.status)}</td>
        <td>
          <div style="display:flex;gap:6px;">
            ${ag.status !== 'Confirmado' ? `<button class="btn btn-secondary btn-xs" onclick="Agendamento.confirm('${ag.id}')">✔ Confirmar</button>` : ''}
            ${ag.status !== 'Cancelado' ? `<button class="btn btn-danger btn-xs" onclick="Agendamento.cancel('${ag.id}')">✕ Cancelar</button>` : ''}
          </div>
        </td>
      </tr>`;
    }).join('');
  },

  filterTable(q) {
    const all = getData('agendamentos');
    const filtered = q ? all.filter(a => {
      const pac = getData('pacientes').find(p=>p.id===a.pacienteId);
      const pro = getData('profissionais').find(p=>p.id===a.profissionalId);
      return (pac && pac.nome.toLowerCase().includes(q.toLowerCase())) ||
             (pro && pro.nome.toLowerCase().includes(q.toLowerCase())) ||
             (a.tipo && a.tipo.toLowerCase().includes(q.toLowerCase()));
    }) : all;
    this.renderTable(filtered);
  },

  filterStatus(s) {
    const all = getData('agendamentos');
    this.renderTable(s ? all.filter(a=>a.status===s) : all);
  },

  openModal(defaultDate) {
    const pacientes = getData('pacientes');
    const profissionais = getData('profissionais');
    const targetDate = defaultDate || this.selectedDate || new Date().toISOString().slice(0, 10);

    const modalHtml = `
      <div style="margin-bottom:16px;">
        <p style="font-size:13px;color:var(--text-secondary);margin-top:2px;">
          Preencha os dados abaixo para agendar a consulta na rede municipal de saúde.
        </p>
      </div>

      <div class="form-grid form-grid-2">
        <div class="form-group" style="grid-column:span 2;">
          <label class="form-label">Paciente *</label>
          <select class="form-control" id="ag-modal-paciente" required>
            <option value="">Selecione o paciente cadastrado...</option>
            ${pacientes.map(p => `
              <option value="${p.id}">${p.nome} — CPF: ${p.cpf || '—'} (${p.unidade})</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group" style="grid-column:span 2;">
          <label class="form-label">Profissional Responsável *</label>
          <select class="form-control" id="ag-modal-profissional" required>
            <option value="">Selecione o médico ou enfermeiro...</option>
            ${profissionais.map(p => `
              <option value="${p.id}">${p.nome} — ${p.cargo} (${p.especialidade || p.unidade})</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Data da Consulta *</label>
          <input type="date" class="form-control" id="ag-modal-data" value="${targetDate}" required>
        </div>

        <div class="form-group">
          <label class="form-label">Horário *</label>
          <select class="form-control" id="ag-modal-hora" required>
            ${[
              '07:00','07:30','08:00','08:30','09:00','09:30',
              '10:00','10:30','11:00','11:30',
              '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'
            ].map(h => `<option value="${h}">${h}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Tipo de Atendimento *</label>
          <select class="form-control" id="ag-modal-tipo">
            <option value="Consulta Médica">Consulta Médica (Clínica Geral)</option>
            <option value="Atendimento de Enfermagem">Atendimento de Enfermagem</option>
            <option value="Pré-natal">Pré-natal</option>
            <option value="Consulta Pediátrica">Consulta Pediátrica</option>
            <option value="Acompanhamento Hiperdia">Hiperdia (HAS / Diabetes)</option>
            <option value="Exame Preventivo (Citopatológico)">Exame Preventivo (Citopatológico)</option>
            <option value="Atendimento Odontológico">Atendimento Odontológico</option>
            <option value="Urgência / Triagem">Urgência / Triagem</option>
            <option value="Retorno">Retorno</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Status Inicial</label>
          <select class="form-control" id="ag-modal-status">
            <option value="Confirmado">Confirmado</option>
            <option value="Aguardando">Aguardando Confirmação</option>
          </select>
        </div>

        <div class="form-group" style="grid-column:span 2;">
          <label class="form-label">Observações / Encaminhamento / Motivo (opcional)</label>
          <textarea class="form-control" id="ag-modal-obs" rows="3" placeholder="Informações relevantes, queixas prévias, encaminhamentos ou preparos necessários..."></textarea>
        </div>
      </div>
    `;

    showModal('📅 Novo Agendamento de Consulta', modalHtml, () => {
      Agendamento.salvar();
    });
  },

  salvar() {
    const pac = document.getElementById('ag-modal-paciente')?.value;
    const pro = document.getElementById('ag-modal-profissional')?.value;
    const data = document.getElementById('ag-modal-data')?.value;
    const hora = document.getElementById('ag-modal-hora')?.value;
    const tipo = document.getElementById('ag-modal-tipo')?.value;
    const status = document.getElementById('ag-modal-status')?.value || 'Confirmado';
    const obs = document.getElementById('ag-modal-obs')?.value?.trim() || '';

    if (!pac || !pro || !data || !hora) {
      showToast('Preencha os campos obrigatórios (Paciente, Profissional, Data e Hora)!', 'error');
      return;
    }

    addItem('agendamentos', {
      id: generateId('AG'),
      pacienteId: pac,
      profissionalId: pro,
      data,
      hora,
      tipo,
      status,
      observacao: obs
    });

    closeModal();
    showToast('Agendamento cadastrado com sucesso!', 'success');

    this.selectedDate = data;
    this.renderTable(getData('agendamentos'));
    this.renderCalendar();
    this.renderAgendaDia(data);
  },

  confirm(id) {
    updateItem('agendamentos', id, { status: 'Confirmado' });
    this.renderTable(getData('agendamentos'));
    this.renderCalendar();
    this.renderAgendaDia(this.selectedDate);
    showToast('Agendamento confirmado!', 'success');
  },

  cancel(id) {
    showModal('Cancelar Agendamento', '<p>Deseja realmente cancelar este agendamento de consulta?</p>', () => {
      updateItem('agendamentos', id, { status: 'Cancelado' });
      closeModal();
      this.renderTable(getData('agendamentos'));
      this.renderCalendar();
      this.renderAgendaDia(this.selectedDate);
      showToast('Agendamento cancelado.', 'info');
    });
  },

  prevMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth()-1, 1);
    this.renderCalendar();
  },

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth()+1, 1);
    this.renderCalendar();
  }
};
