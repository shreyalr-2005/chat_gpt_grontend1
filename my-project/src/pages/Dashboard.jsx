import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [userEmail, setUserEmail] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }

        // Decode the email from the JWT token (payload is base64-encoded)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUserEmail(payload.sub || payload.email || 'User');
        } catch {
            setUserEmail('User');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    const stats = [
        { label: 'Conversations', value: '24', icon: '💬', color: 'from-blue-500 to-cyan-400' },
        { label: 'Images Created', value: '12', icon: '🎨', color: 'from-purple-500 to-pink-400' },
        { label: 'Files Shared', value: '8', icon: '📁', color: 'from-amber-500 to-orange-400' },
        { label: 'Days Active', value: '15', icon: '🔥', color: 'from-green-500 to-emerald-400' },
    ];

    const recentChats = [
        { title: 'How to build a REST API', time: '2 hours ago', preview: 'You asked about FastAPI routing...' },
        { title: 'React component patterns', time: '5 hours ago', preview: 'Discussion about hooks and context...' },
        { title: 'Python data analysis', time: 'Yesterday', preview: 'Using pandas for CSV processing...' },
        { title: 'CSS Grid vs Flexbox', time: '2 days ago', preview: 'Layout comparison and best practices...' },
    ];

    const quickActions = [
        { label: 'New Chat', icon: '✨', desc: 'Start a conversation', path: '/' },
        { label: 'Explore', icon: '🔍', desc: 'Browse templates', path: '/' },
        { label: 'Settings', icon: '⚙️', desc: 'Manage preferences', path: '/' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
            {/* Decorative background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
                <div className="absolute top-1/3 -left-20 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="h-14 w-14 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 text-white text-xl font-bold">
                            {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 bg-clip-text text-transparent">
                                Welcome back! 👋
                            </h1>
                            <p className="text-sm text-gray-500 mt-0.5">{userEmail}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 shadow-sm transition-all duration-200 group"
                    >
                        <svg className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-5 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-2xl">{stat.icon}</span>
                                <div className={`h-8 w-8 rounded-lg bg-gradient-to-r ${stat.color} opacity-20`}></div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6">

                    {/* Recent Conversations */}
                    <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl shadow-lg shadow-gray-100/50 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Recent Conversations
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {recentChats.map((chat, i) => (
                                <div
                                    key={i}
                                    className="px-6 py-4 hover:bg-indigo-50/50 cursor-pointer transition-colors duration-200 group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors truncate">
                                                {chat.title}
                                            </h3>
                                            <p className="text-xs text-gray-400 mt-1 truncate">{chat.preview}</p>
                                        </div>
                                        <span className="text-xs text-gray-400 ml-4 whitespace-nowrap">{chat.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-gray-100 text-center">
                            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition">
                                View all conversations →
                            </button>
                        </div>
                    </div>

                    {/* Quick Actions Sidebar */}
                    <div className="space-y-4">
                        {/* Quick Actions */}
                        <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-6 shadow-lg shadow-gray-100/50">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Quick Actions
                            </h2>
                            <div className="space-y-3">
                                {quickActions.map((action, i) => (
                                    <button
                                        key={i}
                                        onClick={() => navigate(action.path)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50/80 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 border border-transparent hover:border-indigo-100 transition-all duration-200 group text-left"
                                    >
                                        <span className="text-xl group-hover:scale-110 transition-transform">{action.icon}</span>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{action.label}</p>
                                            <p className="text-xs text-gray-400">{action.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Account Info Card */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 shadow-lg shadow-indigo-200 text-white">
                            <h3 className="font-bold text-lg mb-1">Pro Tip 💡</h3>
                            <p className="text-indigo-100 text-sm leading-relaxed">
                                Use specific prompts for better AI responses. Try including context, desired format, and examples in your questions!
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="mt-4 w-full py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
                            >
                                Start New Chat
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;