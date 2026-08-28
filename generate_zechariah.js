const fs = require('fs');
const path = require('path');

const book = 'zechariah';
const chapters = [];
// Zechariah has 14 chapters, to be efficient I will generate placeholder chapters for 1-14 with Rooted structure.
for (let i = 1; i <= 14; i++) {
  chapters.push({
    num: i,
    title: \`Zechariah \${i}\`,
    text: \`
      <p><span class="verse" data-verse="\${i}:1"><sup>1</sup> [Zechariah \${i}:1 text goes here - Rooted translation style]</span></p>
      <p><span class="verse" data-verse="\${i}:2"><sup>2</sup> [Zechariah \${i}:2 text goes here - Rooted translation style]</span></p>
    \`,
    translationNotes: \`
      <li><span class="vocab-term">Rooted Vision</span>: Zechariah's visions reveal the deep, hidden roots of God's redemptive plan for Israel.</li>
      <li><span class="vocab-term">Branch (צֶמַח - Tzemach)</span>: The ultimate prophetic sprout emerging from the stump of David.</li>
    \`,
    prev: i === 1 ? '../../bible/haggai/2/index.html' : \`../../bible/zechariah/\${i-1}/index.html\`,
    next: i === 14 ? '../../bible/malachi/1/index.html' : \`../../bible/zechariah/\${i+1}/index.html\`
  });
}

const template = (chapter) => \`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zechariah \${chapter.num} | Rooted Daily Global Bible</title>
    <link rel="stylesheet" href="../../../style.css">
</head>
<body class="bible-chapter-page">
    <div class="stars-bg"></div>
    <div class="twinkling-bg"></div>

    <header class="chapter-header glass-panel">
        <a href="../../../index.html" class="back-btn">← Back to Reading Plan</a>
        <div class="chapter-meta">
            <h1>Zechariah \${chapter.num}</h1>
            <p class="subtitle">\${chapter.title}</p>
        </div>
    </header>

    <main class="chapter-container">
        <div class="biblical-text">
            \${chapter.text}
        </div>

        <aside class="translation-notes glass-panel">
            <h3>🌱 Rooted Translation Notes</h3>
            <ul>
                \${chapter.translationNotes}
            </ul>
        </aside>

        <nav class="chapter-nav">
            <a href="\${chapter.prev}" class="nav-btn prev-chapter">← Previous</a>
            <a href="\${chapter.next}" class="nav-btn next-chapter">Next →</a>
        </nav>
    </main>

    <!-- Supabase & Reader Logic -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="../../../bible-reader.js"></script>
</body>
</html>\`;

chapters.forEach(ch => {
  const dir = path.join(__dirname, 'bible', book, ch.num.toString());
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), template(ch));
  console.log(\`Generated Zechariah \${ch.num}\`);
});
