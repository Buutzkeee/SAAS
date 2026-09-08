// ===================================================
// AGENDAMENTO MODULE
// ===================================================
const Agendamento = {
  currentDate: new Date(),

  render() {
    const agendamentos = getData('agendamentos');
    const hoje = new Date().toISOString().slice(0,10);

    return `
    <div class="section-header">
      <div>
        <h2>Agendamento</h2>
        <p>Gestão de consultas e atendimentos</p>
      </div>
      <button class="btn btn-primary" onclick="Agendamento.openModal()">+ Novo Agendamento</button>
    </div>

    <div class="grid-2" style="gap:20px;margin-bottom:24px;">
      <div class="card">
        <div class="card-header">
          <h3>🗓️ Calendário</h3>
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
          <h3>⏰ Agenda do Dia</h3>
          <span id="agenda-dia-label" class="badge andamento"></span>
        </div>
        <div class="card-body" style="padding:0;" id="agenda-dia-container">
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>📋 Todos os Agendamentos</h3>
        <div style="display:flex;gap:10px;">
          <input type="text" class="search-input" placeholder="🔍 Buscar paciente..." oninput="Agendamento.filterTable(this.value)" style="width:200px;">
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

    <!-- Modal Novo Agendamento -->
    <div id="modal-agendamento" class="modal-overlay" style="display:none;" onclick="if(event.target===this)this.style.display='none'">
      <div class="modal">
        <div class="modal-header">
          <h3>📅 Novo Agendamento</h3>
          <div class="modal-close" onclick="document.getElementById('modal-agendamento').style.display='none'">✕</div>
        </div>
        <div class="modal-body">
          <div class="form-grid form-grid-2">
            <div class="form-group">
              <label>Paciente *</label>
              <select id="ag-paciente">
                <option value="">Selecione...</option>
                ${getData('pacientes').map(p=>`<option value="${p.id}">${p.nome}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Profissional *</label>
              <select id="ag-profissional">
                <option value="">Selecione...</option>
                ${getData('profissionais').map(p=>`<option value="${p.id}">${p.nome}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Data *</label>
              <input type="date" id="ag-data" value="${hoje}">
            </div>
            <div class="form-group">
              <label>Hora *</label>
              <select id="ag-hora">
                ${['07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'].map(h=>`<option>${h}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Tipo de Atendimento</label>
              <select id="ag-tipo">
                <option>Consulta</option>
                <option>Retorno</option>
                <option>Pré-natal</option>
                <option>Consulta Pediátrica</option>
                <option>Urgência</option>
                <option>Preventivo</option>
                <option>Odontológico</option>
              </select>
            </div>
            <div class="form-group">
              <label>Status</label>
              <select id="ag-status">
                <option>Aguardando</option>
                <option>Confirmado</option>
              </select>
            </div>
            <div class="form-group" style="grid-column:span 2">
              <label>Observações</label>
              <textarea id="ag-obs" placeholder="Observações sobre o agendamento..."></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('modal-agendamento').style.display='none'">Cancelar</button>
          <button class="btn btn-primary" onclick="Agendamento.salvar()">💾 Salvar Agendamento</button>
        </div>
      </div>
    </div>
    `;
  },

  afterRender() {
    this.renderCalendar();
    this.renderTable(getData('agendamentos'));
    this.renderAgendaDia(new Date().toISOString().slice(0,10));
  },

  renderCalendar() {
    const d = this.currentDate;
    const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    document.getElementById('cal-month-label').textContent = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;

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
      const hasEvents = agendamentos.some(a=>a.data===dateStr);
      const isToday = dateStr===hoje;
      html += `<div class="cal-day${isToday?' today':''}${hasEvents?' has-events':''}" onclick="Agendamento.renderAgendaDia('${dateStr}')" title="${dateStr}">${day}</div>`;
    }
    html += '</div>';
    document.getElementById('calendar-container').innerHTML = html;
  },

  renderAgendaDia(dateStr) {
    const agendamentos = getData('agendamentos').filter(a=>a.data===dateStr);
    const label = document.getElementById('agenda-dia-label');
    const container = document.getElementById('agenda-dia-container');
    if (!label || !container) return;
    label.textContent = formatDate(dateStr);

    if (agendamentos.length === 0) {
      container.innerHTML = '<div class="empty-state" style="padding:40px"><div class="icon">📭</div><h3>Sem agendamentos</h3><p>Nenhuma consulta para este dia</p></div>';
      return;
    }
    container.innerHTML = agendamentos.map(ag => {
      const pac = getData('pacientes').find(p=>p.id===ag.pacienteId);
      const pro = getData('profissionais').find(p=>p.id===ag.profissionalId);
      return `<div style="display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.04);">
        <div style="font-size:22px;font-weight:800;color:var(--primary);min-width:50px;">${ag.hora}</div>
        <div style="flex:1;">
          <div style="font-size:13.5px;font-weight:600;color:var(--text-primary)">${pac?pac.nome:'—'}</div>
          <div style="font-size:11.5px;color:var(--text-muted)">${ag.tipo} · ${pro?pro.nome:'—'}</div>
        </div>
        ${getBadge(ag.status)}
        <button class="btn btn-secondary btn-xs" onclick="Agendamento.confirm('${ag.id}')">✔</button>
        <button class="btn btn-danger btn-xs" onclick="Agendamento.cancel('${ag.id}')">✕</button>
      </div>`;
    }).join('');
  },

  renderTable(agendamentos) {
    const tbody = document.getElementById('agendamentos-tbody');
    if (!tbody) return;
    tbody.innerHTML = agendamentos.map(ag => {
      const pac = getData('pacientes').find(p=>p.id===ag.pacienteId);
      const pro = getData('profissionais').find(p=>p.id===ag.profissionalId);
      return `<tr>
        <td class="td-primary">${pac?pac.nome:'—'}</td>
        <td>${pro?pro.nome:'—'}</td>
        <td>${formatDate(ag.data)}</td>
        <td>${ag.hora}</td>
        <td>${ag.tipo}</td>
        <td>${getBadge(ag.status)}</td>
        <td>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-secondary btn-xs" onclick="Agendamento.confirm('${ag.id}')">✔ Confirmar</button>
            <button class="btn btn-danger btn-xs" onclick="Agendamento.cancel('${ag.id}')">✕</button>
          </div>
        </td>
      </tr>`;
    }).join('');
  },

  filterTable(q) {
    const all = getData('agendamentos');
    const filtered = q ? all.filter(a => {
      const pac = getData('pacientes').find(p=>p.id===a.pacienteId);
      return pac && pac.nome.toLowerCase().includes(q.toLowerCase());
    }) : all;
    this.renderTable(filtered);
  },

  filterStatus(s) {
    const all = getData('agendamentos');
    this.renderTable(s ? all.filter(a=>a.status===s) : all);
  },

  openModal() {
    document.getElementById('modal-agendamento').style.display = 'flex';
  },

  salvar() {
    const pac = document.getElementById('ag-paciente').value;
    const pro = document.getElementById('ag-profissional').value;
    const data = document.getElementById('ag-data').value;
    const hora = document.getElementById('ag-hora').value;
    const tipo = document.getElementById('ag-tipo').value;
    const status = document.getElementById('ag-status').value;
    const obs = document.getElementById('ag-obs').value;
    if (!pac || !pro || !data) { showToast('Preencha os campos obrigatórios!', 'error'); return; }
    addItem('agendamentos', { id: generateId('AG'), pacienteId:pac, profissionalId:pro, data, hora, tipo, status, observacao:obs });
    document.getElementById('modal-agendamento').style.display = 'none';
    showToast('Agendamento criado com sucesso!', 'success');
    this.renderTable(getData('agendamentos'));
    this.renderCalendar();
  },

  confirm(id) {
    updateItem('agendamentos', id, { status: 'Confirmado' });
    this.renderTable(getData('agendamentos'));
    this.renderCalendar();
    showToast('Agendamento confirmado!', 'success');
  },

  cancel(id) {
    updateItem('agendamentos', id, { status: 'Cancelado' });
    this.renderTable(getData('agendamentos'));
    showToast('Agendamento cancelado.', 'info');
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
