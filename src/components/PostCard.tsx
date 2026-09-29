import { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, Music, MoreHorizontal, Play } from 'lucide-react';
import { Post } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

interface PostCardProps {
  post: Post;
  onCommentOpen: (postId: string) => void;
  isFeedView?: boolean;
}

export default function PostCard({ post, onCommentOpen, isFeedView = false }: PostCardProps) {
  const { toggleLike, toggleSave } = useApp();
  const navigate = useNavigate();
  const [showHeart, setShowHeart] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleDoubleTap = () => {
    if (!post.isLiked) {
      toggleLike(post.id);
    }
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

  const formatCount = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (isFeedView) {
    return (
      <div className="h-full w-full relative snap-start">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${post.mediaUrl})` }}
          onDoubleClick={handleDoubleTap}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
        </div>

        {/* Play button overlay */}
        {!isPlaying && (
          <button
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 flex items-center justify-center z-10"
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Play size={32} className="text-white fill-white" />
            </div>
          </button>
        )}

        {/* Double tap heart */}
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <Heart size={80} className="text-primary fill-primary animate-like" />
          </div>
        )}

        {/* Right side actions */}
        <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 z-10">
          <button
            onClick={() => toggleLike(post.id)}
            className="flex flex-col items-center gap-1"
          >
            <Heart
              size={28}
              className={`transition-all ${post.isLiked ? 'text-primary fill-primary animate-like' : 'text-white'}`}
            />
            <span className="text-xs text-white font-medium">{formatCount(post.likes)}</span>
          </button>

          <button
            onClick={() => onCommentOpen(post.id)}
            className="flex flex-col items-center gap-1"
          >
            <MessageCircle size={28} className="text-white" />
            <span className="text-xs text-white font-medium">{formatCount(post.comments)}</span>
          </button>

          <button className="flex flex-col items-center gap-1">
            <Send size={28} className="text-white" />
            <span className="text-xs text-white font-medium">{formatCount(post.shares)}</span>
          </button>

          <button
            onClick={() => toggleSave(post.id)}
            className="flex flex-col items-center gap-1"
          >
            <Bookmark
              size={28}
              className={`transition-all ${post.isSaved ? 'text-yellow-400 fill-yellow-400' : 'text-white'}`}
            />
            <span className="text-xs text-white font-medium">{formatCount(post.saves)}</span>
          </button>

          {/* Music disc */}
          <div className="w-10 h-10 rounded-full border-2 border-gray-600 overflow-hidden animate-spin-slow mt-2">
            <img src={post.user.avatar} alt="music" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-20 left-3 right-16 z-10">
          <div className="flex items-center gap-2 mb-2">
            <img
              src={post.user.avatar}
              alt={post.user.username}
              className="w-9 h-9 rounded-full object-cover border border-white/50"
            />
            <span className="text-white font-bold text-sm">{post.user.username}</span>
            {post.user.isVerified && (
              <span className="bg-secondary text-black text-[10px] px-1 rounded font-bold">✓</span>
            )}
            <button className="ml-2 px-3 py-0.5 border border-white/50 rounded text-white text-xs font-medium hover:bg-white/10">
              Follow
            </button>
          </div>
          <p className="text-white text-sm mb-2 line-clamp-2">{post.caption}</p>
          {post.music && (
            <div className="flex items-center gap-2">
              <Music size={12} className="text-white" />
              <p className="text-white text-xs truncate max-w-[200px]">{post.music}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Grid/List view card
  return (
    <div className="bg-dark-card rounded-xl overflow-hidden border border-dark-border">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2.5">
          <img
            src={post.user.avatar}
            alt={post.user.username}
            className="w-9 h-9 rounded-full object-cover cursor-pointer"
            onClick={() => navigate(`/profile/${post.user.id}`)}
          />
          <div>
            <div className="flex items-center gap-1">
              <span
                className="text-white text-sm font-semibold cursor-pointer hover:text-gray-300"
                onClick={() => navigate(`/profile/${post.user.id}`)}
              >
                {post.user.username}
              </span>
              {post.user.isVerified && (
                <span className="text-secondary text-xs">✓</span>
              )}
            </div>
            <span className="text-gray-text text-xs">{post.createdAt}</span>
          </div>
        </div>
        <button className="text-gray-text hover:text-white">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Media */}
      <div className="relative aspect-square">
        <img
          src={post.mediaUrl}
          alt="post"
          className="w-full h-full object-cover"
          onDoubleClick={handleDoubleTap}
        />
        {post.type === 'video' && (
          <div className="absolute top-3 right-3">
            <Play size={16} className="text-white fill-white" />
          </div>
        )}
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Heart size={80} className="text-primary fill-primary animate-like" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-4">
          <button onClick={() => toggleLike(post.id)} className="transition-transform active:scale-125">
            <Heart
              size={24}
              className={`transition-colors ${post.isLiked ? 'text-primary fill-primary' : 'text-white hover:text-gray-300'}`}
            />
          </button>
          <button onClick={() => onCommentOpen(post.id)} className="transition-transform active:scale-110">
            <MessageCircle size={24} className="text-white hover:text-gray-300" />
          </button>
          <button className="transition-transform active:scale-110">
            <Send size={22} className="text-white hover:text-gray-300" />
          </button>
        </div>
        <button onClick={() => toggleSave(post.id)} className="transition-transform active:scale-110">
          <Bookmark
            size={24}
            className={`transition-colors ${post.isSaved ? 'text-yellow-400 fill-yellow-400' : 'text-white hover:text-gray-300'}`}
          />
        </button>
      </div>

      {/* Likes & Caption */}
      <div className="px-3 pb-3">
        <p className="text-white text-sm font-semibold">{formatCount(post.likes)} likes</p>
        <p className="text-white text-sm mt-1">
          <span className="font-semibold">{post.user.username}</span>{' '}
          <span className="text-gray-200">{post.caption}</span>
        </p>
        <button
          onClick={() => onCommentOpen(post.id)}
          className="text-gray-text text-sm mt-1 hover:text-gray-400"
        >
          View all {post.comments} comments
        </button>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {post.tags.map(tag => (
              <span key={tag} className="text-secondary text-xs">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
