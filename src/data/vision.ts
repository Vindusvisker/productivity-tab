export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  imageUrl?: string;
  externalUrl?: string;
  category: 'experience' | 'education' | 'health' | 'investment' | 'other';
  priority: 'high' | 'medium' | 'low';
  deadline?: string; // ISO date string
  description?: string;
}

export interface Affirmation {
  id: string;
  text: string;
  category: 'money' | 'health' | 'freedom' | 'success' | 'habits' | 'motivation';
  author?: string;
}

export const affirmations: Affirmation[] = [
  // Money & Financial Freedom
  {
    id: 'money-1',
    text: 'Every NOK I save today is freedom I buy for tomorrow.',
    category: 'money'
  },
  {
    id: 'money-2',
    text: 'My money works for me, not against me.',
    category: 'money'
  },
  {
    id: 'money-3',
    text: 'Small sacrifices today create big opportunities tomorrow.',
    category: 'money'
  },
  {
    id: 'money-4',
    text: 'I am building wealth one conscious choice at a time.',
    category: 'money'
  },

  // Health & Breaking Habits
  {
    id: 'health-1',
    text: 'My body is a temple, and I choose what enters it.',
    category: 'health'
  },
  {
    id: 'health-2',
    text: 'Each time I resist, I become stronger than before.',
    category: 'health'
  },
  {
    id: 'health-3',
    text: 'I am healing my relationship with instant gratification.',
    category: 'health'
  },
  {
    id: 'health-4',
    text: 'My lungs thank me for every snus I don\'t take.',
    category: 'health'
  },

  // Freedom & Independence
  {
    id: 'freedom-1',
    text: 'I am the architect of my own freedom.',
    category: 'freedom'
  },
  {
    id: 'freedom-2',
    text: 'Every habit I break is a chain I remove.',
    category: 'freedom'
  },
  {
    id: 'freedom-3',
    text: 'Financial independence is my birthright.',
    category: 'freedom'
  },
  {
    id: 'freedom-4',
    text: 'I choose long-term freedom over short-term pleasure.',
    category: 'freedom'
  },

  // Success & Growth
  {
    id: 'success-1',
    text: 'Success is the sum of small efforts repeated daily.',
    category: 'success'
  },
  {
    id: 'success-2',
    text: 'I am becoming the person I want to be.',
    category: 'success'
  },
  {
    id: 'success-3',
    text: 'My discipline today creates my success tomorrow.',
    category: 'success'
  },
  {
    id: 'success-4',
    text: 'I invest in assets that appreciate, not habits that depreciate.',
    category: 'success'
  },

  // Habits & Discipline
  {
    id: 'habits-1',
    text: 'I am stronger than my impulses.',
    category: 'habits'
  },
  {
    id: 'habits-2',
    text: 'My habits either serve my goals or sabotage them.',
    category: 'habits'
  },
  {
    id: 'habits-3',
    text: 'I choose progress over perfection, every single time.',
    category: 'habits'
  },
  {
    id: 'habits-4',
    text: 'Discipline is choosing what I want most over what I want now.',
    category: 'habits'
  },

  // Motivation & Mindset
  {
    id: 'motivation-1',
    text: 'I am not defined by my past; I am designed for my future.',
    category: 'motivation'
  },
  {
    id: 'motivation-2',
    text: 'Every day is a chance to write a better chapter.',
    category: 'motivation'
  },
  {
    id: 'motivation-3',
    text: 'My willpower is a muscle that grows stronger with use.',
    category: 'motivation'
  },
  {
    id: 'motivation-4',
    text: 'I have everything I need to succeed inside me right now.',
    category: 'motivation'
  }
];

export const SNUS_COST_NOK = 4.27; // Cost per snus in NOK
export const HOURLY_RATE_NOK = 200; // Work rate for time calculations
export const SNUS_TIME_MINUTES = 1.3; // Average time spent per snus 