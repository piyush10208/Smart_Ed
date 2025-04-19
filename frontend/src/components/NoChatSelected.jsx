import { BookOpen, Users, MessageSquare } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const NoChatSelected = () => {
  const { openChat } = useChatStore();

  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-8 md:p-16 bg-base-100/50">
      <div className="max-w-2xl w-full space-y-6">
        <div className="flex flex-col md:flex-row flex-wrap justify-center items-stretch gap-4 mt-4">
          <div 
            className="flex-1 bg-base-100 p-6 rounded-lg shadow-sm border border-base-300 text-center flex flex-col items-center justify-center min-w-[200px]"
          >
            <MessageSquare className="mx-auto h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold text-lg mb-1">Class Discussions</h3>
            <p className="text-sm text-base-content/70">
              Connect with your instructors and classmates for academic discussions and collaboration
            </p>
          </div>

          <div 
            className="flex-1 bg-base-100 p-6 rounded-lg shadow-sm border border-base-300 text-center cursor-pointer hover:bg-base-200 transition-colors duration-200 flex flex-col items-center justify-center min-w-[200px]"
            onClick={openChat}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openChat(); }}
          >
            <Users className="mx-auto h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold text-lg mb-1">Ask Questions</h3>
            <p className="text-sm text-base-content/70">Get help from instructors and peers</p>
          </div>
          
          <div className="flex-1 bg-base-100 p-6 rounded-lg shadow-sm border border-base-300 text-center flex flex-col items-center justify-center min-w-[200px]">
            <BookOpen className="mx-auto h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold text-lg mb-1">Discuss Assignments</h3>
            <p className="text-sm text-base-content/70">Collaborate on class projects and homework</p>
          </div>
        </div>
        
        <div className="alert mt-6 justify-center text-center">
          <div>
            <p className="text-sm text-base-content/80">
              Select a classmate or instructor from the sidebar to start a conversation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;
