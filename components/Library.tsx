
import React from 'react';
import { EducationLevel, Course } from '../types';
import { MOCK_COURSES } from '../constants';

interface LibraryProps {
  level: EducationLevel;
}

const Library: React.FC<LibraryProps> = ({ level }) => {
  const filteredCourses = MOCK_COURSES.filter(c => c.level === level);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Thư viện bài học</h2>
          <p className="text-slate-500">Các khóa học được thiết kế riêng cho {level}</p>
        </div>
        <div className="flex gap-2">
          <select className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500">
            <option>Tất cả môn</option>
            <option>Toán học</option>
            <option>Ngữ văn</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm group hover:shadow-xl transition-all">
              <div className="relative h-40 overflow-hidden">
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-blue-600 uppercase shadow-sm">
                  {course.subjectId}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-800 mb-4 line-clamp-1">{course.title}</h3>
                <div className="space-y-3 mb-6">
                  {course.lessons.slice(0, 2).map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <i className={`fas ${lesson.type === 'video' ? 'fa-play-circle text-blue-500' : 'fa-file-alt text-slate-400'}`}></i>
                        <span className="line-clamp-1">{lesson.title}</span>
                      </div>
                      {lesson.completed && <i className="fas fa-check-circle text-green-500 text-[10px]"></i>}
                    </div>
                  ))}
                  {course.lessons.length > 2 && <p className="text-[10px] text-slate-400 italic">+ {course.lessons.length - 2} bài khác</p>}
                </div>
                <button className="w-full py-3 bg-slate-50 text-slate-700 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-all">
                  Tiếp tục học
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <i className="fas fa-folder-open text-4xl text-slate-300 mb-4"></i>
            <p className="text-slate-500 font-medium">Chưa có khóa học nào cho trình độ này.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
