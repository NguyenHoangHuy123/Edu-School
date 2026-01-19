
import React, { useState } from 'react';
import { EducationLevel, Subject } from './types';
import { SUBJECTS, EDUCATION_LEVELS } from './constants';
import AIBuddy from './components/AIBuddy';
import QuizRoom from './components/QuizRoom';
import Library from './components/Library';
import Dashboard from './components/Dashboard';

type AppTab = 'dashboard' | 'library' | 'study' | 'quiz';

const App: React.FC = () => {
  const [level, setLevel] = useState<EducationLevel>('Secondary');
  const [activeSubject, setActiveSubject] = useState<Subject>(SUBJECTS[0]);
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard level={level} onSelectTab={setActiveTab} />;
      case 'library':
        return <Library level={level} />;
      case 'study':
        return <AIBuddy level={level} activeSubject={activeSubject} />;
      case 'quiz':
        return <QuizRoom level={level} activeSubject={activeSubject} />;
      default:
        return <Dashboard level={level} onSelectTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc]">
      {/* Sidebar - Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-blue-200 shadow-lg">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">EduAI</h1>
            </div>
          </div>

          {/* Level Selector */}
          <div className="px-6 py-6">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Trình độ của bạn</label>
            <div className="grid grid-cols-1 gap-2">
              {EDUCATION_LEVELS.map((lev) => (
                <button
                  key={lev.id}
                  onClick={() => setLevel(lev.id as EducationLevel)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    level === lev.id 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-[1.02]' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <i className={`fas ${lev.icon} text-lg`}></i>
                  <span className="font-bold text-xs">{lev.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Nav */}
          <div className="px-6 py-2">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Học tập</label>
             <div className="space-y-1">
                {[
                  { id: 'dashboard', label: 'Bảng điều khiển', icon: 'fa-home' },
                  { id: 'library', label: 'Thư viện bài học', icon: 'fa-book-open' },
                  { id: 'study', label: 'Gia sư AI 24/7', icon: 'fa-robot' },
                  { id: 'quiz', label: 'Kho đề thi & Quiz', icon: 'fa-vial' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id as AppTab); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                      activeTab === item.id 
                        ? 'bg-slate-800 text-white' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <i className={`fas ${item.icon} w-5`}></i>
                    {item.label}
                  </button>
                ))}
             </div>
          </div>

          {/* Subjects (Contextual) */}
          {(activeTab === 'study' || activeTab === 'quiz') && (
            <div className="px-6 py-6 flex-1 overflow-y-auto custom-scrollbar">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Chọn môn học</label>
              <div className="grid grid-cols-1 gap-2">
                {SUBJECTS.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubject(sub)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all border-2 ${
                      activeSubject.id === sub.id 
                        ? 'border-blue-100 bg-blue-50 text-blue-700' 
                        : 'border-transparent text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${sub.color} flex items-center justify-center text-white text-[10px]`}>
                      <i className={`fas ${sub.icon}`}></i>
                    </div>
                    <span className="font-bold text-xs">{sub.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* User Status */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 mt-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=student" alt="Avatar" className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-blue-100" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                  <i className="fas fa-star text-[8px] text-white"></i>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Student AI</p>
                <div className="flex items-center gap-1">
                  <i className="fas fa-coins text-yellow-500 text-[10px]"></i>
                  <span className="text-[10px] text-slate-500 font-bold">1,250 điểm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 md:h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 md:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <i className="fas fa-bars"></i>
            </button>
            <div className="hidden md:block">
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                {activeTab === 'dashboard' ? 'Trang chủ' : 
                 activeTab === 'library' ? 'Thư viện bài học' :
                 activeTab === 'study' ? `Gia sư AI: ${activeSubject.name}` : 'Luyện tập Quiz'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex bg-slate-100 rounded-full px-4 py-2 items-center gap-2">
              <i className="fas fa-search text-slate-400 text-xs"></i>
              <input type="text" placeholder="Tìm kiến thức..." className="bg-transparent border-none text-xs outline-none w-32 focus:w-48 transition-all" />
            </div>
            <button className="relative p-2 text-slate-400 hover:text-blue-600 transition-all">
                <i className="far fa-bell text-xl"></i>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar bg-slate-50/50">
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default App;
