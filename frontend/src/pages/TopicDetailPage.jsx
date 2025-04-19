import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, ArrowRightCircle, Loader } from 'lucide-react';
import RelatedItemWithSummary from '../components/RelatedItemWithSummary';

// Mock data mapping slugs to topic details with embedded summaries
const mockTopicData = {
  'computer-science': {
    title: 'Computer Science',
    description: 'Explore algorithms, data structures, programming paradigms, software development, and more.',
    related: [
      { title: 'Intro to Python', summary: 'A high-level, general-purpose programming language known for its readability and versatility. Widely used in web development, data science, artificial intelligence, and automation. Features dynamic typing and garbage collection.' },
      { title: 'Web Development Basics', summary: 'Fundamentals of creating websites and web applications. Covers HTML for structure, CSS for styling, and JavaScript for interactivity. Understanding client-server architecture and HTTP is key.' },
      { title: 'Data Structures', summary: 'Methods of organizing, managing, and storing data in a computer for efficient access and modification. Includes arrays, linked lists, stacks, queues, trees, and graphs. Crucial for designing efficient algorithms.' }
    ]
  },
  'mathematics': {
    title: 'Mathematics',
    description: 'Dive into algebra, calculus, statistics, proofs, and mathematical logic.',
    related: [
      { title: 'Calculus I', summary: 'Introduces fundamental concepts of limits, derivatives, and integrals of single-variable functions. Explores applications like optimization and related rates. Forms the basis for higher-level mathematics and physics.' },
      { title: 'Linear Algebra', summary: 'Deals with vector spaces, linear mappings, and systems of linear equations. Concepts include matrices, determinants, eigenvalues, and eigenvectors. Essential in computer graphics, machine learning, and engineering.' },
      { title: 'Probability', summary: 'The branch of mathematics concerning numerical descriptions of how likely an event is to occur. Covers concepts like random variables, probability distributions, and expectation. Widely applied in statistics, finance, and science.' }
    ]
  },
  'physics': {
    title: 'Physics',
    description: 'Understand mechanics, thermodynamics, electromagnetism, relativity, and quantum physics.',
    related: [
      { title: 'Classical Mechanics', summary: 'Describes the motion of macroscopic objects, from projectiles to machinery parts, and astronomical objects. Based on Newton\'s laws of motion and principles of energy and momentum conservation. Foundational for many areas of science and engineering.' },
      { title: 'Electricity & Magnetism', summary: 'Studies electric charges, forces, fields, and currents, along with magnetic fields and their effects. Maxwell\'s equations unify these phenomena and describe electromagnetic waves, including light. Crucial for electrical engineering and technology.' },
      { title: 'Modern Physics', summary: 'Encompasses developments from the early 20th century onwards, primarily quantum mechanics and relativity. Deals with the behavior of matter and energy at atomic and subatomic levels, and at very high speeds or strong gravitational fields.' }
    ]
  },
  'biology': {
    title: 'Biology',
    description: 'Learn about cells, genetics, evolution, ecology, and the diversity of life.',
    related: [
      { title: 'Cell Biology', summary: 'The study of cell structure and function, the fundamental unit of life. Investigates organelles, cell cycle, metabolism, and communication. Essential for understanding physiology, development, and disease.' },
      { title: 'Genetics', summary: 'Focuses on genes, genetic variation, and heredity in organisms. Explores DNA structure, gene expression, mutation, and inheritance patterns. Underpins biotechnology, medicine, and evolutionary biology.' },
      { title: 'Ecology', summary: 'Examines the interactions among organisms and their environment. Studies populations, communities, ecosystems, and the biosphere. Addresses issues like biodiversity, resource management, and climate change.' }
    ]
  },
  'chemistry': {
    title: 'Chemistry',
    description: 'Study atomic structure, bonding, reactions, organic chemistry, and biochemistry.',
    related: [
      { title: 'General Chemistry', summary: 'Covers fundamental principles like atomic theory, stoichiometry, thermodynamics, and chemical bonding. Provides a broad overview of chemical concepts essential for specialized fields. Includes laboratory work to reinforce theory.' },
      { title: 'Organic Chemistry I', summary: 'Focuses on the structure, properties, composition, reactions, and synthesis of carbon-containing compounds. Introduces functional groups, stereochemistry, and reaction mechanisms. Key for medicine, materials science, and biology.' },
      { title: 'Biochemistry Basics', summary: 'Explores the chemical processes within and related to living organisms. Studies the structure and function of biomolecules like proteins, carbohydrates, lipids, and nucleic acids. Bridges biology and chemistry.' }
    ]
  },
  'language-arts': {
    title: 'Language Arts',
    description: 'Improve writing, reading comprehension, literature analysis, and communication skills.',
    related: [
      { title: 'Creative Writing', summary: 'Focuses on writing original works like fiction, poetry, and creative nonfiction. Emphasizes narrative technique, character development, imagery, and style. Develops imagination and expressive skills.' },
      { title: 'Shakespearean Literature', summary: 'In-depth study of the plays and poetry of William Shakespeare. Analyzes themes, language, historical context, and dramatic structure. Explores tragedies, comedies, histories, and sonnets.' },
      { title: 'Advanced Composition', summary: 'Develops sophisticated writing skills for various academic and professional contexts. Focuses on argumentation, research synthesis, rhetorical strategies, and clarity. Refines critical thinking and analytical writing abilities.' }
    ]
  },
};

const TopicDetailPage = () => {
  const { topicSlug } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Topic Slug:", topicSlug); // For debugging
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const data = mockTopicData[topicSlug];
      if (data) {
        setTopic(data);
        console.log("Found topic data:", data); // For debugging
      } else {
        console.log("Topic data not found for slug:", topicSlug); // For debugging
        setTopic(null); // Handle case where slug doesn't match
      }
      setLoading(false);
    }, 500); // Simulate network delay
  }, [topicSlug]);

  const handleBack = () => {
    navigate('/dashboard'); // Navigate back to the main dashboard
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 min-h-[calc(100vh-10rem)] flex items-center justify-center">
        <Loader size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-10">
         <button onClick={handleBack} className="btn btn-ghost mb-4">
           <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
         </button>
        <h1 className="text-2xl font-bold text-center mt-4">Topic Not Found</h1>
        <p className="text-center text-base-content/70 mt-2">Could not find details for "{topicSlug}".</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-20 pb-10 min-h-[calc(100vh-5rem)]">
       <button onClick={handleBack} className="btn btn-ghost mb-6 group">
         <ArrowLeft size={18} className="mr-1 transition-transform duration-200 ease-in-out group-hover:-translate-x-1" /> 
         Back to Dashboard
       </button>
      
       <div className={`bg-base-100 p-6 md:p-10 rounded-2xl shadow-lg border border-base-300 max-w-4xl mx-auto animate-fadeIn`}>
        <div className="flex items-start gap-4 mb-6">
            <BookOpen size={40} className="text-primary mt-1 flex-shrink-0" /> 
            <div>
                <h1 className="text-3xl md:text-4xl font-bold">{topic.title}</h1>
                <p className="text-lg text-base-content/70 mt-2">{topic.description}</p>
            </div>
        </div>

        <div className="divider my-6 md:my-8"></div>

        <h2 className="text-2xl font-semibold mb-5">Related Courses & Resources</h2>
        {topic.related && topic.related.length > 0 ? (
          <div className="space-y-4"> 
            {topic.related.map((item, index) => (
              <RelatedItemWithSummary 
                key={index} 
                itemTitle={item.title} 
                itemSummary={item.summary}
              />
            ))}
          </div>
        ) : (
          <p className="text-base-content/60 italic">No related resources available yet.</p>
        )}
      </div>
    </div>
  );
};

export default TopicDetailPage; 