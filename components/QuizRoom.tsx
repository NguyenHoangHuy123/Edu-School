
import React, { useState } from 'react';
import { EducationLevel, QuizQuestion, Subject } from '../types';
import { generateQuiz } from '../services/gemini';

interface QuizRoomProps {
  level: EducationLevel;
  activeSubject: Subject;
}

const QuizRoom: React.FC<QuizRoomProps> = ({ level, activeSubject }) => {
  const [topic, setTopic] = useState('');
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const startQuiz = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setQuizzes([]);
    setShowResult(false);
    setCurrentIdx(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);

    try {
      const data = await generateQuiz(topic, level);
      setQuizzes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (idx: number) => {
    if (isAnswered) return;
    setSelectedAnswer(idx);
    setIsAnswered(true);
    if (idx === quizzes[currentIdx].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIdx < quizzes.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 font-medium">EduAI đang soạn bộ đề cho bạn...</p>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-trophy text-4xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Kết quả bài làm</h2>
        <p className="text-slate-600 mb-6">
          Bạn đã trả lời đúng <span className="font-bold text-blue-600">{score}/{quizzes.length}</span> câu hỏi.
        </p>
        <button 
          onClick={() => { setQuizzes([]); setTopic(''); }}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
        >
          Làm thử chủ đề khác
        </button>
      </div>
    );
  }

  if (quizzes.length > 0) {
    const q = quizzes[currentIdx];
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-500">CÂU HỎI {currentIdx + 1}/{quizzes.length}</span>
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">Chủ đề: {topic}</span>
        </div>
        <div className="p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">{q.question}</h3>
          <div className="space-y-3">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${
                  isAnswered 
                    ? idx === q.correctAnswer 
                      ? 'border-green-500 bg-green-50'
                      : idx === selectedAnswer 
                        ? 'border-red-500 bg-red-50'
                        : 'border-slate-100 opacity-50'
                    : 'border-slate-100 hover:border-blue-200 hover:bg-blue-50'
                }`}
              >
                <span className="flex-1 text-sm">{opt}</span>
                {isAnswered && idx === q.correctAnswer && <i className="fas fa-check-circle text-green-600"></i>}
                {isAnswered && idx === selectedAnswer && idx !== q.correctAnswer && <i className="fas fa-times-circle text-red-600"></i>}
              </button>
            ))}
          </div>

          {isAnswered && (
            <div className="mt-6 p-4 bg-slate-50 rounded-xl animate-fade-in">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Giải thích:</p>
              <p className="text-sm text-slate-700 italic">{q.explanation}</p>
              <button 
                onClick={nextQuestion}
                className="mt-4 w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition-all"
              >
                {currentIdx < quizzes.length - 1 ? 'Tiếp theo' : 'Hoàn thành'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-feather-pointed text-2xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Kiểm tra kiến thức</h2>
        <p className="text-slate-500 mt-2">Nhập chủ đề bạn muốn AI tạo câu hỏi ôn tập</p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="flex flex-col gap-4">
          <input 
            type="text" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && startQuiz()}
            placeholder="Ví dụ: Quang hợp, Chiến dịch Điện Biên Phủ, Thì hiện tại đơn..."
            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none"
          />
          <button 
            onClick={startQuiz}
            disabled={!topic.trim()}
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all ${
              !topic.trim() ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1'
            }`}
          >
            Bắt đầu tạo Quiz
          </button>
        </div>
        
        <div className="mt-8 flex flex-wrap justify-center gap-2">
            <span className="text-xs font-semibold text-slate-400 w-full text-center mb-2 uppercase">Gợi ý chủ đề:</span>
            {['Cộng trừ phân số', 'Nguyên tử', 'Lịch sử lớp 9', 'Passive Voice'].map(tag => (
                <button 
                    key={tag}
                    onClick={() => setTopic(tag)}
                    className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-colors"
                >
                    {tag}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default QuizRoom;
