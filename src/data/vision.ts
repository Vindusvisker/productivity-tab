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
  // Success & Achievement
  {
    id: 'success-1',
    text: 'As a man thinketh, so is he.',
    category: 'success',
    author: 'James Allen'
  },
  {
    id: 'success-2',
    text: 'The only impossible journey is the one you never begin.',
    category: 'success',
    author: 'Tony Robbins'
  },
  {
    id: 'success-3',
    text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    category: 'success',
    author: 'Winston Churchill'
  },
  {
    id: 'success-4',
    text: 'The way to get started is to quit talking and begin doing.',
    category: 'success',
    author: 'Walt Disney'
  },
  {
    id: 'success-5',
    text: 'Don\'t be afraid to give up the good to go for the great.',
    category: 'success',
    author: 'John D. Rockefeller'
  },
  {
    id: 'success-6',
    text: 'Innovation distinguishes between a leader and a follower.',
    category: 'success',
    author: 'Steve Jobs'
  },
  {
    id: 'success-7',
    text: 'The future belongs to those who believe in the beauty of their dreams.',
    category: 'success',
    author: 'Eleanor Roosevelt'
  },
  {
    id: 'success-8',
    text: 'It is during our darkest moments that we must focus to see the light.',
    category: 'success',
    author: 'Aristotle'
  },
  {
    id: 'success-9',
    text: 'Success is going from failure to failure without losing your enthusiasm.',
    category: 'success',
    author: 'Winston Churchill'
  },
  {
    id: 'success-10',
    text: 'The only way to do great work is to love what you do.',
    category: 'success',
    author: 'Steve Jobs'
  },

  // Money & Wealth
  {
    id: 'money-1',
    text: 'An investment in knowledge pays the best interest.',
    category: 'money',
    author: 'Benjamin Franklin'
  },
  {
    id: 'money-2',
    text: 'It\'s not how much money you make, but how much money you keep.',
    category: 'money',
    author: 'Robert Kiyosaki'
  },
  {
    id: 'money-3',
    text: 'The stock market is a device for transferring money from the impatient to the patient.',
    category: 'money',
    author: 'Warren Buffett'
  },
  {
    id: 'money-4',
    text: 'Never spend your money before you have earned it.',
    category: 'money',
    author: 'Thomas Jefferson'
  },
  {
    id: 'money-5',
    text: 'A penny saved is a penny earned.',
    category: 'money',
    author: 'Benjamin Franklin'
  },
  {
    id: 'money-6',
    text: 'Rich people have small TVs and big libraries, and poor people have small libraries and big TVs.',
    category: 'money',
    author: 'Zig Ziglar'
  },
  {
    id: 'money-7',
    text: 'The real measure of your wealth is how much you\'d be worth if you lost all your money.',
    category: 'money',
    author: 'Anonymous'
  },
  {
    id: 'money-8',
    text: 'Time is more valuable than money. You can get more money, but you cannot get more time.',
    category: 'money',
    author: 'Jim Rohn'
  },
  {
    id: 'money-9',
    text: 'Money is only a tool. It will take you wherever you wish, but it will not replace you as the driver.',
    category: 'money',
    author: 'Ayn Rand'
  },
  {
    id: 'money-10',
    text: 'The art is not in making money, but in keeping it.',
    category: 'money',
    author: 'Proverb'
  },

  // Health & Discipline
  {
    id: 'health-1',
    text: 'To keep the body in good health is a duty... otherwise we shall not be able to keep our mind strong and clear.',
    category: 'health',
    author: 'Buddha'
  },
  {
    id: 'health-2',
    text: 'Health is a state of complete harmony of the body, mind and spirit.',
    category: 'health',
    author: 'B.K.S. Iyengar'
  },
  {
    id: 'health-3',
    text: 'The groundwork for all happiness is good health.',
    category: 'health',
    author: 'Leigh Hunt'
  },
  {
    id: 'health-4',
    text: 'Your body can stand almost anything. It\'s your mind that you have to convince.',
    category: 'health',
    author: 'Anonymous'
  },
  {
    id: 'health-5',
    text: 'Health is not about the weight you lose, but about the life you gain.',
    category: 'health',
    author: 'Anonymous'
  },
  {
    id: 'health-6',
    text: 'A healthy outside starts from the inside.',
    category: 'health',
    author: 'Robert Urich'
  },
  {
    id: 'health-7',
    text: 'Take care of your body. It\'s the only place you have to live.',
    category: 'health',
    author: 'Jim Rohn'
  },
  {
    id: 'health-8',
    text: 'The first wealth is health.',
    category: 'health',
    author: 'Ralph Waldo Emerson'
  },
  {
    id: 'health-9',
    text: 'Health is like money, we never have a true idea of its value until we lose it.',
    category: 'health',
    author: 'Josh Billings'
  },
  {
    id: 'health-10',
    text: 'A healthy mind in a healthy body.',
    category: 'health',
    author: 'Juvenal'
  },

  // Freedom & Independence
  {
    id: 'freedom-1',
    text: 'Freedom is not worth having if it does not include the freedom to make mistakes.',
    category: 'freedom',
    author: 'Mahatma Gandhi'
  },
  {
    id: 'freedom-2',
    text: 'The secret to happiness is freedom... And the secret to freedom is courage.',
    category: 'freedom',
    author: 'Thucydides'
  },
  {
    id: 'freedom-3',
    text: 'For to be free is not merely to cast off one\'s chains, but to live in a way that respects and enhances the freedom of others.',
    category: 'freedom',
    author: 'Nelson Mandela'
  },
  {
    id: 'freedom-4',
    text: 'Freedom lies in being bold.',
    category: 'freedom',
    author: 'Robert Frost'
  },
  {
    id: 'freedom-5',
    text: 'The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion.',
    category: 'freedom',
    author: 'Albert Camus'
  },
  {
    id: 'freedom-6',
    text: 'Freedom is the oxygen of the soul.',
    category: 'freedom',
    author: 'Moshe Dayan'
  },
  {
    id: 'freedom-7',
    text: 'Independence is happiness.',
    category: 'freedom',
    author: 'Susan B. Anthony'
  },
  {
    id: 'freedom-8',
    text: 'Freedom is nothing but a chance to be better.',
    category: 'freedom',
    author: 'Albert Camus'
  },
  {
    id: 'freedom-9',
    text: 'The most courageous act is still to think for yourself. Aloud.',
    category: 'freedom',
    author: 'Coco Chanel'
  },
  {
    id: 'freedom-10',
    text: 'Freedom is not a gift bestowed upon us by other men, but a right that belongs to us by the laws of God and nature.',
    category: 'freedom',
    author: 'Benjamin Franklin'
  },

  // Habits & Discipline
  {
    id: 'habits-1',
    text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    category: 'habits',
    author: 'Aristotle'
  },
  {
    id: 'habits-2',
    text: 'Discipline is the bridge between goals and accomplishment.',
    category: 'habits',
    author: 'Jim Rohn'
  },
  {
    id: 'habits-3',
    text: 'The successful warrior is the average man with laser-like focus.',
    category: 'habits',
    author: 'Bruce Lee'
  },
  {
    id: 'habits-4',
    text: 'Motivation is what gets you started. Habit is what keeps you going.',
    category: 'habits',
    author: 'Jim Ryun'
  },
  {
    id: 'habits-5',
    text: 'Your net worth to the network is your ability to help the network increase its net worth.',
    category: 'habits',
    author: 'Reid Hoffman'
  },
  {
    id: 'habits-6',
    text: 'First we form habits, then they form us.',
    category: 'habits',
    author: 'John Dryden'
  },
  {
    id: 'habits-7',
    text: 'The chains of habit are too weak to be felt until they are too strong to be broken.',
    category: 'habits',
    author: 'Samuel Johnson'
  },
  {
    id: 'habits-8',
    text: 'You\'ll never change your life until you change something you do daily.',
    category: 'habits',
    author: 'Mike Murdock'
  },
  {
    id: 'habits-9',
    text: 'Discipline is choosing between what you want now and what you want most.',
    category: 'habits',
    author: 'Augustus F. Hawkins'
  },
  {
    id: 'habits-10',
    text: 'Good habits are worth being fanatical about.',
    category: 'habits',
    author: 'John Irving'
  },

  // Motivation & Mindset
  {
    id: 'motivation-1',
    text: 'Whether you think you can or you think you can\'t, you\'re right.',
    category: 'motivation',
    author: 'Henry Ford'
  },
  {
    id: 'motivation-2',
    text: 'The mind is everything. What you think you become.',
    category: 'motivation',
    author: 'Buddha'
  },
  {
    id: 'motivation-3',
    text: 'Life is what happens to you while you\'re busy making other plans.',
    category: 'motivation',
    author: 'John Lennon'
  },
  {
    id: 'motivation-4',
    text: 'In the middle of difficulty lies opportunity.',
    category: 'motivation',
    author: 'Albert Einstein'
  },
  {
    id: 'motivation-5',
    text: 'It does not matter how slowly you go as long as you do not stop.',
    category: 'motivation',
    author: 'Confucius'
  },
  {
    id: 'motivation-6',
    text: 'Everything you\'ve ever wanted is on the other side of fear.',
    category: 'motivation',
    author: 'George Addair'
  },
  {
    id: 'motivation-7',
    text: 'Believe you can and you\'re halfway there.',
    category: 'motivation',
    author: 'Theodore Roosevelt'
  },
  {
    id: 'motivation-8',
    text: 'The only person you are destined to become is the person you decide to be.',
    category: 'motivation',
    author: 'Ralph Waldo Emerson'
  },
  {
    id: 'motivation-9',
    text: 'It is never too late to be what you might have been.',
    category: 'motivation',
    author: 'George Eliot'
  },
  {
    id: 'motivation-10',
    text: 'Don\'t watch the clock; do what it does. Keep going.',
    category: 'motivation',
    author: 'Sam Levenson'
  },
  {
    id: 'motivation-11',
    text: 'The greatest glory in living lies not in never falling, but in rising every time we fall.',
    category: 'motivation',
    author: 'Nelson Mandela'
  },
  {
    id: 'motivation-12',
    text: 'Life is really simple, but we insist on making it complicated.',
    category: 'motivation',
    author: 'Confucius'
  },
  {
    id: 'motivation-13',
    text: 'You miss 100% of the shots you don\'t take.',
    category: 'motivation',
    author: 'Wayne Gretzky'
  },
  {
    id: 'motivation-14',
    text: 'I have not failed. I\'ve just found 10,000 ways that won\'t work.',
    category: 'motivation',
    author: 'Thomas A. Edison'
  },
  {
    id: 'motivation-15',
    text: 'A person who never made a mistake never tried anything new.',
    category: 'motivation',
    author: 'Albert Einstein'
  },
  {
    id: 'motivation-16',
    text: 'The person who says it cannot be done should not interrupt the person who is doing it.',
    category: 'motivation',
    author: 'Chinese Proverb'
  },
  {
    id: 'motivation-17',
    text: 'Yesterday is history, tomorrow is a mystery, today is a gift.',
    category: 'motivation',
    author: 'Eleanor Roosevelt'
  },
  {
    id: 'motivation-18',
    text: 'If you want to lift yourself up, lift up someone else.',
    category: 'motivation',
    author: 'Booker T. Washington'
  },
  {
    id: 'motivation-19',
    text: 'What lies behind us and what lies before us are tiny matters compared to what lies within us.',
    category: 'motivation',
    author: 'Ralph Waldo Emerson'
  },
  {
    id: 'motivation-20',
    text: 'You are never too old to set another goal or to dream a new dream.',
    category: 'motivation',
    author: 'C.S. Lewis'
  },

  // Additional Classic Quotes
  {
    id: 'classic-1',
    text: 'Be yourself; everyone else is already taken.',
    category: 'motivation',
    author: 'Oscar Wilde'
  },
  {
    id: 'classic-2',
    text: 'Two things are infinite: the universe and human stupidity; and I\'m not sure about the universe.',
    category: 'motivation',
    author: 'Albert Einstein'
  },
  {
    id: 'classic-3',
    text: 'Be the change that you wish to see in the world.',
    category: 'motivation',
    author: 'Mahatma Gandhi'
  },
  {
    id: 'classic-4',
    text: 'In three words I can sum up everything I\'ve learned about life: it goes on.',
    category: 'motivation',
    author: 'Robert Frost'
  },
  {
    id: 'classic-5',
    text: 'If you tell the truth, you don\'t have to remember anything.',
    category: 'motivation',
    author: 'Mark Twain'
  },
  {
    id: 'classic-6',
    text: 'A friend is someone who knows all about you and still loves you.',
    category: 'motivation',
    author: 'Elbert Hubbard'
  },
  {
    id: 'classic-7',
    text: 'To live is the rarest thing in the world. Most people just exist.',
    category: 'motivation',
    author: 'Oscar Wilde'
  },
  {
    id: 'classic-8',
    text: 'That which does not kill us makes us stronger.',
    category: 'motivation',
    author: 'Friedrich Nietzsche'
  },
  {
    id: 'classic-9',
    text: 'Live as if you were to die tomorrow. Learn as if you were to live forever.',
    category: 'motivation',
    author: 'Mahatma Gandhi'
  },
  {
    id: 'classic-10',
    text: 'We accept the love we think we deserve.',
    category: 'motivation',
    author: 'Stephen Chbosky'
  }
];

export const SNUS_COST_NOK = 4.27; // Cost per snus in NOK
export const HOURLY_RATE_NOK = 200; // Work rate for time calculations
export const SNUS_TIME_MINUTES = 1.3; // Average time spent per snus 