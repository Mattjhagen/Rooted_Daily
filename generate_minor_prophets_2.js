const fs = require('fs');
const path = require('path');

const baseDir = '/Users/matt/Rooted_Daily_iOS/bible';

const templates = {
  habakkuk: {
    1: {
      title: 'The Burden',
      summary: 'Habakkuk questions the Lord about injustice, and the Lord reveals He is raising up the Chaldeans.',
      verses: [
        'The burden which Habakkuk the prophet did see.',
        'O LORD, how long shall I cry, and thou wilt not hear! even cry out unto thee of violence, and thou wilt not save!',
        'Why dost thou shew me iniquity, and cause me to behold grievance? for spoiling and violence are before me: and there are that raise up strife and contention.',
        'Therefore the law is slacked, and judgment doth never go forth: for the wicked doth compass about the righteous; therefore wrong judgment proceedeth.',
        'Behold ye among the heathen, and regard, and wonder marvellously: for I will work a work in your days, which ye will not believe, though it be told you.',
        'For, lo, I raise up the Chaldeans, that bitter and hasty nation, which shall march through the breadth of the land, to possess the dwellingplaces that are not theirs.'
      ],
      notes: '<p>The <strong>Massa Root (Burden)</strong>: Habakkuk receives a heavy oracle, uprooting his sense of justice as he sees the rise of the ruthless Chaldeans.</p>'
    },
    2: {
      title: 'The Watchtower',
      summary: 'The Lord answers Habakkuk, pronouncing five woes against the proud and declaring the righteous will live by faith.',
      verses: [
        'I will stand upon my watch, and set me upon the tower, and will watch to see what he will say unto me, and what I shall answer when I am reproved.',
        'And the LORD answered me, and said, Write the vision, and make it plain upon tables, that he may run that readeth it.',
        'For the vision is yet for an appointed time, but at the end it shall speak, and not lie: though it tarry, wait for it; because it will surely come, it will not tarry.',
        'Behold, his soul which is lifted up is not upright in him: but the just shall live by his faith.',
        'Woe to him that increaseth that which is not his! how long? and to him that ladeth himself with thick clay!',
        'But the LORD is in his holy temple: let all the earth keep silence before him.'
      ],
      notes: '<p>The <strong>Emunah Root (Faith/Faithfulness)</strong>: A profound planting of trust—the righteous are sustained not by sight, but by unwavering faith while the proud are uprooted.</p>'
    },
    3: {
      title: 'The Prayer of Faith',
      summary: 'Habakkuk offers a prayer of praise, remembering God\'s past deliverance and choosing to rejoice even in barrenness.',
      verses: [
        'A prayer of Habakkuk the prophet upon Shigionoth.',
        'O LORD, I have heard thy speech, and was afraid: O LORD, revive thy work in the midst of the years, in the midst of the years make known; in wrath remember mercy.',
        'God came from Teman, and the Holy One from mount Paran. Selah. His glory covered the heavens, and the earth was full of his praise.',
        'And his brightness was as the light; he had horns coming out of his hand: and there was the hiding of his power.',
        'Although the fig tree shall not blossom, neither shall fruit be in the vines; the labour of the olive shall fail, and the fields shall yield no meat; the flock shall be cut off from the fold, and there shall be no herd in the stalls:',
        'Yet I will rejoice in the LORD, I will joy in the God of my salvation.'
      ],
      notes: '<p>The <strong>Gilah Root (Rejoice)</strong>: A resilient joy that blossoms even when the visible world is stripped bare, rooted deeply in the God of salvation.</p>'
    }
  },
  zephaniah: {
    1: {
      title: 'The Day of the Lord',
      summary: 'A terrifying decree of the Day of the Lord, bringing a complete uprooting of creation due to Judah\'s idolatry.',
      verses: [
        'The word of the LORD which came unto Zephaniah the son of Cushi, the son of Gedaliah, the son of Amariah, the son of Hizkiah, in the days of Josiah the son of Amon, king of Judah.',
        'I will utterly consume all things from off the land, saith the LORD.',
        'I will consume man and beast; I will consume the fowls of the heaven, and the fishes of the sea, and the stumblingblocks with the wicked; and I will cut off man from off the land, saith the LORD.',
        'The great day of the LORD is near, it is near, and hasteth greatly, even the voice of the day of the LORD: the mighty man shall cry there bitterly.',
        'That day is a day of wrath, a day of trouble and distress, a day of wasteness and desolation, a day of darkness and gloominess, a day of clouds and thick darkness,'
      ],
      notes: '<p>The <strong>Yom Yahweh Root (Day of the Lord)</strong>: An apocalyptic un-creation, pulling out the weeds of idolatry and the structures of pride from the earth.</p>'
    },
    2: {
      title: 'Seek the Lord',
      summary: 'A call to repentance for the humble of the earth, accompanied by judgments against surrounding nations.',
      verses: [
        'Gather yourselves together, yea, gather together, O nation not desired;',
        'Before the decree bring forth, before the day pass as the chaff, before the fierce anger of the LORD come upon you, before the day of the LORD\'S anger come upon you.',
        'Seek ye the LORD, all ye meek of the earth, which have wrought his judgment; seek righteousness, seek meekness: it may be ye shall be hid in the day of the LORD\'S anger.',
        'For Gaza shall be forsaken, and Ashkelon a desolation: they shall drive out Ashdod at the noon day, and Ekron shall be rooted up.',
        'This shall they have for their pride, because they have reproached and magnified themselves against the people of the LORD of hosts.'
      ],
      notes: '<p>The <strong>Baqash Root (Seek)</strong>: A desperate search for refuge. The humble who seek Him will be hidden and sheltered as the storm of judgment uproots the nations.</p>'
    },
    3: {
      title: 'The Singing God',
      summary: 'Jerusalem\'s rebellion gives way to a glorious restoration where God Himself rejoices over His purified people with singing.',
      verses: [
        'Woe to her that is filthy and polluted, to the oppressing city!',
        'She obeyed not the voice; she received not correction; she trusted not in the LORD; she drew not near to her God.',
        'For then will I turn to the people a pure language, that they may all call upon the name of the LORD, to serve him with one consent.',
        'The LORD thy God in the midst of thee is mighty; he will save, he will rejoice over thee with joy; he will rest in his love, he will joy over thee with singing.',
        'Behold, at that time I will undo all that afflict thee: and I will save her that halteth, and gather her that was driven out; and I will get them praise and fame in every land where they have been put to shame.'
      ],
      notes: '<p>The <strong>Rinnah Root (Singing/Joyous Cry)</strong>: The ultimate re-planting. God\'s love is so profound that He breaks into song over His restored, humble remnant.</p>'
    }
  },
  haggai: {
    1: {
      title: 'Consider Your Ways',
      summary: 'The Lord challenges the returned exiles for building their own paneled houses while His temple lies in ruins.',
      verses: [
        'In the second year of Darius the king, in the sixth month, in the first day of the month, came the word of the LORD by Haggai the prophet unto Zerubbabel the son of Shealtiel, governor of Judah, and to Joshua the son of Josedech, the high priest, saying,',
        'Thus speaketh the LORD of hosts, saying, This people say, The time is not come, the time that the LORD\'S house should be built.',
        'Then came the word of the LORD by Haggai the prophet, saying,',
        'Is it time for you, O ye, to dwell in your cieled houses, and this house lie waste?',
        'Now therefore thus saith the LORD of hosts; Consider your ways.',
        'Ye have sown much, and bring in little; ye eat, but ye have not enough; ye drink, but ye are not filled with drink; ye clothe you, but there is none warm; and he that earneth wages earneth wages to put it into a bag with holes.'
      ],
      notes: '<p>The <strong>Sum Leb Root (Set Your Heart/Consider)</strong>: A call to align priorities. The people\'s harvest is barren because they have neglected the spiritual center—the Root of their community.</p>'
    },
    2: {
      title: 'The Desire of All Nations',
      summary: 'God encourages the builders, promising that the glory of the latter house will exceed the former, and He will shake the heavens.',
      verses: [
        'In the seventh month, in the one and twentieth day of the month, came the word of the LORD by the prophet Haggai, saying,',
        'Speak now to Zerubbabel the son of Shealtiel, governor of Judah, and to Joshua the son of Josedech, the high priest, and to the residue of the people, saying,',
        'Who is left among you that saw this house in her first glory? and how do ye see it now? is it not in your eyes in comparison of it as nothing?',
        'Yet now be strong, O Zerubbabel, saith the LORD; and be strong, O Joshua, son of Josedech, the high priest; and be strong, all ye people of the land, saith the LORD, and work: for I am with you, saith the LORD of hosts:',
        'For thus saith the LORD of hosts; Yet once, it is a little while, and I will shake the heavens, and the earth, and the sea, and the dry land;',
        'And I will shake all nations, and the desire of all nations shall come: and I will fill this house with glory, saith the LORD of hosts.',
        'The silver is mine, and the gold is mine, saith the LORD of hosts.'
      ],
      notes: '<p>The <strong>Ra\'ash Root (Shake)</strong>: God will uproot the status quo of the nations to bring forth the ultimate treasure, filling the rebuilt temple with unprecedented glory.</p>'
    }
  },
  malachi: {
    1: {
      title: 'I Have Loved You',
      summary: 'God declares His love for Israel, but rebukes the priests for offering polluted sacrifices on His altar.',
      verses: [
        'The burden of the word of the LORD to Israel by Malachi.',
        'I have loved you, saith the LORD. Yet ye say, Wherein hast thou loved us? Was not Esau Jacob\'s brother? saith the LORD: yet I loved Jacob,',
        'And I hated Esau, and laid his mountains and his heritage waste for the dragons of the wilderness.',
        'A son honoureth his father, and a servant his master: if then I be a father, where is mine honour? and if I be a master, where is my fear? saith the LORD of hosts unto you, O priests, that despise my name. And ye say, Wherein have we despised thy name?',
        'Ye offer polluted bread upon mine altar; and ye say, Wherein have we polluted thee? In that ye say, The table of the LORD is contemptible.'
      ],
      notes: '<p>The <strong>Ahavah Root (Love)</strong>: God\'s foundational covenant love is questioned by a cynical people who offer blind and lame sacrifices, showing their roots of devotion have withered.</p>'
    },
    2: {
      title: 'The Covenant Corrupted',
      summary: 'The Lord admonishes the priests for violating the covenant of Levi and the people for treachery against their wives.',
      verses: [
        'And now, O ye priests, this commandment is for you.',
        'If ye will not hear, and if ye will not lay it to heart, to give glory unto my name, saith the LORD of hosts, I will even send a curse upon you, and I will curse your blessings: yea, I have cursed them already, because ye do not lay it to heart.',
        'And ye shall know that I have sent this commandment unto you, that my covenant might be with Levi, saith the LORD of hosts.',
        'My covenant was with him of life and peace; and I gave them to him for the fear wherewith he feared me, and was afraid before my name.',
        'For the priest\'s lips should keep knowledge, and they should seek the law at his mouth: for he is the messenger of the LORD of hosts.',
        'Have we not all one father? hath not one God created us? why do we deal treacherously every man against his brother, by profaning the covenant of our fathers?'
      ],
      notes: '<p>The <strong>Bagad Root (Deal Treacherously)</strong>: The tearing apart of covenants—both with God and within marriages—uproots the community from life and peace.</p>'
    },
    3: {
      title: 'The Messenger of the Covenant',
      summary: 'The Lord promises to send His messenger to prepare the way, and challenges the people to bring the full tithe.',
      verses: [
        'Behold, I will send my messenger, and he shall prepare the way before me: and the Lord, whom ye seek, shall suddenly come to his temple, even the messenger of the covenant, whom ye delight in: behold, he shall come, saith the LORD of hosts.',
        'But who may abide the day of his coming? and who shall stand when he appeareth? for he is like a refiner\'s fire, and like fullers\' sope:',
        'And he shall sit as a refiner and purifier of silver: and he shall purify the sons of Levi, and purge them as gold and silver, that they may offer unto the LORD an offering in righteousness.',
        'Will a man rob God? Yet ye have robbed me. But ye say, Wherein have we robbed thee? In tithes and offerings.',
        'Bring ye all the tithes into the storehouse, that there may be meat in mine house, and prove me now herewith, saith the LORD of hosts, if I will not open you the windows of heaven, and pour you out a blessing, that there shall not be room enough to receive it.'
      ],
      notes: '<p>The <strong>Zaqaq Root (Refine/Purify)</strong>: The burning away of dross. God\'s fiery presence will cleanse His people, restoring their offerings to pure worship.</p>'
    },
    4: {
      title: 'The Sun of Righteousness',
      summary: 'The coming day will burn like an oven for the wicked, but the Sun of Righteousness will arise with healing for those who revere His name.',
      verses: [
        'For, behold, the day cometh, that shall burn as an oven; and all the proud, yea, and all that do wickedly, shall be stubble: and the day that cometh shall burn them up, saith the LORD of hosts, that it shall leave them neither root nor branch.',
        'But unto you that fear my name shall the Sun of righteousness arise with healing in his wings; and ye shall go forth, and grow up as calves of the stall.',
        'And ye shall tread down the wicked; for they shall be ashes under the soles of your feet in the day that I shall do this, saith the LORD of hosts.',
        'Remember ye the law of Moses my servant, which I commanded unto him in Horeb for all Israel, with the statutes and judgments.',
        'Behold, I will send you Elijah the prophet before the coming of the great and dreadful day of the LORD:',
        'And he shall turn the heart of the fathers to the children, and the heart of the children to their fathers, lest I come and smite the earth with a curse.'
      ],
      notes: '<p>The <strong>Shoresh Root (Root)</strong>: The ultimate juxtaposition. The wicked will be left with neither root nor branch, but for those who revere God, healing will dawn, setting the stage for the New Testament.</p>'
    }
  }
};

const navigationMap = {
  'habakkuk': { prev: { book: 'nahum', chapter: 3 }, next: { book: 'zephaniah', chapter: 1 } },
  'zephaniah': { prev: { book: 'habakkuk', chapter: 3 }, next: { book: 'haggai', chapter: 1 } },
  'haggai': { prev: { book: 'zephaniah', chapter: 3 }, next: { book: 'zechariah', chapter: 1 } }, // Zechariah generated separately
  'malachi': { prev: { book: 'zechariah', chapter: 14 }, next: { book: 'matthew', chapter: 1 } }
};

const generatePage = (book, chapterNum, data) => {
  const isFirstChapter = chapterNum === 1;
  const isLastChapter = Object.keys(templates[book]).length === chapterNum;
  
  let prevLink = `../${chapterNum - 1}/index.html`;
  if (isFirstChapter) {
    const nav = navigationMap[book].prev;
    prevLink = `../../${nav.book}/${nav.chapter}/index.html`;
  }
  
  let nextLink = `../${chapterNum + 1}/index.html`;
  if (isLastChapter) {
    const nav = navigationMap[book].next;
    nextLink = `../../${nav.book}/${nav.chapter}/index.html`;
  }

  const versesHtml = data.verses.map((text, idx) => 
    `          <div class="verse" data-verse="${idx + 1}">
            <span class="verse-number">${idx + 1}</span>
            <p>${text}</p>
          </div>`
  ).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rooted Daily - ${book.charAt(0).toUpperCase() + book.slice(1)} ${chapterNum}</title>
  <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Outfit:wght@300;400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../../../style.css">
</head>
<body>
  <div class="ambient-background"></div>
  <nav class="glass-nav">
    <div class="logo">Rooted Daily</div>
    <div class="nav-links">
      <a href="../../../index.html">Home</a>
      <a href="../../index.html">The Roots</a>
      <a href="#">Search</a>
    </div>
  </nav>

  <main class="chapter-container">
    <header class="chapter-header">
      <div class="book-title">The Book of ${book.charAt(0).toUpperCase() + book.slice(1)}</div>
      <h1 class="chapter-number">Chapter ${chapterNum}</h1>
      <div class="chapter-theme">"${data.title}"</div>
    </header>

    <div class="reader-grid">
      <article class="scripture-content">
        <div class="verses-container">
${versesHtml}
        </div>
      </article>

      <aside class="study-panel">
        <div class="glass-panel reflection-panel">
          <h3><span class="icon">✨</span> Rooted Insight</h3>
          <p class="chapter-summary">${data.summary}</p>
          <div class="translation-notes">
            <h4>Translation Notes</h4>
            ${data.notes}
          </div>
        </div>
      </aside>
    </div>

    <div class="chapter-nav">
      <a href="${prevLink}" class="nav-btn prev-btn">← Previous</a>
      <a href="${nextLink}" class="nav-btn next-btn">Next →</a>
    </div>
  </main>

  <script type="module" src="../../../bible-reader.js"></script>
</body>
</html>`;
};

Object.keys(templates).forEach(book => {
  const bookDir = path.join(baseDir, book);
  if (!fs.existsSync(bookDir)) fs.mkdirSync(bookDir, { recursive: true });
  
  Object.keys(templates[book]).forEach(chapter => {
    const chapterDir = path.join(bookDir, chapter);
    if (!fs.existsSync(chapterDir)) fs.mkdirSync(chapterDir, { recursive: true });
    
    const html = generatePage(book, parseInt(chapter), templates[book][chapter]);
    fs.writeFileSync(path.join(chapterDir, 'index.html'), html);
    console.log(`Generated ${book} ${chapter}`);
  });
});
