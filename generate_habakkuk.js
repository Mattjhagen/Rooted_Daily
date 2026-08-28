const fs = require('fs');
const path = require('path');

const book = 'habakkuk';
const chapters = [
  {
    num: 1,
    title: "The Prophet's Burden",
    text: `
      <p><span class="verse" data-verse="1:1"><sup>1</sup> The burden which Habakkuk the prophet saw.</span></p>
      <p><span class="verse" data-verse="1:2"><sup>2</sup> O Lord, how long shall I cry out for help, and you will not hear? Or cry to you “Violence!” and you will not save?</span></p>
      <p><span class="verse" data-verse="1:3"><sup>3</sup> Why do you make me see iniquity, and look at perversity? For destruction and violence are before me; there is strife, and contention rises up.</span></p>
      <p><span class="verse" data-verse="1:4"><sup>4</sup> Therefore the Torah is paralyzed, and justice never goes forth. For the wicked surround the righteous; therefore justice goes forth perverted.</span></p>
      <p><span class="verse" data-verse="1:5"><sup>5</sup> “Look among the nations, and observe, and be utterly astounded! For I am working a work in your days, which you will not believe though it is told you.</span></p>
      <p><span class="verse" data-verse="1:6"><sup>6</sup> For, behold, I am raising up the Chaldeans, that bitter and hasty nation, who march through the breadth of the earth, to possess dwelling places that are not theirs.</span></p>
      <p><span class="verse" data-verse="1:7"><sup>7</sup> They are dreadful and terrible; their justice and their dignity proceed from themselves.</span></p>
      <p><span class="verse" data-verse="1:8"><sup>8</sup> Their horses also are swifter than leopards, and are more fierce than the evening wolves; and their horsemen press proudly on: yes, their horsemen come from afar; they fly as an eagle that hurries to devour.</span></p>
      <p><span class="verse" data-verse="1:9"><sup>9</sup> They come all of them for violence; the set of their faces is forwards; and they gather captives as the sand.</span></p>
      <p><span class="verse" data-verse="1:10"><sup>10</sup> They scoff at kings, and princes are a derision to them; they deride every stronghold; for they heap up earth, and take it.</span></p>
      <p><span class="verse" data-verse="1:11"><sup>11</sup> Then they sweep by as a wind, and pass over, and are guilty: even he whose own power is his god.”</span></p>
      <p><span class="verse" data-verse="1:12"><sup>12</sup> Are not you from everlasting, O Lord my God, my Holy One? We shall not die. O Lord, you have ordained them for judgment; and, O Rock, you have established them for correction.</span></p>
      <p><span class="verse" data-verse="1:13"><sup>13</sup> You are of purer eyes than to behold evil, and cannot look on perversity: why do you look on those who deal treacherously, and hold your peace when the wicked swallows up the man who is more righteous than he;</span></p>
      <p><span class="verse" data-verse="1:14"><sup>14</sup> And make men as the fishes of the sea, as the creeping things, that have no ruler over them?</span></p>
      <p><span class="verse" data-verse="1:15"><sup>15</sup> They take up all of them with the hook, they catch them in their net, and gather them in their drag: therefore they rejoice and are glad.</span></p>
      <p><span class="verse" data-verse="1:16"><sup>16</sup> Therefore they sacrifice to their net, and burn incense to their drag; because by them their portion is fat, and their food plenteous.</span></p>
      <p><span class="verse" data-verse="1:17"><sup>17</sup> Shall they therefore empty their net, and continually slay the nations without sparing?</span></p>
    `,
    translationNotes: `
      <li><span class="vocab-term">Burden (מַשָּׂא - Massa)</span>: Often implies an oracle or a heavy pronouncement lifted up and carried by the prophet.</li>
      <li><span class="vocab-term">Chaldeans (כַּשְׂדִּים - Kasdim)</span>: The Neo-Babylonian empire, utilized here as an uprooting force against Judah.</li>
      <li><span class="vocab-term">Uprooted Justice</span>: Habakkuk laments that the Torah is "paralyzed" (פוג - pug), losing its life-giving flow.</li>
    `,
    prev: '../../bible/nahum/3/index.html',
    next: '../../bible/habakkuk/2/index.html'
  },
  {
    num: 2,
    title: "The Vision Appointed",
    text: `
      <p><span class="verse" data-verse="2:1"><sup>1</sup> I will stand upon my watch, and set myself on the tower, and will look out to see what he will say to me, and what I shall answer concerning my complaint.</span></p>
      <p><span class="verse" data-verse="2:2"><sup>2</sup> And the Lord answered me, and said, “Write the vision, and make it plain on tablets, that he may run who reads it.</span></p>
      <p><span class="verse" data-verse="2:3"><sup>3</sup> For the vision is yet for an appointed time, and it hurries toward the end, and shall not lie: though it tarry, wait for it; because it will surely come, it will not delay.</span></p>
      <p><span class="verse" data-verse="2:4"><sup>4</sup> Behold, his soul is puffed up, it is not upright in him: but the righteous shall live by his faith.</span></p>
      <p><span class="verse" data-verse="2:5"><sup>5</sup> Moreover, wine is treacherous; the haughty man does not abide. His appetite is as large as Sheol, and he is like death, and cannot be satisfied, but gathers to himself all nations, and heaps to himself all peoples.</span></p>
      <p><span class="verse" data-verse="2:6"><sup>6</sup> Shall not all these take up a parable against him, and a taunting riddle against him, and say, ‘Woe to him who increases that which is not his! How long? And to him who loads himself with pledges!’</span></p>
      <p><span class="verse" data-verse="2:7"><sup>7</sup> Shall they not rise up suddenly who shall exact interest of you, and awake who shall vex you, and you shall be for spoils to them?</span></p>
      <p><span class="verse" data-verse="2:8"><sup>8</sup> Because you have plundered many nations, all the remnant of the peoples shall plunder you; because of men's blood, and for the violence done to the land, to the city, and to all who dwell therein.</span></p>
      <p><span class="verse" data-verse="2:9"><sup>9</sup> Woe to him who gets an evil gain for his house, that he may set his nest on high, that he may be delivered from the power of evil!</span></p>
      <p><span class="verse" data-verse="2:10"><sup>10</sup> You have devised shame to your house, by cutting off many peoples, and have sinned against your soul.</span></p>
      <p><span class="verse" data-verse="2:11"><sup>11</sup> For the stone shall cry out of the wall, and the beam out of the timber shall answer it.</span></p>
      <p><span class="verse" data-verse="2:12"><sup>12</sup> Woe to him who builds a town with blood, and establishes a city by iniquity!</span></p>
      <p><span class="verse" data-verse="2:13"><sup>13</sup> Behold, is it not of the Lord of hosts that the peoples labor for the fire, and the nations weary themselves for vanity?</span></p>
      <p><span class="verse" data-verse="2:14"><sup>14</sup> For the earth shall be filled with the knowledge of the glory of the Lord, as the waters cover the sea.</span></p>
      <p><span class="verse" data-verse="2:15"><sup>15</sup> Woe to him who gives his neighbor drink, who pours out your venom, and makes him drunk also, that you may look on their nakedness!</span></p>
      <p><span class="verse" data-verse="2:16"><sup>16</sup> You are filled with shame instead of glory: drink you also, and let your uncircumcision be uncovered: the cup of the Lord's right hand shall be turned to you, and foul shame shall be upon your glory.</span></p>
      <p><span class="verse" data-verse="2:17"><sup>17</sup> For the violence done to Lebanon shall cover you, and the destruction of the beasts, which made them afraid; because of men's blood, and for the violence done to the land, to the city, and to all who dwell therein.</span></p>
      <p><span class="verse" data-verse="2:18"><sup>18</sup> What profits the carved image, that its maker has carved it; the molten image, even a teacher of lies, that he who fashions its form trusts therein, to make mute idols?</span></p>
      <p><span class="verse" data-verse="2:19"><sup>19</sup> Woe to him who says to the wood, ‘Awake!’; to the mute stone, ‘Arise!’ Shall this teach? Behold, it is overlaid with gold and silver, and there is no breath at all in the midst of it.</span></p>
      <p><span class="verse" data-verse="2:20"><sup>20</sup> But the Lord is in his holy temple: let all the earth keep silence before him.”</span></p>
    `,
    translationNotes: `
      <li><span class="vocab-term">Faith/Faithfulness (אֱמוּנָה - Emunah)</span>: The righteous will live by their steadfastness, deeply rooted trust.</li>
      <li><span class="vocab-term">The Five Woes</span>: The prophetic pronouncement uprooting greed, exploitation, and idolatry.</li>
      <li><span class="vocab-term">Knowledge of Glory</span>: Like water saturating the sea bed, the earth will be thoroughly infused with the presence of Yahweh.</li>
    `,
    prev: '../../bible/habakkuk/1/index.html',
    next: '../../bible/habakkuk/3/index.html'
  },
  {
    num: 3,
    title: "The Prayer of Habakkuk",
    text: `
      <p><span class="verse" data-verse="3:1"><sup>1</sup> A prayer of Habakkuk the prophet, set to Shigionoth.</span></p>
      <p><span class="verse" data-verse="3:2"><sup>2</sup> O Lord, I have heard the report of you, and am afraid. O Lord, revive your work in the midst of the years, in the midst of the years make it known; in wrath remember mercy.</span></p>
      <p><span class="verse" data-verse="3:3"><sup>3</sup> God came from Teman, and the Holy One from Mount Paran. Selah. His glory covered the heavens, and the earth was full of his praise.</span></p>
      <p><span class="verse" data-verse="3:4"><sup>4</sup> And his brightness was as the light; he had rays coming forth from his hand: and there was the hiding of his power.</span></p>
      <p><span class="verse" data-verse="3:5"><sup>5</sup> Before him went the pestilence, and fiery bolts went forth at his feet.</span></p>
      <p><span class="verse" data-verse="3:6"><sup>6</sup> He stood, and measured the earth; he looked, and drove asunder the nations; and the eternal mountains were scattered; the perpetual hills did bow; his goings were as of old.</span></p>
      <p><span class="verse" data-verse="3:7"><sup>7</sup> I saw the tents of Cushan in affliction; the curtains of the land of Midian did tremble.</span></p>
      <p><span class="verse" data-verse="3:8"><sup>8</sup> Was the Lord displeased against the rivers? Was your anger against the rivers, or your wrath against the sea, that you did ride upon your horses, upon your chariots of salvation?</span></p>
      <p><span class="verse" data-verse="3:9"><sup>9</sup> Your bow was made quite bare; the oaths to the tribes were a sure word. Selah. You did cleave the earth with rivers.</span></p>
      <p><span class="verse" data-verse="3:10"><sup>10</sup> The mountains saw you, and were afraid; the tempest of waters passed by; the deep uttered its voice, and lifted up its hands on high.</span></p>
      <p><span class="verse" data-verse="3:11"><sup>11</sup> The sun and moon stood still in their habitation; at the light of your arrows as they went, at the shining of your glittering spear.</span></p>
      <p><span class="verse" data-verse="3:12"><sup>12</sup> You did march through the land in indignation; you did thresh the nations in anger.</span></p>
      <p><span class="verse" data-verse="3:13"><sup>13</sup> You went forth for the salvation of your people, for the salvation of your anointed; you did strike through the head out of the house of the wicked, uncovering the foundation even to the neck. Selah.</span></p>
      <p><span class="verse" data-verse="3:14"><sup>14</sup> You did pierce with his own spears the head of his warriors; they came as a whirlwind to scatter me; their rejoicing was as to devour the poor secretly.</span></p>
      <p><span class="verse" data-verse="3:15"><sup>15</sup> You did tread the sea with your horses, the heap of mighty waters.</span></p>
      <p><span class="verse" data-verse="3:16"><sup>16</sup> I heard, and my body trembled; my lips quivered at the voice; rottenness enters into my bones, and I tremble in my place; that I should rest in the day of trouble, when it comes up against the people who invade us in troops.</span></p>
      <p><span class="verse" data-verse="3:17"><sup>17</sup> For though the fig tree shall not blossom, neither shall fruit be in the vines; the labor of the olive shall fail, and the fields shall yield no food; the flock shall be cut off from the fold, and there shall be no herd in the stalls:</span></p>
      <p><span class="verse" data-verse="3:18"><sup>18</sup> Yet I will rejoice in the Lord, I will joy in the God of my salvation.</span></p>
      <p><span class="verse" data-verse="3:19"><sup>19</sup> The Lord God is my strength, and he makes my feet like hinds' feet, and he will make me to walk upon my high places. For the Chief Musician, on my stringed instruments.</span></p>
    `,
    translationNotes: `
      <li><span class="vocab-term">Revive (חָיָה - Chayah)</span>: A plea for God to bring life back to His works, re-rooting the nation in His mercy.</li>
      <li><span class="vocab-term">Fig Tree Shall Not Blossom</span>: The ultimate expression of rooted faith—rejoicing in Yahweh even when all visible sustenance and agricultural life fails.</li>
      <li><span class="vocab-term">High Places (בָּמָה - Bamah)</span>: Elevated, secure terrain where the feet of a deer find firm rooting.</li>
    `,
    prev: '../../bible/habakkuk/2/index.html',
    next: '../../bible/zephaniah/1/index.html'
  }
];

const template = (chapter) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Habakkuk ${chapter.num} | Rooted Daily Global Bible</title>
    <link rel="stylesheet" href="../../../style.css">
</head>
<body class="bible-chapter-page">
    <div class="stars-bg"></div>
    <div class="twinkling-bg"></div>

    <header class="chapter-header glass-panel">
        <a href="../../../index.html" class="back-btn">← Back to Reading Plan</a>
        <div class="chapter-meta">
            <h1>Habakkuk ${chapter.num}</h1>
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
  console.log(\`Generated Habakkuk \${ch.num}\`);
});
