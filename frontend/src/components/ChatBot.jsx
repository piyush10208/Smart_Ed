import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize, Maximize } from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import { useChatStore } from '../store/useChatStore';

const ChatBot = () => {
  const { 
    isChatOpen, 
    isChatMinimized, 
    toggleChat, 
    toggleMinimize 
  } = useChatStore();

  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Test API connection on load
  useEffect(() => {
    const testApiConnection = async () => {
      try {
        const response = await axiosInstance.get('/chatbot/test');
        console.log("API test response:", response.data);
        setApiStatus({ success: true, message: response.data.message });
      } catch (error) {
        console.error("API test error:", error);
        setApiStatus({ success: false, message: error.message });
      }
    };
    
    testApiConnection();
  }, []);
  
  // Auto-scroll to the bottom when new messages come in or window opens/closes
  useEffect(() => {
    if (isChatOpen && !isChatMinimized) {
      scrollToBottom();
    }
  }, [messages, isChatOpen, isChatMinimized]);

  const scrollToBottom = () => {
    setTimeout(() => {
       messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    const userMessage = { id: Date.now(), text: inputMessage, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    
    try {
      // Log request details for debugging
      console.log("Sending request to:", axiosInstance.defaults.baseURL + '/chatbot');
      console.log("Request payload:", { message: inputMessage });
      
      // Send message to backend for OpenAI processing
      const response = await axiosInstance.post('/chatbot', { 
        message: inputMessage 
      });
      
      console.log("Response:", response.data);
      
      // Add bot response to chat
      const botMessage = { 
        id: Date.now() + 1, 
        text: response.data.message, 
        sender: 'bot' 
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting response from AI:', error);
      
      // Add error message
      const errorMessage = { 
        id: Date.now() + 1, 
        text: "Sorry, I couldn't process your request. Please try again later.", 
        sender: 'bot', 
        error: true 
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button - uses toggleChat from store */}
      <button
        onClick={toggleChat} 
        className={`btn btn-circle btn-primary btn-lg shadow-lg grid place-items-center ${!isChatOpen ? 'tooltip tooltip-top' : ''}`}
        aria-label={isChatOpen ? "Close chat" : "Open chat"}
        data-tip={!isChatOpen ? "Ask me" : ""}
      >
        {isChatOpen ? (
          <X className="size-6" />
        ) : (
          <MessageCircle className="size-6" />
        )}
      </button>

      {/* Chat Window - uses isChatOpen and isChatMinimized from store */}
      {isChatOpen && (
        <div 
          className={`absolute bottom-16 right-0 w-80 sm:w-96 bg-base-100 rounded-lg shadow-xl border border-base-300 overflow-hidden transition-all duration-300 ease-in-out ${
            isChatMinimized ? 'h-14' : 'h-[500px] max-h-[80vh]'
          }`}
        >
          {/* Chat Header */}
          <div className="bg-primary text-primary-content p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle className="size-5" />
              <h3 className="font-bold">AI Assistant</h3>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={toggleMinimize}
                className="btn btn-ghost btn-xs btn-circle"
                aria-label={isChatMinimized ? "Maximize chat" : "Minimize chat"}
              >
                {isChatMinimized ? <Maximize className="size-4" /> : <Minimize className="size-4" />}
              </button>
              <button 
                onClick={toggleChat}
                className="btn btn-ghost btn-xs btn-circle"
                aria-label="Close chat"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages - use isChatMinimized */}
          {!isChatMinimized && (
            <>
              <div className="p-4 h-[calc(500px-120px)] max-h-[calc(80vh-120px)] overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] p-3 rounded-lg shadow-sm ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-content'
                            : message.error 
                              ? 'bg-error text-error-content' 
                              : 'bg-base-200 text-base-content'
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="max-w-[75%] p-3 rounded-lg shadow-sm bg-base-200 text-base-content">
                        <span className="loading loading-dots loading-sm"></span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSubmit} className="p-3 border-t border-base-300">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="input input-bordered flex-grow"
                    value={inputMessage}
                    onChange={handleInputChange}
                  />
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-circle"
                    disabled={isTyping || !inputMessage.trim()}
                  >
                    <Send className="size-5" />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBot; 