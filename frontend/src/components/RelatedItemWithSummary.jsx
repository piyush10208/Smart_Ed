import { useState } from 'react';
import { ArrowRightCircle, ExternalLink, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const RelatedItemWithSummary = ({ itemTitle, itemSummary }) => {
  const [showWikipediaModal, setShowWikipediaModal] = useState(false);
  const [wikipediaContent, setWikipediaContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const wikipediaUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(itemTitle.replace(/ /g, '_'))}`;

  const fetchWikipediaContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the full content Wikipedia API endpoint to get more detailed information
      const articleTitle = itemTitle.replace(/ /g, '_');
      const apiUrl = `https://en.wikipedia.org/w/api.php?action=parse&format=json&origin=*&page=${encodeURIComponent(articleTitle)}&prop=text|sections|displaytitle&formatversion=2&redirects=1`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Wikipedia content');
      }
      
      const data = await response.json();
      
      if (!data.parse) {
        throw new Error(`Article "${itemTitle}" not found on Wikipedia`);
      }
      
      // Process the HTML content
      const htmlContent = data.parse.text;
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      
      // Remove unwanted elements
      const elementsToRemove = tempDiv.querySelectorAll('.mw-empty-elt, .mw-editsection, .reference, .noprint, .error, table.ambox, .hatnote');
      elementsToRemove.forEach(el => el.remove());
      
      // Extract clean title (remove HTML tags)
      const titleDiv = document.createElement('div');
      titleDiv.innerHTML = data.parse.displaytitle || itemTitle;
      const cleanTitle = titleDiv.textContent;
      
      // Get the sections
      const sections = data.parse.sections || [];
      
      // Extract the main content
      const paragraphs = tempDiv.querySelectorAll('p');
      let mainContent = '';
      
      // Get first 3-4 paragraphs for the introduction
      for (let i = 0; i < Math.min(4, paragraphs.length); i++) {
        if (paragraphs[i].textContent.trim().length > 0) {
          mainContent += paragraphs[i].outerHTML;
        }
      }
      
      // Process sections - improved to handle more sections and better content extraction
      const processedSections = [];
      if (sections.length > 0) {
        // Process more sections (up to 10)
        for (let i = 0; i < Math.min(10, sections.length); i++) {
          const section = sections[i];
          if (section.toclevel <= 3) { // Include subsections
            // Try to find section by id first
            let sectionElement = tempDiv.querySelector(`#${section.anchor}`);
            
            // If not found by ID, try to find by heading text
            if (!sectionElement) {
              const headings = tempDiv.querySelectorAll('h2, h3, h4');
              for (const heading of headings) {
                if (heading.textContent.trim() === section.line) {
                  sectionElement = heading;
                  break;
                }
              }
            }
            
            // If still not found, try finding using the section line content
            if (!sectionElement) {
              const headings = tempDiv.querySelectorAll('h2, h3, h4');
              for (const heading of headings) {
                if (heading.textContent.includes(section.line)) {
                  sectionElement = heading;
                  break;
                }
              }
            }
            
            if (sectionElement) {
              // Get the heading
              let sectionContent = '';
              let currentElement = sectionElement.nextElementSibling;
              
              // Collect content until the next heading or end
              while (currentElement && 
                    !['H1', 'H2', 'H3', 'H4'].includes(currentElement.tagName)) {
                if (currentElement.tagName === 'P' || 
                    currentElement.tagName === 'UL' || 
                    currentElement.tagName === 'OL' ||
                    currentElement.tagName === 'DIV' ||
                    currentElement.tagName === 'TABLE') {
                  sectionContent += currentElement.outerHTML;
                }
                currentElement = currentElement.nextElementSibling;
                
                // Safety check - if we're somehow stuck or reached the end
                if (!currentElement) break;
              }
              
              // If no content was found, try a different approach - look for following sibling paragraphs
              if (!sectionContent.trim()) {
                const allElements = Array.from(tempDiv.querySelectorAll('*'));
                const elementIndex = allElements.indexOf(sectionElement);
                
                // Look for the next section heading
                let nextHeadingIndex = -1;
                for (let j = elementIndex + 1; j < allElements.length; j++) {
                  if (['H1', 'H2', 'H3', 'H4'].includes(allElements[j].tagName)) {
                    nextHeadingIndex = j;
                    break;
                  }
                }
                
                // Get all content between this heading and the next
                if (nextHeadingIndex > -1) {
                  for (let j = elementIndex + 1; j < nextHeadingIndex; j++) {
                    if (allElements[j].tagName === 'P' || 
                        allElements[j].tagName === 'UL' || 
                        allElements[j].tagName === 'OL' ||
                        allElements[j].tagName === 'DIV' ||
                        allElements[j].tagName === 'TABLE') {
                      sectionContent += allElements[j].outerHTML;
                    }
                  }
                }
              }
              
              // Add to processed sections, even if content is empty (to show at least the section title)
              processedSections.push({
                title: section.line,
                content: sectionContent || '<p>Content not available for this section.</p>',
                level: parseInt(section.toclevel),
                anchor: section.anchor
              });
            }
          }
        }
      }
      
      // Get images
      let thumbnail = null;
      const images = tempDiv.querySelectorAll('.thumb img, .infobox img');
      if (images.length > 0) {
        const img = images[0];
        if (img.src) {
          thumbnail = { 
            source: img.src.startsWith('http') ? img.src : `https:${img.src}`,
            caption: img.alt || ''
          };
        }
      }
      
      // Format the content
      const formattedContent = {
        title: cleanTitle,
        extract: mainContent,
        sections: processedSections,
        thumbnail: thumbnail,
        fullHtml: tempDiv.innerHTML  // Store the processed HTML
      };
      
      setWikipediaContent(formattedContent);
      setShowWikipediaModal(true);
    } catch (error) {
      console.error('Error fetching Wikipedia content:', error);
      setError("Failed to load content from Wikipedia. Please try again later or visit Wikipedia directly.");
      
      // As a fallback, use the summary we already have
      if (itemSummary) {
        const fallbackContent = {
          title: itemTitle,
          extract: `<p><strong>${itemTitle}</strong> ${itemSummary}</p>`,
          sections: [],
          thumbnail: null
        };
        
        setWikipediaContent(fallbackContent);
        setShowWikipediaModal(true);
        toast.warning("Using local content summary. Wikipedia data couldn't be loaded.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to clean HTML content for safe rendering
  const sanitizeHtml = (html) => {
    // Only allow certain tags and attributes
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remove citation markers/brackets
    const superscripts = tempDiv.querySelectorAll('sup.reference');
    superscripts.forEach(el => el.remove());
    
    return tempDiv.innerHTML;
  };

  return (
    <>
      <div className="flex flex-col gap-2 p-4 rounded-lg bg-base-200/60 border border-base-300/50 transition-colors duration-200">
        <div className="flex items-center gap-3">
          <ArrowRightCircle size={20} className="text-primary/70 flex-shrink-0" />
          <h3 className="font-semibold text-base-content/90 flex-grow">{itemTitle}</h3>
        </div>

        <div className="pl-8 text-sm text-base-content/70 space-y-2">
          {itemSummary ? (
            <p className="line-clamp-3">
              {itemSummary}
            </p>
          ) : (
            <p className="italic">Summary not available.</p> 
          )}
              
          <button 
            onClick={fetchWikipediaContent}
            className="inline-flex items-center gap-1 text-primary hover:underline text-xs font-medium pt-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader size={12} className="animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Read More on Wikipedia <ExternalLink size={12} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Wikipedia Modal */}
      {showWikipediaModal && wikipediaContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-hidden">
          <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-base-300 flex justify-between items-start sticky top-0 bg-base-100 z-10">
              <div>
                <h2 className="text-2xl font-bold">{wikipediaContent.title}</h2>
              </div>
              <button 
                onClick={() => setShowWikipediaModal(false)}
                className="btn btn-sm btn-ghost"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Content - Article Style Layout */}
            <div className="overflow-y-auto flex-grow">
              <div className="p-6 max-w-5xl mx-auto">
                <article className="prose prose-base max-w-none">
                  {/* Main Content */}
                  <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(wikipediaContent.extract) }} />
                  
                  {/* Sections */}
                  {wikipediaContent.sections && wikipediaContent.sections.map((section, index) => (
                    <div key={section.anchor || index} className="mt-6">
                      <h3 className="font-bold text-lg mb-2">{section.title}</h3>
                      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.content) }} />
                    </div>
                  ))}
                </article>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-base-300 flex justify-between items-center bg-base-100">
              <span className="text-xs text-base-content/60">
                From Wikipedia, the free encyclopedia
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowWikipediaModal(false)}
                  className="btn btn-sm btn-ghost"
                >
                  Close
                </button>
                <a 
                  href={wikipediaUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-primary"
                >
                  View Full Article <ExternalLink size={12} className="ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-base-100 rounded-lg p-6 shadow-xl w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-error">Error Loading Content</h2>
              <button 
                onClick={() => setError(null)}
                className="btn btn-sm btn-ghost"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="mb-4">{error}</p>
            
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setError(null)}
                className="btn btn-sm btn-ghost"
              >
                Cancel
              </button>
              <a 
                href={wikipediaUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-sm btn-primary"
              >
                Go to Wikipedia Instead
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-base-100 rounded-lg p-8 shadow-xl w-full max-w-md flex flex-col items-center">
            <Loader size={32} className="animate-spin text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Loading Wikipedia Content</h3>
            <p className="text-base-content/70 text-center">
              Fetching information about "{itemTitle}" from Wikipedia...
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default RelatedItemWithSummary; 