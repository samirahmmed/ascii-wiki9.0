/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useCallback } from 'react';
import { streamDefinition, generateAsciiArt, AsciiArtData } from './services/geminiService.ts';
import ContentDisplay from './components/ContentDisplay.tsx';
import SearchBar from './components/SearchBar.tsx';
import LoadingSkeleton from './components/LoadingSkeleton.tsx';
import AsciiArtDisplay from './components/AsciiArtDisplay.tsx';
import ApiKeyManager from './components/ApiKeyManager.tsx';

// A curated list of "banger" words and phrases for the random button.
const PREDEFINED_WORDS = [
  // List 1
  'Balance', 'Harmony', 'Discord', 'Unity', 'Fragmentation', 'Clarity', 'Ambiguity', 'Presence', 'Absence', 'Creation', 'Destruction', 'Light', 'Shadow', 'Beginning', 'Ending', 'Rising', 'Falling', 'Connection', 'Isolation', 'Hope', 'Despair',
  // Complex phrases from List 1
  'Order and chaos', 'Light and shadow', 'Sound and silence', 'Form and formlessness', 'Being and nonbeing', 'Presence and absence', 'Motion and stillness', 'Unity and multiplicity', 'Finite and infinite', 'Sacred and profane', 'Memory and forgetting', 'Question and answer', 'Search and discovery', 'Journey and destination', 'Dream and reality', 'Time and eternity', 'Self and other', 'Known and unknown', 'Spoken and unspoken', 'Visible and invisible',
  // List 2
  'Zigzag', 'Waves', 'Spiral', 'Bounce', 'Slant', 'Drip', 'Stretch', 'Squeeze', 'Float', 'Fall', 'Spin', 'Melt', 'Rise', 'Twist', 'Explode', 'Stack', 'Mirror', 'Echo', 'Vibrate',
  // List 3
  'Gravity', 'Friction', 'Momentum', 'Inertia', 'Turbulence', 'Pressure', 'Tension', 'Oscillate', 'Fractal', 'Quantum', 'Entropy', 'Vortex', 'Resonance', 'Equilibrium', 'Centrifuge', 'Elastic', 'Viscous', 'Refract', 'Diffuse', 'Cascade', 'Levitate', 'Magnetize', 'Polarize', 'Accelerate', 'Compress', 'Undulate',
  // List 4
  'Liminal', 'Ephemeral', 'Paradox', 'Zeitgeist', 'Metamorphosis', 'Synesthesia', 'Recursion', 'Emergence', 'Dialectic', 'Apophenia', 'Limbo', 'Flux', 'Sublime', 'Uncanny', 'Palimpsest', 'Chimera', 'Void', 'Transcend', 'Ineffable', 'Qualia', 'Gestalt', 'Simulacra', 'Abyssal',
  // List 5
  'Existential', 'Nihilism', 'Solipsism', 'Phenomenology', 'Hermeneutics', 'Deconstruction', 'Postmodern', 'Absurdism', 'Catharsis', 'Epiphany', 'Melancholy', 'Nostalgia', 'Longing', 'Reverie', 'Pathos', 'Ethos', 'Logos', 'Mythos', 'Anamnesis', 'Intertextuality', 'Metafiction', 'Stream', 'Lacuna', 'Caesura', 'Enjambment'
];
const UNIQUE_WORDS = [...new Set(PREDEFINED_WORDS)];

/**
 * Creates a simple ASCII art bounding box as a fallback.
 * @param topic The text to display inside the box.
 * @returns An AsciiArtData object with the generated art.
 */
const createFallbackArt = (topic: string): AsciiArtData => {
  const displayableTopic = topic.length > 20 ? topic.substring(0, 17) + '...' : topic;
  const paddedTopic = ` ${displayableTopic} `;
  const topBorder = `┌${'─'.repeat(paddedTopic.length)}┐`;
  const middle = `│${paddedTopic}│`;
  const bottomBorder = `└${'─'.repeat(paddedTopic.length)}┘`;
  return {
    art: `${topBorder}\n${middle}\n${bottomBorder}`
  };
};

const LANGUAGES = ['Afrikaans', 'Albanian', 'Amharic', 'Arabic', 'Armenian', 'Azerbaijani', 'Basque', 'Belarusian', 'Bengali', 'Bosnian', 'Bulgarian', 'Catalan', 'Cebuano', 'Chichewa', 'Chinese (Simplified)', 'Chinese (Traditional)', 'Corsican', 'Croatian', 'Czech', 'Danish', 'Dutch', 'English', 'Esperanto', 'Estonian', 'Filipino', 'Finnish', 'French', 'Frisian', 'Galician', 'Georgian', 'German', 'Greek', 'Gujarati', 'Haitian Creole', 'Hausa', 'Hawaiian', 'Hebrew', 'Hindi', 'Hmong', 'Hungarian', 'Icelandic', 'Igbo', 'Indonesian', 'Irish', 'Italian', 'Japanese', 'Javanese', 'Kannada', 'Kazakh', 'Khmer', 'Kinyarwanda', 'Korean', 'Kurdish (Kurmanji)', 'Kyrgyz', 'Lao', 'Latin', 'Latvian', 'Lithuanian', 'Luxembourgish', 'Macedonian', 'Malagasy', 'Malay', 'Malayalam', 'Maltese', 'Maori', 'Marathi', 'Mongolian', 'Myanmar (Burmese)', 'Nepali', 'Norwegian', 'Odia (Oriya)', 'Pashto', 'Persian', 'Polish', 'Portuguese', 'Punjabi', 'Romanian', 'Russian', 'Samoan', 'Scots Gaelic', 'Serbian', 'Sesotho', 'Shona', 'Sindhi', 'Sinhala', 'Slovak', 'Slovenian', 'Somali', 'Spanish', 'Sundanese', 'Swahili', 'Swedish', 'Tajik', 'Tamil', 'Tatar', 'Telugu', 'Thai', 'Turkish', 'Turkmen', 'Ukrainian', 'Urdu', 'Uyghur', 'Uzbek', 'Vietnamese', 'Welsh', 'Xhosa', 'Yiddish', 'Yoruba', 'Zulu'];

const TRANSLATIONS: { [key: string]: any } = {
  English: {
    title: 'ASCII WIKI',
    searchPlaceholder: 'Search',
    randomButton: 'Random',
    copyButton: 'Copy',
    copiedButton: 'Copied!',
    failedButton: 'Failed',
    copyArtButton: 'Copy Art',
    errorTitle: 'An Error Occurred',
    noContent: 'Content could not be generated.',
  },
  Español: {
    title: 'ASCII WIKI',
    searchPlaceholder: 'Buscar',
    randomButton: 'Aleatorio',
    copyButton: 'Copiar',
    copiedButton: '¡Copiado!',
    failedButton: 'Fallido',
    copyArtButton: 'Copiar Arte',
    errorTitle: 'Ocurrió un Error',
    noContent: 'No se pudo generar el contenido.',
  },
  Français: {
    title: 'WIKI ASCII',
    searchPlaceholder: 'Rechercher',
    randomButton: 'Aléatoire',
    copyButton: 'Copier',
    copiedButton: 'Copié !',
    failedButton: 'Échec',
    copyArtButton: 'Copier l\'Art',
    errorTitle: 'Une Erreur est Survenue',
    noContent: 'Le contenu n\'a pas pu être généré.',
  },
  Deutsch: {
    title: 'ASCII WIKI',
    searchPlaceholder: 'Suchen',
    randomButton: 'Zufällig',
    copyButton: 'Kopieren',
    copiedButton: 'Kopiert!',
    failedButton: 'Fehlgeschlagen',
    copyArtButton: 'Kunst kopieren',
    errorTitle: 'Ein Fehler ist aufgetreten',
    noContent: 'Inhalt konnte nicht generiert werden.',
  },
  日本語: {
    title: 'アスキーウィキ',
    searchPlaceholder: '検索',
    randomButton: 'ランダム',
    copyButton: 'コピー',
    copiedButton: 'コピーしました！',
    failedButton: '失敗しました',
    copyArtButton: 'アートをコピー',
    errorTitle: 'エラーが発生しました',
    noContent: 'コンテンツを生成できませんでした。',
  },
  Русский: {
    title: 'АСКИИ ВИКИ',
    searchPlaceholder: 'Поиск',
    randomButton: 'Случайно',
    copyButton: 'Копировать',
    copiedButton: 'Скопировано!',
    failedButton: 'Ошибка',
    copyArtButton: 'Копировать арт',
    errorTitle: 'Произошла ошибка',
    noContent: 'Не удалось сгенерировать содержимое.',
  },
  العربية: {
    title: 'أسكي ويكي',
    searchPlaceholder: 'بحث',
    randomButton: 'عشوائي',
    copyButton: 'نسخ',
    copiedButton: 'تم النسخ!',
    failedButton: 'فشل',
    copyArtButton: 'نسخ الفن',
    errorTitle: 'حدث خطأ',
    noContent: 'تعذر إنشاء المحتوى.',
  },
  বাংলা: {
    title: 'অ্যাস্কি উইকি',
    searchPlaceholder: 'অনুসন্ধান',
    randomButton: 'এলোমেলো',
    copyButton: 'অনুলিপি',
    copiedButton: 'অনুলিপি হয়েছে!',
    failedButton: 'ব্যর্থ হয়েছে',
    copyArtButton: 'আর্ট অনুলিপি করুন',
    errorTitle: 'একটি ত্রুটি ঘটেছে',
    noContent: 'বিষয়বস্তু তৈরি করা যায়নি।',
  },
  हिन्दी: {
    title: 'आस्की विकी',
    searchPlaceholder: 'खोजें',
    randomButton: 'यादृच्छिक',
    copyButton: 'कॉपी करें',
    copiedButton: 'कॉपी किया गया!',
    failedButton: 'विफल',
    copyArtButton: 'कला कॉपी करें',
    errorTitle: 'एक त्रुटि हुई',
    noContent: 'सामग्री उत्पन्न नहीं की जा सकी।',
  },
  Português: {
    title: 'WIKI ASCII',
    searchPlaceholder: 'Pesquisar',
    randomButton: 'Aleatório',
    copyButton: 'Copiar',
    copiedButton: 'Copiado!',
    failedButton: 'Falhou',
    copyArtButton: 'Copiar Arte',
    errorTitle: 'Ocorreu um Erro',
    noContent: 'Não foi possível gerar o conteúdo.',
  },
  'Chinese (Simplified)': {
    title: 'ASCII 百科',
    searchPlaceholder: '搜索',
    randomButton: '随机',
    copyButton: '复制',
    copiedButton: '已复制！',
    failedButton: '失败',
    copyArtButton: '复制艺术字',
    errorTitle: '发生错误',
    noContent: '无法生成内容。',
  },
};

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem('gemini-api-key'));
  const [topic, setTopic] = useState<string>('ASCII');
  const [content, setContent] = useState<string>('');
  const [asciiArt, setAsciiArt] = useState<AsciiArtData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [language, setLanguage] = useState('English');

  const translations = TRANSLATIONS[language] || TRANSLATIONS['English'];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleKeySubmit = (key: string) => {
    localStorage.setItem('gemini-api-key', key);
    setApiKey(key);
  };

  const handleClearKey = () => {
    localStorage.removeItem('gemini-api-key');
    setApiKey(null);
  };

  const handleSearch = useCallback(async (query: string) => {
    if (!apiKey) {
      console.error("Attempted to search without an API key.");
      setContent("Please configure your API key to use the app.");
      return;
    }
    setIsLoading(true);
    setIsStreaming(true);
    setTopic(query);
    setContent('');
    setAsciiArt(null);

    let accumulatedContent = '';
    let artResult: AsciiArtData | null = null;
    let contentError: Error | null = null;

    try {
      const artPromise = generateAsciiArt(query, language, apiKey).catch(err => {
        console.error("ASCII Art Generation Failed:", err);
        return createFallbackArt(query);
      });

      const stream = streamDefinition(query, language, apiKey);
      
      const artTask = async () => {
        artResult = await artPromise;
        if (!contentError) {
          setAsciiArt(artResult);
        }
      };
      
      const contentTask = async () => {
        try {
          for await (const chunk of stream) {
            accumulatedContent += chunk;
            setContent(accumulatedContent);
          }
        } catch(err) {
          contentError = err instanceof Error ? err : new Error(String(err));
          console.error("Content Streaming Failed:", contentError);
          const errorText = `${translations.errorTitle}: ${translations.noContent}`;
          setContent(errorText);
        }
      };

      await Promise.all([artTask(), contentTask()]);

    } catch (error) {
      console.error("An unexpected error occurred during search:", error);
      const errorText = `${translations.errorTitle}: ${translations.noContent}`;
      setContent(errorText);
      setAsciiArt(createFallbackArt(query));
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [language, translations, apiKey]);

  const handleRandom = useCallback(async () => {
    const randomWord = UNIQUE_WORDS[Math.floor(Math.random() * UNIQUE_WORDS.length)];
    handleSearch(randomWord);
  }, [handleSearch]);

  useEffect(() => {
    if (apiKey) {
      handleSearch('Wiki');
    }
  }, [apiKey, handleSearch]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value);
  };
  
  if (!apiKey) {
    return <ApiKeyManager onKeySubmit={handleKeySubmit} />;
  }
  
  return (
    <div>
      <header>
        <h1>{translations.title}</h1>
      </header>
      <main>
        <SearchBar 
          onSearch={handleSearch}
          onRandom={handleRandom}
          isLoading={isLoading}
          onToggleTheme={toggleTheme}
          theme={theme}
          language={language}
          languages={LANGUAGES}
          onLanguageChange={handleLanguageChange}
          translations={translations}
          onClearApiKey={handleClearKey}
        />
        <AsciiArtDisplay artData={asciiArt} topic={topic} copyArtText={translations.copyArtButton} copiedText={translations.copiedButton} failedText={translations.failedButton} />
        <div className="content-section">
          {isLoading && !content && <LoadingSkeleton />}
          <ContentDisplay 
            content={content} 
            isLoading={isStreaming} 
            onWordClick={handleSearch} 
          />
        </div>
      </main>
      <footer className="sticky-footer">
        <p className="footer-text"></p>
      </footer>
    </div>
  );
};

export default App;