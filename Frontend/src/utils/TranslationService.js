import React, { useEffect } from "react";

const TranslationService = () => {
  useEffect(() => {
    // Create and load the Google Translate script
    const script = document.createElement("script");
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;

    // Event listener for when the script is loaded
    script.onload = () => {
      // Initialize Google Translate element
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',  // Default language of your page
            includedLanguages: 'en,hi,mr',  // Languages you want to support
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,  // Widget layout
          },
          'google_translate_element'  // This ID must match the div in the JSX below
        );
      };
    };

    document.body.appendChild(script);

    // Cleanup on component unmount
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      id="google_translate_element"
      className="fixed bottom-6 right-6 bg-white p-4 rounded-lg shadow-lg z-50"
    ></div> // The Tailwind classes will style the widget
  );
};

export default TranslationService;
