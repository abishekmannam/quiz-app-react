import { useState, useEffect } from 'react'
import algoData from './data/algo.json'
import aseData from './data/ase.json'
import aplData from './data/apl.json'
import './index.css'

const QUIZ_BANKS = {
  APL: { name: 'APL', data: aplData },
  ASE: { name: 'ASE', data: aseData },
  AAlgorithms: { name: 'Algorithms', data: algoData }
};

const LENGTHS = {
  '10 Qs': 10,
  '20 Qs': 20,
  '30 Qs': 30,
  '40 Qs': 40,
  '50 Qs': 50,
  'All Qs': 'ALL'
};

// Fisher-Yates shuffle
function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

function Home({ startQuiz }) {
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [selectedLength, setSelectedLength] = useState(null)

  return (
    <div className="container">
      <h1>Quiz Master</h1>
      <p style={{textAlign: 'center'}}>Select a question bank and the desired length of your quiz.</p>
      
      <div className="glass-card animate-slide-up">
        <h2>1. Select Question Bank</h2>
        <div className="grid grid-cols-3">
          {Object.keys(QUIZ_BANKS).map(key => (
            <button 
              key={key}
              className={`btn ${selectedQuiz === key ? 'selected' : ''}`}
              onClick={() => setSelectedQuiz(key)}
            >
              <div style={{fontWeight: 600}}>{QUIZ_BANKS[key].name}</div>
              <div style={{fontSize: '0.8rem', opacity: 0.7}}>
                {QUIZ_BANKS[key].data.length} Qs
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card animate-slide-up" style={{animationDelay: '0.1s'}}>
        <h2>2. Select Length</h2>
        <div className="grid grid-cols-3">
          {Object.keys(LENGTHS).map(len => (
            <button 
              key={len}
              className={`btn ${selectedLength === len ? 'selected' : ''}`}
              onClick={() => setSelectedLength(len)}
              style={{justifyContent: 'center'}}
            >
              {len}
            </button>
          ))}
        </div>
      </div>

      <button 
        className="btn btn-primary animate-slide-up" 
        style={{animationDelay: '0.2s'}}
        disabled={!selectedQuiz || !selectedLength}
        onClick={() => startQuiz(selectedQuiz, selectedLength)}
      >
        Start Quiz
      </button>
    </div>
  )
}

function QuizRunner({ questions, finishQuiz }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [incorrectList, setIncorrectList] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)

  const currentQ = questions[currentIndex]

  const handleOptionClick = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentQ.correctAnswer;
    if (isCorrect) {
      setScore(s => s + 1);
    } else {
      setIncorrectList(list => [...list, { ...currentQ, userAns: option }]);
    }
  }

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      finishQuiz(score, incorrectList);
    }
  }

  const progress = ((currentIndex) / questions.length) * 100;

  return (
    <div className="container">
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="glass-card animate-slide-up" key={currentIndex}>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
          <div style={{color: 'var(--text-secondary)'}}>
            Question {currentIndex + 1} / {questions.length}
          </div>
          <div style={{fontWeight: 600, color: 'var(--primary-accent)'}}>
            Score: {score}
          </div>
        </div>

        <h2 style={{minHeight: '4rem'}}>{currentQ.questionText}</h2>

        <div className="grid">
          {currentQ.options.map((opt, idx) => {
            let className = "btn";
            if (isAnswered) {
              if (opt === currentQ.correctAnswer) className += " correct";
              else if (opt === selectedOption) className += " wrong";
            } else if (opt === selectedOption) {
              className += " selected";
            }

            return (
              <button 
                key={idx}
                className={className}
                onClick={() => handleOptionClick(opt)}
                disabled={isAnswered}
              >
                {opt}
              </button>
            )
          })}
        </div>

        {isAnswered && (
          <button 
            className="btn btn-primary" 
            style={{marginTop: '2rem'}}
            onClick={handleNext}
          >
            {currentIndex + 1 < questions.length ? 'Next Question' : 'Finish Quiz'}
          </button>
        )}
      </div>
    </div>
  )
}

function ResultSummary({ score, total, incorrectList, retakeQuiz, goHome }) {
  return (
    <div className="container">
      <div className="glass-card animate-slide-up" style={{textAlign: 'center'}}>
        <h1 style={{fontSize: '3rem', marginBottom: '1rem'}}>Quiz Complete!</h1>
        <h2>Your Score: <span style={{color: 'var(--primary-accent)'}}>{score}</span> / {total}</h2>
        <div style={{fontSize: '1.2rem', color: 'var(--text-secondary)'}}>
          ({Math.round((score/total)*100)}%)
        </div>
      </div>

      {incorrectList.length > 0 && (
        <div className="glass-card animate-slide-up" style={{animationDelay: '0.1s'}}>
          <h2 style={{borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem', marginBottom: '0'}}>
            Questions to Review
          </h2>
          {incorrectList.map((q, i) => (
            <div key={i} className="result-item">
              <div className="result-q">{i+1}. {q.questionText}</div>
              <div className="result-ans">
                <div className="wrong">Your Answer: {q.userAns}</div>
                <div className="correct">Correct Answer: {q.correctAnswer}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 animate-slide-up" style={{animationDelay: '0.2s', gap: '1rem'}}>
        <button className="btn" style={{justifyContent: 'center'}} onClick={goHome}>
          Back to Home
        </button>
        <button className="btn btn-primary" style={{marginTop: 0, gridColumn: 'span 2'}} onClick={retakeQuiz}>
          Retake Quiz
        </button>
      </div>
    </div>
  )
}

function App() {
  const [screen, setScreen] = useState('home'); // home, quiz, results
  const [activeQuestions, setActiveQuestions] = useState([]);
  
  // Results state
  const [finalScore, setFinalScore] = useState(0);
  const [incorrectList, setIncorrectList] = useState([]);
  const [lastSettings, setLastSettings] = useState(null);

  const startQuiz = (bankKey, lengthKey) => {
    const allQuestions = [...QUIZ_BANKS[bankKey].data];
    const shuffled = shuffle(allQuestions);
    const limit = LENGTHS[lengthKey];
    const count = limit === 'ALL' ? shuffled.length : Math.min(limit, shuffled.length);
    const selectedQ = shuffled.slice(0, count);
    
    // Add random IDs to handle duplicate parsed questions and force re-renders if needed
    const qWithKeys = selectedQ.map(q => ({...q, _key: Math.random().toString()}));

    setLastSettings({ bankKey, lengthKey });
    setActiveQuestions(qWithKeys);
    setScreen('quiz');
  };

  const finishQuiz = (score, incorrect) => {
    setFinalScore(score);
    setIncorrectList(incorrect);
    setScreen('results');
  };

  const retakeQuiz = () => {
    startQuiz(lastSettings.bankKey, lastSettings.lengthKey);
  };

  return (
    <>
      {screen === 'home' && <Home startQuiz={startQuiz} />}
      {screen === 'quiz' && <QuizRunner questions={activeQuestions} finishQuiz={finishQuiz} />}
      {screen === 'results' && 
        <ResultSummary 
          score={finalScore} 
          total={activeQuestions.length} 
          incorrectList={incorrectList}
          retakeQuiz={retakeQuiz}
          goHome={() => setScreen('home')}
        />
      }
    </>
  )
}

export default App
