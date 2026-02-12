import React, { useState, useRef, useEffect } from "react";

const STORAGE_KEY_PREFIX = "chatgpt_history_";

// Helper: check if user is logged in
const isLoggedIn = () => !!localStorage.getItem("user_email");

// Helper: get user-specific storage key
const getStorageKey = () => {
  const email = localStorage.getItem("user_email");
  return `${STORAGE_KEY_PREFIX}${email}`;
};

// Helper: load all chats from localStorage (only for logged-in users)
const loadChats = () => {
  try {
    if (!isLoggedIn()) return [];
    const key = getStorageKey();
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Helper: save all chats to localStorage (only for logged-in users)
const saveChats = (chats) => {
  if (!isLoggedIn()) return;
  const key = getStorageKey();
  localStorage.setItem(key, JSON.stringify(chats));
};

const Home = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState(loadChats());
  const [activeChatId, setActiveChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not available in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      if (finalTranscript) {
        setInput(finalTranscript);
        setIsListening(false);
        // Auto-send after a short delay so the user sees the text
        setTimeout(() => {
          document.getElementById("voice-auto-send")?.click();
        }, 500);
      } else if (interimTranscript) {
        setInput(interimTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error === "not-allowed") {
        alert("Microphone access denied. Please allow microphone access in your browser settings.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser. Please use Google Chrome.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
        setIsListening(false);
      }
    }
  };

  // Text-to-speech for AI responses
  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save current chat to history whenever messages change
  useEffect(() => {
    if (messages.length === 0) return;

    setChatHistory((prev) => {
      let updated;
      if (activeChatId) {
        // Update existing chat
        updated = prev.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, messages, updatedAt: Date.now() }
            : chat
        );
      } else {
        // Create new chat entry
        const newId = Date.now().toString();
        setActiveChatId(newId);
        const title =
          messages[0]?.text?.slice(0, 40) +
          (messages[0]?.text?.length > 40 ? "..." : "");
        updated = [
          { id: newId, title, messages, createdAt: Date.now(), updatedAt: Date.now() },
          ...prev,
        ];
      }
      saveChats(updated);
      return updated;
    });
  }, [messages]);

  // File attachment handlers
  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    const isImage = file.type.startsWith("image/");

    if (isImage) {
      reader.onload = () => {
        setAttachedFile({
          name: file.name,
          type: "image",
          content: reader.result, // base64 data URL for preview
        });
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = () => {
        setAttachedFile({
          name: file.name,
          type: "text",
          content: reader.result,
        });
      };
      reader.readAsText(file);
    }

    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const removeAttachment = () => {
    setAttachedFile(null);
  };

  const askQuestion = async () => {
    const question = input.trim();
    if (!question && !attachedFile) return;
    if (loading) return;

    // Increment global search counter
    const currentCount = parseInt(localStorage.getItem("chatgpt_global_search_count") || "0", 10);
    localStorage.setItem("chatgpt_global_search_count", (currentCount + 1).toString());

    // Build the user-visible message
    let userDisplay = question;
    if (attachedFile) {
      userDisplay = question
        ? `📎 ${attachedFile.name}\n\n${question}`
        : `📎 ${attachedFile.name}`;
    }

    // Build the message to send to the AI
    let aiMessage = question;
    if (attachedFile && attachedFile.type === "text") {
      const fileSnippet = attachedFile.content.slice(0, 3000);
      aiMessage = question
        ? `Here is the content of the attached file "${attachedFile.name}":\n\n${fileSnippet}\n\nUser question: ${question}`
        : `Here is the content of the attached file "${attachedFile.name}":\n\n${fileSnippet}\n\nPlease analyze this file.`;
    } else if (attachedFile && attachedFile.type === "image") {
      aiMessage = question
        ? `[User attached an image: ${attachedFile.name}] ${question}`
        : `[User attached an image: ${attachedFile.name}] Please describe or analyze this image.`;
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: userDisplay,
        attachment: attachedFile,
      },
    ]);
    setInput("");
    setAttachedFile(null);
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/ai/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: aiMessage }),
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.response || "No response received." },
      ]);
      // Read AI response aloud
      if (data.response) speakText(data.response);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "⚠️ Something went wrong. Make sure the backend server is running at http://127.0.0.1:8000",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      askQuestion();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setActiveChatId(null);
    setSidebarOpen(false);
  };

  const loadChat = (chat) => {
    setMessages(chat.messages);
    setActiveChatId(chat.id);
    setSidebarOpen(false);
  };

  const deleteChat = (e, chatId) => {
    e.stopPropagation();
    const updated = chatHistory.filter((c) => c.id !== chatId);
    setChatHistory(updated);
    saveChats(updated);
    if (activeChatId === chatId) {
      setMessages([]);
      setActiveChatId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white flex relative">
      {/* Sidebar toggle button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-16 left-4 z-50 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-gray-600"
        title="Chat History"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed top-0 left-0 h-full w-72 bg-gray-50 border-r border-gray-200 z-40 pt-14 flex flex-col shadow-lg">
          <div className="px-4 py-3 border-b border-gray-200">
            <button
              onClick={startNewChat}
              className="w-full px-4 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
            >
              + New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-2">
            {chatHistory.length === 0 ? (
              <p className="text-gray-400 text-sm text-center mt-8">
                No chat history yet
              </p>
            ) : (
              chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => loadChat(chat)}
                  className={`flex items-center justify-between px-3 py-2 mb-1 rounded-lg cursor-pointer text-sm transition ${activeChatId === chat.id
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <span className="truncate flex-1">{chat.title}</span>
                  <button
                    onClick={(e) => deleteChat(e, chat.id)}
                    className="ml-2 p-1 text-gray-400 hover:text-red-500 transition"
                    title="Delete chat"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Click-away overlay to close sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/10"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {messages.length === 0 && (
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
            What can I help with?
          </h1>
        )}

        {/* Chat messages */}
        {messages.length > 0 && (
          <div className="w-full max-w-xl flex-1 overflow-y-auto mb-4 mt-6" style={{ maxHeight: "60vh" }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl max-w-[80%] ${msg.role === "user"
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-800"
                    }`}
                >
                  {msg.attachment && msg.attachment.type === "image" && (
                    <img
                      src={msg.attachment.content}
                      alt={msg.attachment.name}
                      className="max-w-full rounded-lg mb-2"
                      style={{ maxHeight: "200px" }}
                    />
                  )}
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="mb-4 flex justify-start">
                <div className="px-4 py-3 rounded-2xl bg-gray-100 text-gray-500">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".txt,.js,.jsx,.py,.json,.csv,.md,.html,.css,.ts,.tsx,.xml,.yaml,.yml,.log,.pdf,.png,.jpg,.jpeg,.gif,.webp"
        />

        {/* Input box */}
        <div className="w-full max-w-xl">
          {/* Attachment preview */}
          {attachedFile && (
            <div className="flex items-center gap-2 mb-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600">
              <span>{attachedFile.type === "image" ? "🖼️" : "📄"}</span>
              <span className="truncate flex-1">{attachedFile.name}</span>
              {attachedFile.type === "image" && (
                <img src={attachedFile.content} alt="preview" className="h-8 w-8 rounded object-cover" />
              )}
              <button
                onClick={removeAttachment}
                className="text-gray-400 hover:text-red-500 transition"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 border border-gray-300 rounded-2xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-gray-300">
            <input
              type="text"
              placeholder={attachedFile ? "Ask about this file..." : "Ask anything"}
              className="flex-1 outline-none text-gray-700 placeholder-gray-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            {/* Voice input button */}
            <button
              onClick={toggleVoice}
              className={`p-2 rounded-full transition-all duration-200 ${isListening
                ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-300 scale-110"
                : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200 hover:scale-105"
                }`}
              title={isListening ? "Stop listening" : "Click to speak"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            </button>
            {/* Send button */}
            <button
              id="voice-auto-send"
              onClick={askQuestion}
              disabled={loading || (!input.trim() && !attachedFile)}
              className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>

          {/* Listening indicator */}
          {isListening && (
            <div className="flex items-center justify-center gap-2 mt-2 text-red-500 text-sm font-medium animate-pulse">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Listening... Speak now
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {["Attach", "Search", "Study", "Create image"].map((item) => (
              <button
                key={item}
                onClick={item === "Attach" ? handleAttachClick : undefined}
                className="px-4 py-1.5 text-sm border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Footer text */}
        <p className="text-xs text-gray-400 mt-10 text-center max-w-md">
          By messaging ChatGPT, you agree to our Terms and have read our Privacy
          Policy.
        </p>
      </div>
    </div>
  );
};

export default Home;