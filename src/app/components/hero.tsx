'use client';
import React, { useState } from 'react';
import { Search, Plus, Bell, User, Flame, Sparkles, TrendingUp, Clock, MessageSquare, Share2, Bookmark, MoreHorizontal, ArrowUp, ArrowDown, Menu } from 'lucide-react';

export default function RedditFeed() {
    const [activeFilter, setActiveFilter] = useState('hot');
    const [showCommentInput, setShowCommentInput] = useState(null);

    const posts = [
        {
            id: 1,
            subreddit: 'r/technology',
            author: 'u/techguru42',
            time: '3h ago',
            title: 'OpenAI announces GPT-5 with revolutionary reasoning capabilities',
            content: 'The new model shows unprecedented performance in complex reasoning tasks, mathematical problem solving, and creative writing. Early benchmarks suggest a 40% improvement over GPT-4 in logical reasoning.',
            upvotes: '15.4k',
            comments: '2.3k',
            hasImage: false
        },
        {
            id: 2,
            subreddit: 'r/gaming',
            author: 'u/gamer_legend',
            time: '5h ago',
            title: 'After 500 hours, I finally completed this insane no-hit run',
            image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop',
            upvotes: '32.1k',
            comments: '1.9k',
            hasImage: true
        },
        {
            id: 3,
            subreddit: 'r/science',
            author: 'u/dr_quantum',
            time: '7h ago',
            title: 'Breakthrough in quantum computing: Scientists achieve 99.9% error correction rate',
            content: 'A team at MIT has developed a new error correction protocol that could finally make practical quantum computers viable. The breakthrough uses a novel approach for fault-tolerant quantum computation.',
            upvotes: '9.7k',
            comments: '847',
            hasImage: false
        },
        {
            id: 4,
            subreddit: 'r/technology',
            author: 'u/cyber_nexus',
            time: '2h ago',
            title: 'New AI chip reduces power consumption by 70% while increasing performance',
            content: 'A startup from Silicon Valley has introduced a neuromorphic AI chip designed to mimic the human brain. Early benchmarks show drastically lower power usage with significantly higher parallel processing abilities.',
            upvotes: '12.4k',
            comments: '1.2k',
            hasImage: true,
            image: 'https://images.unsplash.com/photo-1593642532973-d31b6557fa68'
        },
        {
            id: 6,
            subreddit: 'r/biology',
            author: 'u/genome_crafter',
            time: '5h ago',
            title: 'Researchers grow functional mini-hearts from stem cells',
            content: 'A breakthrough in regenerative medicine: scientists have successfully created beating heart organoids that mimic real cardiac tissue, opening doors to personalized drug testing and heart disease research.',
            upvotes: '14.8k',
            comments: '967',
            hasImage: false
        }
    ];

    return (
        <div className="min-h-screen bg-[#020d17]">
            {/* Main Container */}
            <div className="w-full max-w-[1200px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
                {/* Filter Tabs */}
                <div className="sticky top-0 z-10 bg-[#020d17] pt-3 sm:pt-4 md:pt-6 pb-2 sm:pb-3">
                    <div className="flex gap-1 sm:gap-2 md:gap-3 border-b border-[#343536] overflow-x-auto scrollbar-hide">
                        {[
                            { name: 'hot', icon: Flame, label: 'Hot' },
                            { name: 'new', icon: Sparkles, label: 'New' },
                            { name: 'top', icon: TrendingUp, label: 'Top' },
                            { name: 'rising', icon: Clock, label: 'Rising' }
                        ].map(filter => (
                            <button
                                key={filter.name}
                                onClick={() => setActiveFilter(filter.name)}
                                className={`
                                    flex items-center gap-1.5 sm:gap-2 md:gap-3 
                                    px-2.5 sm:px-4 md:px-5 lg:px-6
                                    py-2 sm:py-2.5 md:py-3 lg:py-3.5 
                                    text-xs sm:text-sm md:text-base
                                    transition-all relative rounded-lg whitespace-nowrap flex-shrink-0
                                    ${activeFilter === filter.name
                                        ? 'text-white bg-[#272729]'
                                        : 'text-gray-400 hover:text-gray-200 hover:bg-[#1c1c1d]'
                                    }
                                `}
                            >
                                <filter.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                <span className="font-semibold hidden xs:inline">{filter.label}</span>
                                {activeFilter === filter.name && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[2px] sm:h-[3px] bg-white rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Posts Feed */}
                <div className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6 pb-12 sm:pb-16 md:pb-20">
                    {posts.map((post, index) => (
                        <div
                            key={post.id}
                            className="bg-[#0d1d2c] border border-[#343536] rounded-md sm:rounded-lg hover:border-[#1dddf2] transition-all duration-300 overflow-hidden relative"
                        >
                            {/* Liquid shimmer overlay */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50 sm:opacity-100">
                                <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                            </div>

                            <div className="flex">
                                {/* Vote section */}
                                <div className="bg-[#0d1d2c] w-8 sm:w-10 md:w-12 flex flex-col items-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 md:py-3 flex-shrink-0">
                                    <button className="text-gray-400 hover:text-[#ff4500] p-0.5 sm:p-1 rounded transition-all duration-300 hover:scale-110 active:scale-95">
                                        <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                    </button>
                                    <span className="text-white font-bold text-[10px] sm:text-xs md:text-sm leading-tight">{post.upvotes}</span>
                                    <button className="text-gray-400 hover:text-[#7193ff] p-0.5 sm:p-1 rounded transition-all duration-300 hover:scale-110 active:scale-95">
                                        <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                    </button>
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 p-1.5 sm:p-2 md:p-3 lg:p-4 min-w-0">
                                    {/* Post Header */}
                                    <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 mb-1 sm:mb-1.5 md:mb-2 text-[10px] sm:text-xs md:text-sm text-gray-400 flex-wrap">
                                        <span className="font-semibold hover:underline cursor-pointer truncate max-w-[100px] sm:max-w-none">{post.subreddit}</span>
                                        <span className="hidden xs:inline">•</span>
                                        <span className="hover:underline cursor-pointer truncate max-w-[80px] sm:max-w-none">{post.author}</span>
                                        <span className="hidden xs:inline">•</span>
                                        <span className="text-[9px] sm:text-[10px] md:text-xs">{post.time}</span>
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-bold tracking-tight mb-1.5 sm:mb-2 cursor-pointer hover:text-[#ff4500] transition-colors duration-300 line-clamp-2 sm:line-clamp-3 md:line-clamp-none break-words">
                                        {post.title}
                                    </h2>

                                    {/* Image */}
                                    {post.hasImage ? (
                                        <div className="overflow-hidden rounded sm:rounded-md md:rounded-lg mb-1.5 sm:mb-2 md:mb-3 group">
                                            <img
                                                src={post.image}
                                                alt="Post"
                                                className="w-full rounded sm:rounded-md md:rounded-lg transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 text-[11px] sm:text-xs md:text-sm mb-1.5 sm:mb-2 md:mb-3 line-clamp-2 sm:line-clamp-2 md:line-clamp-3 break-words">
                                            {post.content}
                                        </p>
                                    )}

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 flex-wrap">
                                        <button
                                            onClick={() => setShowCommentInput(showCommentInput === post.id ? null : post.id)}
                                            className="flex items-center gap-0.5 sm:gap-1 md:gap-2 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 text-gray-400 hover:bg-[#272729] rounded sm:rounded-md md:rounded-lg transition-all duration-300 active:scale-95"
                                        >
                                            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                            <span className="text-[10px] sm:text-xs md:text-sm font-semibold">
                                                {post.comments}
                                            </span>
                                        </button>

                                        <button className="flex items-center gap-0.5 sm:gap-1 md:gap-2 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 text-gray-400 hover:bg-[#272729] rounded sm:rounded-md md:rounded-lg transition-all duration-300 active:scale-95">
                                            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                            <span className="text-[10px] sm:text-xs md:text-sm font-semibold hidden md:inline">Share</span>
                                        </button>

                                        <button className="flex items-center gap-0.5 sm:gap-1 md:gap-2 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 text-gray-400 hover:bg-[#272729] rounded sm:rounded-md md:rounded-lg transition-all duration-300 active:scale-95">
                                            <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                            <span className="text-[10px] sm:text-xs md:text-sm font-semibold hidden md:inline">Save</span>
                                        </button>

                                        <button className="ml-auto p-1 sm:p-1.5 md:p-2 text-gray-400 hover:bg-[#272729] rounded sm:rounded-md md:rounded-lg active:scale-95">
                                            <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                        </button>
                                    </div>

                                    {/* Comment Input */}
                                    {showCommentInput === post.id && (
                                        <div className="mt-2 sm:mt-3">
                                            <input
                                                type="text"
                                                placeholder="Write a comment..."
                                                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded sm:rounded-md md:rounded-lg bg-[#1a1a1b] border border-gray-700 text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-xs sm:text-sm"
                                                autoFocus
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                
                /* Extra small screens */
                @media (min-width: 475px) {
                    .xs\:inline {
                        display: inline;
                    }
                }
            `}</style>
        </div>
    );
}