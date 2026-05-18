import { getFirebaseDb } from "./firebase";

let dbPromise: Promise<any> | null = null;
function getDb() {
  if (!dbPromise) dbPromise = getFirebaseDb();
  return dbPromise;
}

let fsModulePromise: Promise<any> | null = null;
function getFs() {
  if (!fsModulePromise) fsModulePromise = import("firebase/firestore");
  return fsModulePromise;
}

// ─── Generic helpers ──────────────────────────────────────

export async function addDoc(collection: string, data: any) {
  const [db, mod] = await Promise.all([getDb(), getFs()]);
  const col = mod.collection(db, collection);
  return mod.addDoc(col, data);
}

export async function setDoc(collection: string, id: string, data: any) {
  const [db, mod] = await Promise.all([getDb(), getFs()]);
  const doc = mod.doc(db, collection, id);
  return mod.setDoc(doc, data);
}

export async function getDoc(collection: string, id: string) {
  const [db, mod] = await Promise.all([getDb(), getFs()]);
  const doc = mod.doc(db, collection, id);
  const snap = await mod.getDoc(doc);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getDocs(collection: string) {
  const [db, mod] = await Promise.all([getDb(), getFs()]);
  const col = mod.collection(db, collection);
  const snap = await mod.getDocs(col);
  return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
}

export async function updateDoc(collection: string, id: string, data: any) {
  const [db, mod] = await Promise.all([getDb(), getFs()]);
  const doc = mod.doc(db, collection, id);
  return mod.updateDoc(doc, data);
}

export async function deleteDoc(collection: string, id: string) {
  const [db, mod] = await Promise.all([getDb(), getFs()]);
  const doc = mod.doc(db, collection, id);
  return mod.deleteDoc(doc);
}

export async function queryDocs(collection: string, field: string, op: any, value: any) {
  const [db, mod] = await Promise.all([getDb(), getFs()]);
  const col = mod.collection(db, collection);
  const q = mod.query(col, mod.where(field, op, value));
  const snap = await mod.getDocs(q);
  return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
}

// ─── App-specific helpers ──────────────────────────────────

export async function criarAluno(data: any) {
  return addDoc("alunos", data);
}

export async function listarAlunos() {
  return getDocs("alunos");
}

export async function getAluno(id: string) {
  return getDoc("alunos", id);
}

export async function criarAula(data: any) {
  return addDoc("aulas", data);
}

export async function listarAulas() {
  return getDocs("aulas");
}

export async function getAula(id: string) {
  return getDoc("aulas", id);
}

export async function listarAlunosDaAula(aulaId: string) {
  return queryDocs("alunos", "aulaId", "==", aulaId);
}

export async function salvarPresencas(aulaIdOrList: string | any[], presencas?: any[]) {
  if (Array.isArray(aulaIdOrList)) {
    for (const p of aulaIdOrList) {
      await addDoc("presencas", p);
    }
  } else if (presencas) {
    for (const p of presencas) {
      await addDoc("presencas", { aulaId: aulaIdOrList, ...p });
    }
  }
}

export async function listarMedidas(alunoId: string) {
  return queryDocs("medidas", "alunoId", "==", alunoId);
}

export async function listarPresencasPorAluno(alunoId: string) {
  return queryDocs("presencas", "alunoId", "==", alunoId);
}

export async function getEstatisticas() {
  const [alunos, aulas] = await Promise.all([listarAlunos(), listarAulas()]);
  return {
    totalAlunos: alunos.length,
    totalAulas: aulas.length,
    taxaPresenca: 0,
  };
}

// ─── Types ─────────────────────────────────────────────────

export type Aluno = {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  dataNascimento?: string;
  objetivo?: string;
  observacoes?: string;
  endereco?: string;
  bairro?: string;
  contatoEmergencia?: string;
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
