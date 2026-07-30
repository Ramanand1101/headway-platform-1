'use client';
import { useEffect, useRef } from 'react';

function ToolbarButton({ onClick, title, children, wide }) {
  return (
    <button
      type="button"
      title={title}
      // Prevents the contentEditable area from losing focus/selection
      // before the click's command runs.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`grid ${wide ? 'w-auto px-2' : 'w-8'} h-8 flex-none place-items-center rounded text-sm font-bold text-gray-700 hover:bg-gray-200`}
    >
      {children}
    </button>
  );
}

// Lightweight WYSIWYG editor — no new dependency, uses the browser's
// contentEditable + execCommand (still broadly supported in Chrome/Edge,
// which is what this admin panel is used from). Stores/emits HTML.
export default function RichTextEditor({ value, onChange, onAddImage, placeholder }) {
  const ref = useRef(null);
  const lastEmitted = useRef(value);

  // Only pushes external `value` changes into the DOM when they didn't
  // originate from this editor's own typing, so the cursor never jumps.
  useEffect(() => {
    if (ref.current && value !== lastEmitted.current) {
      ref.current.innerHTML = value || '';
      lastEmitted.current = value;
    }
  }, [value]);

  function emit() {
    const html = ref.current.innerHTML;
    lastEmitted.current = html;
    onChange(html);
  }

  function exec(command, arg) {
    ref.current.focus();
    document.execCommand(command, false, arg);
    emit();
  }

  function handleLink() {
    const url = window.prompt('Link URL (https://...)');
    if (url) exec('createLink', url);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <div className="flex flex-wrap gap-0.5 border-b border-gray-200 bg-gray-50 p-1.5">
        <ToolbarButton title="Bold" onClick={() => exec('bold')}>
          B
        </ToolbarButton>
        <ToolbarButton title="Italic" onClick={() => exec('italic')}>
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton title="Bullet list" onClick={() => exec('insertUnorderedList')}>
          ≡
        </ToolbarButton>
        <ToolbarButton title="Numbered list" onClick={() => exec('insertOrderedList')}>
          1.
        </ToolbarButton>
        <ToolbarButton title="Quote" onClick={() => exec('formatBlock', 'blockquote')}>
          &ldquo;
        </ToolbarButton>
        <ToolbarButton title="Align left" onClick={() => exec('justifyLeft')}>
          ⯇
        </ToolbarButton>
        <ToolbarButton title="Align center" onClick={() => exec('justifyCenter')}>
          ▤
        </ToolbarButton>
        <ToolbarButton title="Align right" onClick={() => exec('justifyRight')}>
          ⯈
        </ToolbarButton>
        <ToolbarButton title="Link" onClick={handleLink}>
          🔗
        </ToolbarButton>
        {onAddImage && (
          <ToolbarButton title="Add media" onClick={onAddImage} wide>
            🖼 Add Media
          </ToolbarButton>
        )}
        <ToolbarButton title="Clear formatting" onClick={() => exec('removeFormat')}>
          ✕
        </ToolbarButton>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        data-placeholder={placeholder}
        className="rte-content min-h-[260px] p-4 text-sm leading-relaxed text-gray-900 outline-none"
      />
    </div>
  );
}
