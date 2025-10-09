import { Routes, Route } from 'react-router-dom';
import Landing from './pages/landing';
import Login from './pages/login';
import Upload from './pages/upload';
import Quiz from './pages/quiz';
import Score from './pages/score';
import Summary from './pages/summary';
import History from './pages/history';
import Progress from './pages/progress';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/score" element={<Score />} />
      <Route path="/summary" element={<Summary />} />
      <Route path="/history" element={<History />} />
      <Route path="/progress" element={<Progress />} />
    </Routes>
  );
}

export default App;