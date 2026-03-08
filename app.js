const startBattleBtn = document.getElementById("start-battle-btn");
const menuScreen = document.getElementById("menu-screen");
const battleScreen = document.getElementById("battle-screen");
const backMenuBtn = document.getElementById("back-menu-btn");
const questionCount = document.getElementById("question-count");
const battleQuestion = document.getElementById("battle-question");
const answerList = document.getElementById("answer-list");
const feedback = document.getElementById("feedback");
const nextBtn = document.getElementById("next-btn");

const questions = [
  {
    question: "Which sentence best shows that the writer feels nervous?",
    answers: [
      { text: "He opened the gate and walked inside.", correct: false },
      { text: "His hands shook as he reached for the handle.", correct: true },
      { text: "The sun was shining over the playground.", correct: false },
      { text: "He remembered the bus arrived at 8:15 am.", correct: false }
    ]
  },
  {
    question: "What is 15% of 200?",
    answers: [
      { text: "20", correct: false },
      { text: "25", correct: false },
      { text: "30", correct: true },
      { text: "35", correct: false }
    ]
  },
  {
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

function showQuestion() {
  const current = questions[currentQuestionIndex];
  questionCount.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  battleQuestion.textContent = current.question;
  answerList.innerHTML = "";
  feedback.textContent = "";
  feedback.className = "feedback";
  nextBtn.classList.add("hidden");

  current.answers.forEach(answer => {
    const button = document.createElement("button");
    button.className = "answer-button";
    button.textContent = answer.text;
    button.addEventListener("click", () => selectAnswer(answer.correct));
    answerList.appendChild(button);
  });
}

function selectAnswer(isCorrect) {
  const buttons = document.querySelectorAll(".answer-button");
  buttons.forEach(btn => btn.disabled = true);

  if (isCorrect) {
    score++;
    feedback.textContent = "Correct! +10 XP";
    feedback.classList.add("correct");
  } else {
    feedback.textContent = "Not quite. Try the next one.";
    feedback.classList.add("wrong");
  }

  nextBtn.classList.remove("hidden");
}

function showResults() {
  questionCount.textContent = "Battle Complete";
  battleQuestion.textContent = `You got ${score} out of ${questions.length} correct.`;
  answerList.innerHTML = "";
  feedback.textContent = score >= 2 ? "Great job, Scholar." : "Good effort — keep training.";
  feedback.className = "feedback correct";
  nextBtn.classList.add("hidden");
  backMenuBtn.classList.remove("hidden");
}

startBattleBtn.addEventListener("click", () => {
  menuScreen.classList.add("hidden");
  battleScreen.classList.remove("hidden");
  currentQuestionIndex = 0;
  score = 0;
  backMenuBtn.classList.add("hidden");
  showQuestion();
});

nextBtn.addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResults();
  }
});

backMenuBtn.addEventListener("click", () => {
  battleScreen.classList.add("hidden");
  menuScreen.classList.remove("hidden");
});
