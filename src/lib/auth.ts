import { signIn, signUp, onAuthChange as restOnAuthChange, storeToken } from "./firebase";

export async function loginAdmin(email: string, password: string) {
  const data = await signIn(email, password);
  storeToken(data);
  return data;
}

export async function registerAdmin(email: string, password: string) {
  const data = await signUp(email, password);
  storeToken(data);
  return data;
}

export async function logout() {
  sessionStorage.removeItem("fb_token");
}

export function onAuthChange(callback: (user: any | null) => void) {
  restOnAuthChange(callback);
  // Listen for storage changes (other tabs)
  const handler = () => restOnAuthChange(callback);
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
