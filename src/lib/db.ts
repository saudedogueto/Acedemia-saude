import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { getAuth } from "firebase/auth";

// ========== TIPOS ==========

export interface Aluno {
  id?: string;
  nome: string;
  dataNascimento?: string;
  telefone?: string;
  endereco?: string;
  bairro?: string;
  contatoEmergencia?: string;
  observacoes?: string;
  ativo?: boolean;
  dataCadastro?: Timestamp;
  createdBy?: string;
}

export interface MedidaCorporal {
  id?: string;
  alunoId: string;
  data: string;
  peso: number;
  altura: number;
  cintura: number;
  quadril: number;
  imc?: number;
  observacoes?: string;
  createdBy?: string;
}

export interface Aula {
  id?: string;
  nome: string;
  diaSemana: string;
  horario: string;
  faixaEtaria: string;
  descricao?: string;
  ativa?: boolean;
  createdBy?: string;
}

export interface Presenca {
  id?: string;
  aulaId: string;
  alunoId: string;
  data: string;
  presente: boolean;
  createdBy?: string;
}

// ========== HELPERS ==========

function getCurrentUser() {
  const auth = getAuth();
  return auth.currentUser?.email || "admin";
}

// ========== ALUNOS ==========

const alunosRef = () => collection(db, "alunos");

export async function criarAluno(aluno: any) {
  return addDoc(alunosRef(), {
    ...aluno,
    ativo: true,
    dataCadastro: serverTimestamp(),
    createdBy: getCurrentUser(),
  });
}

export async function listarAlunos(): Promise<Aluno[]> {
  const q = query(alunosRef(), orderBy("nome"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Aluno));
}

export async function getAluno(id: string): Promise<Aluno | null> {
  const snap = await getDoc(doc(db, "alunos", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Aluno;
}

export async function atualizarAluno(id: string, dados: Partial<Aluno>) {
  return updateDoc(doc(db, "alunos", id), dados);
}

export async function removerAluno(id: string) {
  return deleteDoc(doc(db, "alunos", id));
}

// ========== MEDIDAS ==========

const medidasRef = () => collection(db, "medidas");

export async function criarMedida(medida: any) {
  return addDoc(medidasRef(), {
    ...medida,
    createdBy: getCurrentUser(),
  });
}

export async function listarMedidas(alunoId: string): Promise<MedidaCorporal[]> {
  const q = query(
    medidasRef(),
    where("alunoId", "==", alunoId),
    orderBy("data", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MedidaCorporal));
}

// ========== AULAS ==========

const aulasRef = () => collection(db, "aulas");

export async function criarAula(aula: any) {
  return addDoc(aulasRef(), {
    ...aula,
    ativa: true,
    createdBy: getCurrentUser(),
  });
}

export async function listarAulas(): Promise<Aula[]> {
  const q = query(aulasRef(), orderBy("diaSemana"), orderBy("horario"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Aula));
}

export async function getAula(id: string): Promise<Aula | null> {
  const snap = await getDoc(doc(db, "aulas", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Aula;
}

export async function atualizarAula(id: string, dados: Partial<Aula>) {
  return updateDoc(doc(db, "aulas", id), dados);
}

// ========== PRESENCA ==========

const presencasRef = () => collection(db, "presencas");

export async function salvarPresencas(presencas: Omit<Presenca, "id" | "createdBy">[]) {
  const batch = presencas.map((p) =>
    addDoc(presencasRef(), { ...p, createdBy: getCurrentUser() })
  );
  return Promise.all(batch);
}

export async function listarPresencasPorAula(aulaId: string) {
  const q = query(
    presencasRef(),
    where("aulaId", "==", aulaId),
    orderBy("data", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Presenca));
}

export async function listarPresencasPorAluno(alunoId: string): Promise<Presenca[]> {
  const q = query(
    presencasRef(),
    where("alunoId", "==", alunoId),
    orderBy("data", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Presenca));
}

// ========== ALUNOS DE UMA AULA ==========

export async function listarAlunosDaAula(aulaId: string): Promise<Aluno[]> {
  // Busca alunos que têm presença nessa aula
  const presencas = await listarPresencasPorAula(aulaId);
  const alunoIds = [...new Set(presencas.map((p) => p.alunoId))];

  if (alunoIds.length === 0) return [];

  const alunos = await Promise.all(alunoIds.map((id) => getAluno(id)));
  return alunos.filter(Boolean) as Aluno[];
}

// ========== ESTATISTICAS ==========

export async function getEstatisticas() {
  const [alunosSnap, aulasSnap, presencasSnap] = await Promise.all([
    getDocs(alunosRef()),
    getDocs(aulasRef()),
    getDocs(presencasRef()),
  ]);

  const totalAlunos = alunosSnap.size;
  const totalAulas = aulasSnap.size;
  const totalPresencas = presencasSnap.size;
  const presentes = presencasSnap.docs.filter((d) => d.data().presente).length;

  return {
    totalAlunos,
    totalAulas,
    totalPresencas,
    totalPresentes: presentes,
    taxaPresenca: totalPresencas > 0 ? Math.round((presentes / totalPresencas) * 100) : 0,
  };
}
