import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import bgImage from '../assets/bg.jpg';
import backendAPI from '../services/backendApi';
import ProfileIcon from '../components/ProfileIcon';

export default function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    document.body.classList.add('dark');
    
    const loadQuiz = async () => {
      // Check if quiz data is in state
      if (location.state?.quiz?.parsed && Array.isArray(location.state.quiz.parsed)) {
        setQuizTitle(location.state.quiz.title || 'Quiz');
        setQuestions(location.state.quiz.parsed);
        return;
      }
      
      if (location.state?.quiz?.questions) {
        const quizText = location.state.quiz.questions;
        setQuizTitle(location.state.quiz.title || 'Quiz');
        setQuestions(parseQuizQuestions(quizText));
        return;
      }
      
      // If documentId is present, fetch from backend
      const docId = location.state?.documentId;
      if (docId) {
        try {
          const res = await backendAPI.getQuiz(docId);
          if (res.quiz?.questions) {
            setQuizTitle(res.quiz.title || 'Quiz');
            setQuestions(parseQuizQuestions(res.quiz.questions));
          } else {
            setQuizTitle(location.state?.title || 'Quiz');
          }
        } catch (err) {
          console.error('Failed to load quiz:', err);
          setQuizTitle(location.state?.title || 'Quiz');
        }
      } else {
        setQuizTitle(location.state?.title || 'Quiz');
      }
    };
    
    loadQuiz();
    
    return () => {
      document.body.classList.remove('dark');
    };
  }, [location]);

  const parseQuizQuestions = (quizText) => {
    const questionBlocks = quizText.split(/Q\d+\)/).filter(b => b.trim());
    return questionBlocks.map((block, idx) => {
      const lines = block.trim().split('\n').filter(l => l.trim());
      const question = lines[0];
      const options = { A: '', B: '', C: '', D: '' };
      let correct = 'A';
      
      lines.slice(1).forEach(line => {
        if (line.match(/^[ABCD]\)/)) {
          const match = line.match(/^([ABCD])\)\s*(.+)/);
          if (match) options[match[1]] = match[2];
        } else if (line.includes('Correct:')) {
          const match = line.match(/Correct:\s*([ABCD])/);
          if (match) correct = match[1];
        }
      });
      
      return { id: idx + 1, question, options, correct };
    });
  };

  const submitQuiz = () => {
    if (questions.length === 0) return;
    let correct = 0;
    const review = questions.map(q => {
      const user = answers[q.id];
      const isCorrect = user === q.correct;
      if (isCorrect) correct += 1;
      return {
        id: q.id,
        question: q.question,
        userAnswer: user || null,
        correctAnswer: q.correct,
        isCorrect,
      };
    });
    const total = questions.length;
    const incorrect = total - correct;
    const score = correct; // 1 mark for correct, 0 for incorrect
    const percent = Math.round((correct / total) * 100);

    const payload = { title: quizTitle, total, correct, incorrect, score, percent, review };
    try {
      sessionStorage.setItem('lastQuizResult', JSON.stringify(payload));
      sessionStorage.setItem('lastQuizRaw', JSON.stringify({ title: quizTitle, parsed: questions }));
    } catch {}
    navigate('/score', { state: payload });
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})`, zIndex: 0 }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/60"></div>
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-yellow-500/20 to-orange-500/20 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-purple-500/20 via-blue-500/20 to-green-500/20 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 animate-pulse" style={{ animationDelay: '2s' }}></div>
          {/* Swirling patterns */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-400/30 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
            <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-yellow-400/30 rounded-full blur-3xl animate-blob" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col min-h-screen relative z-10">
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/10 border-b border-white/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-4">
                  <img src={logo} alt="NotesQuest" className="h-8 w-8 object-contain" />
                  <h1 className="font-sans text-xl font-bold text-white">NotesQuest</h1>
                </div>
                <div className="flex items-center gap-4">
                  <Link to="/upload" className="px-6 py-2 text-sm font-bold bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-lg hover:bg-white/30 transition-all duration-300">Home</Link>
                  <Link to="/history" className="px-6 py-2 text-sm font-bold bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-lg hover:bg-white/30 transition-all duration-300">History</Link>
                  <ProfileIcon />
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center text-sm text-gray-300 mb-8">
                  <a className="font-sans hover:text-blue-400" href="#">Quiz</a>
                  <span className="mx-2">/</span>
                  <span className="font-sans font-medium text-white">{quizTitle}</span>
                </div>

                <h1 className="font-sans text-3xl md:text-4xl font-bold text-white mb-4">Quiz: {quizTitle}</h1>
                <p className="text-base text-gray-300 mb-8">Test your knowledge on the key concepts from the chapter.</p>

                <div className="space-y-6">
                  {questions.length > 0 ? questions.map((q, idx) => (
                    <div key={idx} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
                      <div className="flex items-start gap-6">
                        <span className="flex-shrink-0 text-blue-400 font-sans font-bold text-xl">{q.id}.</span>
                        <div className="flex-1">
                          <h3 className="text-lg font-sans font-bold text-white mb-4">{q.question}</h3>
                          <div className="space-y-3">
                            {['A', 'B', 'C', 'D'].map(letter => (
                              <label key={letter} className="flex items-center p-3 rounded-xl backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/20 hover:border-white/40">
                                <input 
                                  type="radio" 
                                  name={`q${q.id}`}
                                  value={letter}
                                  onChange={() => setAnswers({...answers, [q.id]: letter})}
                                  className="h-5 w-5 text-blue-400 focus:ring-blue-400 bg-gray-700 border-gray-600" 
                                />
                                <span className="ml-4 text-base text-gray-300">{letter}) {q.options[letter]}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-600">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Question {q.id} of {questions.length}</span>
                          <button onClick={() => {
                            const showKey = `showAnswer${q.id}`;
                            setAnswers({...answers, [showKey]: !answers[showKey]});
                          }} className="flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                            <span className="material-symbols-outlined text-xl">{answers[`showAnswer${q.id}`] ? 'visibility_off' : 'visibility'}</span>
                            <span>{answers[`showAnswer${q.id}`] ? 'Hide Answer' : 'Show Answer'}</span>
                          </button>
                        </div>
                        {answers[`showAnswer${q.id}`] && (
                          <div className="mt-3 pt-3 border-t border-gray-600">
                            <p className="text-base font-sans font-medium text-white">Correct Answer: <span className="font-body font-normal text-gray-300">{q.correct}) {q.options[q.correct]}</span></p>
                          </div>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 text-center shadow-2xl">
                      <p className="text-gray-400">No quiz questions available yet.</p>
                    </div>
                  )}
                </div>

                <div className="mt-10 flex justify-end">
                  <button onClick={submitQuiz} className="flex items-center gap-2 rounded-full h-12 px-8 font-sans text-base font-medium bg-white text-gray-900 hover:bg-white/90 transition-all transform hover:scale-105 shadow-lg">
                    <span className="material-symbols-outlined">send</span>
                    <span>Submit Quiz</span>
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
  );
}
