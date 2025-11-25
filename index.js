let textarea = document.querySelector("#textarea");

textarea.addEventListener("input", function () {
    // 1. Get the full text
    let text = textarea.value.trim();
    
    // 2. Split by any whitespace (space, tab, newline)
    let words = text.split(/\s+/);
    
    // 3. Filter out any empty strings (just in case)
    words = words.filter(word => word.length > 0);
    
    // 4. Show the word count
   console.log(words);

});
