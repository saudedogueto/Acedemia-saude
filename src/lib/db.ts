import { addDoc as restAddDoc, getDoc as restGetDoc, getDocs as restGetDocs } from "./firebase";

// ─── App-specific helpers ──────────────────────────

export async function criarAluno(data: any) {
  return restAddDoc("alunos", data);
}

export async function listarAlunos() {
  return restGetDocs("alunos");
}

export async function getAluno(id: string) {
  return restGetDoc("alunos", id);
}

export async function criarAula(data: any) {
  return restAddDoc("aulas", data);
}

export async function listarAulas() {
  return restGetDocs("aulas");
}

export async function getAula(id: string) {
  return restGetDoc("aulas", id);
}

export async function salvarPresencas(registros: any[]) {
  for (const p of registros) {
    await restAddDoc("presencas", p);
  }
}

export async function listarAlunosDaAula(aulaId: string) {
  const todos = await listarAlunos();
  return todos.filter((a: any) => a.aulaId === aulaId);
}

export async function listarMedidas(alunoId: string) {
  const todos = await restGetDocs("medidas");
  return todos.filter((m: any) => m.alunoId === alunoId);
}

export async function listarPresencasPorAluno(alunoId: string) {
  const todos = await restGetDocs("presencas");
  return todos.filter((p: any) => p.alunoId === alunoId);
}

export async function getEstatisticas() {
  const [alunos, aulas] = await Promise.all([listarAlunos(), listarAulas()]);
  return {
    totalAlunos: alunos.length,
    totalAulas: aulas.length,
    taxaPresenca: 0,
  };
}

// ─── Types ─────────────────────────────────────────

export type Aluno = {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  dataNascimento?: string;
  endereco?: string;
  bairro?: string;
  contatoEmergencia?: string;
  objetivo?: string;
  observacoes?: string;
  criadoEm?: any;
};

export type Aula = {
  id: string;
  nome: string;
  horario: string;
  diasSemana: string[];
  professor?: string;
  faixaEtaria?: string;
  descricao?: string;
  criadoEm?: any;
};

export type Presenca = {
  id: string;
  aulaId: string;
  alunoId: string;
  data: string;
  presente: boolean;
};

export type MedidaCorporal = {
  id: string;
  alunoId: string;
  data: string;
  peso?: number;
  altura?: number;
  cintura?: number;
  quadril?: number;
  braco?: number;
  coxa?: number;
  observacoes?: string;
};
