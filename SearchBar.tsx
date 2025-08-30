/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onRandom: () => void;
  isLoading: boolean;
  onToggleTheme: () => void;
  theme: string;
  language: string;
  languages: string[];
  onLanguageChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  translations: { [key: string]: string };
  onClearApiKey: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  onRandom, 
  isLoading, 
  onToggleTheme, 
  theme,
  language,
  languages,
  onLanguageChange,
  translations,
  onClearApiKey
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
      setQuery(''); // Clear the input field after search
    }
  };

  return (
    <div className="search-container">
      <div className="top-controls">
        <select 
          className="language-selector"
          value={language}
          onChange={onLanguageChange}
          disabled={isLoading}
          aria-label="Select language"
        >
          {languages.map(lang => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
        <div className="top-right-controls">
          <button onClick={onClearApiKey} className="api-key-button" aria-label="Change API Key">
            🔑
          </button>
          <button onClick={onToggleTheme} className="theme-toggle-button" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="search-form" role="search">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={translations.searchPlaceholder}
          className="search-input"
          aria-label="Search for a topic"
          disabled={isLoading}
        />
      </form>
      <button onClick={onRandom} className="random-button" disabled={isLoading}>
        {translations.randomButton}
      </button>
    </div>
  );
};

export default SearchBar;