
export const renderTextWithTags = (text: string) => {
  if (!text) return null;
  
  // Split the text by mentions or hashtags using regex
  const parts = text.split(/([@#]\w+)/g);
  
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('@') && part.length > 1) {
          return <span key={i} className="ping-user">{part}</span>;
        } else if (part.startsWith('#') && part.length > 1) {
          return <span key={i} className="ping-dept">{part}</span>;
        }
        return part;
      })}
    </>
  );
};
