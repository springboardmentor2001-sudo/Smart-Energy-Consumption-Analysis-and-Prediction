// Review storage utility for localStorage persistence
// Structure ready for backend migration

export interface Review {
  id: string;
  name: string;
  content: string;
  rating: number;
  timestamp: number;
}

const STORAGE_KEY = "smartenergy_reviews";

export function getReviews(): Review[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as Review[];
  } catch (error) {
    console.error("Error reading reviews from storage:", error);
    return [];
  }
}

export function saveReview(review: Omit<Review, "id" | "timestamp">): Review {
  const newReview: Review = {
    ...review,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };

  try {
    const reviews = getReviews();
    reviews.unshift(newReview); // Add to beginning (latest first)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    return newReview;
  } catch (error) {
    console.error("Error saving review:", error);
    throw new Error("Failed to save review");
  }
}

export function clearAllReviews(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing reviews:", error);
  }
}

// Future: When backend is ready, replace localStorage with API calls
// export async function saveReviewToBackend(review: Omit<Review, "id" | "timestamp">) {
//   const response = await fetch("/api/reviews", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(review),
//   });
//   return response.json();
// }
