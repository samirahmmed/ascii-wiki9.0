/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useCallback } from 'react';
import type { AsciiArtData } from '../services/geminiService.ts';

type CopyState = 'default' | 'copied' | 'failed';

interface AsciiArtDisplayProps {
  artData: AsciiArtData | null;
  topic: string;
  copyArtText: string;
  copiedText: string;
  failedText: string;
}

const AsciiArtDisplay: React.FC<AsciiArtDisplayProps> = ({ artData, topic, copyArtText, copiedText, failedText }) => {
  const [visibleContent, setVisibleContent] = useState<string>('*'); // Start with placeholder
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [copyState, setCopyState] = useState<CopyState>('default');

  // Effect for the streaming "typing" animation
  useEffect(() => {
    let intervalId: number;

    if (artData) {
      setVisibleContent(''); // Clear the initial '*' placeholder
      setIsStreaming(true);
      setCopyState('default'); // Reset copy button state on new art

      // Conditionally construct the full text based on whether text data exists.
      const fullText = artData.text ? `${artData.art}\n\n${artData.text}` : artData.art;
      let currentIndex = 0;
      
      intervalId = window.setInterval(() => {
        const char = fullText[currentIndex];
        if (char !== undefined) { // Check if character exists
          setVisibleContent(prev => prev + char);
          currentIndex++;
        } else {
          // Once we're out of characters, stop the interval and cursor.
          window.clearInterval(intervalId);
          setIsStreaming(false);
        }
      }, 5); // A 5ms delay creates a fast, smooth "typing" effect.

    } else {
      // If artData is null (e.g., on a new search), reset to the placeholder.
      setVisibleContent('*');
      setIsStreaming(false);
    }
    
    // The cleanup function is crucial to prevent memory leaks.
    return () => window.clearInterval(intervalId);
  }, [artData]); // This effect re-runs whenever the artData prop changes.

  // Effect to reset copy button state if language changes
  useEffect(() => {
    setCopyState('default');
  }, [copyArtText]);

  const handleCopy = useCallback(() => {
    if (artData?.art) {
      navigator.clipboard.writeText(artData.art).then(() => {
        setCopyState('copied');
        setTimeout(() => setCopyState('default'), 2000);
      }, () => {
        setCopyState('failed');
        setTimeout(() => setCopyState('default'), 2000);
      });
    }
  }, [artData]);

  const copyButtonText = {
    default: copyArtText,
    copied: copiedText,
    failed: failedText,
  }[copyState];
  
  const accessibilityLabel = `ASCII art for ${topic}`;

  return (
    <div className="ascii-art-container">
      <pre className="ascii-art" aria-label={accessibilityLabel}>
        {visibleContent}
        {isStreaming && <span className="blinking-cursor">|</span>}
      </pre>
      {artData && !isStreaming && (
        <button 
          onClick={handleCopy} 
          className="copy-art-button"
          aria-label="Copy ASCII art to clipboard"
        >
          {copyButtonText}
        </button>
      )}
    </div>
  );
};

export default AsciiArtDisplay;