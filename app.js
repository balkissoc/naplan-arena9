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
const battleCard = document.querySelector("#battle-screen .battle-card");

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

const STORAGE_KEY = "naplanArenaProfileV4";
const DEFAULT_QUESTIONS_PER_BATTLE = 10;
const DAILY_QUEST_QUESTIONS = 5;

const CATEGORY_LABELS = {
  writing_skills: "Writing",
  reading: "Reading",
  spelling: "Spelling",
  grammar_punctuation: "Grammar & Punctuation",
  number_non_calculator: "Number (No Calculator)",
  number_calculator_allowed: "Number (Calculator)",
  algebra_calculator_allowed: "Algebra",
  geometry_calculator_allowed: "Geometry",
  measurement_calculator_allowed: "Measurement",
  chance_data_calculator_allowed: "Chance & Data"
};

let fullQuestionBank = Array.isArray(window.questionBank) ? window.questionBank : [];
let battleQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let questionAnswered = false;
let battleXpEarned = 0;
let battleCoinsEarned = 0;
let currentBattleLabel = "Mixed Battle";
let currentBattleSource = "mixed";
let currentSkillCategory = null;

let player = {
  name: "Jamie",
  xp: 420,
  xpMax: 500,
  coins: 1250,
  gems: 48,
  totalBattles: 0,
  bestScore: 0,
  lastMode: "Mixed Battle"
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
      gems: Number(saved.gems ?? 48),
      totalBattles: Number(saved.totalBattles ?? 0),
      bestScore: Number(saved.bestScore ?? 0),
      lastMode: saved.lastMode || "Mixed Battle"
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

function animateXpBar() {
  xpFill.classList.remove("xp-pop");
  void xpFill.offsetWidth;
  xpFill.classList.add("xp-pop");

  setTimeout(() => {
    xpFill.classList.remove("xp-pop");
  }, 500);
}

function updatePlayerUi(animateXp = false) {
  playerNameEl.textContent = player.name;
  playerRankEl.textContent = getRankLabel(player.xp);
  playerAvatarEl.textContent = player.name.charAt(0).toUpperCase();

  xpText.textContent = `${player.xp} / ${player.xpMax}`;
  xpFill.style.width = `${Math.min((player.xp / player.xpMax) * 100, 100)}%`;

  if (animateXp) {
    animateXpBar();
  }

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
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function takeRandomQuestions(sourceQuestions, count) {
  return shuffleArray(sourceQuestions).slice(0, Math.min(count, sourceQuestions.length));
}

function buildMixedBattleSet(count) {
  if (!fullQuestionBank.length) return [];

  const grouped = {};
  for (const q of fullQuestionBank) {
    if (!grouped[q.category]) grouped[q.category] = [];
    grouped[q.category].push(q);
  }

  const categories = shuffleArray(Object.keys(grouped));
  const picked = [];

  for (const category of categories) {
    if (picked.length >= count) break;
    const pool = shuffleArray(grouped[category]);
    if (pool.length > 0) picked.push(pool[0]);
  }

  if (picked.length < count) {
    const usedIds = new Set(picked.map((q) => q.id));
    const remaining = shuffleArray(fullQuestionBank.filter((q) => !usedIds.has(q.id)));
    for (const q of remaining) {
      if (picked.length >= count) break;
      picked.push(q);
    }
  }

  return shuffleArray(picked).slice(0, count);
}

function buildCategoryBattleSet(category, count) {
  const pool = fullQuestionBank.filter((q) => q.category === category);
  return takeRandomQuestions(pool, count);
}

function addPressAnimation(button) {
  if (!button) return;
  button.classList.add("pressed");
  setTimeout(() => {
    button.classList.remove("pressed");
  }, 120);
}

function attachPressAnimations() {
  const buttons = document.querySelectorAll(".menu-button, .answer-button");
  buttons.forEach((button) => {
    button.addEventListener("mousedown", () => addPressAnimation(button));
    button.addEventListener("touchstart", () => addPressAnimation(button), { passive: true });
  });
}

function flashBattleCard(type) {
  if (!battleCard) return;

  battleCard.classList.remove("flash-correct", "flash-wrong");
  void battleCard.offsetWidth;

  if (type === "correct") {
    battleCard.classList.add("flash-correct");
  } else {
    battleCard.classList.add("flash-wrong");
  }

  setTimeout(() => {
    battleCard.classList.remove("flash-correct", "flash-wrong");
  }, 500);
}

function createTone(frequency, duration, type = "sine", volume = 0.03) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  if (!window.__naplanAudioCtx) {
    window.__naplanAudioCtx = new AudioContextClass();
  }

  const ctx = window.__naplanAudioCtx;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gainNode.gain.value = volume;

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  const now = ctx.currentTime;
  oscillator.start(now);
  gainNode.gain.setValueAtTime(volume, now);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.stop(now + duration);
}

function playSound(type) {
  try {
    if (type === "click") {
      createTone(420, 0.05, "square", 0.02);
    } else if (type === "correct") {
      createTone(660, 0.08, "triangle", 0.03);
      setTimeout(() => createTone(880, 0.1, "triangle", 0.025), 60);
    } else if (type === "wrong") {
      createTone(220, 0.09, "sawtooth", 0.025);
      setTimeout(() => createTone(180, 0.12, "sawtooth", 0.02), 50);
    } else if (type === "results") {
      createTone(523, 0.08, "triangle", 0.03);
      setTimeout(() => createTone(659, 0.08, "triangle", 0.025), 90);
      setTimeout(() => createTone(784, 0.12, "triangle", 0.025), 180);
    }
  } catch (error) {
    console.error("Sound playback failed", error);
  }
}

function showQuestion() {
  const current = battleQuestions[currentQuestionIndex];
  const letters = ["A", "B", "C", "D"];

  questionAnswered = false;
  battleMode.textContent = currentBattleLabel.toUpperCase();
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
    button.addEventListener("click", () => {
      addPressAnimation(button);
      playSound("click");
      selectAnswer(index);
    });
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
      btn.classList.add("correct-answer");
    }

    if (index === selectedIndex && !selectedAnswer.correct) {
      btn.style.outline = "4px solid #ff9aa8";
      btn.classList.add("wrong-answer");
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
    flashBattleCard("correct");
    playSound("correct");
    updatePlayerUi(true);
  } else {
    battleCoinsEarned += 5;
    player.coins += 5;
    feedback.textContent = `Not quite. ${current.explanation}`;
    feedback.className = "feedback wrong";
    flashBattleCard("wrong");
    playSound("wrong");
    updatePlayerUi(false);
  }

  saveProfile();
  nextBtn.classList.remove("hidden");
}

function showResults() {
  player.totalBattles += 1;
  player.bestScore = Math.max(player.bestScore, score);
  player.lastMode = currentBattleLabel;
  saveProfile();

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
  playSound("results");
  showScreen(resultsScreen);
}

function startBattleWithQuestions(questions, label, source) {
  if (!questions.length) {
    alert("No questions were found for that mode.");
    return;
  }

  battleQuestions = questions;
  currentQuestionIndex = 0;
  score = 0;
  battleXpEarned = 0;
  battleCoinsEarned = 0;
  currentBattleLabel = label;
  currentBattleSource = source;

  showScreen(battleScreen);
  showQuestion();
}

function startMixedBattle() {
  const questions = buildMixedBattleSet(DEFAULT_QUESTIONS_PER_BATTLE);
  currentSkillCategory = null;
  startBattleWithQuestions(questions, "Mixed Battle", "mixed");
}

function startDailyQuest() {
  const questions = buildMixedBattleSet(DAILY_QUEST_QUESTIONS);
  currentSkillCategory = null;
  startBattleWithQuestions(questions, "Daily Quest", "daily");
}

function openSkillsMenu() {
  const options = Object.entries(CATEGORY_LABELS)
    .map(([key, label], index) => `${index + 1}. ${label}`)
    .join("\n");

  const choice = prompt(
    `Choose a skill area by number:\n\n${options}\n\nEnter a number from 1 to ${Object.keys(CATEGORY_LABELS).length}:`
  );

  if (!choice) return;

  const index = Number(choice) - 1;
  const entries = Object.entries(CATEGORY_LABELS);

  if (Number.isNaN(index) || index < 0 || index >= entries.length) {
    alert("That was not a valid choice.");
    return;
  }

  const [category, label] = entries[index];
  const questions = buildCategoryBattleSet(category, DEFAULT_QUESTIONS_PER_BATTLE);
  currentSkillCategory = category;
  startBattleWithQuestions(questions, `${label} Practice`, "skills");
}

function showLeaderboard() {
  playSound("click");
  alert(
    `Player: ${player.name}\n` +
    `Rank: ${getRankLabel(player.xp)}\n` +
    `XP: ${player.xp}\n` +
    `Coins: ${player.coins}\n` +
    `Total Battles: ${player.totalBattles}\n` +
    `Best Score: ${player.bestScore}\n` +
    `Last Mode: ${player.lastMode}`
  );
}

function replayCurrentMode() {
  if (currentBattleSource === "daily") {
    startDailyQuest();
    return;
  }

  if (currentBattleSource === "skills" && currentSkillCategory) {
    const questions = buildCategoryBattleSet(currentSkillCategory, DEFAULT_QUESTIONS_PER_BATTLE);
    startBattleWithQuestions(
      questions,
      `${CATEGORY_LABELS[currentSkillCategory]} Practice`,
      "skills"
    );
    return;
  }

  startMixedBattle();
}

function resetProfile() {
  if (!confirm("Reset player name, XP, coins and gems?")) return;

  player = {
    name: "Jamie",
    xp: 420,
    xpMax: 500,
    coins: 1250,
    gems: 48,
    totalBattles: 0,
    bestScore: 0,
    lastMode: "Mixed Battle"
  };

  saveProfile();
  askForPlayerNameIfNeeded();
  updatePlayerUi();
  showScreen(menuScreen);
}

[startBattleBtn, leaderboardBtn, skillsBtn, dailyQuestBtn, nextBtn, playAgainBtn, resultsMenuBtn, backMenuBtn]
  .filter(Boolean)
  .forEach((button) => {
    button.addEventListener("click", () => {
      addPressAnimation(button);
      playSound("click");
    });
  });

startBattleBtn.addEventListener("click", startMixedBattle);
dailyQuestBtn.addEventListener("click", startDailyQuest);
skillsBtn.addEventListener("click", openSkillsMenu);
leaderboardBtn.addEventListener("click", showLeaderboard);

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

playAgainBtn.addEventListener("click", replayCurrentMode);

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
attachPressAnimations();
