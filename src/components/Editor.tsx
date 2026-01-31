"use client";

import { useState, useRef, useCallback, KeyboardEvent, useEffect, ChangeEvent } from "react";
import { Chronicle } from "@/lib/chronicle";
import { analyzeRhymeScheme } from "@/lib/rhyme";

interface EditorProps {
  content: string[];
  onChange: (content: string[]) => void;
  onWordSelect: (word: string) => void;
  chronicle: Chronicle;
}

export function Editor({ content, onChange, onWordSelect, chronicle }: EditorProps) {
  const [cursorLine, setCursorLine] = useState(0);
  const [rhymeScheme, setRhymeScheme] = useState<string[]>([]);
  const inputRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  // Analyze rhyme scheme when content changes
  useEffect(() => {
    const scheme = analyzeRhymeScheme(content);
    setRhymeScheme(scheme);
  }, [content]);

  const handleChange = useCallback(
    (lineIndex: number, e: ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;

      // Check for newline (user pressed enter in the middle of text)
      if (newText.includes('\n')) {
        const parts = newText.split('\n');
        const newContent = [...content];
        newContent.splice(lineIndex, 1, ...parts);
        onChange(newContent);

        // Move cursor to the new line
        setTimeout(() => {
          const newLineIndex = lineIndex + 1;
          inputRefs.current[newLineIndex]?.focus();
        }, 0);
        return;
      }

      const newContent = [...content];
      const oldText = newContent[lineIndex] || "";

      // Track the edit in chronicle
      if (newText !== oldText) {
        chronicle.replace(
          {
            start: { line: lineIndex, character: 0 },
            end: { line: lineIndex, character: oldText.length },
          },
          newText
        );
      }

      newContent[lineIndex] = newText;
      onChange(newContent);
    },
    [content, onChange, chronicle]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>, lineIndex: number) => {
      const target = e.currentTarget;
      const cursorPos = target.selectionStart;

      if (e.key === "Enter") {
        e.preventDefault();

        // Split line at cursor position
        const currentText = content[lineIndex] || "";
        const beforeCursor = currentText.slice(0, cursorPos);
        const afterCursor = currentText.slice(cursorPos);

        const newContent = [...content];
        newContent[lineIndex] = beforeCursor;
        newContent.splice(lineIndex + 1, 0, afterCursor);
        onChange(newContent);

        // Move cursor to new line
        setTimeout(() => {
          const newLine = inputRefs.current[lineIndex + 1];
          if (newLine) {
            newLine.focus();
            newLine.setSelectionRange(0, 0);
          }
        }, 0);
      } else if (e.key === "Backspace" && cursorPos === 0 && lineIndex > 0) {
        e.preventDefault();

        // Merge with previous line
        const prevLineText = content[lineIndex - 1] || "";
        const currentText = content[lineIndex] || "";
        const mergedText = prevLineText + currentText;

        const newContent = [...content];
        newContent[lineIndex - 1] = mergedText;
        newContent.splice(lineIndex, 1);
        onChange(newContent);

        // Move cursor to merge point
        setTimeout(() => {
          const prevLine = inputRefs.current[lineIndex - 1];
          if (prevLine) {
            prevLine.focus();
            prevLine.setSelectionRange(prevLineText.length, prevLineText.length);
          }
        }, 0);
      } else if (e.key === "ArrowUp" && lineIndex > 0) {
        e.preventDefault();
        const prevLine = inputRefs.current[lineIndex - 1];
        if (prevLine) {
          prevLine.focus();
          const pos = Math.min(cursorPos, prevLine.value.length);
          prevLine.setSelectionRange(pos, pos);
        }
      } else if (e.key === "ArrowDown" && lineIndex < content.length - 1) {
        e.preventDefault();
        const nextLine = inputRefs.current[lineIndex + 1];
        if (nextLine) {
          nextLine.focus();
          const pos = Math.min(cursorPos, nextLine.value.length);
          nextLine.setSelectionRange(pos, pos);
        }
      }
    },
    [content, onChange]
  );

  const handleSelect = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;

    if (start !== end) {
      const selectedText = target.value.slice(start, end).trim().toLowerCase().replace(/[^a-z]/g, "");
      if (selectedText) {
        onWordSelect(selectedText);
      }
    }
  }, [onWordSelect]);

  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    // Browser auto-selects word on double-click, grab it after a tick
    setTimeout(() => {
      const start = target.selectionStart;
      const end = target.selectionEnd;
      if (start !== end) {
        const selectedText = target.value.slice(start, end).trim().toLowerCase().replace(/[^a-z]/g, "");
        if (selectedText) {
          onWordSelect(selectedText);
        }
      }
    }, 0);
  }, [onWordSelect]);

  const handleFocus = useCallback((lineIndex: number) => {
    setCursorLine(lineIndex);
  }, []);

  // Rhyme scheme colors (text and background)
  const RHYME_COLORS: Record<string, { text: string; bg: string; border: string }> = {
    A: { text: "text-red-400", bg: "bg-red-500/10", border: "border-l-red-500" },
    B: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-l-blue-500" },
    C: { text: "text-green-400", bg: "bg-green-500/10", border: "border-l-green-500" },
    D: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-l-orange-500" },
    E: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-l-purple-500" },
    F: { text: "text-pink-400", bg: "bg-pink-500/10", border: "border-l-pink-500" },
    G: { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-l-yellow-500" },
    H: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-l-cyan-500" },
  };

  const getSchemeColors = (scheme: string) => {
    return RHYME_COLORS[scheme] || { text: "text-ghost-muted", bg: "", border: "" };
  };

  // Get the last word of a line for display
  const getLastWord = (line: string) => {
    const words = line.trim().split(/\s+/);
    return words[words.length - 1] || "";
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-3xl mx-auto">
        {content.map((line, index) => {
          const scheme = rhymeScheme[index];
          const hasRhyme = scheme && scheme !== "-" && scheme !== "?";
          const colors = hasRhyme ? getSchemeColors(scheme) : null;
          const lastWord = hasRhyme ? getLastWord(line) : "";

          return (
          <div
            key={index}
            className={`flex items-start gap-2 group rounded-r ${
              cursorLine === index ? "bg-ghost-surface/50" : ""
            } ${colors?.bg || ""} ${hasRhyme ? `border-l-2 ${colors?.border}` : "border-l-2 border-l-transparent"} pl-2 -ml-2`}
          >
            {/* Line number and rhyme indicator */}
            <div className="editor-line-number pt-2 flex items-center gap-1.5 select-none min-w-[52px]">
              <span className="w-5 text-right">{index + 1}</span>
              {hasRhyme && (
                <span className={`text-xs font-bold w-4 ${colors?.text}`}>
                  {scheme}
                </span>
              )}
            </div>

            {/* Line content */}
            <textarea
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              value={line}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onSelect={handleSelect}
              onFocus={() => handleFocus(index)}
              onDoubleClick={handleDoubleClick}
              placeholder={index === 0 && !line ? "Start writing..." : ""}
              rows={1}
              className="editor-line flex-1 bg-transparent outline-none resize-none min-h-[28px] placeholder:text-ghost-muted/50"
              style={{
                height: 'auto',
                overflow: 'hidden',
              }}
              onInput={(e) => {
                // Auto-resize textarea
                const target = e.currentTarget;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
            />

            {/* Rhyme word indicator */}
            {hasRhyme && lastWord && (
              <div className={`pt-2 text-xs ${colors?.text} opacity-60 select-none hidden sm:block`}>
                {lastWord}
              </div>
            )}
          </div>
        );
        })}

        {/* Add line button */}
        <button
          onClick={() => {
            const newContent = [...content, ""];
            onChange(newContent);
            setTimeout(() => {
              inputRefs.current[newContent.length - 1]?.focus();
            }, 0);
          }}
          className="mt-4 text-ghost-muted hover:text-ghost-text text-sm opacity-50 hover:opacity-100 transition-opacity"
        >
          + Add line
        </button>
      </div>
    </div>
  );
}
