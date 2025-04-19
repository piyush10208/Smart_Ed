import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { GraduationCap, LayoutDashboard, LogOut, ShieldAlert, BookOpen } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const isAdmin = authUser && authUser.role === 'admin';

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">SmartEdu</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {authUser && (
              <>
                <Link
                  to={"/dashboard"}
                  className="btn btn-sm gap-2 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Student Dashboard</span>
                  <span className="sm:hidden">Dashboard</span>
                </Link>

                {isAdmin && (
                  <Link
                    to={"/admin"}
                    className="btn btn-sm gap-2 btn-primary"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span className="hidden sm:inline">Admin Dashboard</span>
                    <span className="sm:hidden">Admin</span>
                  </Link>
                )}

                <button className="flex gap-2 items-center" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
