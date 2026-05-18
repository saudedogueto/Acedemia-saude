// Firebase via REST API — sem SDK pesado
// Tudo é importado sob demanda com fetch()

const API_KEY = "AIzaSyDg7vyK_hESz63244QHujBMoLYjtJF-l34";
const PROJECT_ID = "academia-saude-cabucu";

export async function signIn(email: string, password: string) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw { code: data.error?.message || "unknown", message: data.error?.message };
  return data;
}

export async function signUp(email: string, password: string) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw { code: data.error?.message || "unknown" };
  return data;
}

async function refreshToken(refreshToken: string) {
  const res = await fetch(
    `https://securetoken.googleapis.com/v1/token?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grant_type: "refresh_token", refresh_token: refreshToken }),
    }
  );
  return res.json();
}

// ─── Firestore REST ────────────────────────────────

async function getAccessToken() {
  // Tenta pegar do sessionStorage
  const stored = sessionStorage.getItem("fb_token");
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed.expiresAt > Date.now()) return parsed.idToken;
    // Expirado, tenta refresh
    if (parsed.refreshToken) {
      const refreshed = await refreshToken(parsed.refreshToken);
      if (refreshed.id_token) {
        const newToken = {
          idToken: refreshed.id_token,
          refreshToken: refreshed.refresh_token,
          expiresAt: Date.now() + parseInt(refreshed.expires_in) * 1000,
        };
        sessionStorage.setItem("fb_token", JSON.stringify(newToken));
        return newToken.idToken;
      }
    }
  }
  return null;
}

function storeToken(authData: any) {
  sessionStorage.setItem("fb_token", JSON.stringify({
    idToken: authData.idToken,
    refreshToken: authData.refreshToken,
    expiresAt: Date.now() + parseInt(authData.expiresIn) * 1000,
  }));
}

export function onAuthChange(callback: (user: any | null) => void) {
  const stored = sessionStorage.getItem("fb_token");
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed.expiresAt > Date.now()) {
      callback({ email: parsed.email || "user@email.com", getIdToken: () => parsed.idToken });
    } else {
      callback(null);
    }
  } else {
    callback(null);
  }
}

export { storeToken };

// ─── Firestore helpers ─────────────────────────────

const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function firestoreFetch(path: string, options: any = {}) {
  const token = await getAccessToken();
  const res = await fetch(`${FIRESTORE_URL}/${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export async function addDoc(collection: string, data: any) {
  const result = await firestoreFetch(collection, {
    method: "POST",
    body: JSON.stringify({ fields: toFirestoreFields(data) }),
  });
  return { id: result.name?.split("/").pop() };
}

export async function getDoc(collection: string, id: string) {
  const result = await firestoreFetch(`${collection}/${id}`);
  if (result.error) return null;
  return { id, ...fromFirestoreFields(result.fields) };
}

export async function getDocs(collection: string) {
  const result = await firestoreFetch(`${collection}`);
  return (result.documents || []).map((doc: any) => ({
    id: doc.name.split("/").pop(),
    ...fromFirestoreFields(doc.fields),
  }));
}

function toFirestoreFields(obj: any): any {
  const fields: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    if (typeof value === "string") fields[key] = { stringValue: value };
    else if (typeof value === "number") fields[key] = { doubleValue: value };
    else if (typeof value === "boolean") fields[key] = { booleanValue: value };
    else if (value instanceof Date) fields[key] = { timestampValue: value.toISOString() };
    else fields[key] = { stringValue: String(value) };
  }
  return fields;
}

function fromFirestoreFields(fields: any): any {
  if (!fields) return {};
  const obj: any = {};
  for (const [key, value] of Object.entries(fields)) {
    const v = value as any;
    if (v.stringValue !== undefined) obj[key] = v.stringValue;
    else if (v.doubleValue !== undefined) obj[key] = v.doubleValue;
    else if (v.integerValue !== undefined) obj[key] = parseInt(v.integerValue);
    else if (v.booleanValue !== undefined) obj[key] = v.booleanValue;
    else if (v.timestampValue) obj[key] = v.timestampValue;
  }
  return obj;
}
