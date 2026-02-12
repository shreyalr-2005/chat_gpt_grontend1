import React, { useState, useEffect } from "react";

const STORAGE_KEY_PREFIX = "chatgpt_history_";

function Dashboard() {
    const userEmail = localStorage.getItem("user_email");
    const isLoggedIn = !!userEmail;

    const [globalSearchCount, setGlobalSearchCount] = useState(0);
    const [userStats, setUserStats] = useState({
        totalChats: 0,
        totalMessages: 0,
        totalUserMessages: 0,
        totalAiResponses: 0,
        recentChats: [],
    });

    useEffect(() => {
        // Global search count (all users)
        const count = parseInt(localStorage.getItem("chatgpt_global_search_count") || "0", 10);
        setGlobalSearchCount(count);

        // Per-user stats (only if logged in)
        if (isLoggedIn) {
            try {
                const key = `${STORAGE_KEY_PREFIX}${userEmail}`;
                const data = localStorage.getItem(key);
                const chats = data ? JSON.parse(data) : [];

                let totalMessages = 0;
                let totalUserMessages = 0;
                let totalAiResponses = 0;

                chats.forEach((chat) => {
                    totalMessages += chat.messages?.length || 0;
                    chat.messages?.forEach((msg) => {
                        if (msg.role === "user") totalUserMessages++;
                        else totalAiResponses++;
                    });
                });

                setUserStats({
                    totalChats: chats.length,
                    totalMessages,
                    totalUserMessages,
                    totalAiResponses,
                    recentChats: chats.slice(0, 10),
                });
            } catch {
                // ignore
            }
        }
    }, [isLoggedIn, userEmail]);

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-500 mt-1">
                        {isLoggedIn
                            ? <>Welcome back, <span className="font-medium text-gray-700">{userEmail}</span></>
                            : "Website activity overview"}
                    </p>
                </div>

                {/* Global Stats */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-700 mb-3">🌐 Global Activity</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-lg text-white">
                            <p className="text-sm opacity-80 mb-1">Total Searches (All Users)</p>
                            <p className="text-4xl font-bold">{globalSearchCount}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-6 shadow-lg text-white">
                            <p className="text-sm opacity-80 mb-1">Status</p>
                            <p className="text-2xl font-bold">
                                {isLoggedIn ? "🟢 Logged In" : "🔵 Guest Mode"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* User Stats — only for logged-in users */}
                {isLoggedIn && (
                    <>
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-gray-700 mb-3">👤 Your Activity</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                    <p className="text-sm text-gray-500 mb-1">Your Chats</p>
                                    <p className="text-3xl font-bold text-indigo-600">{userStats.totalChats}</p>
                                </div>
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                    <p className="text-sm text-gray-500 mb-1">Total Messages</p>
                                    <p className="text-3xl font-bold text-purple-600">{userStats.totalMessages}</p>
                                </div>
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                    <p className="text-sm text-gray-500 mb-1">Questions Asked</p>
                                    <p className="text-3xl font-bold text-green-600">{userStats.totalUserMessages}</p>
                                </div>
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                    <p className="text-sm text-gray-500 mb-1">AI Responses</p>
                                    <p className="text-3xl font-bold text-orange-500">{userStats.totalAiResponses}</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Chats Table */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-800">Your Recent Chats</h2>
                            </div>

                            {userStats.recentChats.length === 0 ? (
                                <div className="px-6 py-12 text-center text-gray-400">
                                    <p className="text-lg">No chats yet</p>
                                    <p className="text-sm mt-1">Start a conversation from the Home page</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50 text-left text-sm text-gray-500">
                                                <th className="px-6 py-3 font-medium">#</th>
                                                <th className="px-6 py-3 font-medium">Chat Title</th>
                                                <th className="px-6 py-3 font-medium">Messages</th>
                                                <th className="px-6 py-3 font-medium">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {userStats.recentChats.map((chat, index) => (
                                                <tr
                                                    key={chat.id}
                                                    className="border-t border-gray-50 hover:bg-gray-50 transition"
                                                >
                                                    <td className="px-6 py-3 text-sm text-gray-400">{index + 1}</td>
                                                    <td className="px-6 py-3 text-sm text-gray-800 font-medium max-w-xs truncate">
                                                        {chat.title || "Untitled"}
                                                    </td>
                                                    <td className="px-6 py-3 text-sm text-gray-600">
                                                        {chat.messages?.length || 0}
                                                    </td>
                                                    <td className="px-6 py-3 text-sm text-gray-400">
                                                        {chat.createdAt
                                                            ? new Date(chat.createdAt).toLocaleDateString("en-IN", {
                                                                day: "numeric",
                                                                month: "short",
                                                                year: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })
                                                            : "—"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Guest message */}
                {!isLoggedIn && (
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                        <p className="text-gray-500 text-lg">🔒 Log in to see your personal chat history and detailed stats</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
g