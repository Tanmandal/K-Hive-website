'use client'
import React, { useState } from 'react';
import { 
  User, Calendar, Cake, Award, MessageSquare, FileText, 
  Bookmark, TrendingUp, ArrowUp, ArrowDown, ExternalLink,
  Clock, Share2, MoreHorizontal
} from 'lucide-react';

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock user data
  const userData = {
    username: 'tech_explorer',
    displayName: 'Tech Explorer',
    bio: 'Software developer passionate about AI, open source, and building cool stuff. Always learning, always coding.',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=300&fit=crop',
    karma: {
      post: 15420,
      comment: 8934,
      total: 24354
    },
    cakeDay: 'March 15, 2021',
    joined: '3 years ago'
  };

  // Mock posts data
  const posts = [
    {
      id: 1,
      title: 'I built an AI-powered code reviewer and it saved me hours',
      subreddit: 'r/programming',
      upvotes: 2847,
      comments: 234,
      time: '12h ago',
      preview: 'After months of development, I finally released my AI code reviewer tool. It analyzes your code for bugs, security issues...'
    },
    {
      id: 2,
      title: 'The best VS Code extensions for React developers in 2024',
      subreddit: 'r/reactjs',
      upvotes: 1923,
      comments: 156,
      time: '2d ago',
      hasImage: true
    },
    {
      id: 3,
      title: 'Why I switched from React to Svelte and never looked back',
      subreddit: 'r/webdev',
      upvotes: 892,
      comments: 445,
      time: '5d ago',
      preview: 'After 5 years of React development, I decided to give Svelte a try. Here\'s what I learned...'
    }
  ];

  // Mock comments data
  const comments = [
    {
      id: 1,
      content: 'This is exactly what I needed! The documentation is clear and the examples are super helpful. Thanks for sharing!',
      post: 'How to build a REST API with Node.js',
      subreddit: 'r/node',
      upvotes: 342,
      time: '8h ago'
    },
    {
      id: 2,
      content: 'I disagree with this approach. While it works, there are more efficient ways to handle state management in modern React apps.',
      post: 'Redux vs Context API: Which should you use?',
      subreddit: 'r/reactjs',
      upvotes: 128,
      time: '1d ago'
    },
    {
      id: 3,
      content: 'Great tutorial! One suggestion: you could add error handling for edge cases. Otherwise, perfect explanation.',
      post: 'Complete guide to async/await in JavaScript',
      subreddit: 'r/javascript',
      upvotes: 89,
      time: '3d ago'
    }
  ];

  // Mock saved items
  const savedItems = [
    {
      id: 1,
      type: 'post',
      title: 'The Ultimate Guide to System Design Interviews',
      subreddit: 'r/cscareerquestions',
      upvotes: 5234,
      time: '1w ago'
    },
    {
      id: 2,
      type: 'comment',
      content: 'Here\'s a comprehensive list of free resources for learning machine learning...',
      post: 'Best ML resources for beginners?',
      subreddit: 'r/MachineLearning',
      upvotes: 892,
      time: '2w ago'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'comments', label: 'Comments', icon: MessageSquare },
    { id: 'saved', label: 'Saved', icon: Bookmark }
  ];

  return (
    <div className="min-h-screen bg-[#0b0b0b]">
      {/* Profile Container */}
      <div className="max-w-[900px] mx-auto">
        
        {/* Banner */}
        <div className="relative h-32 sm:h-40 md:h-48 bg-gradient-to-r from-[#00ff1187] to-[#1dddf2] rounded-b-xl sm:rounded-b-2xl overflow-hidden">
          <img 
            src={userData.banner} 
            alt="Profile banner" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
        </div>

        {/* Profile Header */}
        <div className="relative px-3 sm:px-4 md:px-6 pb-4 md:pb-6 bg-[#1a1a1b] border-b border-[#343536]">
          {/* Avatar */}
          <div className="relative -mt-10 sm:-mt-12 md:-mt-16 mb-3 md:mb-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full border-4 border-[#1a1a1b] overflow-hidden shadow-xl">
              <img 
                src={userData.avatar} 
                alt={userData.username}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* User Info */}
          <div className="mb-4 md:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
              u/{userData.username}
            </h1>
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-2xl">
              {userData.bio}
            </p>
          </div>

          {/* Stats - Responsive Grid */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-4 md:gap-6 mb-4 md:mb-6">
            <div className="flex items-center gap-2 text-gray-300">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-[#00ff1187] flex-shrink-0" />
              <div>
                <p className="text-xs sm:text-sm text-gray-400">Karma</p>
                <p className="text-sm sm:text-base font-bold text-white">{userData.karma.total.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Cake className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff4500] flex-shrink-0" />
              <div>
                <p className="text-xs sm:text-sm text-gray-400">Cake Day</p>
                <p className="text-xs sm:text-sm font-semibold text-white">{userData.cakeDay}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-300 col-span-2 sm:col-span-1">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#1dddf2] flex-shrink-0" />
              <div>
                <p className="text-xs sm:text-sm text-gray-400">Joined</p>
                <p className="text-xs sm:text-sm font-semibold text-white">{userData.joined}</p>
              </div>
            </div>
          </div>

          {/* Karma Breakdown */}
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <div className="bg-[#272729] px-3 sm:px-4 py-2 rounded-lg flex-1 sm:flex-initial min-w-[140px]">
              <p className="text-xs text-gray-400 mb-1">Post Karma</p>
              <p className="text-sm sm:text-base font-bold text-white">{userData.karma.post.toLocaleString()}</p>
            </div>
            <div className="bg-[#272729] px-3 sm:px-4 py-2 rounded-lg flex-1 sm:flex-initial min-w-[140px]">
              <p className="text-xs text-gray-400 mb-1">Comment Karma</p>
              <p className="text-sm sm:text-base font-bold text-white">{userData.karma.comment.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Tabs - Responsive Scrollable */}
        <div className="bg-[#1a1a1b] border-b border-[#343536] sticky top-0 z-10">
          <div className="flex gap-1 px-3 sm:px-4 md:px-6 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-3 md:py-4 
                  font-semibold text-xs sm:text-sm whitespace-nowrap
                  transition-all relative rounded-t-lg flex-shrink-0
                  ${activeTab === tab.id 
                    ? 'text-white bg-[#272729]' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#1c1c1d]'
                  }
                `}
              >
                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#00ff1187] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-3 sm:p-4 md:p-6">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4 md:space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="bg-[#1a1a1b] border border-[#343536] rounded-xl p-4 md:p-6">
                  <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-[#00ff1187]" />
                    <h3 className="text-lg md:text-xl font-bold text-white">Top Posts</h3>
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    {posts.slice(0, 3).map(post => (
                      <div key={post.id} className="flex items-center justify-between py-2 border-b border-[#272729] last:border-0 gap-2">
                        <span className="text-gray-300 text-xs sm:text-sm truncate flex-1">{post.title}</span>
                        <span className="text-[#00ff1187] font-bold text-xs sm:text-sm flex-shrink-0">{post.upvotes}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#1a1a1b] border border-[#343536] rounded-xl p-4 md:p-6">
                  <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                    <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-[#1dddf2]" />
                    <h3 className="text-lg md:text-xl font-bold text-white">Recent Activity</h3>
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center gap-2 md:gap-3 py-2 border-b border-[#272729]">
                      <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-300 text-xs sm:text-sm flex-1 truncate">Posted in r/programming</span>
                      <span className="text-gray-500 text-xs flex-shrink-0">12h</span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 py-2 border-b border-[#272729]">
                      <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-300 text-xs sm:text-sm flex-1 truncate">Commented on r/reactjs</span>
                      <span className="text-gray-500 text-xs flex-shrink-0">1d</span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 py-2">
                      <Bookmark className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-300 text-xs sm:text-sm flex-1 truncate">Saved a post</span>
                      <span className="text-gray-500 text-xs flex-shrink-0">2d</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="space-y-3 md:space-y-4 animate-fadeIn">
              {posts.map(post => (
                <div 
                  key={post.id}
                  className="bg-[#1a1a1b] border border-[#343536] rounded-xl hover:border-[#474748] transition-all overflow-hidden"
                >
                  <div className="flex">
                    {/* Vote Section */}
                    <div className="bg-[#161617] w-10 sm:w-12 flex flex-col items-center gap-1 py-2 sm:py-3">
                      <button className="text-gray-400 hover:text-[#ff4500] p-1 rounded transition-colors">
                        <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <span className="text-white font-bold text-xs sm:text-sm">{post.upvotes}</span>
                      <button className="text-gray-400 hover:text-[#7193ff] p-1 rounded transition-colors">
                        <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>

                    {/* Post Content */}
                    <div className="flex-1 p-3 sm:p-4">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 text-xs text-gray-400 flex-wrap">
                        <span className="text-white font-semibold hover:underline cursor-pointer">
                          {post.subreddit}
                        </span>
                        <span>•</span>
                        <span>{post.time}</span>
                      </div>
                      <h3 className="text-white text-sm sm:text-base md:text-lg font-semibold mb-2 hover:underline cursor-pointer leading-tight">
                        {post.title}
                      </h3>
                      {post.preview && (
                        <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                          {post.preview}
                        </p>
                      )}
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-gray-400 hover:bg-[#272729] rounded-lg transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-xs sm:text-sm">{post.comments}</span>
                        </button>
                        <button className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-gray-400 hover:bg-[#272729] rounded-lg transition-colors">
                          <Share2 className="w-4 h-4" />
                          <span className="text-xs sm:text-sm hidden sm:inline">Share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-3 md:space-y-4 animate-fadeIn">
              {comments.map(comment => (
                <div 
                  key={comment.id}
                  className="bg-[#1a1a1b] border border-[#343536] rounded-xl p-3 sm:p-4 hover:border-[#474748] transition-all"
                >
                  <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="flex flex-col items-center gap-1">
                      <button className="text-gray-400 hover:text-[#ff4500] transition-colors">
                        <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <span className="text-white font-bold text-xs">{comment.upvotes}</span>
                      <button className="text-gray-400 hover:text-[#7193ff] transition-colors">
                        <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 text-xs text-gray-400 flex-wrap">
                        <span className="text-white font-semibold">u/{userData.username}</span>
                        <span className="hidden sm:inline">commented on</span>
                        <span className="text-[#00ff1187] hover:underline cursor-pointer truncate">
                          {comment.post}
                        </span>
                        <span>•</span>
                        <span className="flex-shrink-0">{comment.time}</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {comment.subreddit}
                      </div>
                      <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
                        <button className="text-gray-400 hover:text-white text-xs transition-colors">
                          Reply
                        </button>
                        <button className="text-gray-400 hover:text-white text-xs transition-colors">
                          Share
                        </button>
                        <button className="text-gray-400 hover:text-white text-xs transition-colors hidden sm:inline">
                          Award
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Saved Tab */}
          {activeTab === 'saved' && (
            <div className="space-y-3 md:space-y-4 animate-fadeIn">
              {savedItems.map(item => (
                <div 
                  key={item.id}
                  className="bg-[#1a1a1b] border border-[#343536] rounded-xl p-3 sm:p-4 hover:border-[#474748] transition-all"
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-[#00ff1187] flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 text-xs text-gray-400 flex-wrap">
                        <span className="text-white font-semibold hover:underline cursor-pointer">
                          {item.subreddit}
                        </span>
                        <span>•</span>
                        <span>{item.time}</span>
                      </div>
                      {item.type === 'post' ? (
                        <>
                          <h3 className="text-white text-sm sm:text-base font-semibold mb-2 hover:underline cursor-pointer">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                            <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>{item.upvotes}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-gray-300 text-xs sm:text-sm mb-2 leading-relaxed">
                            {item.content}
                          </p>
                          <div className="text-xs text-gray-500">
                            on: <span className="text-[#00ff1187] hover:underline cursor-pointer">{item.post}</span>
                          </div>
                        </>
                      )}
                    </div>
                    <button className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-[#272729] rounded-lg transition-colors flex-shrink-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}