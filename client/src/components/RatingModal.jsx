import React, { useState } from 'react';
import api from '../api/axios.js';
import { Star, X, CheckCircle2 } from 'lucide-react';

export const RatingModal = ({ order, isOpen, onClose, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState(['Super Fresh', 'Fast Delivery']);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const availableTags = [
    'Super Fresh 🥬',
    'Fast Delivery ⚡',
    'Great Packaging 📦',
    'Polite Delivery Boy 🛵',
    'Accurate Weight ⚖️',
    'Value for Money 💰',
  ];

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/reviews', {
        orderId: order._id,
        rating,
        comment,
        tags: selectedTags,
      });
      if (res.data.success) {
        onReviewSubmitted();
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-500 flex items-center justify-center mx-auto mb-3 text-2xl shadow-inner">
            ⭐
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Rate {order.vendorId?.shopName || 'Your Store'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Order #{order.orderNumber} • Delivered Fresh
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Selector */}
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-125 focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    (hoverRating || rating) >= star
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Quick Compliment Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              What did you love?
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      isSelected
                        ? 'bg-brand-50 border-brand-500 text-brand-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment text area */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Feedback (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell other neighbors about vegetable quality, freshness, and delivery speed..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-brand-500 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 active:scale-98 text-white font-bold rounded-2xl shadow-xl shadow-brand-600/30 text-sm transition"
          >
            {submitting ? 'Submitting...' : 'Submit Rating & Feedback ⭐'}
          </button>
        </form>
      </div>
    </div>
  );
};
