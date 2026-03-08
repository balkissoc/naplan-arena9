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
const playerName = document.getElementById("player-name");
const playerRank = document.getElementById("player-rank");
const playerAvatar = document.getElementById("player-avatar");

const resultsRank = document.getElementById("results-rank");
const resultsTitle = document.getElementById("results-title");
const resultsScore = document.getElementById("results-score");
const resultsXp = document.getElementById("results-xp");
const resultsCoins = document.getElementById("results-coins");
const resultsMessage = document.getElementById("results-message");

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
      { text: "A. 20", correct: false },
      { text: "B. 25", correct: false },
      { text: "C. 30", correct: true },
      { text: "D. 35", correct: false }
    ]
  },
  {
    mode: "LANGUAGE CLASH",
    question: "Which word is spelled correctly?",
    answers: [
      { text: "A. definately", correct: false },
      { text: "B. definitely", correct: true },
      { text: "C. defanitely", correct: false },
      { text: "D. definetly", correct: false }
    ]
  }
];

let currentQuestionIndex = 0;
let score = 0;
let xp = 420;
let xpMax = 500;
let coins = 1250;
let gems = 48;

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

function updatePlayerUi() {
  xpText.textContent = `${xp} / ${xpMax}`;
  xpFill.style.width = `${Math.min((xp / xpMax) * 100, 100)}%`;
  coinCount.textContent = coins;
  gemCount.textContent = gems;
  playerRank.textContent = getRankLabel(xp);
  resultsRank.textContent = getRankLabel(xp);

  const currentName = playerName.textContent.trim();
  if (currentName) {
    playerAvatar.textContent = currentName.charAt(0).toUpperCase();
  }
}

function showScreen(screenToShow) {
  menuScreen.classList.add("hidden");
  battleScreen.classList.add("hidden");
  resultsScreen.classList.add("hidden");
  screenToShow.classList.remove("hidden");
}

function showQuestion() {
  const current = questions[currentQuestionIndex];
  battleMode.textContent = current.mode;
  questionCount.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  battleQuestion.textContent = current.question;
  answerList.innerHTML = "";
  feedback.textContent = "";
  feedback.className = "feedback";
  nextBtn.classList.add("hidden");
  backMenuBtn.classList.add("hidden");

  const letters = ["A", "B", "C", "D"];

  current.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.className = "answer-button";

    const textWithoutPrefix = answer.text.replace(/^[A-D]\.\s*/, "");
    button.textContent = `${letters[index]}. ${textWithoutPrefix}`;

    button.addEventListener("click", () => selectAnswer(answer.correct, button));
    answerList.appendChild(button);
  });
}

function selectAnswer(isCorrect, clickedButton) {
  const buttons = document.querySelectorAll(".answer-button");
  buttons.forEach(btn => {
    btn.disabled = true;
  });

  if (isCorrect) {
    score++;
    xp += 25;
    coins += 20;
    feedback.textContent = "Correct! +25 XP, +20 coins";
    feedback.className = "feedback correct";
    clickedButton.style.outline = "4px solid #7dff9b";
  } else {
    coins += 5;
    feedback.textContent = "Not quite. +5 coins for trying";
    feedback.className = "feedback wrong";
    clickedButton.style.outline = "4px solid #ff9aa8";

    buttons.forEach((btn, index) => {
      if (questions[currentQuestionIndex].answers[index].correct) {
        btn.style.outline = "4px solid #7dff9b";
      }
    });
  }

  updatePlayerUi();
  nextBtn.classList.remove("hidden");
}

function showResults() {
  const earnedXp = score * 25;
  const earnedCoins = score * 20 + (questions.length - score) * 5;

  resultsTitle.textContent = score === questions.length
    ? "Perfect battle."
    : score >= 2
    ? "Strong effort."
    : "Keep training.";

  resultsScore.textContent = `${score} / ${questions.length} correct`;
  resultsXp.textContent = `+${earnedXp} XP`;
  resultsCoins.textContent = `+${earnedCoins} coins`;
  resultsMessage.textContent = score === questions.length
    ? "Outstanding work. You cleared every question."
    : score >= 2
    ? "You are improving well. Keep pushing."
    : "Every battle builds skill. Go again.";

  showScreen(resultsScreen);
}

function startBattle() {
  currentQuestionIndex = 0;
  score = 0;
  showScreen(battleScreen);
  showQuestion();
}

startBattleBtn.addEventListener("click", startBattle);

nextBtn.addEventListener("click", () => {
  currentQuestionIndex++;
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

updatePlayerUi();
showScreen(menuScreen);
