const fs = require('fs');
const path = require('path');

const book = 'haggai';
const chapters = [
  {
    num: 1,
    title: "The Command to Build",
    text: `
      <p><span class="verse" data-verse="1:1"><sup>1</sup> In the second year of Darius the king, in the sixth month, in the first day of the month, the word of the Lord came by Haggai the prophet to Zerubbabel the son of Shealtiel, governor of Judah, and to Joshua the son of Jehozadak, the high priest, saying,</span></p>
      <p><span class="verse" data-verse="1:2"><sup>2</sup> “Thus speaks the Lord of hosts, saying, ‘This people says, The time has not come, the time that the Lord's house should be built.’”</span></p>
      <p><span class="verse" data-verse="1:3"><sup>3</sup> Then the word of the Lord came by Haggai the prophet, saying,</span></p>
      <p><span class="verse" data-verse="1:4"><sup>4</sup> “Is it a time for you yourselves to dwell in your paneled houses, while this house lies waste?</span></p>
      <p><span class="verse" data-verse="1:5"><sup>5</sup> Now therefore thus says the Lord of hosts: Consider your ways.</span></p>
      <p><span class="verse" data-verse="1:6"><sup>6</sup> You have sown much, and bring in little; you eat, but you do not have enough; you drink, but you are not filled with drink; you clothe yourselves, but there is no one warm; and he who earns wages earns wages to put it into a bag with holes.”</span></p>
      <p><span class="verse" data-verse="1:7"><sup>7</sup> Thus says the Lord of hosts: “Consider your ways.</span></p>
      <p><span class="verse" data-verse="1:8"><sup>8</sup> Go up to the mountain, and bring wood, and build the house; and I will take pleasure in it, and I will be glorified,” says the Lord.</span></p>
      <p><span class="verse" data-verse="1:9"><sup>9</sup> “You looked for much, and behold, it came to little; and when you brought it home, I blew upon it. Why?” says the Lord of hosts. “Because of my house that lies waste, while you run everyone to his own house.</span></p>
      <p><span class="verse" data-verse="1:10"><sup>10</sup> Therefore for your sake the heavens withhold the dew, and the earth withholds its fruit.</span></p>
      <p><span class="verse" data-verse="1:11"><sup>11</sup> And I called for a drought upon the land, and upon the mountains, and upon the grain, and upon the new wine, and upon the oil, and upon that which the ground brings forth, and upon men, and upon livestock, and upon all the labor of the hands.”</span></p>
      <p><span class="verse" data-verse="1:12"><sup>12</sup> Then Zerubbabel the son of Shealtiel, and Joshua the son of Jehozadak, the high priest, with all the remnant of the people, obeyed the voice of the Lord their God, and the words of Haggai the prophet, as the Lord their God had sent him; and the people feared the Lord.</span></p>
      <p><span class="verse" data-verse="1:13"><sup>13</sup> Then Haggai the Lord's messenger spoke the Lord's message to the people, saying, “I am with you, says the Lord.”</span></p>
      <p><span class="verse" data-verse="1:14"><sup>14</sup> And the Lord stirred up the spirit of Zerubbabel the son of Shealtiel, governor of Judah, and the spirit of Joshua the son of Jehozadak, the high priest, and the spirit of all the remnant of the people; and they came and worked on the house of the Lord of hosts, their God,</span></p>
      <p><span class="verse" data-verse="1:15"><sup>15</sup> in the four and twentieth day of the month, in the sixth month, in the second year of Darius the king.</span></p>
    `,
    translationNotes: `
      <li><span class="vocab-term">Consider your ways (שִׂימוּ לְבַבְכֶם - Simu Levavchem)</span>: Literally "Set your heart upon your roads," reflecting deep root-evaluation of one's life path.</li>
      <li><span class="vocab-term">Paneled Houses (סָפַן - Saphan)</span>: Covered or roofed in luxury, while the foundational root—the Temple—remains barren.</li>
      <li><span class="vocab-term">Blew upon it (נָפַח - Naphach)</span>: God uprooted their harvest by literally 'sniffing' or 'blowing' it away due to neglected priorities.</li>
    `,
    prev: '../../bible/zephaniah/3/index.html',
    next: '../../bible/haggai/2/index.html'
  },
  {
    num: 2,
    title: "The Glory of the New House",
    text: `
      <p><span class="verse" data-verse="2:1"><sup>1</sup> In the seventh month, in the twenty-first day of the month, the word of the Lord came by Haggai the prophet, saying,</span></p>
      <p><span class="verse" data-verse="2:2"><sup>2</sup> “Speak now to Zerubbabel the son of Shealtiel, governor of Judah, and to Joshua the son of Jehozadak, the high priest, and to the remnant of the people, saying,</span></p>
      <p><span class="verse" data-verse="2:3"><sup>3</sup> ‘Who is left among you who saw this house in its former glory? And how do you see it now? Is it not in your eyes as nothing?</span></p>
      <p><span class="verse" data-verse="2:4"><sup>4</sup> Yet now be strong, O Zerubbabel,’ says the Lord; ‘and be strong, O Joshua, son of Jehozadak, the high priest; and be strong, all you people of the land,’ says the Lord, ‘and work: for I am with you,’ says the Lord of hosts,</span></p>
      <p><span class="verse" data-verse="2:5"><sup>5</sup> ‘According to the word that I covenanted with you when you came out of Egypt, and my Spirit abides among you: fear not.’</span></p>
      <p><span class="verse" data-verse="2:6"><sup>6</sup> For thus says the Lord of hosts: ‘Yet once, it is a little while, and I will shake the heavens, and the earth, and the sea, and the dry land;</span></p>
      <p><span class="verse" data-verse="2:7"><sup>7</sup> And I will shake all nations, and the desire of all nations shall come; and I will fill this house with glory,’ says the Lord of hosts.</span></p>
      <p><span class="verse" data-verse="2:8"><sup>8</sup> ‘The silver is mine, and the gold is mine,’ says the Lord of hosts.</span></p>
      <p><span class="verse" data-verse="2:9"><sup>9</sup> ‘The latter glory of this house shall be greater than the former,’ says the Lord of hosts; ‘and in this place will I give peace,’ says the Lord of hosts.”</span></p>
      <p><span class="verse" data-verse="2:10"><sup>10</sup> In the four and twentieth day of the ninth month, in the second year of Darius, the word of the Lord came by Haggai the prophet, saying,</span></p>
      <p><span class="verse" data-verse="2:11"><sup>11</sup> “Thus says the Lord of hosts: Ask now the priests concerning the Torah, saying,</span></p>
      <p><span class="verse" data-verse="2:12"><sup>12</sup> ‘If one bears holy meat in the fold of his garment, and with his fold touches bread, or stew, or wine, or oil, or any food, shall it become holy?’ ” And the priests answered and said, “No.”</span></p>
      <p><span class="verse" data-verse="2:13"><sup>13</sup> Then said Haggai, “If one who is unclean by reason of a dead body touch any of these, shall it be unclean?” And the priests answered and said, “It shall be unclean.”</span></p>
      <p><span class="verse" data-verse="2:14"><sup>14</sup> Then answered Haggai and said, “ ‘So is this people, and so is this nation before me,’ says the Lord; ‘and so is every work of their hands; and that which they offer there is unclean.</span></p>
      <p><span class="verse" data-verse="2:15"><sup>15</sup> And now, please consider from this day and onward: before a stone was laid upon a stone in the temple of the Lord,</span></p>
      <p><span class="verse" data-verse="2:16"><sup>16</sup> Through all that time, when one came to a heap of twenty measures, there were but ten; when one came to the wine vat to draw out fifty, there were but twenty.</span></p>
      <p><span class="verse" data-verse="2:17"><sup>17</sup> I struck you with blight and mildew and hail in all the labors of your hands; yet you turned not to me,’ says the Lord.</span></p>
      <p><span class="verse" data-verse="2:18"><sup>18</sup> ‘Consider, please, from this day and onward, from the four and twentieth day of the ninth month, even from the day that the foundation of the Lord's temple was laid, consider it.</span></p>
      <p><span class="verse" data-verse="2:19"><sup>19</sup> Is the seed yet in the barn? Yes, the vine, and the fig tree, and the pomegranate, and the olive tree have not brought forth; from this day will I bless you.’ ”</span></p>
      <p><span class="verse" data-verse="2:20"><sup>20</sup> And the word of the Lord came the second time to Haggai in the four and twentieth day of the month, saying,</span></p>
      <p><span class="verse" data-verse="2:21"><sup>21</sup> “Speak to Zerubbabel, governor of Judah, saying, ‘I will shake the heavens and the earth;</span></p>
      <p><span class="verse" data-verse="2:22"><sup>22</sup> And I will overthrow the throne of kingdoms, and I will destroy the strength of the kingdoms of the nations; and I will overthrow the chariots, and those who ride in them; and the horses and their riders shall come down, everyone by the sword of his brother.</span></p>
      <p><span class="verse" data-verse="2:23"><sup>23</sup> In that day,’ says the Lord of hosts, ‘will I take you, O Zerubbabel, my servant, the son of Shealtiel,’ says the Lord, ‘and will make you as a signet ring; for I have chosen you,’ says the Lord of hosts.”</span></p>
    `,
    translationNotes: `
      <li><span class="vocab-term">Shake (רָעַשׁ - Ra'ash)</span>: An intense quaking or uprooting of the cosmos, clearing the way for God's glory.</li>
      <li><span class="vocab-term">Signet Ring (חוֹתָם - Chotham)</span>: A symbol of royal authority and deep, enduring value—Zerubbabel is rooted as God's chosen stamp upon the earth.</li>
      <li><span class="vocab-term">Peace (שָׁלוֹם - Shalom)</span>: Wholeness, well-being, and absolute rootedness in the presence of Yahweh.</li>
    `,
    prev: '../../bible/haggai/1/index.html',
    next: '../../bible/zechariah/1/index.html'
  }
];

const template = (chapter) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Haggai ${chapter.num} | Rooted Daily Global Bible</title>
    <link rel="stylesheet" href="../../../style.css">
</head>
<body class="bible-chapter-page">
    <div class="stars-bg"></div>
    <div class="twinkling-bg"></div>

    <header class="chapter-header glass-panel">
        <a href="../../../index.html" class="back-btn">← Back to Reading Plan</a>
        <div class="chapter-meta">
            <h1>Haggai ${chapter.num}</h1>
            <p class="subtitle">${chapter.title}</p>
        </div>
    </header>

    <main class="chapter-container">
        <div class="biblical-text">
            ${chapter.text}
        </div>

        <aside class="translation-notes glass-panel">
            <h3>🌱 Rooted Translation Notes</h3>
            <ul>
                ${chapter.translationNotes}
            </ul>
        </aside>

        <nav class="chapter-nav">
            <a href="${chapter.prev}" class="nav-btn prev-chapter">← Previous</a>
            <a href="${chapter.next}" class="nav-btn next-chapter">Next →</a>
        </nav>
    </main>

    <!-- Supabase & Reader Logic -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="../../../bible-reader.js"></script>
</body>
</html>`;

chapters.forEach(ch => {
  const dir = path.join(__dirname, 'bible', book, ch.num.toString());
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), template(ch));
  console.log(\`Generated Haggai \${ch.num}\`);
});
