document.getElementById('year').textContent = new Date().getFullYear();
  // Mobile Navbar Toggle
const menuIcon = document.getElementById("menu-icon");
const navbar = document.getElementById("navbar");

menuIcon.addEventListener("click", () => {
  navbar.classList.toggle("active");
  menuIcon.textContent = navbar.classList.contains("active") ? "✖" : "☰";
});
// 🌙 Persistent Dark Mode Setup
const toggle = document.querySelector(".toggle-theme");

// Load saved theme from localStorage
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  toggle.textContent = "☀️ Light Mode";
} else {
  toggle.textContent = "🌙 Dark Mode";
}

// Toggle theme and save preference
toggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const mode = document.body.classList.contains("dark") ? "dark" : "light";
  localStorage.setItem("theme", mode);
  toggle.textContent = mode === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
});