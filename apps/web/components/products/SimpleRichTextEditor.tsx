import { useCallback, useEffect, useRef } from 'react';

interface SimpleRichTextEditorProps {
  id?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function SimpleRichTextEditor({
  id,
  value,
  onChange,
  placeholder = 'Write a description…',
  minHeight = 160,
}: SimpleRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    const el = editorRef.current;
    if (!el || isInternalChange.current) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || '';
    }
  }, [value]);

  const exec = useCallback((command: string, valueArg?: string) => {
    document.execCommand(command, false, valueArg);
    editorRef.current?.focus();
  }, []);

  const handleInput = () => {
    const html = editorRef.current?.innerHTML ?? '';
    isInternalChange.current = true;
    onChange(html);
    requestAnimationFrame(() => {
      isInternalChange.current = false;
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        <button type="button" className="ios-btn-secondary text-xs px-2 py-1" onClick={() => exec('bold')}>
          Bold
        </button>
        <button type="button" className="ios-btn-secondary text-xs px-2 py-1" onClick={() => exec('italic')}>
          Italic
        </button>
        <button type="button" className="ios-btn-secondary text-xs px-2 py-1" onClick={() => exec('insertUnorderedList')}>
          List
        </button>
        <button type="button" className="ios-btn-secondary text-xs px-2 py-1" onClick={() => exec('formatBlock', 'h3')}>
          Heading
        </button>
        <button type="button" className="ios-btn-secondary text-xs px-2 py-1" onClick={() => exec('removeFormat')}>
          Clear
        </button>
      </div>
      <div
        id={id}
        ref={editorRef}
        role="textbox"
        aria-multiline="true"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        className="ios-input min-h-[120px] prose prose-sm max-w-none focus:outline-none"
        style={{ minHeight }}
        onInput={handleInput}
      />
    </div>
  );
}
