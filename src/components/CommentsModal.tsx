import React, { useState } from 'react';
import { X, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommentsModal({ isOpen, onClose }: CommentsModalProps) {
  const { comments, toggleCommentLike, addComment } = useApp();
  const [newComment, setNewComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addComment(newComment.trim());
      setNewComment('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-dark-card rounded-t-2xl max-h-[70vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-border">
          <h3 className="text-white font-semibold text-lg">Comments</h3>
          <button onClick={onClose} className="text-gray-text hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <img
                src={comment.user.avatar}
                alt={comment.user.username}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-semibold">{comment.user.username}</span>
                  <span className="text-gray-text text-xs">{comment.createdAt}</span>
                </div>
                <p className="text-gray-200 text-sm mt-0.5">{comment.text}</p>
                <div className="flex items-center gap-4 mt-1">
                  <button className="text-gray-text text-xs hover:text-white">Reply</button>
                  <button className="text-gray-text text-xs hover:text-white">View replies</button>
                </div>
              </div>
              <button
                onClick={() => toggleCommentLike(comment.id)}
                className="flex flex-col items-center gap-0.5 pt-2"
              >
                <Heart
                  size={14}
                  className={comment.isLiked ? 'text-primary fill-primary' : 'text-gray-text'}
                />
                <span className="text-[10px] text-gray-text">{comment.likes}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex items-center gap-3 p-4 border-t border-dark-border">
          <img
            src="https://ui-avatars.com/api/?name=You&background=fe2c55&color=fff&size=200"
            alt="You"
            className="w-8 h-8 rounded-full object-cover"
          />
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-transparent text-white text-sm placeholder-gray-text outline-none"
          />
          {newComment.trim() && (
            <button type="submit" className="text-secondary font-semibold text-sm">
              Post
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
