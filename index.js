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
const toggle = document.querySelector(".toggle-theme");
const dictInput = document.getElementById('dictInput');
const dictResult = document.getElementById('dictResult');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile Navbar Toggle
const menuIcon = document.getElementById("menu-icon");
const navbar = document.getElementById("navbar");

menuIcon.addEventListener("click", () => {
    navbar.classList.toggle("active");
    menuIcon.textContent = navbar.classList.contains("active") ? "✖" : "☰";
});

// Update counts
function updateCounts() {
    const text = editor.innerText;
    charCountEl.textContent = text.length;
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    wordCountEl.textContent = words;
    const spaces = (text.match(/ /g) || []).length;
    spaceCountEl.textContent = spaces;
    updateTimes(words);
    updateKeywords(text);
    updateHighlight();
    localStorage.setItem("savedText", text);
}
function updateTimes(words) {
    const readSec = Math.round(words / 3.33);
    const speakSec = Math.round(words / 2.5);
    readTimeEl.textContent = `${readSec}s`;
    speakTimeEl.textContent = `${speakSec}s`;
}
function updateKeywords(text) {
    const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);
    keywordsEl.innerHTML = top.map(([w, c]) => `<li>${w}: ${(c / words.length * 100).toFixed(1)}%</li>`).join("") || "<li>None</li>";
}
function updateHighlight() {
    const text = editor.innerText;
    const searchWord = searchWordInput.innerText.trim();
    if (!searchWord) { highlightedTextDiv.innerHTML = text; occurrencesEl.textContent = 0; return; }
    const regex = new RegExp(`\\b(${escapeRegExp(searchWord)})\\b`, "gi");
    highlightedTextDiv.innerHTML = text.replace(regex, "<mark>$1</mark>");
    const matches = text.match(regex);
    occurrencesEl.textContent = matches ? matches.length : 0;
}
function escapeRegExp(string) { return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

// Replace highlighted words
document.getElementById('replaceBtn').addEventListener('click', () => {
    const searchWord = searchWordInput.innerText.trim();
    const replacement = replaceWordInput.innerText;
    if (!searchWord) return;
    const regex = new RegExp(`\\b(${escapeRegExp(searchWord)})\\b`, "gi");
    editor.innerText = editor.innerText.replace(regex, replacement);
    replaceWordInput.innerText = "";
    updateCounts();
});

// Save and Clear
// Download text
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

// 🌙 Persistent Dark Mode
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    toggle.textContent = "☀️ Light Mode";
} else { toggle.textContent = "🌙 Dark Mode"; }
toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const mode = document.body.classList.contains("dark") ? "dark" : "light";
    localStorage.setItem("theme", mode);
    toggle.textContent = mode === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
});


const tooltip = document.getElementById("tooltip");
const copyBtn = document.getElementById("copyBtn");
const fixAllBtn = document.getElementById("fixAllBtn");
const toast = document.getElementById("toast");
let latestText = "", activeTarget = null, hideTimer = null, checkTimer = null, recheckTimer = null;
let tooltipLocked = false, insideHoverZone = false;

// Typing listener
editor.addEventListener("input", () => {
    clearTimeout(checkTimer);
    latestText = editor.innerText;
    checkTimer = setTimeout(runCheck, 900);
});

// Spell + Grammar Check
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
    return str.replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[m]));
}
function placeCaretAtEnd(el) {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
}

// Tooltip behavior
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
tooltip.addEventListener("mouseenter", () => { insideHoverZone = true; clearTimeout(hideTimer); });
tooltip.addEventListener("mouseleave", () => { insideHoverZone = false; scheduleHideTooltip(); });
function showTooltip(target) {
    const sugg = JSON.parse(target.dataset.suggestions);
    const rect = target.getBoundingClientRect();
    tooltip.innerHTML = `<strong>${target.classList.contains("error-spell") ? "Spelling suggestions:" : "Grammar suggestions:"}</strong><ul>${sugg.map(s => `<li>${s}</li>`).join("") || "<li>No suggestions</li>"}</ul>`;
    tooltip.classList.add("visible");
    tooltip.style.left = rect.left + window.scrollX + "px";
    tooltip.style.top = rect.bottom + window.scrollY + 8 + "px";
    activeTarget = target;
}
function scheduleHideTooltip() { clearTimeout(hideTimer); hideTimer = setTimeout(() => { if (!insideHoverZone) { tooltip.classList.remove("visible"); activeTarget = null; } }, 800); }

// Click suggestion replaces word
tooltip.addEventListener("click", e => {
    if (e.target.tagName === "LI" && activeTarget) {
        tooltipLocked = true;
        const newWord = e.target.textContent;
        activeTarget.outerHTML = newWord;
        latestText = editor.innerText;
        tooltip.classList.remove("visible");
        clearTimeout(recheckTimer);
        recheckTimer = setTimeout(() => { tooltipLocked = false; runCheck(); }, 400);
    }
});

// Copy Text
copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(editor.innerText).then(() => {
        toast.style.opacity = 1;
        copyBtn.textContent = "✅";
        setTimeout(() => { toast.style.opacity = 0; copyBtn.textContent = "📋 Copy Text"; }, 1500);
    });
});

// Fix All Mistakes
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
            if (best) { correctedText = correctedText.slice(0, match.offset) + best + correctedText.slice(match.offset + match.length); }
        }
        editor.innerText = correctedText;
        latestText = correctedText;
        runCheck();
        fixAllBtn.textContent = "✅ Fixed!";
        setTimeout(() => fixAllBtn.textContent = "🪄 Fix All", 1500);
    } catch (e) { fixAllBtn.textContent = "⚠️ Try Again"; console.error(e); }
});

editor.addEventListener('input', updateCounts);
searchWordInput.addEventListener('input', updateHighlight);
