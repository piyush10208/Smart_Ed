import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, GraduationCap, BookOpen, Search } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = users
    .filter(user => {
      // Apply online filter if enabled
      if (showOnlineOnly && !onlineUsers.includes(user._id)) {
        return false;
      }
      
      // Apply search filter if there's a search term
      if (searchTerm && !user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });

  if (isUsersLoading) return <SidebarSkeleton />;

  // Group users by role (instructors first, then students)
  const instructors = filteredUsers.filter(user => user.role === "instructor");
  const students = filteredUsers.filter(user => user.role !== "instructor");
  
  const renderUserButton = (user) => (
    <button
      key={user._id}
      onClick={() => setSelectedUser(user)}
      className={`
        w-full p-3 flex items-center gap-3
        hover:bg-base-300 transition-colors
        ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
      `}
    >
      <div className="relative mx-auto lg:mx-0">
        <img
          src={user.profilePic || "/avatar.png"}
          alt={user.name}
          className="size-12 object-cover rounded-full"
        />
        {onlineUsers.includes(user._id) && (
          <span
            className="absolute bottom-0 right-0 size-3 bg-green-500 
            rounded-full ring-2 ring-base-100"
          />
        )}
      </div>

      {/* User info - only visible on larger screens */}
      <div className="hidden lg:block text-left min-w-0">
        <div className="font-medium truncate">{user.fullName}</div>
        <div className="text-sm text-base-content/70 flex items-center gap-1">
          {user.role === "instructor" ? (
            <>
              <GraduationCap className="size-3" />
              <span>Instructor</span>
            </>
          ) : (
            <>
              <BookOpen className="size-3" />
              <span>Student</span>
            </>
          )}
          <span className="ml-2">• {onlineUsers.includes(user._id) ? "Online" : "Offline"}</span>
        </div>
      </div>
    </button>
  );

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6 text-primary" />
          <span className="font-medium hidden lg:block">Academic Community</span>
        </div>
        
        <div className="mt-3 hidden lg:block">
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Search people..."
              className="input input-bordered w-full input-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50" />
          </div>
          
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm checkbox-primary"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-base-content/70 mt-1">({onlineUsers.length} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {/* Instructors Group */}
        {instructors.length > 0 && (
          <div className="mb-4">
            <div className="px-4 py-2 text-xs font-semibold text-base-content/70 hidden lg:block">
              Instructors
            </div>
            {instructors.map(renderUserButton)}
          </div>
        )}
        
        {/* Students Group */}
        {students.length > 0 && (
          <div>
            <div className="px-4 py-2 text-xs font-semibold text-base-content/70 hidden lg:block">
              Classmates
            </div>
            {students.map(renderUserButton)}
          </div>
        )}

        {filteredUsers.length === 0 && (
          <div className="text-center text-base-content/70 py-4">
            {searchTerm ? "No matching results" : "No one available"}
          </div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
