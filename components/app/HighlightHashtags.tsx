import React from 'react';

export const HighlightHashtags = ({ text }: { text: string }) => {
  // Regular expression to match hashtags
  const hashtagRegex = /#(\w+)/g;

  // Split text into parts based on hashtags
  const parts = text.split(hashtagRegex);

  return (
    <div>
      {parts.map((part, index) => {
        // Check if the part is a hashtag
        if (hashtagRegex.test(`#${part}`)) {
          return (
            <span key={index} style={{ color: 'blue', fontWeight: 'bold' }}>
              #{part}
            </span>
          );
        } else {
          return <span key={index}>{part}</span>;
        }
      })}
    </div>
  );
};

export default HighlightHashtags;
