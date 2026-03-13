import { useState } from 'react'
import algoData from './data/algo.json'
import aseData from './data/ase.json'
import aplData from './data/apl.json'
import './index.css'

const QUIZ_BANKS = {
  APL: { id: 'APL', code: 'APL 524', title: 'Advanced Topics in Programming Languages', desc: 'BNF · Binding · Scoping', theme: 'apl', icon: '💻', data: aplData },
  ASE: { id: 'ASE', code: 'ASE 543', title: 'Advanced Software Engineering', desc: 'Patterns · Architecture · Testing', theme: 'ase', icon: '⚙️', data: aseData },
  ALGO: { id: 'ALGO', code: 'CS 528', title: 'Advanced Algorithms', desc: 'Graphs · DP · Complexity', theme: 'algo', icon: '📈', data: algoData }
};

// Fisher-Yates shuffle
function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  const arr = [...array];
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
  }
  return arr;
}

function SubjectSelection({ onSelect }) {
  return (
    <>
      <header className="site-header">
        <span className="eyebrow">Exam Prep</span>
        <h1>Quiz Station</h1>
        <p>// select subject → set range → ace the exam</p>
      </header>

      <div className="subject-grid animate-in">
        {Object.values(QUIZ_BANKS).map(subj => (
          <div 
            key={subj.id} 
            className={`subject-card ${subj.theme}`} 
            onClick={() => onSelect(subj)}
          >
            <div style={{fontSize: '2rem', marginBottom: '12px'}}>{subj.icon}</div>
            <div className="subj-code">{subj.code}</div>
            <div className="subj-title">{subj.title}</div>
            <div className="subj-desc" style={{color: 'var(--muted)', fontSize: '13px', lineHeight: '1.4'}}>{subj.desc}</div>
            <div className="subj-count">
              <span>{subj.data.length} Qs</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function RangeSetup({ subject, onBack, onStart }) {
  const maxQs = subject.data.length;
  const [fromQ, setFromQ] = useState(1);
  const [toQ, setToQ] = useState(Math.min(maxQs, 50));

  const handleStart = () => {
    let start = Math.max(1, parseInt(fromQ) || 1);
    let end = Math.min(maxQs, Math.max(start, parseInt(toQ) || maxQs));
    onStart(subject.id, start, end);
  }

  return (
    <div className="animate-in">
      <button className="back-btn" onClick={onBack}>← Back to Subjects</button>
      
      <div className="setup-card">
        <h2>Configure Quiz</h2>
        <p className="setup-sub">// choose your question range for {subject.id}</p>

        <div className="range-row">
          <div className="field">
            <label>From Q#</label>
            <input 
              type="number" 
              value={fromQ} 
              min="1" 
              max={maxQs} 
              onChange={e => setFromQ(e.target.value)} 
            />
          </div>
          <div className="field">
            <label>To Q#</label>
            <input 
              type="number" 
              value={toQ} 
              min="1" 
              max={maxQs}
              onChange={e => setToQ(e.target.value)} 
            />
          </div>
        </div>

        <p className="range-info">Bank: <span>{maxQs}</span> questions available</p>

        <button className="btn-start" onClick={handleStart}>
          ▶ Start Quiz
        </button>
      </div>
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

  return (
    <div className="animate-in" key={currentIndex}>
      <div className="q-box">
        <div className="q-meta">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span style={{color: 'var(--ok)'}}>Score: {score}</span>
        </div>

        <h2 className="q-text">{currentQ.questionText}</h2>

        <div className="opts">
          {currentQ.options.map((opt, idx) => {
            let className = "opt-btn";
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
                style={isAnswered ? {} : (opt===selectedOption ? {borderColor:'var(--text)', background:'var(--surf)'} : {})}
              >
                <span style={{fontFamily:'var(--mono)', opacity:0.5, marginRight:'12px'}}>{String.fromCharCode(65+idx)}.</span> 
                {opt}
              </button>
            )
          })}
        </div>

        {isAnswered && (
          <div className="next-wrap">
            <button className="btn-next" onClick={handleNext}>
              {currentIndex + 1 < questions.length ? 'Next Question →' : 'Finish Quiz →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ResultSummary({ score, total, incorrectList, retakeQuiz, goHome }) {
  return (
    <div className="animate-in">
      <div className="result-card" style={{marginBottom: '24px'}}>
        <h1 style={{fontSize: '2rem', marginBottom: '32px', fontFamily: 'var(--serif)'}}>Quiz Complete</h1>
        
        <div className="score-circle">
          {Math.round((score/total)*100)}<span style={{fontSize:'1rem'}}>%</span>
        </div>
        
        <p style={{color: 'var(--muted)'}}>You scored {score} out of {total}</p>

        <div className="result-actions">
          <button className="btn-outline" onClick={goHome}>Change Subject</button>
          <button className="btn-outline" style={{background: '#fff', color: '#000'}} onClick={retakeQuiz}>Retake Quiz</button>
        </div>
      </div>

      {incorrectList.length > 0 && (
        <div className="result-card" style={{textAlign: 'left'}}>
          <h2 style={{fontSize: '1.2rem', marginBottom: '24px'}}>Questions to Review</h2>
          {incorrectList.map((q, i) => (
            <div key={i} className="review-item">
              <div className="review-q">{i+1}. {q.questionText}</div>
              <div className="review-a">Your Answer: {q.userAns}</div>
              <div className="review-c">Correct Answer: {q.correctAnswer}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function App() {
  const [screen, setScreen] = useState('subjects'); // subjects, setup, quiz, results
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [activeQuestions, setActiveQuestions] = useState([]);
  
  // Results state
  const [finalScore, setFinalScore] = useState(0);
  const [incorrectList, setIncorrectList] = useState([]);
  const [lastSettings, setLastSettings] = useState(null);

  const startQuiz = (bankKey, fromQ, toQ) => {
    const allQuestions = QUIZ_BANKS[bankKey].data;
    
    // Select the specific range (fromQ and toQ are 1-indexed)
    const rangeSubset = allQuestions.slice(fromQ - 1, toQ);
    
    // Shuffle the subset so they aren't always in the exact same order
    const shuffled = shuffle(rangeSubset);
    
    const qWithKeys = shuffled.map(q => ({...q, _key: Math.random().toString()}));

    setLastSettings({ bankKey, fromQ, toQ });
    setActiveQuestions(qWithKeys);
    setScreen('quiz');
  };

  const finishQuiz = (score, incorrect) => {
    setFinalScore(score);
    setIncorrectList(incorrect);
    setScreen('results');
  };

  const retakeQuiz = () => {
    startQuiz(lastSettings.bankKey, lastSettings.fromQ, lastSettings.toQ);
  };

  return (
    <>
      {screen === 'subjects' && (
        <SubjectSelection onSelect={(subj) => { setSelectedSubject(subj); setScreen('setup'); }} />
      )}
      
      {screen === 'setup' && (
         <RangeSetup 
           subject={selectedSubject} 
           onBack={() => setScreen('subjects')}
           onStart={startQuiz}
         />
      )}

      {screen === 'quiz' && (
         <QuizRunner questions={activeQuestions} finishQuiz={finishQuiz} />
      )}

      {screen === 'results' && (
        <ResultSummary 
          score={finalScore} 
          total={activeQuestions.length} 
          incorrectList={incorrectList}
          retakeQuiz={retakeQuiz}
          goHome={() => setScreen('subjects')}
        />
      )}
    </>
  )
}

export default App
