/* ---------- LOGIN ---------- */
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = e.target.email.value;
  const password = e.target.password.value;

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.success) {
      // ✅ STORE USER (dashboard & settings expect this)
      localStorage.setItem("user", JSON.stringify(data.user));

      // redirect
      window.location.replace("/dashboard.html");
    } else {
      alert(data.error || "Login failed");
    }
  } catch (err) {
    alert("Server error. Try again.");
  }
});


/* ---------- REGISTER ---------- */
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = e.target.fullName.value;
  const email = e.target.email.value;
  const password = e.target.password.value;
  const confirmPassword = e.target.confirmPassword.value;

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password })
    });

    const data = await res.json();

    if (data.success) {
      alert("Registration successful! Please login.");
      window.location.href = "/index.html";
    } else {
      alert(data.error || "Registration failed");
    }
  } catch (err) {
    alert("Server error. Try again.");
  }
});


/* ---------- LOGOUT (GLOBAL) ---------- */
function logout() {
  localStorage.removeItem("user");
  window.location.replace("/index.html");
}
