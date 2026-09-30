import { stories as initialStories } from '../data/mockData';
import { Plus } from 'lucide-react';

export default function StoriesBar() {
  return (
    <div className="flex gap-3 px-4 py-3 overflow-x-auto hide-scrollbar border-b border-dark-border">
      {initialStories.map((story, index) => (
        <div key={story.id} className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className={`relative ${index === 0 ? '' : 'story-ring'}`}>
            {index === 0 ? (
              <div className="relative">
                <img
                  src={story.user.avatar}
                  alt="Your story"
                  className="w-16 h-16 rounded-full object-cover border-2 border-dark-border"
                />
                <div className="absolute bottom-0 right-0 bg-primary rounded-full w-5 h-5 flex items-center justify-center border-2 border-black">
                  <Plus size={12} className="text-white" />
                </div>
              </div>
            ) : (
              <img
                src={story.user.avatar}
                alt={story.user.username}
                className={`w-16 h-16 rounded-full object-cover border-2 ${
                  story.isViewed ? 'border-gray-600' : 'border-transparent'
                }`}
              />
            )}
          </div>
          <span className="text-[11px] text-gray-text truncate w-16 text-center">
            {index === 0 ? 'Your story' : story.user.username.slice(0, 10)}
          </span>
        </div>
      ))}
    </div>
  );
}
