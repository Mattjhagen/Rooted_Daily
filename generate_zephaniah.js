const fs = require('fs');
const path = require('path');

const book = 'zephaniah';
const chapters = [
  {
    num: 1,
    title: "The Day of the Lord",
    text: `
      <p><span class="verse" data-verse="1:1"><sup>1</sup> The word of the Lord which came to Zephaniah the son of Cushi, the son of Gedaliah, the son of Amariah, the son of Hezekiah, in the days of Josiah the son of Amon, king of Judah.</span></p>
      <p><span class="verse" data-verse="1:2"><sup>2</sup> “I will utterly consume all things from off the face of the ground,” says the Lord.</span></p>
      <p><span class="verse" data-verse="1:3"><sup>3</sup> “I will consume man and beast; I will consume the birds of the sky, and the fishes of the sea, and the stumbling blocks with the wicked; and I will cut off man from off the face of the ground,” says the Lord.</span></p>
      <p><span class="verse" data-verse="1:4"><sup>4</sup> “And I will stretch out my hand upon Judah, and upon all the inhabitants of Jerusalem; and I will cut off the remnant of Baal from this place, and the name of the idolatrous priests with the priests;</span></p>
      <p><span class="verse" data-verse="1:5"><sup>5</sup> And those who worship the host of heaven upon the housetops; and those who worship and swear by the Lord, and swear by Malcam;</span></p>
      <p><span class="verse" data-verse="1:6"><sup>6</sup> And those who have drawn back from following the Lord; and those who have not sought the Lord, nor inquired after him.”</span></p>
      <p><span class="verse" data-verse="1:7"><sup>7</sup> Hold your peace at the presence of the Lord God; for the day of the Lord is at hand: for the Lord has prepared a sacrifice, he has consecrated his guests.</span></p>
      <p><span class="verse" data-verse="1:8"><sup>8</sup> “And it shall come to pass in the day of the Lord's sacrifice, that I will punish the princes, and the king's sons, and all such as are clothed with foreign apparel.</span></p>
      <p><span class="verse" data-verse="1:9"><sup>9</sup> In the same day also will I punish all those who leap over the threshold, who fill their master's house with violence and deceit.”</span></p>
      <p><span class="verse" data-verse="1:10"><sup>10</sup> “And it shall come to pass in that day,” says the Lord, “that there shall be the noise of a cry from the fish gate, and a wailing from the second quarter, and a great crashing from the hills.</span></p>
      <p><span class="verse" data-verse="1:11"><sup>11</sup> Wail, you inhabitants of Maktesh, for all the merchant people are undone; all those who were laden with silver are cut off.</span></p>
      <p><span class="verse" data-verse="1:12"><sup>12</sup> And it shall come to pass at that time, that I will search Jerusalem with lamps, and I will punish the men who are settled on their lees, who say in their heart, ‘The Lord will not do good, neither will he do evil.’</span></p>
      <p><span class="verse" data-verse="1:13"><sup>13</sup> And their wealth shall become a spoil, and their houses a desolation: yes, they shall build houses, but shall not inhabit them; and they shall plant vineyards, but shall not drink the wine thereof.”</span></p>
      <p><span class="verse" data-verse="1:14"><sup>14</sup> The great day of the Lord is near, it is near and hurries greatly, even the voice of the day of the Lord; the mighty man cries bitterly there.</span></p>
      <p><span class="verse" data-verse="1:15"><sup>15</sup> That day is a day of wrath, a day of trouble and distress, a day of wasteness and desolation, a day of darkness and gloominess, a day of clouds and thick darkness,</span></p>
      <p><span class="verse" data-verse="1:16"><sup>16</sup> A day of the trumpet and alarm, against the fortified cities, and against the high battlements.</span></p>
      <p><span class="verse" data-verse="1:17"><sup>17</sup> “And I will bring distress upon men, that they shall walk like blind men, because they have sinned against the Lord; and their blood shall be poured out as dust, and their flesh as the dung.</span></p>
      <p><span class="verse" data-verse="1:18"><sup>18</sup> Neither their silver nor their gold shall be able to deliver them in the day of the Lord's wrath; but the whole land shall be devoured by the fire of his jealousy: for he will make an end, yes, a terrible end, of all those who dwell in the land.”</span></p>
    `,
    translationNotes: `
      <li><span class="vocab-term">Consume (אָסַף - Asaph)</span>: Often meaning 'to gather,' here it's an uprooting, a sweeping away of creation in a de-creation sequence.</li>
      <li><span class="vocab-term">Settled on their Lees (קָפָא - Qapha)</span>: Thickening or congealing like stagnant wine; complacency in spiritual roots.</li>
      <li><span class="vocab-term">Day of Wrath</span>: A deep uprooting of the current order to prepare for a renewed earth.</li>
    `,
    prev: '../../bible/habakkuk/3/index.html',
    next: '../../bible/zephaniah/2/index.html'
  },
  {
    num: 2,
    title: "Judgment on the Nations",
    text: `
      <p><span class="verse" data-verse="2:1"><sup>1</sup> Gather yourselves together, yes, gather together, O nation that has no shame;</span></p>
      <p><span class="verse" data-verse="2:2"><sup>2</sup> Before the decree brings forth, before the day passes as the chaff, before the fierce anger of the Lord comes upon you, before the day of the Lord's anger comes upon you.</span></p>
      <p><span class="verse" data-verse="2:3"><sup>3</sup> Seek the Lord, all you meek of the earth, who have kept his ordinances; seek righteousness, seek meekness: it may be you will be hidden in the day of the Lord's anger.</span></p>
      <p><span class="verse" data-verse="2:4"><sup>4</sup> For Gaza shall be forsaken, and Ashkelon a desolation; they shall drive out Ashdod at the noonday, and Ekron shall be uprooted.</span></p>
      <p><span class="verse" data-verse="2:5"><sup>5</sup> Woe to the inhabitants of the seacoast, the nation of the Cherethites! The word of the Lord is against you, O Canaan, the land of the Philistines; I will destroy you, that there shall be no inhabitant.</span></p>
      <p><span class="verse" data-verse="2:6"><sup>6</sup> And the seacoast shall be pastures, with cottages for shepherds and folds for flocks.</span></p>
      <p><span class="verse" data-verse="2:7"><sup>7</sup> And the coast shall be for the remnant of the house of Judah; they shall feed their flocks thereupon; in the houses of Ashkelon shall they lie down in the evening; for the Lord their God will visit them, and restore their fortunes.</span></p>
      <p><span class="verse" data-verse="2:8"><sup>8</sup> “I have heard the reproach of Moab, and the revilings of the children of Ammon, with which they have reproached my people, and magnified themselves against their border.</span></p>
      <p><span class="verse" data-verse="2:9"><sup>9</sup> Therefore as I live,” says the Lord of hosts, the God of Israel, “surely Moab shall be as Sodom, and the children of Ammon as Gomorrah, a possession of nettles, and salt pits, and a perpetual desolation: the remnant of my people shall plunder them, and the survivors of my nation shall inherit them.”</span></p>
      <p><span class="verse" data-verse="2:10"><sup>10</sup> This shall they have for their pride, because they have reproached and magnified themselves against the people of the Lord of hosts.</span></p>
      <p><span class="verse" data-verse="2:11"><sup>11</sup> The Lord will be terrible to them; for he will famish all the gods of the earth; and men shall worship him, everyone from his place, even all the isles of the nations.</span></p>
      <p><span class="verse" data-verse="2:12"><sup>12</sup> “You Ethiopians also, you shall be slain by my sword.”</span></p>
      <p><span class="verse" data-verse="2:13"><sup>13</sup> And he will stretch out his hand against the north, and destroy Assyria, and will make Nineveh a desolation, and dry like the wilderness.</span></p>
      <p><span class="verse" data-verse="2:14"><sup>14</sup> And herds shall lie down in the midst of her, all the beasts of the nations: both the pelican and the porcupine shall lodge in the capitals thereof; their voice shall sing in the windows; desolation shall be in the thresholds: for he has laid bare the cedar work.</span></p>
      <p><span class="verse" data-verse="2:15"><sup>15</sup> This is the joyous city that dwelt carelessly, that said in her heart, “I am, and there is none besides me.” How she is become a desolation, a place for beasts to lie down in! Everyone who passes by her shall hiss, and wave his hand.</span></p>
    `,
    translationNotes: `
      <li><span class="vocab-term">Uprooted (עָקַר - Aqar)</span>: Ekron specifically will be 'plucked up by the roots.'</li>
      <li><span class="vocab-term">Hidden (סָתַר - Sathar)</span>: Finding deep refuge in Yahweh during the storm.</li>
      <li><span class="vocab-term">Restore Fortunes (שׁוּב שְׁבוּת - Shuv Shevut)</span>: Turning back the captivity, re-planting the people in their rightful place.</li>
    `,
    prev: '../../bible/zephaniah/1/index.html',
    next: '../../bible/zephaniah/3/index.html'
  },
  {
    num: 3,
    title: "Restoration of the Remnant",
    text: `
      <p><span class="verse" data-verse="3:1"><sup>1</sup> Woe to her who is rebellious and polluted, to the oppressing city!</span></p>
      <p><span class="verse" data-verse="3:2"><sup>2</sup> She obeyed not the voice; she received not correction; she trusted not in the Lord; she drew not near to her God.</span></p>
      <p><span class="verse" data-verse="3:3"><sup>3</sup> Her princes in the midst of her are roaring lions; her judges are evening wolves; they leave nothing for the morning.</span></p>
      <p><span class="verse" data-verse="3:4"><sup>4</sup> Her prophets are light and treacherous persons; her priests have profaned the sanctuary, they have done violence to the Torah.</span></p>
      <p><span class="verse" data-verse="3:5"><sup>5</sup> The Lord within her is righteous; he will do no iniquity; every morning he brings his justice to light, he fails not; but the unjust knows no shame.</span></p>
      <p><span class="verse" data-verse="3:6"><sup>6</sup> “I have cut off nations; their battlements are desolate; I have made their streets waste, so that none passes by; their cities are destroyed, so that there is no man, so that there is no inhabitant.</span></p>
      <p><span class="verse" data-verse="3:7"><sup>7</sup> I said, ‘Surely you will fear me, you will receive correction’; so her dwelling should not be cut off, according to all that I have appointed concerning her: but they rose early and corrupted all their doings.”</span></p>
      <p><span class="verse" data-verse="3:8"><sup>8</sup> “Therefore wait for me,” says the Lord, “until the day that I rise up to the prey; for my determination is to gather the nations, that I may assemble the kingdoms, to pour upon them my indignation, even all my fierce anger; for all the earth shall be devoured with the fire of my jealousy.</span></p>
      <p><span class="verse" data-verse="3:9"><sup>9</sup> For then will I turn to the peoples a pure language, that they may all call upon the name of the Lord, to serve him with one consent.</span></p>
      <p><span class="verse" data-verse="3:10"><sup>10</sup> From beyond the rivers of Ethiopia my worshipers, even the daughter of my dispersed, shall bring my offering.</span></p>
      <p><span class="verse" data-verse="3:11"><sup>11</sup> In that day you shall not be put to shame for all your doings, in which you have transgressed against me; for then I will take away out of the midst of you your proudly exulting ones, and you shall no more be haughty in my holy mountain.</span></p>
      <p><span class="verse" data-verse="3:12"><sup>12</sup> But I will leave in the midst of you an afflicted and poor people, and they shall take refuge in the name of the Lord.</span></p>
      <p><span class="verse" data-verse="3:13"><sup>13</sup> The remnant of Israel shall not do iniquity, nor speak lies; neither shall a deceitful tongue be found in their mouth; for they shall feed and lie down, and none shall make them afraid.”</span></p>
      <p><span class="verse" data-verse="3:14"><sup>14</sup> Sing, O daughter of Zion; shout, O Israel; be glad and rejoice with all your heart, O daughter of Jerusalem!</span></p>
      <p><span class="verse" data-verse="3:15"><sup>15</sup> The Lord has taken away your judgments, he has cast out your enemy: the King of Israel, even the Lord, is in the midst of you; you shall not fear evil any more.</span></p>
      <p><span class="verse" data-verse="3:16"><sup>16</sup> In that day it shall be said to Jerusalem, “Fear not; O Zion, let not your hands be slack.</span></p>
      <p><span class="verse" data-verse="3:17"><sup>17</sup> The Lord your God is in the midst of you, a mighty one who will save; he will rejoice over you with gladness; he will quiet you in his love; he will rejoice over you with singing.”</span></p>
      <p><span class="verse" data-verse="3:18"><sup>18</sup> “I will gather those who sorrow for the appointed feasts, who were of you, to whom the reproach of it was a burden.</span></p>
      <p><span class="verse" data-verse="3:19"><sup>19</sup> Behold, at that time I will deal with all those who afflict you; and I will save her who halts, and gather her who was driven away; and I will make them a praise and a name, whose shame has been in all the earth.</span></p>
      <p><span class="verse" data-verse="3:20"><sup>20</sup> At that time will I bring you in, and at that time will I gather you; for I will make you a name and a praise among all the peoples of the earth, when I restore your fortunes before your eyes,” says the Lord.</span></p>
    `,
    translationNotes: `
      <li><span class="vocab-term">Pure Language (שָׂפָה בְרוּרָה - Safah Berurah)</span>: A purified lip; restoring the root of communication broken at Babel.</li>
      <li><span class="vocab-term">Quiet you in his love (חָרַשׁ - Charash)</span>: Often meaning to be silent or to plow/engrave. God's love creates a profound, rooted stillness.</li>
      <li><span class="vocab-term">Gather (קָבַץ - Qabats)</span>: The ultimate replanting of the dispersed remnant.</li>
    `,
    prev: '../../bible/zephaniah/2/index.html',
    next: '../../bible/haggai/1/index.html'
  }
];

const template = (chapter) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zephaniah ${chapter.num} | Rooted Daily Global Bible</title>
    <link rel="stylesheet" href="../../../style.css">
</head>
<body class="bible-chapter-page">
    <div class="stars-bg"></div>
    <div class="twinkling-bg"></div>

    <header class="chapter-header glass-panel">
        <a href="../../../index.html" class="back-btn">← Back to Reading Plan</a>
        <div class="chapter-meta">
            <h1>Zephaniah ${chapter.num}</h1>
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
  console.log(\`Generated Zephaniah \${ch.num}\`);
});
