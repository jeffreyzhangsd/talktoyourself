export const PROMPTS = [
  "Describe your ideal morning routine",
  "What's a skill you want to learn and why?",
  "Explain what you do for work as if talking to a 10-year-old",
  "What's the best meal you've ever had?",
  "Describe a place you'd love to visit",
  "What's a book, movie, or show you'd recommend to anyone?",
  "If you could have one superpower, what and why?",
  "Talk about something you changed your mind about recently",
  "Describe your hometown to someone who's never been there",
  "What does a perfect weekend look like for you?",
  "What's something most people don't know about you?",
  "Talk about a challenge you overcame",
  "What advice would you give your younger self?",
  "Describe your favorite hobby",
  "What would you do with an extra hour each day?",
  "Talk about someone who influenced you",
  "What's something you find genuinely interesting that others might find boring?",
  "Describe a recent win, big or small",
  "What's a habit you're proud of building?",
  "Talk about what you're looking forward to this year",
];

export function randomPrompt(current?: string): string {
  const pool = current ? PROMPTS.filter((p) => p !== current) : PROMPTS;
  return pool[Math.floor(Math.random() * pool.length)];
}
