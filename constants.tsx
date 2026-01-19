
import { Subject, Course } from './types';

export const SUBJECTS: Subject[] = [
  { id: 'math', name: 'Toán học', icon: 'fa-calculator', color: 'bg-blue-500' },
  { id: 'literature', name: 'Ngữ văn', icon: 'fa-book', color: 'bg-red-500' },
  { id: 'english', name: 'Tiếng Anh', icon: 'fa-language', color: 'bg-green-500' },
  { id: 'science', name: 'Khoa học', icon: 'fa-flask', color: 'bg-purple-500' },
  { id: 'history', name: 'Lịch sử', icon: 'fa-landmark', color: 'bg-yellow-600' },
  { id: 'it', name: 'Tin học', icon: 'fa-laptop-code', color: 'bg-indigo-500' },
];

export const EDUCATION_LEVELS = [
  { id: 'Primary', label: 'Tiểu học (Lớp 1-5)', icon: 'fa-child', color: 'from-orange-400 to-red-500' },
  { id: 'Secondary', label: 'THCS (Lớp 6-9)', icon: 'fa-graduation-cap', color: 'from-blue-400 to-indigo-600' },
  { id: 'HighSchool', label: 'THPT (Lớp 10-12)', icon: 'fa-user-graduate', color: 'from-purple-400 to-pink-600' },
];

export const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    subjectId: 'math',
    title: 'Toán nâng cao Lớp 5',
    level: 'Primary',
    thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd482180c?w=400&h=250&fit=crop',
    lessons: [
      { id: 'l1', title: 'Ôn tập về số thập phân', duration: '15p', completed: true, type: 'video' },
      { id: 'l2', title: 'Phép nhân số thập phân', duration: '20p', completed: false, type: 'practice' },
    ]
  },
  {
    id: 'c2',
    subjectId: 'science',
    title: 'Vật lý 9: Điện học',
    level: 'Secondary',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=250&fit=crop',
    lessons: [
      { id: 'l3', title: 'Định luật Ôm', duration: '25p', completed: true, type: 'video' },
      { id: 'l4', title: 'Đoạn mạch nối tiếp', duration: '15p', completed: false, type: 'text' },
    ]
  },
  {
    id: 'c3',
    subjectId: 'literature',
    title: 'Ngữ văn 12: NLXH',
    level: 'HighSchool',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=250&fit=crop',
    lessons: [
      { id: 'l5', title: 'Cách làm bài nghị luận xã hội', duration: '30p', completed: false, type: 'video' },
    ]
  }
];
