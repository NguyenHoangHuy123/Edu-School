
export type EducationLevel = 'Primary' | 'Secondary' | 'HighSchool';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  image?: string;
  groundingSources?: Array<{ title: string; uri: string }>;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  subjectId: string;
  level: EducationLevel;
  lastUpdate: Date;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  type: 'video' | 'text' | 'practice';
}

export interface Course {
  id: string;
  subjectId: string;
  title: string;
  level: EducationLevel;
  lessons: Lesson[];
  thumbnail: string;
}
