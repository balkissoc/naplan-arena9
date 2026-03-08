const startBattleBtn = document.getElementById("start-battle-btn");
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

const STORAGE_KEY = "naplanArenaProfile";

const questions = [
  {
    mode: "READING BLITZ",
    question: "Which sentence best shows that the writer feels nervous?",
    answers: [
      { text: "He opened the gate and walked inside.", correct: false },
      { text: "His hands shook as he reached for the handle.", correct: true },
      { text: "The sun was shining over the playground.", correct: false },
      { text: "He remembered the bus arrived at 8:15 am.", correct: false }
    ]
  },
  {
    mode: "NUMERACY SPRINT",
    question: "What is 15% of 200?",
    answers: [
      { text: "20", correct: false },
      { text: "25", correct: false },
      { text: "30", correct: true },
      { text: "35", correct: false }
    ]
  },
  {
    mode: "LANGUAGE CLASH",
    question: "Which word is spelled correctly?",
    answers: [
      { text: "definately", correct: false },
      { text: "definitely", correct: true },
      { text: "defanitely", correct: false },
      { text: "definetly", correct: false }
    ]
  }
];

let currentQuestionIndex = 0;
let score = 0;
let questionAnswered = false;

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
  { minXp: 700, label: "Rank 7 • Master" }
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

function showQuestion() {
  const current = questions[currentQuestionIndex];
  const letters = ["A", "B", "C", "D"];

  questionAnswered = false;
  battleMode.textContent = current.mode;
  questionCount.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
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

  const current = questions[currentQuestionIndex];
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
    player.xp += 25;
    player.coins += 20;
    feedback.textContent = "Correct! +25 XP, +20 coins";
    feedback.className = "feedback correct";
  } else {
    player.coins += 5;
    feedback.textContent = "Not quite. +5 coins for trying";
    feedback.className = "feedback wrong";
  }

  updatePlayerUi();
  saveProfile();
  nextBtn.classList.remove("hidden");
}

function showResults() {
  const earnedXp = score * 25;
  const earnedCoins = score * 20 + (questions.length - score) * 5;

  resultsTitle.textContent =
    score === questions.length ? "Perfect battle." :
    score >= 2 ? "Strong effort." :
    "Keep training.";

  resultsScore.textContent = `${score} / ${questions.length} correct`;
  resultsXp.textContent = `+${earnedXp} XP`;
  resultsCoins.textContent = `+${earnedCoins} coins`;
  resultsMessage.textContent =
    score === questions.length
      ? "Outstanding work. You cleared every question."
      : score >= 2
      ? "You are improving well. Keep pushing."
      : "Every battle builds skill. Go again.";

  updatePlayerUi();
  showScreen(resultsScreen);
}

function startBattle() {
  currentQuestionIndex = 0;
  score = 0;
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

  if (currentQuestionIndex < questions.length) {
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
