const startBattleBtn = document.getElementById("start-battle-btn");
const leaderboardBtn = document.getElementById("leaderboard-btn");
const skillsBtn = document.getElementById("skills-btn");
const dailyQuestBtn = document.getElementById("daily-quest-btn");

const menuScreen = document.getElementById("menu-screen");
const battleScreen = document.getElementById("battle-screen");
const resultsScreen = document.getElementById("results-screen");

const backMenuBtn = document.getElementById("back-menu-btn");
const nextBtn = document.getElementById("next-btn");
const playAgainBtn = document.getElementById("play-again-btn");
const resultsMenuBtn = document.getElementById("results-menu-btn");

const battleMode = document.getElementById("battle-mode");
const questionCount = document.getElementById("question-count");
const battleQuestion = document.getElementById("battle-question");
const answerList = document.getElementById("answer-list");
const feedback = document.getElementById("feedback");

const xpText = document.getElementById("xp-text");
const xpFill = document.getElementById("xp-fill");
const coinCount = document.getElementById("coin-count");
const gemCount = document.getElementById("gem-count");
const playerNameEl = document.getElementById("player-name");
const playerRankEl = document.getElementById("player-rank");
const playerAvatarEl = document.getElementById("player-avatar");

const resultsRank = document.getElementById("results-rank");
const resultsTitle = document.getElementById("results-title");
const resultsScore = document.getElementById("results-score");
const resultsXp = document.getElementById("results-xp");
const resultsCoins = document.getElementById("results-coins");
const resultsMessage = document.getElementById("results-message");

const STORAGE_KEY = "naplanArenaProfileV2";
const QUESTIONS_PER_BATTLE = 10;

let fullQuestionBank = Array.isArray(window.questionBank) ? window.questionBank : [];
let battleQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let questionAnswered = false;
let battleXpEarned = 0;
let battleCoinsEarned = 0;

let player = {
  name: "Jamie",
  xp: 420,
  xpMax: 500,
  coins: 1250,
  gems: 48
};

const rankTable = [
  { minXp: 0, label: "Rank 1 • Rookie" },
  { minXp: 100, label: "Rank 2 • Challenger" },
  { minXp: 200, label: "Rank 3 • Fighter" },
  { minXp: 300, label: "Rank 4 • Strategist" },
  { minXp: 400, label: "Rank 5 • Scholar" },
  { minXp: 500, label: "Rank 6 • Elite" },
  { minXp: 700, label: "Rank 7 • Master" },
  { minXp: 900, label: "Rank 8 • Champion" },
  { minXp: 1200, label: "Rank 9 • Grandmaster" }
];

function getRankLabel(currentXp) {
  let rank = rankTable[0].label;
  for (const entry of rankTable) {
    if (currentXp >= entry.minXp) {
      rank = entry.label;
    }
  }
  return rank;
}

function saveProfile() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
}

function loadProfile() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const saved = JSON.parse(raw);
    player = {
      name: saved.name || "Jamie",
      xp: Number(saved.xp ?? 420),
      xpMax: Number(saved.xpMax ?? 500),
      coins: Number(saved.coins ?? 1250),
      gems: Number(saved.gems ?? 48)
    };
  } catch (error) {
    console.error("Could not load profile", error);
  }
}

function askForPlayerNameIfNeeded() {
  if (player.name && player.name !== "Jamie") return;

  const enteredName = prompt("Enter your player name:", player.name || "Jamie");

  if (enteredName && enteredName.trim()) {
    player.name = enteredName.trim();
    saveProfile();
  }
}

function updatePlayerUi() {
  playerNameEl.textContent = player.name;
  playerRankEl.textContent = getRankLabel(player.xp);
  playerAvatarEl.textContent = player.name.charAt(0).toUpperCase();

  xpText.textContent = `${player.xp} / ${player.xpMax}`;
  xpFill.style.width = `${Math.min((player.xp / player.xpMax) * 100, 100)}%`;

  coinCount.textContent = player.coins;
  gemCount.textContent = player.gems;
  resultsRank.textContent = getRankLabel(player.xp);
}

function showScreen(screenToShow) {
  menuScreen.classList.add("hidden");
  battleScreen.classList.add("hidden");
  resultsScreen.classList.add("hidden");
  screenToShow.classList.remove("hidden");
}

function shuffleArray(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildBalancedBattleSet() {
  if (!fullQuestionBank.length) return [];

  const grouped = {};
  for (const q of fullQuestionBank) {
    if (!grouped[q.category]) grouped[q.category] = [];
    grouped[q.category].push(q);
  }

  const categories = Object.keys(grouped);
  const picked = [];

  const shuffledCategories = shuffleArray(categories);

  for (const category of shuffledCategories) {
    if (picked.length >= QUESTIONS_PER_BATTLE) break;
    const pool = shuffleArray(grouped[category]);
    if (pool.length > 0) {
      picked.push(pool[0]);
    }
  }

  if (picked.length < QUESTIONS_PER_BATTLE) {
    const usedIds = new Set(picked.map(q => q.id));
    const remaining = shuffleArray(
      fullQuestionBank.filter(q => !usedIds.has(q.id))
    );

    for (const q of remaining) {
      if (picked.length >= QUESTIONS_PER_BATTLE) break;
      picked.push(q);
    }
  }

  return shuffleArray(picked).slice(0, QUESTIONS_PER_BATTLE);
}

function showQuestion() {
  const current = battleQuestions[currentQuestionIndex];
  const letters = ["A", "B", "C", "D"];

  questionAnswered = false;
  battleMode.textContent = current.mode || "BATTLE";
  questionCount.textContent = `Question ${currentQuestionIndex + 1} of ${battleQuestions.length}`;
  battleQuestion.textContent = current.question;
  answerList.innerHTML = "";
  feedback.textContent = "";
  feedback.className = "feedback";
  nextBtn.classList.add("hidden");
  backMenuBtn.classList.add("hidden");

  current.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-button";
    button.textContent = `${letters[index]}. ${answer.text}`;
    button.addEventListener("click", () => selectAnswer(index));
    answerList.appendChild(button);
  });
}

function selectAnswer(selectedIndex) {
  if (questionAnswered) return;

  questionAnswered = true;

  const current = battleQuestions[currentQuestionIndex];
  const buttons = document.querySelectorAll(".answer-button");
  const selectedAnswer = current.answers[selectedIndex];

  buttons.forEach((btn, index) => {
    btn.disabled = true;

    if (current.answers[index].correct) {
      btn.style.outline = "4px solid #7dff9b";
    }

    if (index === selectedIndex && !selectedAnswer.correct) {
      btn.style.outline = "4px solid #ff9aa8";
    }
  });

  if (selectedAnswer.correct) {
    score += 1;
    battleXpEarned += 25;
    battleCoinsEarned += 20;
    player.xp += 25;
    player.coins += 20;
    feedback.textContent = "Correct! +25 XP, +20 coins";
    feedback.className = "feedback correct";
  } else {
    battleCoinsEarned += 5;
    player.coins += 5;
    feedback.textContent = `Not quite. ${current.explanation}`;
    feedback.className = "feedback wrong";
  }

  updatePlayerUi();
  saveProfile();
  nextBtn.classList.remove("hidden");
}

function showResults() {
  resultsTitle.textContent =
    score === battleQuestions.length
      ? "Perfect battle."
      : score >= Math.ceil(battleQuestions.length * 0.7)
      ? "Strong effort."
      : "Keep training.";

  resultsScore.textContent = `${score} / ${battleQuestions.length} correct`;
  resultsXp.textContent = `+${battleXpEarned} XP`;
  resultsCoins.textContent = `+${battleCoinsEarned} coins`;

  resultsMessage.textContent =
    score === battleQuestions.length
      ? "Outstanding work. You cleared every question."
      : score >= Math.ceil(battleQuestions.length * 0.7)
      ? "You are improving well. Keep pushing."
      : "Every battle builds skill. Go again.";

  updatePlayerUi();
  showScreen(resultsScreen);
}

function startBattle() {
  if (!fullQuestionBank.length) {
    alert("No questions were loaded. Please check questions.js.");
    return;
  }

  battleQuestions = buildBalancedBattleSet();
  currentQuestionIndex = 0;
  score = 0;
  battleXpEarned = 0;
  battleCoinsEarned = 0;

  showScreen(battleScreen);
  showQuestion();
}

function resetProfile() {
  if (!confirm("Reset player name, XP, coins and gems?")) return;

  player = {
    name: "Jamie",
    xp: 420,
    xpMax: 500,
    coins: 1250,
    gems: 48
  };

  saveProfile();
  askForPlayerNameIfNeeded();
  updatePlayerUi();
  showScreen(menuScreen);
}

startBattleBtn.addEventListener("click", startBattle);

nextBtn.addEventListener("click", () => {
  if (!questionAnswered) return;

  currentQuestionIndex += 1;

  if (currentQuestionIndex < battleQuestions.length) {
    showQuestion();
  } else {
    showResults();
  }
});

backMenuBtn.addEventListener("click", () => {
  showScreen(menuScreen);
});

playAgainBtn.addEventListener("click", startBattle);

resultsMenuBtn.addEventListener("click", () => {
  showScreen(menuScreen);
});

leaderboardBtn.addEventListener("click", () => {
  alert("Leaderboard coming soon.");
});

skillsBtn.addEventListener("click", () => {
  alert("Skills panel coming soon.");
});

dailyQuestBtn.addEventListener("click", () => {
  alert("Daily Quest coming soon.");
});

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "r" && event.shiftKey) {
    resetProfile();
  }
});

loadProfile();
askForPlayerNameIfNeeded();
updatePlayerUi();
showScreen(menuScreen);
saveProfile();
