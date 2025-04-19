import React, { useState, useEffect } from 'react';
import { Calendar, X, Clock, Book, Calendar as CalendarIcon, CheckCircle } from 'lucide-react';

const CalendarModal = ({ isOpen, onClose, userId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Mock data for demonstration
  const mockEvents = [
    {
      id: 1,
      title: "Python Basics Quiz",
      type: "quiz",
      date: new Date(new Date().setDate(new Date().getDate() + 2)),
      course: "Introduction to Python",
      completed: false
    },
    {
      id: 2,
      title: "React Components Assignment",
      type: "assignment",
      date: new Date(new Date().setDate(new Date().getDate() + 5)),
      course: "Web Development Fundamentals",
      completed: false
    },
    {
      id: 3,
      title: "Machine Learning Lecture",
      type: "lecture",
      date: new Date(new Date().setDate(new Date().getDate() - 1)),
      course: "Machine Learning Fundamentals",
      completed: true
    },
    {
      id: 4,
      title: "Group Project Meeting",
      type: "meeting",
      date: new Date(),
      course: "Team Collaboration",
      completed: false
    }
  ];

  useEffect(() => {
    // In a real app, this would fetch events from an API
    const fetchEvents = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setEvents(mockEvents);
      } catch (error) {
        console.error("Error fetching calendar events:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchEvents();
    }
  }, [isOpen, userId]);

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    // Day names
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    // Create calendar grid
    let days = [];
    
    // Add day headers
    dayNames.forEach(day => {
      days.push(
        <div key={`header-${day}`} className="text-center font-medium p-2 text-base-content/70">
          {day}
        </div>
      );
    });
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayEvents = events.filter(event => 
        event.date.getFullYear() === date.getFullYear() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getDate() === date.getDate()
      );
      
      const isToday = 
        date.getDate() === new Date().getDate() && 
        date.getMonth() === new Date().getMonth() && 
        date.getFullYear() === new Date().getFullYear();
      
      const isSelected = 
        date.getDate() === selectedDate.getDate() && 
        date.getMonth() === selectedDate.getMonth() && 
        date.getFullYear() === selectedDate.getFullYear();
      
      days.push(
        <div 
          key={`day-${day}`} 
          className={`p-1 text-center relative cursor-pointer transition-colors ${
            isToday ? 'bg-primary/10' : ''
          } ${isSelected ? 'bg-primary/20' : 'hover:bg-base-200'}`}
          onClick={() => setSelectedDate(date)}
        >
          <span className={`inline-block w-8 h-8 leading-8 rounded-full ${
            isToday ? 'bg-primary text-primary-content' : ''
          }`}>
            {day}
          </span>
          {dayEvents.length > 0 && (
            <div className="absolute bottom-1 left-0 right-0 flex justify-center">
              <div className="size-1.5 rounded-full bg-accent"></div>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    );
  };

  const renderEvents = () => {
    const filteredEvents = events.filter(event => 
      event.date.getFullYear() === selectedDate.getFullYear() &&
      event.date.getMonth() === selectedDate.getMonth() &&
      event.date.getDate() === selectedDate.getDate()
    );
    
    if (filteredEvents.length === 0) {
      return (
        <div className="text-center py-8 text-base-content/70">
          <CalendarIcon className="size-10 mx-auto mb-2 opacity-30" />
          <p>No events scheduled for this day</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {filteredEvents.map(event => (
          <div 
            key={event.id}
            className={`p-3 rounded-lg border ${
              event.completed ? 'border-success/30 bg-success/5' : 'border-base-300'
            }`}
          >
            <div className="flex justify-between items-start">
              <h4 className="font-medium">{event.title}</h4>
              {event.completed && (
                <span className="badge badge-success badge-sm gap-1">
                  <CheckCircle className="size-3" />
                  Completed
                </span>
              )}
            </div>
            <p className="text-sm text-base-content/70">{event.course}</p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="size-3.5 text-primary" />
                <span>
                  {event.date.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Book className="size-3.5 text-primary" />
                <span>{event.type}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-base-300 sticky top-0 bg-base-100 z-10">
          <h3 className="text-xl font-bold">Course Schedule</h3>
          <button 
            className="btn btn-sm btn-ghost" 
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 h-[70vh]">
          {/* Calendar Side */}
          <div className="p-4 border-r border-base-300 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <button 
                className="btn btn-sm btn-ghost" 
                onClick={prevMonth}
              >
                &laquo;
              </button>
              <h4 className="font-medium">
                {currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
              </h4>
              <button 
                className="btn btn-sm btn-ghost" 
                onClick={nextMonth}
              >
                &raquo;
              </button>
            </div>
            
            {renderCalendar()}
            
            <div className="mt-6 p-3 bg-base-200 rounded-lg text-sm">
              <h4 className="font-medium mb-2">Upcoming Deadlines</h4>
              <ul className="space-y-2">
                {events
                  .filter(event => new Date(event.date) > new Date() && !event.completed)
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .slice(0, 3)
                  .map(event => (
                    <li key={event.id} className="flex justify-between">
                      <span>{event.title}</span>
                      <span className="text-base-content/70">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
          
          {/* Events Side */}
          <div className="p-4 overflow-y-auto">
            <h4 className="font-medium mb-4">
              Events for {selectedDate.toLocaleDateString('default', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </h4>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="loading loading-spinner loading-md text-primary"></div>
              </div>
            ) : (
              renderEvents()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarModal; 