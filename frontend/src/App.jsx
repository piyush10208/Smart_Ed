import Navbar from "./components/Navbar";
import ChatBot from "./components/ChatBot";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/DashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import TopicDetailPage from "./pages/TopicDetailPage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();

  console.log({ onlineUsers });

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log({ authUser });

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  // Check if user is admin
  const isAdmin = authUser && authUser.role === 'admin';

  return (
    <div className="relative min-h-screen">
      <Navbar />

      <Toaster
        toastOptions={{
          duration: 4000,
          success: {
            duration: 3000,
          },
          error: {
            duration: 5000,
          },
        }}
      />

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={authUser ? <SettingsPage /> : <Navigate to="/login" />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={authUser ? <DashboardPage /> : <Navigate to="/login" />} />
        <Route path="/admin" element={isAdmin ? <AdminDashboardPage /> : <Navigate to="/" />} />
        <Route path="/courses/:courseId" element={authUser ? <CourseDetailPage /> : <Navigate to="/login" />} />
        <Route path="/courses/:courseId/pre-enrollment" element={authUser ? <CourseDetailPage /> : <Navigate to="/login" />} />
        <Route path="/topics/:topicSlug" element={authUser ? <TopicDetailPage /> : <Navigate to="/login" />} />
      </Routes>
      
      {/* Floating Chatbot - appears on all pages */}
      <ChatBot />
    </div>
  );
};
export default App;
