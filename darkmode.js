  
const toggle = document.querySelector(".toggle-theme");
  
  if (toggle) {
    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark");
      toggle.textContent = "☀️ Light Mode";
    } else {
      toggle.textContent = "🌙 Dark Mode";
    }

    toggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      const mode = document.body.classList.contains("dark") ? "dark" : "light";
      localStorage.setItem("theme", mode);
      toggle.textContent = mode === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
    });
  }
