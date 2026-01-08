if (!localStorage.getItem("loggedIn")) {
  window.location.href = "/index.html";
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("loggedIn");
  window.location.href = "/index.html";
});
