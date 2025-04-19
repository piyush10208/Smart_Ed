import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  isSocketConnecting: false,
  socketListeners: {},

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      if (res.data) {
        // Add a role field for testing purposes (in a real app, this would come from the backend)
        // For testing, make the email with "admin" an admin
        const userWithRole = {
          ...res.data,
          role: res.data.email.includes("admin") ? "admin" : "student"
        };
        set({ authUser: userWithRole });
        get().connectSocket();
      }
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      if (res.data) {
        // Add a role field for testing purposes (in a real app, this would come from the backend)
        // For testing, make the email with "admin" an admin
        const userWithRole = {
          ...res.data,
          role: res.data.email.includes("admin") ? "admin" : "student"
        };
        set({ authUser: userWithRole });
        toast.success("Account created successfully");
        get().connectSocket();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      if (res.data) {
        // Add a role field for testing purposes (in a real app, this would come from the backend)
        // For testing, make the email with "admin" an admin
        const userWithRole = {
          ...res.data,
          role: res.data.email.includes("admin") ? "admin" : "student"
        };
        set({ authUser: userWithRole });
        toast.success("Logged in successfully");
        get().connectSocket();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      get().disconnectSocket();
      set({ authUser: null, onlineUsers: [] });
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      if (res.data) {
        // Preserve the role when updating
        const updatedUser = {
          ...res.data,
          role: get().authUser?.role || "student"
        };
        set({ authUser: updatedUser });
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response?.data?.message || "Profile update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket, isSocketConnecting, socketListeners } = get();
    
    // Don't connect if already connecting or connected
    if (isSocketConnecting || (socket?.connected && authUser?._id === socket?.auth?.userId)) {
      return;
    }

    // Clean up existing socket if any
    get().disconnectSocket();

    set({ isSocketConnecting: true });

    try {
      const newSocket = io(BASE_URL, {
        query: {
          userId: authUser?._id,
        },
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        autoConnect: true,
        forceNew: true
      });

      const handleConnect = () => {
        console.log("Socket connected");
        set({ isSocketConnecting: false });
      };

      const handleDisconnect = () => {
        console.log("Socket disconnected");
        set({ isSocketConnecting: false });
      };

      const handleError = (error) => {
        console.error("Socket connection error:", error);
        set({ isSocketConnecting: false });
      };

      const handleOnlineUsers = (userIds) => {
        if (Array.isArray(userIds)) {
          set((state) => ({
            onlineUsers: userIds.filter(id => id !== authUser?._id)
          }));
        }
      };

      // Store listeners for cleanup
      const listeners = {
        connect: handleConnect,
        disconnect: handleDisconnect,
        connect_error: handleError,
        getOnlineUsers: handleOnlineUsers
      };

      // Add listeners
      Object.entries(listeners).forEach(([event, handler]) => {
        newSocket.on(event, handler);
      });

      set({ 
        socket: newSocket,
        socketListeners: listeners
      });
    } catch (error) {
      console.error("Failed to create socket connection:", error);
      set({ isSocketConnecting: false });
    }
  },

  disconnectSocket: () => {
    const { socket, socketListeners } = get();
    if (socket) {
      try {
        // Remove all listeners
        Object.entries(socketListeners).forEach(([event, handler]) => {
          socket.off(event, handler);
        });
        
        socket.disconnect();
      } catch (error) {
        console.error("Error disconnecting socket:", error);
      } finally {
        set({ 
          socket: null, 
          onlineUsers: [], 
          isSocketConnecting: false,
          socketListeners: {}
        });
      }
    }
  },
}));
