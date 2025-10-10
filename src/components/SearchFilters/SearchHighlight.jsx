import React from "react";

const SearchHighlight = ({ text, searchTerms = [], className = "" }) => {
  if (!text || !searchTerms.length) {
    return <span className={className}>{text}</span>;
  }

  // Create a regex pattern for all search terms
  const pattern = new RegExp(`(${searchTerms.join("|")})`, "gi");
  const parts = text.split(pattern);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = searchTerms.some(
          (term) => term.toLowerCase() === part.toLowerCase()
        );

        return isMatch ? (
          <mark
            key={index}
            className="bg-yellow-200 text-yellow-900 px-1 rounded"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
};

export default SearchHighlight;
