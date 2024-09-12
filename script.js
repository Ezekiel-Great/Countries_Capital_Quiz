let countries = [];
let selectedQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswer = null;

const questionElement = document.querySelector('.question');
const questionNumberElement = document.querySelector('.question-number');
const answersElement = document.querySelector('.answers');
const resultElement = document.querySelector('.result');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const playAgainButton = document.getElementById('play-again');

// Fetch country data from API
async function fetchCountries() {
  try {
    const response = await fetch('https://restcountries.com/v2/all');
    if (!response.ok) throw new Error('Network response was not ok');
    let data = await response.json();

    // Filter out countries with no capital
    countries = data.filter(country => country.capital && country.capital.trim() !== "");
    
    if (countries.length > 0) {
      startQuiz();
    } else {
      questionElement.textContent = 'Failed to load countries.';
    }
  } catch (error) {
    questionElement.textContent = 'Error loading countries.';
    console.error('Error:', error);
  }
}

function startQuiz() {
  getRandomQuestions();
  loadQuestion();
}

// Select 10 random questions
function getRandomQuestions() {
  let shuffled = countries.sort(() => 0.5 - Math.random());
  selectedQuestions = shuffled.slice(0, 10).map(country => ({
    country: country.name,
    capital: country.capital
  }));
}

function loadQuestion() {
  if (selectedQuestions.length === 0) {
    questionElement.textContent = 'No questions available.';
    return;
  }

  const currentQuestion = selectedQuestions[currentQuestionIndex];
  questionElement.textContent = `What is the capital of ${currentQuestion.country}?`;
  questionNumberElement.textContent = `Question ${currentQuestionIndex + 1} of ${selectedQuestions.length}`;
  answersElement.innerHTML = '';

  const allOptions = getRandomOptions(currentQuestion.capital);
  allOptions.forEach(option => {
    const button = document.createElement('button');
    button.textContent = option;
    button.addEventListener('click', () => handleAnswer(button, option, currentQuestion.capital));
    answersElement.appendChild(button);
  });

  prevButton.disabled = currentQuestionIndex === 0;
  nextButton.disabled = true;
}

function getRandomOptions(correctAnswer) {
  const incorrectOptions = countries
    .map(c => c.capital)
    .filter(cap => cap && cap !== correctAnswer)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  return [...incorrectOptions, correctAnswer].sort(() => 0.5 - Math.random());
}

function handleAnswer(button, selectedOption, correctAnswer) {
  if (selectedAnswer !== null) return;

  selectedAnswer = selectedOption;
  const buttons = answersElement.querySelectorAll('button');
  buttons.forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === correctAnswer) {
      btn.classList.add('correct');
    } else {
      btn.classList.add('incorrect');
    }
  });

  button.classList.add('selected'); // Add the 'selected' class to the chosen button
  button.classList.add(selectedOption === correctAnswer ? 'correct' : 'incorrect');

  if (selectedOption === correctAnswer) {
    score++;
    showResult('Correct!', true);
  } else {
    showResult('Incorrect!', false);
  }

  nextButton.disabled = false;
}

function showResult(message, isCorrect) {
  resultElement.textContent = message;
}

function showFinalScore() {
  const finalComment = getFinalComment(score, selectedQuestions.length);
  resultElement.innerHTML = `Quiz completed! Your score: ${score}/${selectedQuestions.length} <br> ${finalComment}`;
  questionElement.textContent = '';
  answersElement.innerHTML = '';
  prevButton.style.display = 'none';
  nextButton.style.display = 'none';
  playAgainButton.style.display = 'inline-block';
}

function getFinalComment(score, totalQuestions) {
  const percentage = (score / totalQuestions) * 100;
  if (percentage === 100) {
    return "You're on fire! 🔥";
  } else if (percentage >= 80) {
    return "Awesome! Keep it up!";
  } else if (percentage >= 60) {
    return "Good job!";
  } else if (percentage >= 40) {
    return "Not bad, but you can do better!";
  } else {
    return "Keep practicing!";
  }
}

prevButton.addEventListener('click', () => {
  currentQuestionIndex--;
  selectedAnswer = null;
  loadQuestion();
  resultElement.textContent = '';
});

nextButton.addEventListener('click', () => {
  currentQuestionIndex++;
  selectedAnswer = null;
  resultElement.textContent = '';

  if (currentQuestionIndex < selectedQuestions.length) {
    loadQuestion();
  } else {
    showFinalScore();
  }
});

playAgainButton.addEventListener('click', () => {
  score = 0;
  currentQuestionIndex = 0;
  selectedAnswer = null;
  playAgainButton.style.display = 'none';
  prevButton.style.display = 'inline-block';
  nextButton.style.display = 'inline-block';
  resultElement.textContent = '';

  // Re-fetch new set of random questions and start quiz again
  fetchCountries();
});

// Initialize the quiz app
fetchCountries();
