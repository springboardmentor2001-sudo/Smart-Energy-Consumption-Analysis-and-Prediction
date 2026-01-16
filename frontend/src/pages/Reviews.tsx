import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Star, Send, AlertCircle, CheckCircle } from "lucide-react";
import { containsOffensiveContent, sanitizeReviewText } from "@/lib/offensiveWords";
import { getReviews, saveReview, type Review } from "@/lib/reviewStorage";
import { useToast } from "@/hooks/use-toast";

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  // Load reviews on mount
  useEffect(() => {
    const loadedReviews = getReviews();
    setReviews(loadedReviews);
  }, []);

  const validateName = (nameInput: string): string | null => {
    if (!nameInput.trim()) {
      return "Name is required";
    }
    if (nameInput.length < 2) {
      return "Name must be at least 2 characters";
    }
    if (!/^[a-zA-Z\s]+$/.test(nameInput)) {
      return "Name can only contain letters and spaces";
    }
    return null;
  };

  const validateContent = (contentInput: string): string | null => {
    if (!contentInput.trim()) {
      return "Review cannot be empty";
    }
    if (contentInput.length < 10) {
      return "Review must be at least 10 characters";
    }
    if (contentInput.length > 300) {
      return "Review must not exceed 300 characters";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowSuccess(false);

    // Validate name
    const nameError = validateName(name);
    if (nameError) {
      setError(nameError);
      return;
    }

    // Validate content
    const contentError = validateContent(content);
    if (contentError) {
      setError(contentError);
      return;
    }

    // Check for offensive content
    if (containsOffensiveContent(content)) {
      setError("Please remove inappropriate language from your review.");
      return;
    }

    // Submit review
    setIsSubmitting(true);
    try {
      const sanitized = sanitizeReviewText(content);
      const newReview = saveReview({
        name: name.trim(),
        content: sanitized,
        rating,
      });

      // Update UI
      setReviews((prev) => [newReview, ...prev]);
      
      // Clear form
      setName("");
      setContent("");
      setRating(5);
      
      // Show success message
      setShowSuccess(true);
      toast({
        title: "Success",
        description: "Thank you for your feedback!",
      });

      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError("Failed to save review. Please try again.");
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12" data-testid="page-reviews">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-4xl md:text-5xl font-bold mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            User Reviews & Feedback
          </h1>
          <p className="text-lg text-muted-foreground">
            Share your experience with SmartEnergy. Your feedback helps us improve!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Review Form */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4" data-testid="heading-write-review">
                Write a Review
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Success Message */}
                {showSuccess && (
                  <div
                    className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-md text-sm"
                    data-testid="alert-success"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Thank you for your feedback!
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div
                    className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-md text-sm"
                    data-testid="alert-error"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Name Input */}
                <div>
                  <label className="block text-sm font-medium mb-2" htmlFor="name-input">
                    Your Name
                  </label>
                  <Input
                    id="name-input"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    data-testid="input-name"
                  />
                </div>

                {/* Star Rating */}
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex gap-1" data-testid="rating-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        disabled={isSubmitting}
                        className="focus:outline-none transition-transform hover:scale-110"
                        data-testid={`star-${star}`}
                        title={`${star} star${star !== 1 ? "s" : ""}`}
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Content */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium" htmlFor="content-input">
                      Your Review
                    </label>
                    <span className="text-xs text-muted-foreground" data-testid="char-count">
                      {content.length}/300
                    </span>
                  </div>
                  <Textarea
                    id="content-input"
                    placeholder="Share your thoughts about SmartEnergy..."
                    value={content}
                    onChange={(e) => setContent(e.target.value.slice(0, 300))}
                    disabled={isSubmitting}
                    className="min-h-32 resize-none"
                    data-testid="textarea-content"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    10–300 characters
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                  data-testid="button-submit-review"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            </Card>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold" data-testid="heading-reviews-list">
                All Reviews
              </h2>
              <span className="text-sm text-muted-foreground" data-testid="review-count">
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </span>
            </div>

            {reviews.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground" data-testid="empty-state">
                  No reviews yet. Be the first to share your feedback!
                </p>
              </Card>
            ) : (
              <div className="space-y-4" data-testid="reviews-container">
                {reviews.map((review) => (
                  <Card key={review.id} className="p-4" data-testid={`review-card-${review.id}`}>
                    {/* Review Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg" data-testid={`review-name-${review.id}`}>
                          {review.name}
                        </h3>
                        <p className="text-xs text-muted-foreground" data-testid={`review-date-${review.id}`}>
                          {new Date(review.timestamp).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>

                      {/* Stars */}
                      <div className="flex gap-0.5" data-testid={`review-rating-${review.id}`}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review Content */}
                    <p className="text-sm leading-relaxed text-foreground" data-testid={`review-content-${review.id}`}>
                      {review.content}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
