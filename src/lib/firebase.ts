const firebaseConfig = {
  apiKey: "AIzaSyDg7vyK_hESz63244QHujBMoLYjtJF-l34",
  authDomain: "academia-saude-cabucu.firebaseapp.com",
  projectId: "academia-saude-cabucu",
  storageBucket: "academia-saude-cabucu.firebasestorage.app",
  messagingSenderId: "715257537282",
  appId: "1:715257537282:web:a8ac4ca352616d3012981b",
  measurementId: "G-3TPBKKGJ1Y",
};

let cachedAuth: any = null;
let cachedDb: any = null;

export async function getFirebaseAuth() {
  if (cachedAuth) return cachedAuth;
  const mod = await import("firebase/auth");
  const { getApps, initializeApp } = await import("firebase/app");
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
  cachedAuth = mod.getAuth(getApps()[0]);
  return cachedAuth;
}

export async function getFirebaseDb() {
  if (cachedDb) return cachedDb;
  const mod = await import("firebase/firestore");
  const { getApps, initializeApp } = await import("firebase/app");
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
  cachedDb = mod.getFirestore(getApps()[0]);
  return cachedDb;
}

export { firebaseConfig };
