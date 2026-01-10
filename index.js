document.addEventListener("DOMContentLoaded", () => {

  // 🧩 Element References
  const editor = document.getElementById('editor');
  const wordCountEl = document.getElementById('wordCount');
  const charCountEl = document.getElementById('charCount');
  const spaceCountEl = document.getElementById('spaceCount');
  const readTimeEl = document.getElementById('readTime');
  const speakTimeEl = document.getElementById('speakTime');
  const keywordsEl = document.getElementById('keywords');
  const searchWordInput = document.getElementById('searchWord');
  const occurrencesEl = document.getElementById('occurrences');
  const highlightedTextDiv = document.getElementById('highlightedText');
  const replaceWordInput = document.getElementById('replaceWord');
  const dictInput = document.getElementById('dictInput');
  const dictResult = document.getElementById('dictResult');
  const saveBtn = document.getElementById('saveBtn');
  const clearBtn = document.getElementById('clearBtn');
  const copyBtn = document.getElementById("copyBtn");
  const fixAllBtn = document.getElementById("fixAllBtn");
  const tooltip = document.getElementById("tooltip");
  const toast = document.getElementById("toast");
  const menuIcon = document.getElementById("menu-icon");
  const navbar = document.getElementById("navbar");
  const year = document.getElementById("year");
  const goalInput = document.getElementById("goalInput");
  const goalStatus = document.getElementById("goalStatus");
  const goalFill = document.getElementById("goalFill");

  // 📱 Navbar Toggle (safe for all pages)
  if (menuIcon && navbar) {
    menuIcon.addEventListener("click", () => {
      navbar.classList.toggle("active");
      menuIcon.textContent = navbar.classList.contains("active") ? "✖" : "☰";
    });
  }

  // 🕓 Footer Year
  if (year) year.textContent = new Date().getFullYear();

// ✍️ Update Counts (clean + accurate)
function updateCounts() {
  // 1️⃣ Clean HTML (remove tags, collapse spaces)
  const cleanText = editor.innerHTML
    .replace(/<[^>]*>/g, '')   // remove all HTML tags
    .replace(/&nbsp;/g, ' ')   // replace non-breaking spaces
    .replace(/\s+/g, ' ')      // collapse multiple spaces
    .trim();

  // 2️⃣ Word count
  const words = cleanText === "" ? 0 : cleanText.split(/\b[\s,.:;!?()"'`]+/).filter(Boolean).length;

  // 3️⃣ Character counts
  const charsWithSpaces = cleanText.length;
  const charsWithoutSpaces = cleanText.replace(/\s/g, '').length;
  const spaces = (cleanText.match(/ /g) || []).length;

  // 4️⃣ Sentence & paragraph counts
  const sentences = (cleanText.match(/[.!?]+(\s|$)/g) || []).length;
  const paragraphs = cleanText.split(/\n+/).filter(p => p.trim() !== "").length;

  // 5️⃣ Update DOM
  wordCountEl.textContent = words;
  // charCountEl.textContent = charsWithSpaces; // for old compatibility
  document.getElementById("charCountWithSpaces").textContent = charsWithSpaces;
  document.getElementById("charCountWithoutSpaces").textContent = charsWithoutSpaces;
  spaceCountEl.textContent = spaces;
  document.getElementById("sentenceCount").textContent = sentences;
  document.getElementById("paragraphCount").textContent = paragraphs;

  // 6️⃣ Update extras
  updateTimes(words);
  updateKeywords(cleanText);
  updateReadingLevel(cleanText, words, sentences);
  checkGoal(words);

  // 7️⃣ Save text locally
  localStorage.setItem("savedText", cleanText);
}

// ⏱️ Reading & Speaking Time (minutes + seconds)
function updateTimes(words) {
  // Reading speed: 200 wpm (≈3.33 words/s)
  // Speaking speed: 130 wpm (≈2.17 words/s)
  const readSec = Math.round(words / (200 / 60));   // words ÷ (words per min / 60)
  const speakSec = Math.round(words / (130 / 60));

  readTimeEl.textContent = formatTime(readSec);
  speakTimeEl.textContent = formatTime(speakSec);
}

function formatTime(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs === 0 ? `${minutes}m` : `${minutes}m ${secs}s`;
}

  // 🔍 Keyword Density
  function updateKeywords(text) {
    const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);
    keywordsEl.innerHTML =
      top.map(([w, c]) => `<li>${w}: ${(c / words.length * 100).toFixed(1)}%</li>`).join("") || "<li>None</li>";
  }

  // 🎓 Reading Level (Flesch-Kincaid)
  function updateReadingLevel(text, words, sentences) {
    const readingEl = document.getElementById("readingLevel");
    if (sentences === 0 || words === 0) {
      readingEl.textContent = "—";
      return;
    }
    const syllables = (text.match(/[aeiouy]+/gi) || []).length;
    const fkGrade = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
    const level = fkGrade.toFixed(1);
    readingEl.textContent =
      level <= 5 ? `Easy (Grade ${level})` :
      level <= 10 ? `Medium (Grade ${level})` :
      `Advanced (Grade ${level})`;
  }

  // 🎯 Word Goal + Progress Bar
  goalInput?.addEventListener("input", () => checkGoal(parseInt(wordCountEl.textContent)));
function checkGoal(words) {
  const goal = parseInt(goalInput?.value || 0);
  if (!goal) {
    goalStatus.textContent = "";
    goalFill.style.width = "0%";
    goalFill.style.filter = "hue-rotate(0deg)";
    return;
  }

  const percent = Math.min((words / goal) * 100, 100);
  goalFill.style.width = `${percent}%`;

  // 🌈 Smooth color transition via hue rotation
  const hue = Math.min(120, (percent / 100) * 120); // Red (0°) → Green (120°)
  goalFill.style.filter = `hue-rotate(${hue}deg)`;

  if (words >= goal) {
    goalStatus.textContent = `✅ Goal reached! (${words}/${goal} words)`;
    goalStatus.style.color = "#38b2ac";
  } else {
    goalStatus.textContent = `Progress: ${words}/${goal} words`;
    goalStatus.style.color = "#e67e22";
  }
}


  // 🔦 Word Highlighting
  function updateHighlight() {
    const text = editor.innerText;
    const searchWord = searchWordInput.value.trim();
    if (!searchWord) {
      highlightedTextDiv.innerHTML = text;
      occurrencesEl.textContent = 0;
      return;
    }
    const regex = new RegExp(`\\b(${escapeRegExp(searchWord)})\\b`, "gi");
    highlightedTextDiv.innerHTML = text.replace(regex, "<mark>$1</mark>");
    const matches = text.match(regex);
    occurrencesEl.textContent = matches ? matches.length : 0;
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // 📝 Replace Words
  document.getElementById('replaceBtn').addEventListener('click', () => {
    const searchWord = searchWordInput.value.trim();
    const replacement = replaceWordInput.value;
    if (!searchWord) return;
    const regex = new RegExp(`\\b(${escapeRegExp(searchWord)})\\b`, "gi");
    editor.innerText = editor.innerText.replace(regex, replacement);
    replaceWordInput.value = "";
    updateCounts();
  });

  // 💾 Save / 🧹 Clear
  saveBtn.addEventListener('click', () => {
    const blob = new Blob([editor.innerText], { type: "text/plain" });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "text.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  clearBtn.addEventListener('click', () => {
    editor.innerText = "";
    localStorage.removeItem('savedText');
    updateCounts();
  });

  // 📋 Copy Text
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(editor.innerText).then(() => {
      toast.style.opacity = 1;
      copyBtn.textContent = "✅";
      setTimeout(() => {
        toast.style.opacity = 0;
        copyBtn.textContent = "📋 Copy";
      }, 1500);
    });
  });

  // 🪄 Fix All Mistakes
  fixAllBtn.addEventListener("click", async () => {
    const text = editor.innerText.trim();
    if (!text) return;
    fixAllBtn.textContent = "⏳ Fixing...";
    try {
      const res = await fetch("https://api.languagetool.org/v2/check", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ text, language: "en-US" })
      });
      const data = await res.json();
      let correctedText = text;
      const sortedMatches = data.matches.sort((a, b) => b.offset - a.offset);
      for (const match of sortedMatches) {
        const best = match.replacements[0]?.value;
        if (best) {
          correctedText = correctedText.slice(0, match.offset) + best + correctedText.slice(match.offset + match.length);
        }
      }
      editor.innerText = correctedText;
      latestText = correctedText;
      runCheck();
      fixAllBtn.textContent = "✅ Fixed!";
      setTimeout(() => fixAllBtn.textContent = "🪄 Fix All", 1500);
    } catch (e) {
      fixAllBtn.textContent = "⚠️ Try Again";
      console.error(e);
    }
  });

  // 🧠 Grammar & Spell Check (LanguageTool)
  let latestText = "", activeTarget = null, hideTimer = null, checkTimer = null, recheckTimer = null;
  let tooltipLocked = false, insideHoverZone = false;

  editor.addEventListener("input", () => {
    clearTimeout(checkTimer);
    latestText = editor.innerText;
    checkTimer = setTimeout(runCheck, 900);
    updateCounts();
  });

  async function runCheck() {
    if (tooltipLocked) return;
    const text = editor.innerText.trim();
    if (!text) return;
    try {
      const res = await fetch("https://api.languagetool.org/v2/check", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ text, language: "en-US" })
      });
      const data = await res.json();
      highlightIssues(data.matches);
    } catch (e) { console.error(e); }
  }

  function highlightIssues(matches) {
    const text = latestText;
    let segments = [], last = 0;
    matches.forEach(m => {
      if (m.offset > last) segments.push(escapeHtml(text.slice(last, m.offset)));
      const wrong = text.slice(m.offset, m.offset + m.length);
      const cls = m.rule.issueType === "misspelling" ? "error-spell" : "error-grammar";
      const sug = m.replacements.slice(0, 3).map(s => s.value);
      segments.push(`<span class="${cls}" data-suggestions='${JSON.stringify(sug)}'>${escapeHtml(wrong)}</span>`);
      last = m.offset + m.length;
    });
    segments.push(escapeHtml(text.slice(last)));
    editor.innerHTML = segments.join("");
    placeCaretAtEnd(editor);
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, m =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[m])
    );
  }

  function placeCaretAtEnd(el) {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  // 💡 Tooltip Suggestion System
  editor.addEventListener("mousemove", e => {
    const t = e.target;
    if (t.classList.contains("error-spell") || t.classList.contains("error-grammar")) {
      insideHoverZone = true;
      clearTimeout(hideTimer);
      if (activeTarget !== t) showTooltip(t);
    } else {
      insideHoverZone = false;
      if (!tooltip.matches(":hover")) scheduleHideTooltip();
    }
  });

  tooltip.addEventListener("mouseenter", () => {
    insideHoverZone = true;
    clearTimeout(hideTimer);
  });

  tooltip.addEventListener("mouseleave", () => {
    insideHoverZone = false;
    scheduleHideTooltip();
  });

  function showTooltip(target) {
    const sugg = JSON.parse(target.dataset.suggestions);
    const rect = target.getBoundingClientRect();
    tooltip.innerHTML = `
      <strong>${target.classList.contains("error-spell") ? "Spelling suggestions:" : "Grammar suggestions:"}</strong>
      <ul>${sugg.map(s => `<li>${s}</li>`).join("") || "<li>No suggestions</li>"}</ul>`;
    tooltip.classList.add("visible");
    tooltip.style.left = rect.left + window.scrollX + "px";
    tooltip.style.top = rect.bottom + window.scrollY + 8 + "px";
    activeTarget = target;
  }

  function scheduleHideTooltip() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (!insideHoverZone) {
        tooltip.classList.remove("visible");
        activeTarget = null;
      }
    }, 800);
  }

  // 🖱️ Apply suggestion click
  tooltip.addEventListener("click", e => {
    if (e.target.tagName === "LI" && activeTarget) {
      tooltipLocked = true;
      const newWord = e.target.textContent;
      activeTarget.outerHTML = newWord;
      latestText = editor.innerText;
      tooltip.classList.remove("visible");
      clearTimeout(recheckTimer);
      recheckTimer = setTimeout(() => {
        tooltipLocked = false;
        runCheck();
      }, 400);
    }
  });

  // 🔁 Event Listeners
  searchWordInput.addEventListener('input', updateHighlight);

});



// document.addEventListener("DOMContentLoaded", () => {

// const editor = document.getElementById('editor');
// const wordCountEl = document.getElementById('wordCount');
// const charCountEl = document.getElementById('charCount');
// const spaceCountEl = document.getElementById('spaceCount');
// const readTimeEl = document.getElementById('readTime');
// const speakTimeEl = document.getElementById('speakTime');
// const keywordsEl = document.getElementById('keywords');
// const searchWordInput = document.getElementById('searchWord');
// const occurrencesEl = document.getElementById('occurrences');
// const highlightedTextDiv = document.getElementById('highlightedText');
// const replaceWordInput = document.getElementById('replaceWord');
// // const toggle = document.querySelector(".toggle-theme");
// const dictInput = document.getElementById('dictInput');
// const dictResult = document.getElementById('dictResult');
// const saveBtn = document.getElementById('saveBtn');
// const clearBtn = document.getElementById('clearBtn');


// // Mobile Navbar Toggle
// const menuIcon = document.getElementById("menu-icon");
// const navbar = document.getElementById("navbar");

// // 📱 Navbar toggle (works safely on all pages)
//   if (menuIcon && navbar) {
//     menuIcon.addEventListener("click", () => {
//       navbar.classList.toggle("active");
//       menuIcon.textContent = navbar.classList.contains("active") ? "✖" : "☰";
//     });
//   }
// // menuIcon.addEventListener("click", () => {
// //     navbar.classList.toggle("active");
// //     menuIcon.textContent = navbar.classList.contains("active") ? "✖" : "☰";
// // });

// // Update counts
// function updateCounts() {
//   const text = editor.innerText.trim();
//   const words = text === "" ? 0 : text.split(/\s+/).length;
//   const chars = text.length;
//   const spaces = (text.match(/ /g) || []).length;
//   const sentences = (text.match(/[.!?]+(\s|$)/g) || []).length;
//   const paragraphs = text.split(/\n+/).filter(p => p.trim() !== "").length;

//   wordCountEl.textContent = words;
//   charCountEl.textContent = chars;
//   spaceCountEl.textContent = spaces;
//   document.getElementById("sentenceCount").textContent = sentences;
//   document.getElementById("paragraphCount").textContent = paragraphs;

//   updateTimes(words);
//   updateKeywords(text);
//   updateReadingLevel(text, words, sentences);
//   checkGoal(words);

//   localStorage.setItem("savedText", text);
// }
// // 🎓 Reading Level Estimation (Flesch-Kincaid Grade)
// function updateReadingLevel(text, words, sentences) {
//   if (sentences === 0 || words === 0) {
//     document.getElementById("readingLevel").textContent = "—";
//     return;
//   }
//   const syllables = (text.match(/[aeiouy]+/gi) || []).length;
//   const fkGrade = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
//   const level = fkGrade.toFixed(1);
//   document.getElementById("readingLevel").textContent =
//     level <= 5 ? "Easy (Grade " + level + ")" :
//     level <= 10 ? "Medium (Grade " + level + ")" :
//     "Advanced (Grade " + level + ")";
// }

// // 🎯 Word Goal Checker
// const goalInput = document.getElementById("goalInput");
// const goalStatus = document.getElementById("goalStatus");

// goalInput?.addEventListener("input", () => checkGoal(parseInt(wordCountEl.textContent)));

// function checkGoal(words) {
//   const goal = parseInt(goalInput?.value || 0);
//   if (!goal) {
//     goalStatus.textContent = "";
//     return;
//   }

//   if (words >= goal) {
//     goalStatus.textContent = `✅ Goal reached! (${words}/${goal} words)`;
//     goalStatus.style.color = "#38b2ac";
//   } else {
//     goalStatus.textContent = `Progress: ${words}/${goal} words`;
//     goalStatus.style.color = "#e67e22";
//   }
// }

// function updateTimes(words) {
//     const readSec = Math.round(words / 3.33);
//     const speakSec = Math.round(words / 2.5);
//     readTimeEl.textContent = `${readSec}s`;
//     speakTimeEl.textContent = `${speakSec}s`;
// }
// function updateKeywords(text) {
//     const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
//     const freq = {};
//     words.forEach(w => freq[w] = (freq[w] || 0) + 1);
//     const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);
//     keywordsEl.innerHTML = top.map(([w, c]) => `<li>${w}: ${(c / words.length * 100).toFixed(1)}%</li>`).join("") || "<li>None</li>";
// }
// function updateHighlight() {
//     const text = editor.innerText;
//     const searchWord = searchWordInput.innerText.trim();
//     if (!searchWord) { highlightedTextDiv.innerHTML = text; occurrencesEl.textContent = 0; return; }
//     const regex = new RegExp(`\\b(${escapeRegExp(searchWord)})\\b`, "gi");
//     highlightedTextDiv.innerHTML = text.replace(regex, "<mark>$1</mark>");
//     const matches = text.match(regex);
//     occurrencesEl.textContent = matches ? matches.length : 0;
// }
// function escapeRegExp(string) { return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

// // Replace highlighted words
// document.getElementById('replaceBtn').addEventListener('click', () => {
//     const searchWord = searchWordInput.innerText.trim();
//     const replacement = replaceWordInput.innerText;
//     if (!searchWord) return;
//     const regex = new RegExp(`\\b(${escapeRegExp(searchWord)})\\b`, "gi");
//     editor.innerText = editor.innerText.replace(regex, replacement);
//     replaceWordInput.innerText = "";
//     updateCounts();
// });

// // Save and Clear
// // Download text
// saveBtn.addEventListener('click', () => {
//     const blob = new Blob([editor.innerText], { type: "text/plain" });
//     const a = document.createElement('a');
//     a.href = URL.createObjectURL(blob);
//     a.download = "text.txt";
//     a.click();
//     URL.revokeObjectURL(a.href);
// });
// clearBtn.addEventListener('click', () => {
//     editor.innerText = "";
//     localStorage.removeItem('savedText');
//     updateCounts();
// });

// // 🌙 Persistent Dark Mode Setup


// // Load saved theme from localStorage
// //   if (toggle) {
// //     if (localStorage.getItem("theme") === "dark") {
// //       document.body.classList.add("dark");
// //       toggle.textContent = "☀️ Light Mode";
// //     } else {
// //       toggle.textContent = "🌙 Dark Mode";
// //     }

// //     toggle.addEventListener("click", () => {
// //       document.body.classList.toggle("dark");
// //       const mode = document.body.classList.contains("dark") ? "dark" : "light";
// //       localStorage.setItem("theme", mode);
// //       toggle.textContent = mode === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
// //     });
// //   }
//     // 🕓 Footer year (safe on all pages)
//   const year = document.getElementById("year");
//   if (year) year.textContent = new Date().getFullYear();


// // if (localStorage.getItem("theme") === "dark") {
// //   document.body.classList.add("dark");
// //   toggle.textContent = "☀️ Light Mode";
// // } else {
// //   toggle.textContent = "🌙 Dark Mode";
// // }

// // // Toggle theme and save preference
// // toggle.addEventListener("click", () => {
// //   document.body.classList.toggle("dark");
// //   const mode = document.body.classList.contains("dark") ? "dark" : "light";
// //   localStorage.setItem("theme", mode);
// //   toggle.textContent = mode === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
// // });


// const tooltip = document.getElementById("tooltip");
// const copyBtn = document.getElementById("copyBtn");
// const fixAllBtn = document.getElementById("fixAllBtn");
// const toast = document.getElementById("toast");
// let latestText = "", activeTarget = null, hideTimer = null, checkTimer = null, recheckTimer = null;
// let tooltipLocked = false, insideHoverZone = false;

// // Typing listener
// editor.addEventListener("input", () => {
//     clearTimeout(checkTimer);
//     latestText = editor.innerText;
//     checkTimer = setTimeout(runCheck, 900);
// });

// // Spell + Grammar Check
// async function runCheck() {
//     if (tooltipLocked) return;
//     const text = editor.innerText.trim();
//     if (!text) return;
//     try {
//         const res = await fetch("https://api.languagetool.org/v2/check", {
//             method: "POST",
//             headers: { "Content-Type": "application/x-www-form-urlencoded" },
//             body: new URLSearchParams({ text, language: "en-US" })
//         });
//         const data = await res.json();
//         highlightIssues(data.matches);
//     } catch (e) { console.error(e); }
// }

// function highlightIssues(matches) {
//     const text = latestText;
//     let segments = [], last = 0;
//     matches.forEach(m => {
//         if (m.offset > last) segments.push(escapeHtml(text.slice(last, m.offset)));
//         const wrong = text.slice(m.offset, m.offset + m.length);
//         const cls = m.rule.issueType === "misspelling" ? "error-spell" : "error-grammar";
//         const sug = m.replacements.slice(0, 3).map(s => s.value);
//         segments.push(`<span class="${cls}" data-suggestions='${JSON.stringify(sug)}'>${escapeHtml(wrong)}</span>`);
//         last = m.offset + m.length;
//     });
//     segments.push(escapeHtml(text.slice(last)));
//     editor.innerHTML = segments.join("");
//     placeCaretAtEnd(editor);
// }
// function escapeHtml(str) {
//     return str.replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[m]));
// }
// function placeCaretAtEnd(el) {
//     const range = document.createRange();
//     const sel = window.getSelection();
//     range.selectNodeContents(el);
//     range.collapse(false);
//     sel.removeAllRanges();
//     sel.addRange(range);
// }

// // Tooltip behavior
// editor.addEventListener("mousemove", e => {
//     const t = e.target;
//     if (t.classList.contains("error-spell") || t.classList.contains("error-grammar")) {
//         insideHoverZone = true;
//         clearTimeout(hideTimer);
//         if (activeTarget !== t) showTooltip(t);
//     } else {
//         insideHoverZone = false;
//         if (!tooltip.matches(":hover")) scheduleHideTooltip();
//     }
// });
// tooltip.addEventListener("mouseenter", () => { insideHoverZone = true; clearTimeout(hideTimer); });
// tooltip.addEventListener("mouseleave", () => { insideHoverZone = false; scheduleHideTooltip(); });
// function showTooltip(target) {
//     const sugg = JSON.parse(target.dataset.suggestions);
//     const rect = target.getBoundingClientRect();
//     tooltip.innerHTML = `<strong>${target.classList.contains("error-spell") ? "Spelling suggestions:" : "Grammar suggestions:"}</strong><ul>${sugg.map(s => `<li>${s}</li>`).join("") || "<li>No suggestions</li>"}</ul>`;
//     tooltip.classList.add("visible");
//     tooltip.style.left = rect.left + window.scrollX + "px";
//     tooltip.style.top = rect.bottom + window.scrollY + 8 + "px";
//     activeTarget = target;
// }
// function scheduleHideTooltip() { clearTimeout(hideTimer); hideTimer = setTimeout(() => { if (!insideHoverZone) { tooltip.classList.remove("visible"); activeTarget = null; } }, 800); }

// // Click suggestion replaces word
// tooltip.addEventListener("click", e => {
//     if (e.target.tagName === "LI" && activeTarget) {
//         tooltipLocked = true;
//         const newWord = e.target.textContent;
//         activeTarget.outerHTML = newWord;
//         latestText = editor.innerText;
//         tooltip.classList.remove("visible");
//         clearTimeout(recheckTimer);
//         recheckTimer = setTimeout(() => { tooltipLocked = false; runCheck(); }, 400);
//     }
// });

// // Copy Text
// copyBtn.addEventListener("click", () => {
//     navigator.clipboard.writeText(editor.innerText).then(() => {
//         toast.style.opacity = 1;
//         copyBtn.textContent = "✅";
//         setTimeout(() => { toast.style.opacity = 0; copyBtn.textContent = "📋 Copy Text"; }, 1500);
//     });
// });

// // Fix All Mistakes
// fixAllBtn.addEventListener("click", async () => {
//     const text = editor.innerText.trim();
//     if (!text) return;
//     fixAllBtn.textContent = "⏳ Fixing...";
//     try {
//         const res = await fetch("https://api.languagetool.org/v2/check", {
//             method: "POST",
//             headers: { "Content-Type": "application/x-www-form-urlencoded" },
//             body: new URLSearchParams({ text, language: "en-US" })
//         });
//         const data = await res.json();
//         let correctedText = text;
//         const sortedMatches = data.matches.sort((a, b) => b.offset - a.offset);
//         for (const match of sortedMatches) {
//             const best = match.replacements[0]?.value;
//             if (best) { correctedText = correctedText.slice(0, match.offset) + best + correctedText.slice(match.offset + match.length); }
//         }
//         editor.innerText = correctedText;
//         latestText = correctedText;
//         runCheck();
//         fixAllBtn.textContent = "✅ Fixed!";
//         setTimeout(() => fixAllBtn.textContent = "🪄 Fix All", 1500);
//     } catch (e) { fixAllBtn.textContent = "⚠️ Try Again"; console.error(e); }
// });

// editor.addEventListener('input', updateCounts);
// searchWordInput.addEventListener('input', updateHighlight);
// });