
import React, { useState, useRef, useEffect } from 'react';
import { EducationLevel, Message, Subject, ChatSession } from '../types';
import { chatWithAI, generateAudio, decodeBase64ToUint8Array, decodeAudioData } from '../services/gemini';

interface AIBuddyProps {
  level: EducationLevel;
  activeSubject: Subject;
}

const STORAGE_KEY = 'eduai_chat_sessions';

const AIBuddy: React.FC<AIBuddyProps> = ({ level, activeSubject }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  
  // Trạng thái ghi âm: idle (chờ), recording (đang ghi), review (xem lại để gửi/xóa)
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'review'>('idle');
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Khởi tạo dữ liệu từ LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const formatted = parsed.map((s: any) => ({
          ...s,
          lastUpdate: new Date(s.lastUpdate),
          messages: s.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
        }));
        setSessions(formatted);
      } catch (e) {
        console.error("Lỗi tải lịch sử", e);
      }
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const startNewSession = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: `Hỏi về ${activeSubject.name} (${new Date().toLocaleDateString('vi-VN')})`,
      messages: [
        {
          id: '1',
          role: 'assistant',
          content: `Chào bạn! Tôi là EduAI. Tôi đã sẵn sàng giúp bạn học môn ${activeSubject.name}. Bạn có thể gửi câu hỏi bằng chữ, hình ảnh hoặc giọng nói nhé!`,
          timestamp: new Date()
        }
      ],
      subjectId: activeSubject.id,
      level: level,
      lastUpdate: new Date()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setShowHistory(false);
  };

  useEffect(() => {
    if (!currentSessionId) {
      const existing = sessions.find(s => s.subjectId === activeSubject.id && s.level === level);
      if (existing) {
        setCurrentSessionId(existing.id);
      } else {
        startNewSession();
      }
    }
  }, [activeSubject.id, level]);

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    if (currentSessionId === id) {
      setCurrentSessionId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setShowPlusMenu(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Logic Ghi âm
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = () => {
        setRecordingStatus('review');
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setRecordingStatus('recording');
      setRecordingDuration(0);
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert("Cần quyền truy cập Micro để ghi âm!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingStatus === 'recording') {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    setRecordingStatus('idle');
    setRecordingDuration(0);
    audioChunksRef.current = [];
  };

  const sendVoiceMessage = async () => {
    await processMessage("🎤 [Tin nhắn thoại]");
    setRecordingStatus('idle');
    setRecordingDuration(0);
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading || !currentSessionId) return;
    await processMessage(input);
  };

  const processMessage = async (msgContent: string) => {
    if (!currentSessionId) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: msgContent || (selectedImage ? "[Hình ảnh bài tập]" : ""),
      image: selectedImage || undefined,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMsg];
    setSessions(prev => prev.map(s => 
      s.id === currentSessionId 
        ? { ...s, messages: updatedMessages, lastUpdate: new Date(), title: msgContent.length > 20 ? msgContent.slice(0, 20) + "..." : msgContent } 
        : s
    ));

    const currentInput = msgContent;
    const currentImage = selectedImage;
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const history = updatedMessages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const response = await chatWithAI(currentInput, level, activeSubject.name, history, currentImage || undefined);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        groundingSources: response.groundingSources
      };

      setSessions(prev => prev.map(s => 
        s.id === currentSessionId 
          ? { ...s, messages: [...updatedMessages, assistantMsg], lastUpdate: new Date() } 
          : s
      ));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = async (id: string, text: string) => {
    if (isSpeaking === id) return;
    setIsSpeaking(id);
    try {
      const base64Audio = await generateAudio(text);
      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        const audioData = decodeBase64ToUint8Array(base64Audio);
        const buffer = await decodeAudioData(audioData, ctx);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setIsSpeaking(null);
        source.start();
      }
    } catch (err) {
      setIsSpeaking(null);
    }
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 relative">
      
      {/* Sidebar Lịch sử */}
      <div className={`absolute inset-y-0 left-0 z-20 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${showHistory ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:w-72 flex flex-col border-r border-slate-800`}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h4 className="font-bold text-sm">Lịch sử hội thoại</h4>
          <button onClick={() => setShowHistory(false)} className="md:hidden opacity-50"><i className="fas fa-times"></i></button>
        </div>
        <div className="p-3">
          <button onClick={startNewSession} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all">
            <i className="fas fa-plus"></i> Hội thoại mới
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {sessions.map((s) => (
            <div key={s.id} onClick={() => { setCurrentSessionId(s.id); setShowHistory(false); }} className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${currentSessionId === s.id ? 'bg-white/10' : 'hover:bg-white/5 text-slate-400'}`}>
              <div className="truncate pr-2">
                <p className="text-xs font-medium truncate">{s.title}</p>
                <p className="text-[9px] opacity-40">{s.lastUpdate.toLocaleDateString('vi-VN')}</p>
              </div>
              <button onClick={(e) => deleteSession(e, s.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"><i className="fas fa-trash-alt text-[10px]"></i></button>
            </div>
          ))}
        </div>
      </div>

      {/* Vùng Chat Chính */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/30">
        {/* Header */}
        <div className={`${activeSubject.color} p-4 text-white flex items-center justify-between shrink-0 z-10 shadow-md`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowHistory(true)} className="md:hidden w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center"><i className="fas fa-bars"></i></button>
            <div className="hidden sm:block bg-white/20 p-2 rounded-lg"><i className={`fas ${activeSubject.icon} text-lg`}></i></div>
            <div className="truncate">
              <h3 className="font-bold text-sm">Gia sư {activeSubject.name}</h3>
              <p className="text-[10px] opacity-80">{level}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-black/10 px-3 py-1 rounded-full border border-white/20">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase">Sẵn sàng</span>
          </div>
        </div>

        {/* Tin nhắn */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
                {m.image && <img src={m.image} alt="Upload" className="mb-3 max-h-60 w-full object-contain rounded-lg bg-slate-100" />}
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</div>
                <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-between">
                  {m.role === 'assistant' && (
                    <button onClick={() => speakText(m.id, m.content)} className={`text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 hover:bg-blue-50 flex items-center gap-1 ${isSpeaking === m.id ? 'text-blue-600' : 'text-slate-500'}`}>
                      <i className={`fas ${isSpeaking === m.id ? 'fa-volume-up' : 'fa-volume-low'}`}></i>
                      {isSpeaking === m.id ? 'Đang đọc...' : 'Nghe giảng'}
                    </button>
                  )}
                  <span className="text-[9px] opacity-40 ml-auto">{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400">EduAI đang soạn bài...</span>
                <div className="flex gap-1"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-75"></div></div>
              </div>
            </div>
          )}
        </div>

        {/* Khu vực Nhập liệu */}
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto">
            {selectedImage && (
              <div className="mb-3 relative inline-block animate-bounce-in">
                <img src={selectedImage} alt="Preview" className="w-20 h-20 object-cover rounded-xl border-2 border-blue-200 shadow-lg" />
                <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] shadow-lg"><i className="fas fa-times"></i></button>
              </div>
            )}
            
            <div className="flex items-end gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200 focus-within:bg-white focus-within:border-blue-400 transition-all">
              
              {/* Nút (+) bên trái */}
              <div className="relative shrink-0">
                <button onClick={() => setShowPlusMenu(!showPlusMenu)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showPlusMenu ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:text-blue-600 shadow-sm'}`}>
                  <i className={`fas ${showPlusMenu ? 'fa-times' : 'fa-plus'}`}></i>
                </button>
                {showPlusMenu && (
                  <div className="absolute bottom-14 left-0 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 w-48 animate-fade-in z-30">
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 w-full p-3 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center"><i className="fas fa-image"></i></div>
                      Gửi ảnh bài tập
                    </button>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>

              {/* Vùng nội dung chính */}
              {recordingStatus === 'recording' ? (
                <div className="flex-1 flex items-center justify-between px-4 py-2 bg-red-50 border border-red-100 rounded-xl animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
                    <span className="text-xs font-black text-red-700">Đang ghi âm: {formatDuration(recordingDuration)}</span>
                  </div>
                  <button onClick={stopRecording} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-sm">Dừng</button>
                </div>
              ) : recordingStatus === 'review' ? (
                <div className="flex-1 flex items-center justify-between px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl animate-fade-in">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-microphone text-blue-600"></i>
                    <span className="text-xs font-bold text-blue-700">Đã ghi xong ({formatDuration(recordingDuration)})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={cancelRecording} className="p-2 text-red-500 hover:bg-red-100 rounded-lg" title="Xóa"><i className="fas fa-trash-alt"></i></button>
                    <button onClick={sendVoiceMessage} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-sm">Gửi</button>
                  </div>
                </div>
              ) : (
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                  placeholder="Hỏi bất cứ điều gì..."
                  className="flex-1 bg-transparent border-none py-2 px-2 text-sm focus:ring-0 outline-none resize-none max-h-32 min-h-[40px]"
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                />
              )}

              {/* Nút điều khiển bên phải: Mic & Gửi */}
              {recordingStatus === 'idle' && (
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={startRecording} className="w-10 h-10 rounded-xl bg-white text-slate-500 hover:text-red-600 hover:shadow-md transition-all flex items-center justify-center shadow-sm" title="Ghi âm">
                    <i className="fas fa-microphone"></i>
                  </button>
                  <button onClick={handleSend} disabled={isLoading || (!input.trim() && !selectedImage)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isLoading || (!input.trim() && !selectedImage) ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white shadow-lg hover:scale-105 shadow-blue-200'}`}>
                    <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showHistory && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-10 md:hidden" onClick={() => setShowHistory(false)}></div>}
    </div>
  );
};

export default AIBuddy;
