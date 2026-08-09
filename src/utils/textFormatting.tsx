import React from 'react';

export const renderTextWithTags = (text: string) => {
  if (!text) return null;
  
  // Split the text by words that start with @ or #
  const words = text.split(/(\s+)/);
  
  return (
    <>
      {words.map((word, i) => {
        if (word.startsWith('@') && word.length > 1) {
          return <span key={i} className="ping-user">{word}</span>;
        } else if (word.startsWith('#') && word.length > 1) {
          return <span key={i} className="ping-dept">{word}</span>;
        }
        return word;
      })}
    </>
  );
};
