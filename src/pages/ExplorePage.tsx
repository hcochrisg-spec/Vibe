import { useState } from 'react';
import { Search, TrendingUp, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { explorePosts, trendingTags, users } from '../data/mockData';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import CommentsModal from '../components/CommentsModal';

export default function ExplorePage() {
  const { toggleFollow } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'top' | 'accounts' | 'tags'>('top');
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const filteredUsers = searchQuery
    ? users.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredPosts = searchQuery
    ? explorePosts.filter(p =>
        p.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <div className="h-full flex flex-col bg-black pb-16">
      {/* Search Bar */}
      <div className="sticky top-0 z-20 bg-black/95 backdrop-blur-lg px-4 pt-4 pb-2">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-text" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(true); }}
            onFocus={() => setShowSearch(true)}
            placeholder="Search users, tags, sounds..."
            className="w-full bg-dark-card text-white text-sm pl-10 pr-10 py-2.5 rounded-xl outline-none border border-dark-border focus:border-primary transition-colors placeholder-gray-text"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setShowSearch(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-text"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Tabs */}
        {!showSearch && (
          <div className="flex gap-4 mt-3 border-b border-dark-border">
            {(['top', 'accounts', 'tags'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 text-sm font-medium capitalize transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'text-white border-white'
                    : 'text-gray-text border-transparent'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Results */}
      {showSearch && searchQuery && (
        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-2">
          {filteredUsers.length > 0 && (
            <div className="mb-4">
              <h3 className="text-white text-sm font-semibold mb-2">Accounts</h3>
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-2.5 cursor-pointer"
                  onClick={() => navigate(`/profile/${user.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.username} className="w-11 h-11 rounded-full object-cover" />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-white text-sm font-semibold">{user.username}</span>
                        {user.isVerified && <span className="text-secondary text-xs">✓</span>}
                      </div>
                      <span className="text-gray-text text-xs">{user.displayName} · {user.followers.toLocaleString()} followers</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFollow(user.id); }}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                      user.isFollowing
                        ? 'bg-dark-card text-white border border-dark-border'
                        : 'bg-primary text-white'
                    }`}
                  >
                    {user.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>
          )}
          {filteredPosts.length > 0 && (
            <div className="space-y-4">
              {filteredPosts.map(post => (
                <PostCard key={post.id} post={post} onCommentOpen={() => setCommentsOpen(true)} />
              ))}
            </div>
          )}
          {filteredUsers.length === 0 && filteredPosts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <Search size={48} className="text-gray-text mb-4" />
              <p className="text-gray-text">No results for "{searchQuery}"</p>
            </div>
          )}
        </div>
      )}

      {/* Main Explore Content */}
      {!showSearch && (
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {/* Trending Tags */}
          {activeTab === 'top' && (
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={18} className="text-primary" />
                <h3 className="text-white font-semibold">Trending</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map(({ tag, posts }) => (
                  <button
                    key={tag}
                    onClick={() => { setSearchQuery(tag); setShowSearch(true); }}
                    className="bg-dark-card border border-dark-border rounded-full px-3 py-1.5 text-sm hover:border-primary transition-colors"
                  >
                    <span className="text-secondary">#</span>
                    <span className="text-white ml-0.5">{tag}</span>
                    <span className="text-gray-text ml-1.5 text-xs">{posts}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Accounts */}
          {activeTab === 'accounts' && (
            <div className="px-4 py-3 space-y-3">
              {users.map(user => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-2 cursor-pointer"
                  onClick={() => navigate(`/profile/${user.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.username} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-white text-sm font-semibold">{user.username}</span>
                        {user.isVerified && <span className="text-secondary text-xs">✓</span>}
                      </div>
                      <span className="text-gray-text text-xs">{user.followers.toLocaleString()} followers</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFollow(user.id); }}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                      user.isFollowing
                        ? 'bg-dark-card text-white border border-dark-border'
                        : 'bg-primary text-white'
                    }`}
                  >
                    {user.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          {activeTab === 'tags' && (
            <div className="px-4 py-3 space-y-3">
              {trendingTags.map(({ tag, posts }) => (
                <div
                  key={tag}
                  className="flex items-center justify-between py-2 cursor-pointer"
                  onClick={() => { setSearchQuery(tag); setShowSearch(true); }}
                >
                  <div>
                    <p className="text-white font-semibold">#{tag}</p>
                    <p className="text-gray-text text-sm">{posts} posts</p>
                  </div>
                  <div className="w-12 h-12 bg-dark-card rounded-lg" />
                </div>
              ))}
            </div>
          )}

          {/* Grid */}
          {activeTab === 'top' && (
            <div className="grid grid-cols-3 gap-0.5 px-0.5 mt-2">
              {explorePosts.map(post => (
                <div
                  key={post.id}
                  className="aspect-square relative cursor-pointer group"
                  onClick={() => setCommentsOpen(true)}
                >
                  <img
                    src={post.mediaUrl}
                    alt=""
                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                  />
                  {post.type === 'video' && (
                    <div className="absolute top-1.5 right-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <CommentsModal isOpen={commentsOpen} onClose={() => setCommentsOpen(false)} />
    </div>
  );
}
