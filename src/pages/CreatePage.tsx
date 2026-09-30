import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Video, Image, Music, MapPin, Tag, X, ChevronDown, Sparkles, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CreatePage() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'post' | 'reel' | 'story'>('post');
  const [caption, setCaption] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const sampleMedia = [
    'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1682687221038-404670f09ef1?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  ];

  const handlePost = () => {
    if (selectedMedia || caption) {
      alert('Post created! 🎉');
      navigate('/');
    }
  };

  return (
    <div className="h-full flex flex-col bg-black pb-16">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
        <button onClick={() => navigate(-1)} className="text-white">
          <X size={24} />
        </button>
        <div className="flex gap-4">
          {(['post', 'reel', 'story'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-semibold capitalize pb-1 border-b-2 transition-colors ${
                activeTab === tab
                  ? 'text-white border-white'
                  : 'text-gray-text border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          onClick={handlePost}
          className="text-primary font-semibold text-sm"
        >
          Share
        </button>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {/* User info */}
        <div className="flex items-center gap-3 px-4 py-4">
          <img src={currentUser.avatar} alt="You" className="w-10 h-10 rounded-full object-cover" />
          <span className="text-white font-semibold">{currentUser.username}</span>
          <button className="flex items-center gap-1 text-gray-text text-sm">
            <Users size={14} />
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Caption */}
        <div className="px-4">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            className="w-full bg-transparent text-white text-base resize-none outline-none min-h-[120px] placeholder-gray-text"
            maxLength={2200}
          />
          <div className="text-right text-gray-text text-xs">{caption.length}/2,200</div>
        </div>

        {/* Media Selection */}
        <div className="px-4 py-3">
          <h3 className="text-white text-sm font-semibold mb-3">
            {activeTab === 'reel' ? 'Select video' : 'Select photo'}
          </h3>
          <div className="grid grid-cols-3 gap-1.5">
            {sampleMedia.map((url, i) => (
              <button
                key={i}
                onClick={() => setSelectedMedia(selectedMedia === url ? null : url)}
                className={`aspect-square rounded-lg overflow-hidden relative ${
                  selectedMedia === url ? 'ring-2 ring-primary' : ''
                }`}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
                {selectedMedia === url && (
                  <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="border-t border-dark-border mt-2">
          {[
            { icon: Tag, label: 'Tag people', action: 'Tag' },
            { icon: MapPin, label: 'Add location', action: 'Add' },
            { icon: Music, label: 'Add music', action: 'Add' },
            { icon: Sparkles, label: 'AI Effects', action: 'Try' },
          ].map(({ icon: Icon, label, action }) => (
            <button
              key={label}
              className="flex items-center justify-between w-full px-4 py-3.5 border-b border-dark-border/50 hover:bg-dark-card/50"
            >
              <div className="flex items-center gap-3">
                <Icon size={20} className="text-white" />
                <span className="text-white text-sm">{label}</span>
              </div>
              <span className="text-gray-text text-sm">{action}</span>
            </button>
          ))}
        </div>

        {/* Quick Tools */}
        <div className="px-4 py-4">
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-dark-card border border-dark-border rounded-full px-4 py-2 hover:border-primary/50 transition-colors">
              <Camera size={16} className="text-white" />
              <span className="text-white text-sm">Camera</span>
            </button>
            <button className="flex items-center gap-2 bg-dark-card border border-dark-border rounded-full px-4 py-2 hover:border-primary/50 transition-colors">
              <Video size={16} className="text-white" />
              <span className="text-white text-sm">Record</span>
            </button>
            <button className="flex items-center gap-2 bg-dark-card border border-dark-border rounded-full px-4 py-2 hover:border-primary/50 transition-colors">
              <Image size={16} className="text-white" />
              <span className="text-white text-sm">Gallery</span>
            </button>
          </div>
        </div>

        {/* Preview */}
        {selectedMedia && (
          <div className="px-4 pb-4">
            <h3 className="text-white text-sm font-semibold mb-2">Preview</h3>
            <div className="relative rounded-xl overflow-hidden">
              <img src={selectedMedia} alt="Preview" className="w-full aspect-square object-cover" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
                  <p className="text-white text-sm truncate">{caption || 'Your caption here...'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
