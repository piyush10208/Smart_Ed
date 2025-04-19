import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Theme state (light/dark)
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    // Default to 'light' if no preference found
    return savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  // High contrast state
  const [isHighContrast, setIsHighContrast] = useState(() => {
    const savedContrast = localStorage.getItem('highContrast');
    return savedContrast === 'true'; // Convert string from localStorage to boolean
  });

  // Effect to apply theme (via data-theme) and high contrast (via class)
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Handle theme (using data-theme for DaisyUI)
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Handle high contrast class
    if (isHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    localStorage.setItem('highContrast', isHighContrast);

  }, [theme, isHighContrast]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const toggleHighContrast = () => {
    setIsHighContrast((prevContrast) => !prevContrast);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isHighContrast, toggleHighContrast }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

// NOTE: To make High Contrast visually work, you need to define styles 
// targeting the `.high-contrast` class in your CSS (e.g., in index.css).
// Example:
// .high-contrast body {
//   background-color: black;
//   color: white;
// }
// .high-contrast .btn-primary {
//   background-color: yellow;
//   color: black;
//   border: 2px solid white;
// } 