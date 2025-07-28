import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageCircle, Send, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePlaces } from '../context/PlacesContext';
import { Review } from '../types';

interface ReviewSectionProps {
  placeId: string;
  reviews: Review[];
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ placeId, reviews }) => {
  const { user } = useAuth();
  const { addReview } = usePlaces();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || rating === 0 || !comment.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const success = await addReview(placeId, rating, comment.trim());
    if (success) {
      setRating(0);
      setComment('');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
        <MessageCircle className="w-6 h-6 text-primary-500" />
        <span>Reseñas ({reviews.length})</span>
      </h3>

      {/* Formulario de nueva reseña */}
      {user ? (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmitReview}
          className="bg-gradient-to-br from-purple-50 to-orange-50 rounded-xl p-6 mb-6"
        >
          <h4 className="font-semibold text-gray-900 mb-4">Escribe una reseña</h4>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Calificación</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-colors"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Comentario</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all resize-none"
              placeholder="Comparte tu experiencia en este lugar..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={rating === 0 || !comment.trim() || isSubmitting}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              rating > 0 && comment.trim() && !isSubmitting
                ? 'bg-gradient-to-r from-primary-500 to-tomato text-white hover:shadow-lg transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Publicar reseña</span>
              </>
            )}
          </button>
        </motion.form>
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">Inicia sesión para escribir una reseña</p>
        </div>
      )}

      {/* Lista de reseñas */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-500 mb-2">No hay reseñas aún</h4>
            <p className="text-gray-400">Sé el primero en compartir tu experiencia</p>
          </div>
        ) : (
          reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-gray-50 rounded-xl p-4"
            >
              <div className="flex items-start space-x-3">
                <img
                  loading="lazy"
                  src={review.userAvatar || '/assets/images/avatar.png'}
                  alt={review.userName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">{review.userName}</h5>
                    <span className="text-sm text-gray-500">
                      {review.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;