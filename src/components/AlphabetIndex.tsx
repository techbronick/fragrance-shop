import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("shop");
  const handleClick = useCallback((letter: string, isAvailable: boolean) => {
    if (!isAvailable) return;
    onLetterClick(letter);
  }, [onLetterClick]);

  return (
    <nav
      className="alphabet-index"
      aria-label={t("brands.alphabetNavAriaLabel")}
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
                  ? t("brands.jumpToSection", { letter: letter === '#' ? 'simboluri' : letter })
                  : t("brands.noSection", { letter: letter === '#' ? 'simboluri' : letter })
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