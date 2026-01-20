import React, { useState } from 'react';
import { Star, ThumbsUp, MessageCircle, Send } from 'lucide-react';

export const Reviews = () => {
  const [selectedRating, setSelectedRating] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    rating: 0,
    title: '',
    text: '',
  });
  const [submittedReviews, setSubmittedReviews] = useState([]);

  const reviews = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Homeowner',
      avatar: '👩‍💼',
      rating: 5,
      date: 'January 2026',
      title: 'Excellent Predictions!',
      text: 'This system has been incredibly accurate with our energy predictions. We\'ve managed to reduce our monthly bill by 32% just by following the recommendations.',
      helpful: 245,
      verified: true,
      usage: '2,400 sq ft home'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Small Business Owner',
      avatar: '👨‍💼',
      rating: 5,
      date: 'January 2026',
      title: 'Game Changer for Our Office',
      text: 'We\'ve been using this for 3 months now. The AI chatbot is super helpful, and the real-time analytics dashboard gives us insights we never had before. Highly recommend!',
      helpful: 189,
      verified: true,
      usage: '5,000 sq ft office'
    },
    {
      id: 3,
      name: 'Emma Williams',
      role: 'Environmental Consultant',
      avatar: '👩‍🔬',
      rating: 5,
      date: 'December 2025',
      title: 'Perfect for Sustainability Goals',
      text: 'The AI predictions are spot-on. Our clients love seeing the carbon footprint reduction. The detailed reports make it easy to demonstrate environmental impact.',
      helpful: 156,
      verified: true,
      usage: 'Commercial buildings'
    },
    {
      id: 4,
      name: 'David Martinez',
      role: 'Facility Manager',
      avatar: '👨‍🔧',
      rating: 4,
      date: 'December 2025',
      title: 'Great Tool, User Friendly',
      text: 'Very impressed with the accuracy and ease of use. The chatbot feature is a nice touch. Only minor UI improvements would make it perfect.',
      helpful: 128,
      verified: true,
      usage: '10,000 sq ft facility'
    },
    {
      id: 5,
      name: 'Lisa Anderson',
      role: 'Apartment Complex Manager',
      avatar: '👩‍💻',
      rating: 5,
      date: 'December 2025',
      title: 'Transformed Our Energy Management',
      text: 'Managing energy for 50 units was a nightmare. This system makes it so much easier. Predictions are incredibly accurate, and we\'ve saved thousands.',
      helpful: 203,
      verified: true,
      usage: 'Multi-unit building'
    },
    {
      id: 6,
      name: 'James Thompson',
      role: 'Homeowner',
      avatar: '👨‍🌾',
      rating: 5,
      date: 'November 2025',
      title: 'Best Investment Ever',
      text: 'Skeptical at first, but the system has paid for itself within 2 months. The AI predictions helped me optimize my heating schedule perfectly.',
      helpful: 167,
      verified: true,
      usage: '3,200 sq ft home'
    },
  ];

  const stats = [
    { label: 'Average Rating', value: '4.8/5' },
    { label: 'User Reviews', value: '2,400+' },
    { label: 'Satisfaction Rate', value: '97%' },
    { label: 'Avg Cost Savings', value: '32%' },
  ];

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={18}
            className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}
          />
        ))}
      </div>
    );
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.role || formData.rating === 0 || !formData.title || !formData.text) {
      alert('Please fill in all fields');
      return;
    }

    const newReview = {
      id: reviews.length + submittedReviews.length + 1,
      name: formData.name,
      role: formData.role,
      avatar: '👤',
      rating: formData.rating,
      date: 'Just now',
      title: formData.title,
      text: formData.text,
      helpful: 0,
      verified: false,
      usage: '',
    };

    setSubmittedReviews([newReview, ...submittedReviews]);
    setFormData({
      name: '',
      role: '',
      rating: 0,
      title: '',
      text: '',
    });
    setShowReviewForm(false);
    
    // Show success message
    alert('Thank you for your review! It has been submitted successfully.');
  };

  return (
    <div className="min-h-screen py-20">
      {/* Header */}
      <div className="container mx-auto px-4 mb-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-6">
            <MessageCircle size={16} className="text-blue-400" />
            <span className="text-sm text-blue-300">Real User Reviews</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Loved by
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"> 2,400+ Users</span>
          </h1>
          
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            See what real customers are saying about how the Smart Energy Prediction System has transformed their energy management.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center hover:border-blue-500/50 transition-all"
            >
              <p className="text-3xl font-bold text-blue-400 mb-2">{stat.value}</p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Rating Filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <button
            onClick={() => setSelectedRating(null)}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              selectedRating === null
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Reviews
          </button>
          {[5, 4, 3].map((rating) => (
            <button
              key={rating}
              onClick={() => setSelectedRating(rating)}
              className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                selectedRating === rating
                  ? 'bg-yellow-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {rating} <Star size={16} className="fill-current" />
            </button>
          ))}
        </div>

        {/* Write Review Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
          >
            <Send size={18} />
            Write a Review
          </button>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="max-w-2xl mx-auto mb-12 bg-slate-800/50 border border-blue-500/30 rounded-2xl p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-6 text-slate-100">Share Your Experience</h3>
            
            <form onSubmit={handleSubmitReview} className="space-y-6">
              {/* Name & Role Row */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Your Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Your Role</label>
                  <input
                    type="text"
                    placeholder="e.g., Homeowner, Business Owner"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({...formData, rating: star})}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={`cursor-pointer transition-all ${
                          star <= formData.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-slate-600 hover:text-yellow-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Review Title</label>
                <input
                  type="text"
                  placeholder="e.g., Excellent Predictions!"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Your Review</label>
                <textarea
                  placeholder="Share your experience with the Smart Energy Prediction System..."
                  value={formData.text}
                  onChange={(e) => setFormData({...formData, text: e.target.value})}
                  rows="5"
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold py-3 px-6 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Reviews Grid */}
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...submittedReviews, ...reviews]
            .filter((review) => selectedRating === null || review.rating === selectedRating)
            .map((review) => (
              <div
                key={review.id}
                className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-3xl">{review.avatar}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-100">{review.name}</h3>
                        {review.verified && (
                          <div className="bg-green-500/20 border border-green-500/50 rounded-full p-1" title="Verified Purchase">
                            <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">{review.role}</p>
                      <p className="text-xs text-slate-500 mt-1">{review.usage}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 ml-2">{review.date}</p>
                </div>

                {/* Rating */}
                <div className="mb-4">
                  {renderStars(review.rating)}
                </div>

                {/* Title & Review */}
                <h4 className="font-semibold text-slate-100 mb-2">{review.title}</h4>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  {review.text}
                </p>

                {/* Helpful */}
                <div className="flex items-center gap-2 pt-4 border-t border-slate-700">
                  <button className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors text-sm group-hover:translate-x-1">
                    <ThumbsUp size={16} />
                    <span>{review.helpful}</span>
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 mt-20">
        <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-3xl p-12 text-center backdrop-blur-sm">
          <h3 className="text-3xl font-bold mb-4">Join Thousands of Satisfied Users</h3>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Experience the same energy savings and insights that our 2,400+ users are enjoying.
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95">
            Start Your Free Trial Today
          </button>
        </div>
      </div>
    </div>
  );
};
