import React, { useState, useEffect, useRef } from 'react';

interface MentionsTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  placeholder?: string;
}

const DEPARTMENTS = [
  'Technical', 'Creative', 'Photography', 'SocialMedia', 'Marketing', 'Hospitality'
];

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5175').replace(/\/+$/, '');

export const MentionsTextarea: React.FC<MentionsTextareaProps> = ({ 
  value, 
  onChange, 
  className,
  onSelect,
  onKeyDown,
  ...rest 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  
  const [suggestions, setSuggestions] = useState<{ id: string; handle: string; displayName: string; type: 'user' | 'dept' }[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeQuery, setActiveQuery] = useState<{ text: string; startIndex: number; type: 'user' | 'dept' } | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement, Event>) => {
    const el = e.currentTarget;
    const cursorPosition = el.selectionStart;
    
    const textBeforeCursor = el.value.substring(0, cursorPosition);
    
    // Match @ or # followed by word characters, up to 30 length
    const match = textBeforeCursor.match(/([@#])(\w{0,30})$/);
    
    if (match) {
      const type = match[1] === '@' ? 'user' : 'dept';
      const query = match[2];
      const startIndex = match.index || 0;
      setActiveQuery({ text: query, startIndex, type });
    } else {
      setActiveQuery(null);
      setDropdownVisible(false);
    }

    if (onSelect) onSelect(e);
  };

  const activeQueryKey = activeQuery ? `${activeQuery.type}:${activeQuery.startIndex}:${activeQuery.text}` : '';

  useEffect(() => {
    if (!activeQuery) {
      setSuggestions([]);
      setDropdownVisible(false);
      return;
    }
    
    let cancelled = false;

    const fetchSuggestions = async () => {
      if (activeQuery.type === 'dept') {
        const filtered = DEPARTMENTS
          .filter(d => d.toLowerCase().includes(activeQuery.text.toLowerCase()))
          .map(d => ({ id: d, handle: d, displayName: d, type: 'dept' as const }));
        
        if (!cancelled) {
          setSuggestions(filtered);
          setSelectedIndex(0);
          setDropdownVisible(filtered.length > 0);
        }
      } else {
        try {
          const token = localStorage.getItem('atl_jwt_token');
          const res = await fetch(`${API_URL}/api/community/users/search?q=${encodeURIComponent(activeQuery.text)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (!cancelled && data.success && data.users) {
            const mapped = data.users.map((u: any) => ({ 
              id: u.id, 
              handle: u.name.replace(/\s+/g, ''), 
              displayName: u.name,
              type: 'user' as const 
            }));
            setSuggestions(mapped);
            setSelectedIndex(0);
            setDropdownVisible(mapped.length > 0);
          }
        } catch (err) {
          console.error('Mention search failed:', err);
          if (!cancelled) {
            setDropdownVisible(false);
          }
        }
      }
    };
    
    const delay = activeQuery.type === 'dept' || activeQuery.text === '' ? 0 : 200;
    const timer = setTimeout(fetchSuggestions, delay);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeQueryKey]);

  const insertSuggestion = (suggestion: { handle: string, type: string }) => {
    if (!activeQuery || !textareaRef.current) return;
    
    const prefix = suggestion.type === 'user' ? '@' : '#';
    const replacement = `${prefix}${suggestion.handle} `;
    
    const before = value.substring(0, activeQuery.startIndex);
    const after = value.substring(textareaRef.current.selectionStart);
    
    const newValue = before + replacement + after;
    
    onChange({ target: { value: newValue } } as React.ChangeEvent<HTMLTextAreaElement>);
    
    setActiveQuery(null);
    setDropdownVisible(false);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPos = activeQuery.startIndex + replacement.length;
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (dropdownVisible && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertSuggestion(suggestions[selectedIndex]);
      } else if (e.key === 'Escape') {
        setDropdownVisible(false);
      }
    }
    
    if (onKeyDown) onKeyDown(e);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <textarea
        {...rest}
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          onChange(e);
          handleSelect(e);
        }}
        onSelect={handleSelect}
        onKeyDown={handleKeyDown}
        className={className}
      />
      
      {dropdownVisible && suggestions.length > 0 && (
        <div className="mentions-dropdown">
          {suggestions.map((s, idx) => (
            <div 
              key={s.id} 
              className={`mention-item ${idx === selectedIndex ? 'selected' : ''}`}
              onClick={() => insertSuggestion(s)}
              onMouseEnter={() => setSelectedIndex(idx)}
            >
              <span className="mention-item-prefix">{s.type === 'user' ? '@' : '#'}</span>
              {s.displayName}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
