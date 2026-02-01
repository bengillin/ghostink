"use client";

import { BeatControls } from "./BeatControls";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bpm: number;
  onBpmChange: (bpm: number) => void;
}

export function SettingsModal({ isOpen, onClose, bpm, onBpmChange }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-ghost-bg border border-ghost-border rounded-lg shadow-xl w-full max-w-md mx-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-ghost-border">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 text-ghost-muted hover:text-ghost-text rounded transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Beat Controls Section */}
          <div>
            <h3 className="text-sm font-medium text-ghost-muted uppercase tracking-wide mb-3">
              Beat & Tempo
            </h3>
            <div className="bg-ghost-surface rounded-lg p-4">
              <BeatControls initialBpm={bpm} onBpmChange={onBpmChange} />
            </div>
          </div>

          {/* Keyboard Shortcuts Reference */}
          <div>
            <h3 className="text-sm font-medium text-ghost-muted uppercase tracking-wide mb-3">
              Keyboard Shortcuts
            </h3>
            <div className="bg-ghost-surface rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ghost-muted">Complete line</span>
                <kbd className="kbd">⌘J</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-ghost-muted">Next line</span>
                <kbd className="kbd">⌘K</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-ghost-muted">Inspire</span>
                <kbd className="kbd">⌘⇧K</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-ghost-muted">Analyze</span>
                <kbd className="kbd">⌘⇧A</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-ghost-muted">Switch mask</span>
                <kbd className="kbd">⌘M</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-ghost-muted">Undo</span>
                <kbd className="kbd">⌘Z</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-ghost-muted">Redo</span>
                <kbd className="kbd">⌘⇧Z</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-ghost-muted">Settings</span>
                <kbd className="kbd">⌘,</kbd>
              </div>
            </div>
          </div>

          {/* Inline Commands Reference */}
          <div>
            <h3 className="text-sm font-medium text-ghost-muted uppercase tracking-wide mb-3">
              Inline Commands
            </h3>
            <div className="bg-ghost-surface rounded-lg p-4 space-y-2 text-sm">
              <p className="text-ghost-muted text-xs mb-3">
                Type these at the start of a line, then press Tab or Enter:
              </p>
              <div className="grid grid-cols-2 gap-2 text-ghost-muted">
                <code>/complete</code>
                <code>/next</code>
                <code>/inspire</code>
                <code>/analyze</code>
                <code>/transfer</code>
                <code>/cipher</code>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-ghost-border flex justify-end">
          <button
            onClick={onClose}
            className="btn btn-primary"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
