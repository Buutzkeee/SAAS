// seed.js — Dados iniciais do sistema de Gestão em Saúde
const SEED_DATA = {
  pacientes: [
    { id: 'P001', nome: 'Maria das Graças Silva', cpf: '123.456.789-00', cns: '700123456789012', dataNasc: '1985-03-15', sexo: 'F', telefone: '(83) 99123-4567', endereco: 'Rua das Flores, 45 - Centro', bairro: 'Centro', zona: 'Urbana', agente: 'ACS001', unidade: 'UBSF Centro', foto: null },
    { id: 'P002', nome: 'João Batista Oliveira', cpf: '987.654.321-00', cns: '700987654321098', dataNasc: '1972-07-22', sexo: 'M', telefone: '(83) 99876-5432', endereco: 'Rua Nova, 12 - Cohab', bairro: 'Cohab', zona: 'Urbana', agente: 'ACS002', unidade: 'UBSF Cohab', foto: null },
    { id: 'P003', nome: 'Ana Lúcia Ferreira', cpf: '456.789.123-00', cns: '700456789123456', dataNasc: '1990-11-08', sexo: 'F', telefone: '(83) 99456-7890', endereco: 'Sítio Boa Vista, s/n', bairro: 'Zona Rural', zona: 'Rural', agente: 'ACS003', unidade: 'UBSF Rural', foto: null },
    { id: 'P004', nome: 'Francisco Souza Lima', cpf: '321.654.987-00', cns: '700321654987321', dataNasc: '1965-05-30', sexo: 'M', telefone: '(83) 99321-6549', endereco: 'Rua do Açude, 78', bairro: 'Açude', zona: 'Urbana', agente: 'ACS001', unidade: 'UBSF Centro', foto: null },
    { id: 'P005', nome: 'Antônia Nascimento Costa', cpf: '654.987.321-00', cns: '700654987321654', dataNasc: '2010-01-20', sexo: 'F', telefone: '(83) 99654-9873', endereco: 'Rua das Pedras, 33', bairro: 'Centro', zona: 'Urbana', agente: 'ACS002', unidade: 'UBSF Centro', foto: null },
    { id: 'P006', nome: 'Pedro Henrique Alves', cpf: '789.321.456-00', cns: '700789321456789', dataNasc: '1998-09-14', sexo: 'M', telefone: '(83) 99789-3214', endereco: 'Conjunto Novo, 22', bairro: 'Conjunto Novo', zona: 'Urbana', agente: 'ACS003', unidade: 'UBSF Cohab', foto: null },
  ],
  profissionais: [
    { id: 'PRO001', nome: 'Dr. Carlos Eduardo Menezes', crm: 'CRM-PB 12345', especialidade: 'Clínica Geral', cargo: 'Médico', unidade: 'UBSF Centro', cns: '700111222333444', cpf: '111.222.333-44', telefone: '(83) 99111-2233', email: 'carlos.menezes@saude.pb.gov.br' },
    { id: 'PRO002', nome: 'Enf. Juliana Santos Barbosa', coren: 'COREN-PB 54321', especialidade: 'Saúde da Família', cargo: 'Enfermeira', unidade: 'UBSF Centro', cns: '700222333444555', cpf: '222.333.444-55', telefone: '(83) 99222-3344', email: 'juliana.barbosa@saude.pb.gov.br' },
    { id: 'PRO003', nome: 'Dr. Ricardo Almeida Cruz', crm: 'CRM-PB 67890', especialidade: 'Pediatria', cargo: 'Médico', unidade: 'UBSF Cohab', cns: '700333444555666', cpf: '333.444.555-66', telefone: '(83) 99333-4455', email: 'ricardo.cruz@saude.pb.gov.br' },
    { id: 'PRO004', nome: 'ACS Maria Eduarda Lima', cargo: 'Agente Comunitário', unidade: 'UBSF Rural', cns: '700444555666777', cpf: '444.555.666-77', telefone: '(83) 99444-5566', email: 'mariaeduarda.lima@saude.pb.gov.br' },
  ],
  agendamentos: [
    { id: 'AG001', pacienteId: 'P001', profissionalId: 'PRO001', data: '2026-09-10', hora: '08:00', tipo: 'Consulta', status: 'Confirmado', observacao: 'Retorno hipertensão' },
    { id: 'AG002', pacienteId: 'P002', profissionalId: 'PRO001', data: '2026-09-10', hora: '08:30', tipo: 'Consulta', status: 'Aguardando', observacao: '' },
    { id: 'AG003', pacienteId: 'P003', profissionalId: 'PRO002', data: '2026-09-10', hora: '09:00', tipo: 'Pré-natal', status: 'Confirmado', observacao: '3º trimestre' },
    { id: 'AG004', pacienteId: 'P005', profissionalId: 'PRO003', data: '2026-09-11', hora: '10:00', tipo: 'Consulta Pediátrica', status: 'Aguardando', observacao: '' },
    { id: 'AG005', pacienteId: 'P004', profissionalId: 'PRO001', data: '2026-09-12', hora: '14:00', tipo: 'Consulta', status: 'Cancelado', observacao: 'Paciente remarcou' },
  ],
  vacinas: [
    { id: 'VAC001', pacienteId: 'P001', vacina: 'Influenza', dose: 'Dose única', data: '2026-04-10', lote: 'LOT2026-001', fabricante: 'Butantan', profissionalId: 'PRO002', local: 'UBSF Centro' },
    { id: 'VAC002', pacienteId: 'P005', vacina: 'COVID-19', dose: '1ª Dose', data: '2026-03-15', lote: 'LOT2026-102', fabricante: 'Fiocruz', profissionalId: 'PRO002', local: 'UBSF Centro' },
    { id: 'VAC003', pacienteId: 'P005', vacina: 'COVID-19', dose: '2ª Dose', data: '2026-04-15', lote: 'LOT2026-103', fabricante: 'Fiocruz', profissionalId: 'PRO002', local: 'UBSF Centro' },
    { id: 'VAC004', pacienteId: 'P002', vacina: 'Hepatite B', dose: '3ª Dose', data: '2026-02-20', lote: 'LOT2026-055', fabricante: 'GSK', profissionalId: 'PRO002', local: 'UBSF Cohab' },
  ],
  historico: [
    { id: 'HC001', pacienteId: 'P001', data: '2026-08-15', profissionalId: 'PRO001', tipo: 'Consulta', queixa: 'Cefaleia e tontura', anamnese: 'Paciente refere episódios de tontura há 2 semanas, PA elevada 160/100.', diagnostico: 'Hipertensão Arterial Sistêmica', cid: 'I10', conduta: 'Ajuste de medicação anti-hipertensiva. Retorno em 30 dias.', prescricao: 'Losartana 50mg - 1 comprimido por dia\nHidroclorotiazida 25mg - 1 comprimido pela manhã' },
    { id: 'HC002', pacienteId: 'P003', data: '2026-08-20', profissionalId: 'PRO002', tipo: 'Pré-natal', queixa: 'Consulta de rotina pré-natal', anamnese: 'IG 28 semanas. BCF positivo. AU 28cm. Sem queixas.', diagnostico: 'Gravidez normal', cid: 'Z34', conduta: 'Manter acompanhamento quinzenal. Solicitar exames de rotina.', prescricao: 'Sulfato Ferroso 40mg - 1 comprimido ao dia\nÁcido Fólico 5mg - 1 comprimido ao dia' },
  ],
  exames: [
    { id: 'EX001', pacienteId: 'P001', data: '2026-08-15', profissionalId: 'PRO001', tipo: 'Hemograma Completo', status: 'Resultado Disponível', resultado: 'Hemoglobina: 13,5 g/dL (Normal)\nHematócrito: 42% (Normal)\nLeucócitos: 7.500/mm³ (Normal)\nPlaquetas: 220.000/mm³ (Normal)', observacao: 'Resultado dentro da normalidade' },
    { id: 'EX002', pacienteId: 'P001', data: '2026-08-15', profissionalId: 'PRO001', tipo: 'Glicemia em Jejum', status: 'Resultado Disponível', resultado: '102 mg/dL', observacao: 'Limítrofe - monitorar' },
    { id: 'EX003', pacienteId: 'P003', data: '2026-08-20', profissionalId: 'PRO002', tipo: 'Ultrassonografia Obstétrica', status: 'Aguardando', resultado: '', observacao: '' },
  ],
  procedimentos: [
    { id: 'PROC001', pacienteId: 'P002', data: '2026-08-10', profissionalId: 'PRO002', procedimento: 'Curativo', descricao: 'Curativo simples em membro inferior direito', material: 'SF 0,9%, gaze estéril, micropore', observacao: 'Ferida limpa, boa cicatrização' },
    { id: 'PROC002', pacienteId: 'P004', data: '2026-09-05', profissionalId: 'PRO002', procedimento: 'Inalação', descricao: 'Nebulização com Soro Fisiológico + Fenoterol', material: 'Fenoterol 5 gotas + SF 0,9% 3mL', observacao: 'Paciente apresentou melhora após procedimento' },
  ],
  visitas: [
    { id: 'VIS001', pacienteId: 'P004', agente: 'ACS001', data: '2026-09-03', motivo: 'Acompanhamento HAS', observacao: 'PA: 145/90. Orientado sobre alimentação e medicação. Retorno em 15 dias.', status: 'Realizada' },
    { id: 'VIS002', pacienteId: 'P003', agente: 'ACS003', data: '2026-09-08', motivo: 'Pré-natal domiciliar', observacao: '', status: 'Agendada' },
    { id: 'VIS003', pacienteId: 'P006', agente: 'ACS002', data: '2026-09-09', motivo: 'Cadastramento SIAB', observacao: '', status: 'Agendada' },
  ],
  mensagens: [
    { id: 'MSG001', remetente: 'P001', destinatario: 'UBSF Centro', texto: 'Bom dia! Preciso remarcar minha consulta de amanhã.', dataHora: '2026-09-08T09:15:00', lida: true },
    { id: 'MSG002', remetente: 'UBSF Centro', destinatario: 'P001', texto: 'Bom dia, Maria das Graças! Pode remarcar para o dia 15/09 às 08:00. Está disponível?', dataHora: '2026-09-08T09:32:00', lida: true },
    { id: 'MSG003', remetente: 'P002', destinatario: 'UBSF Cohab', texto: 'Preciso saber o resultado do meu exame de sangue.', dataHora: '2026-09-08T10:00:00', lida: false },
  ],
  campanhas: [
    { id: 'CAMP001', nome: 'Campanha Nacional de Vacinação Influenza 2026', inicio: '2026-04-01', fim: '2026-05-31', publico: 'Idosos, gestantes, crianças até 6 anos', meta: 2400, aplicadas: 1876, status: 'Encerrada' },
    { id: 'CAMP002', nome: 'Campanha Multivacinação 2026', inicio: '2026-08-01', fim: '2026-09-30', publico: 'Crianças de 0 a 15 anos', meta: 850, aplicadas: 423, status: 'Em andamento' },
  ]
};

function initSeedData() {
  const keys = Object.keys(SEED_DATA);
  keys.forEach(key => {
    if (!localStorage.getItem(`saude_${key}`)) {
      localStorage.setItem(`saude_${key}`, JSON.stringify(SEED_DATA[key]));
    }
  });
}

function getData(key) {
  const raw = localStorage.getItem(`saude_${key}`);
  return raw ? JSON.parse(raw) : [];
}

function setData(key, data) {
  localStorage.setItem(`saude_${key}`, JSON.stringify(data));
}

function addItem(key, item) {
  const data = getData(key);
  data.push(item);
  setData(key, data);
}

function updateItem(key, id, updates) {
  const data = getData(key);
  const idx = data.findIndex(d => d.id === id);
  if (idx !== -1) {
    data[idx] = { ...data[idx], ...updates };
    setData(key, data);
  }
}

function deleteItem(key, id) {
  const data = getData(key);
  setData(key, data.filter(d => d.id !== id));
}

function generateId(prefix) {
  return `${prefix}${Date.now().toString(36).toUpperCase()}`;
}
