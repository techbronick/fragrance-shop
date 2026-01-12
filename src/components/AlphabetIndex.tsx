import { useState, useCallback } from "react";

interface AlphabetIndexProps {
  availableLetters: Set<string>;
  onLetterClick: (letter: string) => void;
  activeLetter?: string | null;
}

const ALPHABET = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const AlphabetIndex = ({
  availableLetters,
  onLetterClick,
  activeLetter = null,
}: AlphabetIndexProps) => {
  const handleClick = useCallback((letter: string, isAvailable: boolean) => {
    if (!isAvailable) return;
    onLetterClick(letter);
  }, [onLetterClick]);

  return (
    <nav
      className="alphabet-index"
      aria-label="Navigare alfabetică"
      role="navigation"
    >
      <div className="alphabet-index-strip" role="list">
        {ALPHABET.map((letter) => {
          const isAvailable = availableLetters.has(letter);
          const isActive = activeLetter === letter;

          return (
            <button
              key={letter}
              type="button"
              role="listitem"
              onClick={() => handleClick(letter, isAvailable)}
              disabled={!isAvailable}
              aria-disabled={!isAvailable}
              aria-current={isActive ? "location" : undefined}
              data-letter={letter}
              className={`
                alphabet-index-letter
                ${isAvailable ? 'alphabet-index-letter--enabled' : 'alphabet-index-letter--disabled'}
                ${isActive ? 'alphabet-index-letter--active' : ''}
              `}
              aria-label={
                isAvailable 
                  ? `Salt la secțiunea ${letter === '#' ? 'simboluri' : letter}` 
                  : `Niciun brand pentru ${letter === '#' ? 'simboluri' : letter}`
              }
            >
              {letter}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default AlphabetIndex;