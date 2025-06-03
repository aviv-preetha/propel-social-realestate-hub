
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/hooks/useProfile';

interface UserMentionProps {
  value: string;
  onChange: (value: string) => void;
  onTagUser: (userId: string) => void;
  placeholder?: string;
  className?: string;
}

const UserMention: React.FC<UserMentionProps> = ({
  value,
  onChange,
  onTagUser,
  placeholder,
  className = '',
}) => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionQuery, setMentionQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (mentionQuery.length > 0) {
      fetchUsers(mentionQuery);
    } else {
      setUsers([]);
      setShowSuggestions(false);
    }
  }, [mentionQuery]);

  const fetchUsers = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(5);

      if (error) throw error;
      
      if (data) {
        // Ensure badge is properly typed
        const profilesData: Profile[] = data.map(profile => ({
          ...profile,
          badge: profile.badge as 'owner' | 'seeker' | 'business'
        }));
        setUsers(profilesData);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newCursorPosition = e.target.selectionStart;
    
    onChange(newValue);
    setCursorPosition(newCursorPosition);

    // Check for @ mentions
    const beforeCursor = newValue.substring(0, newCursorPosition);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
    } else {
      setMentionQuery('');
      setShowSuggestions(false);
    }
  };

  const selectUser = (user: Profile) => {
    const beforeCursor = value.substring(0, cursorPosition);
    const afterCursor = value.substring(cursorPosition);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const mentionStart = beforeCursor.length - mentionMatch[0].length;
      const newValue = 
        value.substring(0, mentionStart) + 
        `@${user.name} ` + 
        afterCursor;
      
      onChange(newValue);
      onTagUser(user.user_id);
      setShowSuggestions(false);
      setMentionQuery('');
      
      // Focus back to textarea
      setTimeout(() => {
        textareaRef.current?.focus();
        const newCursorPos = mentionStart + user.name.length + 2;
        textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        placeholder={placeholder}
        className={className}
        rows={3}
      />
      
      {showSuggestions && users.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => selectUser(user)}
              className="w-full p-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
            >
              <img
                src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.location}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserMention;
