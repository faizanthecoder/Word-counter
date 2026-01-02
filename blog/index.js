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


const searchBox = document.getElementById("searchBox");
const blogCards = document.querySelectorAll(".blog-card");

searchBox.addEventListener("input", () => {
  const query = searchBox.value.toLowerCase().trim();
  let resultsFound = false;

  blogCards.forEach(card => {
    const title = card.querySelector("h2").textContent.toLowerCase();
    const desc = card.querySelector("p").textContent.toLowerCase();
    const match = title.includes(query) || desc.includes(query);

    if (match) {
      resultsFound = true;
      card.classList.remove("fade-out");
      card.classList.add("fade-in");
      setTimeout(() => (card.style.display = "flex"), 100);
    } else {
      card.classList.remove("fade-in");
      card.classList.add("fade-out");
      setTimeout(() => (card.style.display = "none"), 300);
    }
  });

  // "No Results" message
  let msg = document.getElementById("noResultsMsg");
  if (!resultsFound) {
    if (!msg) {
      msg = document.createElement("p");
      msg.id = "noResultsMsg";
      msg.textContent = "No matching blog posts found.";
      msg.style.textAlign = "center";
      msg.style.color = "#666";
      msg.style.marginTop = "20px";
      document.querySelector(".blog-grid").after(msg);
    }
  } else if (msg) {
    msg.remove();
  }
});