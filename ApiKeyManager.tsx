/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';

interface ApiKeyManagerProps {
  onKeySubmit: (key: string) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onKeySubmit }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onKeySubmit(apiKey.trim());
    }
  };

  return (
    <div className="api-key-overlay">
      <div className="api-key-modal">
        <h2>Enter your Gemini API Key</h2>
        <p>
          To use this application, you need to provide your own Google Gemini API key.
          Your key will be saved securely in your browser's local storage.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            aria-label="Enter your Gemini API key"
            required
          />
          <button type="submit" className="modal-button">Save and Continue</button>
        </form>
        <p>
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
            Get your API key from Google AI Studio
          </a>
        </p>
      </div>
    </div>
  );
};

export default ApiKeyManager;
