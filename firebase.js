// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "مفتاح API هنا",
  authDomain: "مشروع.firebaseapp.com",
  projectId: "معرف المشروع",
  storageBucket: "مشروع.appspot.com",
  messagingSenderId: "المرسل",
  appId: "ID التطبيق"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
