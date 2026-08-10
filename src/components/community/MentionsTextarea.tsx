import React, { useState, useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';

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

export const MentionsTextarea: React.FC<MentionsTextareaProps> = ({ value, onChange, className, ...props }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [dropdownVisible, setDropdownVisible] = useState(false);
  
  const [suggestions, setSuggestions] = useState<{ id: string; label: string; type: 'user' | 'dept' }[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeQuery, setActiveQuery] = useState<{ text: string; startIndex: number; type: 'user' | 'dept' } | null>(null);

  // Parse text at cursor to detect @ or #
  const handleSelect = (e: any) => {
    const el = e.target;
    const cursorPosition = el.selectionStart;
    
    // Find the word currently being typed
    const textBeforeCursor = el.value.substring(0, cursorPosition);
    
    // Regex matches the last word if it starts with @ or # (allowing spaces for full names)
    const match = textBeforeCursor.match(/([@#])([a-zA-Z0-9_ ]{0,30})$/);
    
    if (match) {
      const type = match[1] === '@' ? 'user' : 'dept';
      const query = match[2];
      const startIndex = match.index || 0;
      setActiveQuery({ text: query, startIndex, type });
      
      // Basic positioning logic: we will just show it near the bottom of the textarea wrapper
      setDropdownPosition({ top: 100, left: 0 }); 
    } else {
      setActiveQuery(null);
      setDropdownVisible(false);
    }
  };

  // Serialize activeQuery to a string so useEffect always triggers correctly
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
          .map(d => ({ id: d, label: d, type: 'dept' as const }));
        
        if (!cancelled) {
          setSuggestions(filtered);
          setSelectedIndex(0);
          setDropdownVisible(filtered.length > 0);
        }
      } else {
        // Fetch users
        try {
          const token = localStorage.getItem('atl_jwt_token');
          const res = await fetch(`${API_URL}/api/community/users/search?q=${encodeURIComponent(activeQuery.text)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (!cancelled && data.success && data.users) {
            const mapped = data.users.map((u: any) => ({ id: u.id, label: u.name.replace(/\s+/g, ''), type: 'user' as const }));
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
    
    // No debounce for empty query (just '@' typed) — show users immediately
    // Debounce slightly when user is actively typing a name
    const delay = activeQuery.type === 'dept' || activeQuery.text === '' ? 0 : 200;
    const timer = setTimeout(fetchSuggestions, delay);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeQueryKey]);

  const insertSuggestion = (suggestion: { label: string, type: string }) => {
    if (!activeQuery || !textareaRef.current) return;
    
    const prefix = suggestion.type === 'user' ? '@' : '#';
    const replacement = `${prefix}${suggestion.label} `;
    
    const before = value.substring(0, activeQuery.startIndex);
    const after = value.substring(textareaRef.current.selectionStart);
    
    const newValue = before + replacement + after;
    
    // Create a synthetic event to call onChange
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
    nativeInputValueSetter?.call(textareaRef.current, newValue);
    
    const event = new Event('input', { bubbles: true });
    textareaRef.current.dispatchEvent(event);
    
    // We manually call onChange just in case
    onChange({ target: { value: newValue } } as any);
    
    setActiveQuery(null);
    setDropdownVisible(false);
    
    // Restore focus and cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPos = activeQuery.startIndex + replacement.length;
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
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
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <textarea
        {...props}
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
              {s.type === 'user' ? '@' : '#'}{s.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
