// ===================================================
// DASHBOARD MODULE
// ===================================================
const Dashboard = {
  render() {
    const agendamentos = getData('agendamentos');
    const pacientes = getData('pacientes');
    const vacinas = getData('vacinas');
    const visitas = getData('visitas');
    const hoje = new Date().toISOString().slice(0,10);
    const agHoje = agendamentos.filter(a => a.data === hoje);
    const agPendentes = agendamentos.filter(a => a.status === 'Aguardando');
    const visitasAgendadas = visitas.filter(v => v.status === 'Agendada');

    return `
    <div class="section-header">
      <div>
        <h2>Dashboard</h2>
        <p>Visão geral da saúde municipal · ${formatDate(hoje)}</p>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="Dashboard.exportReport()">📊 Relatório</button>
        <button class="btn btn-primary btn-sm" onclick="navigate('agendamento')">+ Novo Agendamento</button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-icon blue">👥</div>
          <span class="stat-badge neutral">+12 mês</span>
        </div>
        <div class="stat-value">${pacientes.length}</div>
        <div class="stat-label">Pacientes Cadastrados</div>
        <div class="stat-sub">Ativos na rede municipal</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-icon green">📅</div>
          <span class="stat-badge ${agHoje.length > 0 ? 'up' : 'neutral'}">${agHoje.length} hoje</span>
        </div>
        <div class="stat-value">${agendamentos.filter(a=>a.status!=='Cancelado').length}</div>
        <div class="stat-label">Agendamentos Ativos</div>
        <div class="stat-sub">${agPendentes.length} aguardando confirmação</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-icon purple">💉</div>
          <span class="stat-badge up">+8 semana</span>
        </div>
        <div class="stat-value">${vacinas.length}</div>
        <div class="stat-label">Doses Aplicadas</div>
        <div class="stat-sub">Vacinação em andamento</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-icon orange">🏠</div>
          <span class="stat-badge neutral">${visitasAgendadas.length} agendadas</span>
        </div>
        <div class="stat-value">${visitas.length}</div>
        <div class="stat-label">Visitas Domiciliares</div>
        <div class="stat-sub">Cobertura territorial</div>
      </div>
    </div>

    <div class="grid-2" style="gap:20px;margin-bottom:24px;">
      <div class="card">
        <div class="card-header">
          <h3>📈 Atendimentos por Mês</h3>
          <span class="badge andamento">2026</span>
        </div>
        <div class="card-body">
          <canvas id="chart-atendimentos" height="180"></canvas>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3>📅 Próximas Consultas</h3>
          <button class="btn btn-secondary btn-xs" onclick="navigate('agendamento')">Ver todas</button>
        </div>
        <div class="card-body" style="padding:0;">
          <div class="table-wrapper">
            <table>
              <thead><tr><th>Paciente</th><th>Data/Hora</th><th>Tipo</th><th>Status</th></tr></thead>
              <tbody>
                ${agendamentos.slice(0,5).map(ag => {
                  const pac = getData('pacientes').find(p => p.id === ag.pacienteId);
                  return `<tr>
                    <td class="td-primary">${pac ? pac.nome.split(' ').slice(0,2).join(' ') : '—'}</td>
                    <td>${formatDate(ag.data)} ${ag.hora}</td>
                    <td>${ag.tipo}</td>
                    <td>${getBadge(ag.status)}</td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="grid-3" style="gap:20px;">
      <div class="card">
        <div class="card-header"><h3>💉 Campanhas Ativas</h3></div>
        <div class="card-body">
          ${getData('campanhas').map(c => `
            <div style="margin-bottom:18px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <span style="font-size:13px;font-weight:600;color:var(--text-primary)">${c.nome.slice(0,35)}...</span>
                <span class="badge ${c.status==='Em andamento'?'andamento':'encerrada'}">${c.status}</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-bottom:4px;">
                <span>${c.aplicadas} aplicadas</span><span>Meta: ${c.meta}</span>
              </div>
              <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(100,(c.aplicadas/c.meta*100)).toFixed(0)}%"></div></div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>🏠 Visitas Hoje</h3></div>
        <div class="card-body" style="padding:0;">
          ${visitas.filter(v => v.data === hoje || v.status==='Agendada').slice(0,4).map(v => {
            const pac = getData('pacientes').find(p=>p.id===v.pacienteId);
            return `<div class="chat-conversation-item">
              <div class="chat-avatar" style="background:linear-gradient(135deg,var(--secondary),#059669)">🏠</div>
              <div class="chat-conv-info">
                <div class="chat-conv-name">${pac?pac.nome.split(' ').slice(0,2).join(' '):'—'}</div>
                <div class="chat-conv-preview">${v.motivo}</div>
              </div>
              <span class="badge ${v.status==='Realizada'?'confirmado':'aguardando'}">${v.status}</span>
            </div>`;
          }).join('') || '<div class="empty-state" style="padding:24px"><div class="icon">✅</div><p>Nenhuma visita agendada</p></div>'}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>💬 Mensagens Recentes</h3><button class="btn btn-secondary btn-xs" onclick="navigate('chat')">Abrir chat</button></div>
        <div class="card-body" style="padding:0;">
          ${getData('mensagens').slice(0,4).map(m => {
            const pac = getData('pacientes').find(p=>p.id===m.remetente);
            return `<div class="chat-conversation-item">
              <div class="chat-avatar">${pac?pac.nome[0]:'S'}</div>
              <div class="chat-conv-info">
                <div class="chat-conv-name">${pac?pac.nome.split(' ').slice(0,2).join(' '):m.remetente}</div>
                <div class="chat-conv-preview">${m.texto}</div>
              </div>
              ${!m.lida?'<div class="nav-badge">!</div>':''}
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>
    `;
  },

  afterRender() {
    this.renderChart();
  },

  renderChart() {
    const canvas = document.getElementById('chart-atendimentos');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set'];
    const valores = [142, 168, 155, 189, 204, 178, 221, 198, 87];
    const W = canvas.offsetWidth || 400;
    const H = 180;
    canvas.width = W; canvas.height = H;

    const maxV = Math.max(...valores);
    const pad = { top: 20, right: 10, bottom: 30, left: 40 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;
    const barW = (chartW / meses.length) - 8;

    ctx.clearRect(0,0,W,H);

    // Grid lines
    for(let i=0;i<=4;i++) {
      const y = pad.top + (chartH/4)*i;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.moveTo(pad.left, y); ctx.lineTo(W-pad.right, y);
      ctx.stroke();
      ctx.fillStyle = 'rgba(126,168,204,0.5)';
      ctx.font = '10px Inter';
      ctx.fillText(Math.round(maxV - (maxV/4)*i), 4, y+3);
    }

    // Bars
    meses.forEach((m, i) => {
      const x = pad.left + i * (chartW/meses.length);
      const barH = (valores[i]/maxV)*chartH;
      const y = pad.top + chartH - barH;

      const grad = ctx.createLinearGradient(0, y, 0, y+barH);
      grad.addColorStop(0, 'rgba(0,180,216,0.9)');
      grad.addColorStop(1, 'rgba(0,119,182,0.4)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x + 4, y, barW, barH, 4);
      ctx.fill();

      ctx.fillStyle = 'rgba(126,168,204,0.6)';
      ctx.font = '10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(m, x + barW/2 + 4, H - 8);
    });
  },

  exportReport() {
    showToast('Relatório gerado com sucesso!', 'success');
  }
};
