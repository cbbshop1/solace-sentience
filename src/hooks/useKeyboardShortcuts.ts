import { useEffect, useCallback } from 'react';

interface ShortcutHandlers {
  onNewThread?: () => void;
  onExport?: () => void;
  onSearch?: () => void;
  onToggleSidebar?: () => void;
}

export const useKeyboardShortcuts = ({
  onNewThread,
  onExport,
  onSearch,
  onToggleSidebar,
}: ShortcutHandlers) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        // Allow Escape to blur the input
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      if (modKey && e.key === 'n') {
        e.preventDefault();
        onNewThread?.();
      } else if (modKey && e.key === 'e') {
        e.preventDefault();
        onExport?.();
      } else if (modKey && e.key === 'k') {
        e.preventDefault();
        onSearch?.();
      } else if (modKey && e.key === 'b') {
        e.preventDefault();
        onToggleSidebar?.();
      }
    },
    [onNewThread, onExport, onSearch, onToggleSidebar]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
