
import React from 'react';
import { EducationLevel, Subject } from '../types';
import { EDUCATION_LEVELS, SUBJECTS } from '../constants';

interface DashboardProps {
  level: EducationLevel;
  onSelectTab: (tab: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ level, onSelectTab }) => {
  const currentLevelInfo = EDUCATION_LEVELS.find(l => l.id === level);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className={`relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r ${currentLevelInfo?.color} text-white shadow-xl`}>
        <div className="relative z-10 max-w-lg">
          <h2 className="text-3xl font-black mb-2">Học tập là một cuộc hành trình! 🚀</h2>
          <p className="text-white/80 mb-6">EduAI đã cá nhân hóa lộ trình học cho bạn ở cấp {currentLevelInfo?.label}. Cùng bắt đầu nhé!</p>
          <div className="flex gap-4">
            <button 
              onClick={() => onSelectTab('study')}
              className="bg-white text-slate-800 px-6 py-2.5 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Học ngay
            </button>
            <button 
              onClick={() => onSelectTab('quiz')}
              className="bg-white/20 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-bold hover:bg-white/30 transition-all border border-white/30"
            >
              Luyện đề
            </button>
          </div>
        </div>
        <i className={`fas ${currentLevelInfo?.icon} absolute -right-4 -bottom-4 text-[180px] opacity-10 rotate-12`}></i>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Statistics */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <i className="fas fa-chart-line text-blue-500"></i>
            Tiến độ của bạn
          </h3>
          <div className="space-y-6">
            {['Toán học', 'Ngữ văn', 'Tiếng Anh'].map((sub, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm font-bold text-slate-600 mb-2">
                  <span>{sub}</span>
                  <span>{75 - i * 15}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-blue-500 transition-all duration-1000`} 
                    style={{ width: `${75 - i * 15}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Quest */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <i className="fas fa-bolt text-yellow-500"></i>
            Nhiệm vụ hôm nay
          </h3>
          <div className="space-y-3">
            {[
              { text: 'Hoàn thành 1 bài tập Toán', done: true },
              { text: 'Hỏi AI 1 câu về Ngữ văn', done: false },
              { text: 'Đạt điểm 10/10 Quiz IT', done: false },
            ].map((quest, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border-2 ${quest.done ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-transparent'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${quest.done ? 'bg-green-500 text-white' : 'border-2 border-slate-200'}`}>
                  {quest.done && <i className="fas fa-check text-[10px]"></i>}
                </div>
                <span className={`text-sm ${quest.done ? 'text-green-700 font-medium line-through opacity-70' : 'text-slate-600'}`}>{quest.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Topics */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800">Chủ đề nên xem</h3>
          <button className="text-blue-600 text-sm font-bold hover:underline">Tất cả</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SUBJECTS.slice(0, 4).map((sub) => (
            <button 
              key={sub.id} 
              className="group bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all text-left"
            >
              <div className={`w-12 h-12 ${sub.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                <i className={`fas ${sub.icon} text-xl`}></i>
              </div>
              <h4 className="font-bold text-slate-800">{sub.name}</h4>
              <p className="text-xs text-slate-400 mt-1">12 bài học mới</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
