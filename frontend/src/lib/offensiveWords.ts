// Offensive words filter for content moderation
// Includes profanity, hate speech, and abusive language detection

const bannedWords = [
  // Profanity
  "damn",
  "hell",
  "crap",
  "piss",
  "ass",
  "bastard",
  "bitch",
  "dick",
  "shit",
  "fuck",
  "asshole",
  "bullshit",
  "dammit",
  "goddam",
  "motherf",
  "f*ck",
  "b*tch",

  // Hate speech and slurs (generic, respectful filtering)
  "nigga",
  "nigg",
  "faggot",
  "fag",
  "dyke",
  "retard",
  "retardo",

  // Abusive language
  "idiot",
  "moron",
  "stupid",
  "dumb",
  "loser",
  "worthless",
  "pathetic",
  "garbage",
  "trash",
  "scum",
  "filthy",
  "disgusting",
  "vile",
];

export function containsOffensiveContent(text: string): boolean {
  if (!text) return false;

  // Convert to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();

  // Check for banned words (with partial word detection)
  for (const word of bannedWords) {
    // Match whole word or as part of another word
    const regex = new RegExp(`\\b${word}\\w*|${word}`, "gi");
    if (regex.test(lowerText)) {
      return true;
    }
  }

  return false;
}

export function sanitizeReviewText(text: string): string {
  // Remove any HTML tags
  const sanitized = text.replace(/<[^>]*>/g, "");
  
  // Remove extra whitespace
  return sanitized.trim();
}
