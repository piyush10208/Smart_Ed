import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  messageListener: null,
  messageListenerCleanup: null,
  isChatOpen: false,
  isChatMinimized: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      if (Array.isArray(res.data)) {
        set({ users: res.data });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    if (!userId) return;
    
    set({ isMessagesLoading: true, messages: [] });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      if (Array.isArray(res.data)) {
        set({ messages: res.data });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    if (!selectedUser?._id) return;
    
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      if (res.data) {
        set((state) => {
          if (!Array.isArray(state.messages)) {
            return { messages: [res.data] };
          }
          return {
            messages: [...state.messages, res.data]
          };
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, messageListener, messageListenerCleanup } = get();
    if (!selectedUser?._id) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Clean up existing listener if any
    if (messageListenerCleanup) {
      messageListenerCleanup();
    }

    const handleNewMessage = (newMessage) => {
      if (!newMessage?._id || !newMessage?.senderId) return;
      
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set((state) => {
        if (!Array.isArray(state.messages)) {
          return { messages: [newMessage] };
        }
        
        // Prevent duplicate messages
        if (state.messages.some(msg => msg._id === newMessage._id)) {
          return state;
        }
        
        return {
          messages: [...state.messages, newMessage]
        };
      });
    };

    socket.on("newMessage", handleNewMessage);
    set({ messageListener: handleNewMessage });

    // Create cleanup function
    const cleanup = () => {
      if (socket && handleNewMessage) {
        socket.off("newMessage", handleNewMessage);
      }
    };

    set({ messageListenerCleanup: cleanup });
    return cleanup;
  },

  unsubscribeFromMessages: () => {
    const { messageListenerCleanup } = get();
    if (messageListenerCleanup) {
      messageListenerCleanup();
      set({ messageListener: null, messageListenerCleanup: null });
    }
  },

  setSelectedUser: (selectedUser) => {
    if (!selectedUser?._id) {
      set({ selectedUser: null, messages: [] });
    } else {
      set({ selectedUser, messages: [] });
    }
  },

  openChat: () => set({ isChatOpen: true, isChatMinimized: false }),
  closeChat: () => set({ isChatOpen: false }),
  toggleChat: () => set((state) => ({ 
    isChatOpen: !state.isChatOpen, 
    isChatMinimized: !state.isChatOpen ? false : state.isChatMinimized 
  })),
  toggleMinimize: () => set((state) => ({ isChatMinimized: !state.isChatMinimized })),

  fetchMessages: async () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    try {
      const res = await axiosInstance.get(`/messages/${selectedUser._id}`);

      if (res.data.error) throw new Error(res.data.error);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.message);
    }
  },

  processAiMessage: async (message) => {
    set((state) => ({ messages: [...state.messages, { text: message, sender: 'user', _id: Date.now() }] }));

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

    // Add bot response to chat (replace with actual AI logic)
    const botMessage = { 
      text: `AI processed: "${message}"`, 
      sender: 'bot', 
      _id: Date.now() + 1 
    };
    
    set((state) => ({ messages: [...state.messages, botMessage] }));
  },

  clearMessages: () => set({ messages: [] }),
}));
