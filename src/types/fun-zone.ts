export type GameType =
  | "guess-who"
  | "caption-this"
  | "memory-quiz"
  | "then-and-now";

export interface FunPost {
  id: string;
  gameType: GameType;
  uploadedBy: string;
  uploadedByName: string;
  uploadedByPhotoURL?: string | null;
  isAnonymous: boolean; // for guess-who: hides uploadedByName until reveal
  imageUrl?: string;
  imageStoragePath?: string;
  imageThen?: string;
  imageThenStoragePath?: string;
  imageNow?: string;
  imageNowStoragePath?: string;
  width?: number;
  height?: number;
  prompt?: string;       // for caption-this
  question?: string;     // for memory-quiz
  hint?: string;         // for guess-who
  correctAnswer?: string; // for memory-quiz / guess-who reveal
  options?: string[];    // for memory-quiz multiple choice
  isRevealed: boolean;
  revealedAt?: string;
  createdAt: string;
  guessCount: number;
  commentCount: number;
  voteCount: number;
}

export interface FunComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userPhotoURL?: string | null;
  text: string;
  isCorrect?: boolean;
  votes: number;
  createdAt: string;
}

export interface FunVote {
  id: string;
  postId: string;
  commentId?: string;
  userId: string;
  voteType: "upvote" | "best-glow-up" | "most-changed" | "same-same";
  createdAt: string;
}

export interface FunScore {
  userId: string;
  userName: string;
  totalPoints: number;
  guessWhoPoints: number;
  captionPoints: number;
  quizPoints: number;
  correctGuesses: number;
  rank?: number;
}
