import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PostCard from '../components/PostCard';
import CommentsModal from '../components/CommentsModal';
import { Logo } from '../components/Logo';

export default function HomePage() {
  const { posts } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'following' | 'foryou'>('foryou');
  const [commentsOpen, setCommentsOpen] = useState(false);
  

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3">
        <Logo />
        <button
          onClick={() => navigate('/messages')}
          className="text-white hover:text-gray-300"
        >
          <MessageCircle size={24} />
        </button>
      </div>

      {/* Tabs */}
      <div className="absolute top-12 left-0 right-0 z-30 flex items-center justify-center gap-6">
        <button
          onClick={() => setActiveTab('following')}
          className={`text-base font-semibold transition-colors ${
            activeTab === 'following' ? 'text-white' : 'text-gray-text'
          }`}
        >
          Following
        </button>
        <span className="text-gray-text">|</span>
        <button
          onClick={() => setActiveTab('foryou')}
          className={`text-base font-semibold transition-colors ${
            activeTab === 'foryou' ? 'text-white' : 'text-gray-text'
          }`}
        >
          For You
        </button>
      </div>

      {/* Feed */}
      <div
        className="flex-1 overflow-y-auto snap-feed hide-scrollbar"
      >
        {posts.map(post => (
          <div key={post.id} className="h-full w-full">
            <PostCard
              post={post}
              onCommentOpen={() => setCommentsOpen(true)}
              isFeedView={true}
            />
          </div>
        ))}
      </div>

      <CommentsModal isOpen={commentsOpen} onClose={() => setCommentsOpen(false)} />
    </div>
  );
}
