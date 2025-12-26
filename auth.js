import { auth } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const loginForm = document.getElementById("loginForm");
const loginContainer = document.getElementById("login-container");
const painelSistema = document.getElementById("painel-sistema");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const senha = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, senha).catch((err) =>
    alert("Acesso Negado: E-mail ou senha inválidos.")
  );
});

document
  .getElementById("btn-logout")
  .addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginContainer.style.display = "none";
    painelSistema.style.display = "flex";
    document.body.style.background = "#f1f5f9";
  } else {
    loginContainer.style.display = "block";
    painelSistema.style.display = "none";
    document.body.style.background =
      "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)";
  }
});
