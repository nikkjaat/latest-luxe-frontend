import React from "react";

const SearchHighlight = ({
  text,
  searchTerms = [],
  className = "",
  highlightClassName = "bg-yellow-200 text-yellow-900 font-medium px-1 rounded-sm",
  caseSensitive = false,
}) => {
  if (!text || !searchTerms.length) {
    return <span className={className}>{text}</span>;
  }

  try {
    // Escape special regex characters in search terms
    const escapedTerms = searchTerms
      .filter((term) => term && term.trim())
      .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

    if (escapedTerms.length === 0) {
      return <span className={className}>{text}</span>;
    }

    // Create a regex pattern for all search terms
    const pattern = new RegExp(
      `(${escapedTerms.join("|")})`,
      caseSensitive ? "g" : "gi"
    );

    const parts = text.split(pattern);

    return (
      <span className={className}>
        {parts.map((part, index) => {
          if (!part) return null;

          // Check if this part matches any search term
          const isMatch = escapedTerms.some((term) => {
            const termRegex = new RegExp(`^${term}$`, caseSensitive ? "" : "i");
            return termRegex.test(part);
          });

          return isMatch ? (
            <mark
              key={index}
              className={highlightClassName}
              style={{ transition: "background-color 0.2s ease" }}
            >
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          );
        })}
      </span>
    );
  } catch (error) {
    console.error("SearchHighlight error:", error);
    return <span className={className}>{text}</span>;
  }
};

export default SearchHighlight;
