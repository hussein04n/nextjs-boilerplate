function toggleForms() {
  const login = document.getElementById("login-form");
  const register = document.getElementById("register-form");
  login.style.display = login.style.display === "none" ? "block" : "none";
  register.style.display = register.style.display === "none" ? "block" : "none";
}

function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch(error => {
      alert(error.message);
    });
}

function register() {
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(() => {
      alert("Account created! You can now login.");
      toggleForms();
    })
    .catch(error => {
      alert(error.message);
    });
}
