import React, { useState } from 'react';
import { Star, ThumbsUp, Camera, User } from 'lucide-react';
import { useReviews } from '../context/ReviewContext';
import { useAuth } from '../context/AuthContext';

const ProductReviews = ({ productId }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
    images: []
  });

  const { getProductReviews, addReview, markHelpful } = useReviews();
  const { user } = useAuth();
  const reviews = getProductReviews(productId);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!user) return;

    addReview({
      ...newReview,
      productId,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar
    });

    setNewReview({ rating: 5, title: '', comment: '', images: [] });
    setShowReviewForm(false);
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onRatingChange(star) : undefined}
            className={interactive ? "cursor-pointer" : "cursor-default"}
          >
            <Star
              className={`h-5 w-5 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Customer Reviews</h3>
        {user && user.role === 'user' && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Write Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <form onSubmit={handleSubmitReview} className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h4 className="text-lg font-semibold mb-4">Write a Review</h4>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            {renderStars(newReview.rating, true, (rating) => 
              setNewReview(prev => ({ ...prev, rating }))
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Title
            </label>
            <input
              type="text"
              value={newReview.title}
              onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Summarize your review"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Share your experience with this product"
              required
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Review
            </button>
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6">
              <div className="flex items-start space-x-4">
                <img
                  src={review.userAvatar}
                  alt={review.userName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                      <div className="flex items-center space-x-2">
                        {renderStars(review.rating)}
                        {review.verified && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>

                  <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                  <p className="text-gray-700 mb-3">{review.comment}</p>

                  {review.images && review.images.length > 0 && (
                    <div className="flex space-x-2 mb-3">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review ${index + 1}`}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => markHelpful(review.id)}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>Helpful ({review.helpful})</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;