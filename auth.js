let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const logoutBtn = document.getElementById("logoutBtn");
const currentUserDisplay = document.getElementById("currentUserDisplay");

if (currentUser && currentUserDisplay) {
  currentUserDisplay.textContent = `Hello, ${currentUser.username}`;
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", e => {
    e.preventDefault();
    const username = document.getElementById("signupUsername").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;

    if (users.some(u => u.email === email)) { alert("Email exists"); return; }

    const newUser = { username, email, password };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    window.location.href = "index.html";
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) { alert("Invalid"); return; }
    localStorage.setItem("currentUser", JSON.stringify(user));
    window.location.href = "index.html";
  });
}
