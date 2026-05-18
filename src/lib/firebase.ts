import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDg7vyK_hESz63244QHujBMoLYjtJF-l34",
  authDomain: "academia-saude-cabucu.firebaseapp.com",
  projectId: "academia-saude-cabucu",
  storageBucket: "academia-saude-cabucu.firebasestorage.app",
  messagingSenderId: "715257537282",
  appId: "1:715257537282:web:a8ac4ca352616d3012981b",
  measurementId: "G-3TPBKKGJ1Y",
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (typeof window !== "undefined") {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
}

// Configuracao Firebase v2 - API Key corrigida
export { app, auth, db };
