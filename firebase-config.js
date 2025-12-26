import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB5V7jRJrftoEdNQtpK5FZkszDeNl5ZGsw",
  authDomain: "estoquereidacoxinhadebatata.firebaseapp.com",
  databaseURL:
    "https://estoquereidacoxinhadebatata-default-rtdb.firebaseio.com",
  projectId: "estoquereidacoxinhadebatata",
  storageBucket: "estoquereidacoxinhadebatata.firebasestorage.app",
  messagingSenderId: "833730205046",
  appId: "1:833730205046:web:5b26fd5a80d2826bff5657",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
