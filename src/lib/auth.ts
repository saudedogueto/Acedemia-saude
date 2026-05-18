import { getFirebaseAuth } from "./firebase";

let authPromise: Promise<any> | null = null;
function getAuth() {
  if (!authPromise) authPromise = getFirebaseAuth();
  return authPromise;
}

let authModulePromise: Promise<any> | null = null;
function getAuthModule() {
  if (!authModulePromise) authModulePromise = import("firebase/auth");
  return authModulePromise;
}

export async function loginAdmin(email: string, password: string) {
  const [auth, mod] = await Promise.all([getAuth(), getAuthModule()]);
  return mod.signInWithEmailAndPassword(auth, email, password);
}

export async function registerAdmin(email: string, password: string) {
  const [auth, mod] = await Promise.all([getAuth(), getAuthModule()]);
  return mod.createUserWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  const [auth, mod] = await Promise.all([getAuth(), getAuthModule()]);
  return mod.signOut(auth);
}

export function onAuthChange(callback: (user: any | null) => void) {
  let unsub: (() => void) | null = null;
  Promise.all([getAuth(), getAuthModule()]).then(([auth, mod]) => {
    unsub = mod.onAuthStateChanged(auth, callback);
  });
  return () => {
    if (unsub) unsub();
  };
}
