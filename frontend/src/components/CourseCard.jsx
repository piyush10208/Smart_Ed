import { Link } from "react-router-dom";
import { Users, Clock, BookOpen, Star } from "lucide-react";
import useCourseStore from "../store/useCourseStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const CourseCard = ({ course }) => {
  const { enrolledCourses, enrollInCourse } = useCourseStore();
  const navigate = useNavigate();
  
  // Check if the user is already enrolled in this course
  const isEnrolled = enrolledCourses.some(c => c.title === course.title);
  
  const handleEnrollClick = (e) => {
    e.preventDefault(); // Prevent default link behavior
    
    if (isEnrolled) {
      // If already enrolled, navigate to course detail page
      navigate(`/courses/${course._id}`);
    } else {
      // Enroll in the course
      enrollInCourse(course);
      toast.success(`Successfully enrolled in ${course.title}`);
      // Could navigate to the course detail page or stay on the current page
      navigate(`/courses/${course._id}`);
    }
  };

  return (
    <div className="bg-base-100 rounded-xl overflow-hidden shadow-sm border border-base-300 hover:shadow-md transition-all">
      <div 
        className="h-48 bg-cover bg-center relative" 
        style={{ backgroundImage: `url(${course.image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute top-4 right-4">
          <div className={`badge ${course.color || "bg-primary"} text-white`}>
            {course.featured ? "Featured" : course.category}
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-bold text-xl">{course.title}</h3>
          <p className="text-white/80 text-sm">{course.instructor}</p>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-3 mb-3 text-sm text-base-content/70">
          <div className="flex items-center gap-1">
            <Users className="size-4" />
            <span>{course.enrolledCount || 0} students</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="size-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="size-4" />
            <span>{course.level}</span>
          </div>
          {course.rating && (
            <div className="flex items-center gap-1">
              <Star className="size-4 fill-amber-500 text-amber-500" />
              <span>{course.rating}</span>
            </div>
          )}
        </div>
        
        <p className="text-base-content/80 mb-4 line-clamp-2 text-sm">
          {course.description}
        </p>
        
        <button onClick={handleEnrollClick} className="btn btn-primary btn-block">
          {isEnrolled ? "Continue Learning" : "Enroll Now"}
        </button>
      </div>
    </div>
  );
};

export default CourseCard; 