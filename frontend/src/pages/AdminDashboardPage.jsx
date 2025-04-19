import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { 
  Users, 
  BookOpen, 
  PlusCircle, 
  Trash2, 
  Edit, 
  Search, 
  FileText, 
  CheckCircle, 
  XCircle,
  ShieldAlert,
  Settings
} from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const AdminDashboardPage = () => {
  const { authUser, onlineUsers } = useAuthStore();
  const [activeTab, setActiveTab] = useState("courses");
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  
  // New course form data
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    instructor: "",
    category: "",
    duration: "",
    level: "Beginner"
  });

  // Fetch users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // In a real app, you would have a dedicated endpoint
      const res = await axiosInstance.get("/messages/users");
      if (Array.isArray(res.data)) {
        setUsers(res.data);
      }
    } catch (error) {
      toast.error("Failed to load users");
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch courses
  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      // Mock data for courses (in a real app, you would fetch this from your backend)
      const mockCourses = [
        {
          _id: "1",
          title: "Introduction to Computer Science",
          description: "Learn the fundamentals of computer science and programming",
          instructor: "Dr. Alan Smith",
          category: "Computer Science",
          duration: "12 weeks",
          level: "Beginner",
          enrolledCount: 1240,
          createdAt: "2023-05-15"
        },
        {
          _id: "2",
          title: "Advanced Mathematics",
          description: "Deep dive into calculus, linear algebra, and statistics",
          instructor: "Dr. Maria Johnson",
          category: "Mathematics",
          duration: "16 weeks",
          level: "Advanced",
          enrolledCount: 876,
          createdAt: "2023-06-22"
        },
        {
          _id: "3",
          title: "Physics Fundamentals",
          description: "Explore the laws of physics and their applications",
          instructor: "Prof. Robert Chen",
          category: "Physics",
          duration: "10 weeks",
          level: "Intermediate",
          enrolledCount: 654,
          createdAt: "2023-07-10"
        }
      ];
      
      setCourses(mockCourses);
      
      // In a real app, you would fetch courses from your backend:
      // const res = await axiosInstance.get("/courses");
      // setCourses(res.data);
    } catch (error) {
      toast.error("Failed to load courses");
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "courses") {
      fetchCourses();
    }
  }, [activeTab]);

  // Create new course
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      // In a real app, you would send a request to your backend
      // const res = await axiosInstance.post("/courses", newCourse);
      
      // Mock creating a new course
      const newCourseWithId = {
        ...newCourse,
        _id: Math.random().toString(36).substring(2, 9),
        enrolledCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      setCourses(prevCourses => [...prevCourses, newCourseWithId]);
      setShowAddCourseModal(false);
      setNewCourse({
        title: "",
        description: "",
        instructor: "",
        category: "",
        duration: "",
        level: "Beginner"
      });
      
      toast.success("Course created successfully");
    } catch (error) {
      toast.error("Failed to create course");
      console.error("Error creating course:", error);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    try {
      // In a real app, you would send a request to your backend
      // await axiosInstance.delete(`/users/${selectedUserId}`);
      
      // Mock deleting a user
      setUsers(prevUsers => prevUsers.filter(user => user._id !== selectedUserId));
      setShowDeleteUserModal(false);
      setSelectedUserId(null);
      
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error("Failed to delete user");
      console.error("Error deleting user:", error);
    }
  };

  // Filter courses based on search term
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "courses":
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="input input-bordered w-full pr-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/50" size={18} />
              </div>
              
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddCourseModal(true)}
              >
                <PlusCircle size={18} />
                Add New Course
              </button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Instructor</th>
                      <th>Category</th>
                      <th>Level</th>
                      <th>Duration</th>
                      <th>Enrolled</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((course) => (
                      <tr key={course._id}>
                        <td className="font-medium">{course.title}</td>
                        <td>{course.instructor}</td>
                        <td>{course.category}</td>
                        <td>{course.level}</td>
                        <td>{course.duration}</td>
                        <td>{course.enrolledCount}</td>
                        <td>{course.createdAt}</td>
                        <td>
                          <div className="flex gap-2">
                            <button className="btn btn-sm btn-ghost">
                              <Edit size={16} />
                            </button>
                            <button className="btn btn-sm btn-ghost text-error">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredCourses.length === 0 && (
                  <div className="text-center py-8 text-base-content/70">
                    {courses.length === 0 ? "No courses found. Create your first course!" : "No courses match your search."}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      
      case "users":
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="input input-bordered w-full pr-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/50" size={18} />
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="w-12 h-12 rounded-full">
                                <img src={user.profilePic || "/avatar.png"} alt={user.fullName} />
                              </div>
                            </div>
                            <div>
                              <div className="font-bold">{user.fullName}</div>
                              {user._id === authUser?._id && (
                                <span className="badge badge-sm badge-primary">You</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-accent'}`}>
                            {user.role || 'Student'}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <div className={`size-2 rounded-full ${onlineUsers?.includes(user._id) ? 'bg-success' : 'bg-error'}`}></div>
                            <span>{onlineUsers?.includes(user._id) ? 'Active' : 'Inactive'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button className="btn btn-sm btn-ghost">
                              <Edit size={16} />
                            </button>
                            {user._id !== authUser?._id && (
                              <button 
                                className="btn btn-sm btn-ghost text-error"
                                onClick={() => {
                                  setSelectedUserId(user._id);
                                  setShowDeleteUserModal(true);
                                }}
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-base-content/70">
                    {users.length === 0 ? "No users found." : "No users match your search."}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      
      case "settings":
        return (
          <div className="space-y-8">
            <div className="bg-base-100 p-6 rounded-xl shadow-sm border border-base-300">
              <h3 className="text-xl font-bold mb-4">Platform Settings</h3>
              
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Platform Name</span>
                  </label>
                  <input 
                    type="text" 
                    value="SmartEdu" 
                    className="input input-bordered" 
                    placeholder="Platform name"
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Support Email</span>
                  </label>
                  <input 
                    type="email" 
                    value="support@smartedu.com" 
                    className="input input-bordered" 
                    placeholder="Support email"
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Maintenance Mode</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <input type="checkbox" className="toggle toggle-primary" />
                    <span className="text-sm text-base-content/70">
                      When enabled, the platform will be unavailable to regular users
                    </span>
                  </div>
                </div>
                
                <button className="btn btn-primary mt-4">Save Settings</button>
              </div>
            </div>
            
            <div className="bg-base-100 p-6 rounded-xl shadow-sm border border-base-300">
              <h3 className="text-xl font-bold mb-4">Registration Settings</h3>
              
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Allow New Registrations</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <input type="checkbox" className="toggle toggle-primary" checked />
                    <span className="text-sm text-base-content/70">
                      When disabled, new users won't be able to register
                    </span>
                  </div>
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Email Verification Required</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <input type="checkbox" className="toggle toggle-primary" checked />
                    <span className="text-sm text-base-content/70">
                      When enabled, users must verify their email before accessing the platform
                    </span>
                  </div>
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Default User Role</span>
                  </label>
                  <select className="select select-bordered w-full max-w-xs">
                    <option>Student</option>
                    <option>Instructor</option>
                    <option>Admin</option>
                  </select>
                </div>
                
                <button className="btn btn-primary mt-4">Save Settings</button>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  if (!authUser || authUser.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 pt-24 pb-10">
        <div className="bg-base-100 p-8 rounded-xl shadow-sm border border-base-300 text-center">
          <ShieldAlert className="size-16 text-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-base-content/70 mb-6">
            You don't have permission to access the admin dashboard.
          </p>
          <a href="/" className="btn btn-primary">Go to Homepage</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-10">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShieldAlert className="size-8" />
              Admin Dashboard
            </h1>
            <p className="text-base-content/70 mt-1">
              Manage courses, users, and platform settings
            </p>
          </div>
        </div>
        
        <div className="tabs tabs-bordered">
          <button 
            className={`tab tab-lg ${activeTab === "courses" ? "tab-active" : ""}`}
            onClick={() => {
              setActiveTab("courses");
              setSearchTerm("");
            }}
          >
            <BookOpen className="size-4 mr-2" />
            Courses
          </button>
          <button 
            className={`tab tab-lg ${activeTab === "users" ? "tab-active" : ""}`}
            onClick={() => {
              setActiveTab("users");
              setSearchTerm("");
            }}
          >
            <Users className="size-4 mr-2" />
            Users
          </button>
          <button 
            className={`tab tab-lg ${activeTab === "settings" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="size-4 mr-2" />
            Settings
          </button>
        </div>
        
        <div>
          {renderContent()}
        </div>
      </div>

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6 border-b border-base-300">
              <h3 className="text-xl font-bold">Add New Course</h3>
            </div>
            
            <form onSubmit={handleCreateCourse}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Course Title</span>
                    </label>
                    <input 
                      type="text" 
                      className="input input-bordered" 
                      placeholder="Enter course title"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Instructor</span>
                    </label>
                    <input 
                      type="text" 
                      className="input input-bordered" 
                      placeholder="Enter instructor name"
                      value={newCourse.instructor}
                      onChange={(e) => setNewCourse({...newCourse, instructor: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Description</span>
                  </label>
                  <textarea 
                    className="textarea textarea-bordered h-24" 
                    placeholder="Enter course description"
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                    required
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Category</span>
                    </label>
                    <input 
                      type="text" 
                      className="input input-bordered" 
                      placeholder="Enter category"
                      value={newCourse.category}
                      onChange={(e) => setNewCourse({...newCourse, category: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Duration</span>
                    </label>
                    <input 
                      type="text" 
                      className="input input-bordered" 
                      placeholder="e.g. 12 weeks"
                      value={newCourse.duration}
                      onChange={(e) => setNewCourse({...newCourse, duration: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Level</span>
                    </label>
                    <select 
                      className="select select-bordered"
                      value={newCourse.level}
                      onChange={(e) => setNewCourse({...newCourse, level: e.target.value})}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-base-300 flex justify-end gap-3">
                <button 
                  type="button" 
                  className="btn btn-ghost"
                  onClick={() => setShowAddCourseModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Create Course</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
              <p className="text-base-content/70 mb-6">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
              
              <div className="flex justify-end gap-3">
                <button 
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowDeleteUserModal(false);
                    setSelectedUserId(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-error"
                  onClick={handleDeleteUser}
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage; 