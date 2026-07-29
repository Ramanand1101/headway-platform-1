'use client';
import { useId, useState } from 'react';

// Chip-style multi-value input — replaces raw "comma separated" text fields
// with an actual add/remove UI. Optional `suggestions` renders as a
// datalist so values already used elsewhere (e.g. service card titles) are
// one click away instead of retyped.
export default function TagInput({ value = [], onChange, placeholder = '', suggestions = [], className = '' }) {
  const [draft, setDraft] = useState('');
  const listId = useId();

  function addTag(raw) {
    const tag = raw.trim();
    if (!tag || value.includes(tag)) {
      setDraft('');
      return;
    }
    onChange([...value, tag]);
    setDraft('');
  }

  function removeTag(tag) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === 'Backspace' && !draft && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 focus-within:border-ia-blue focus-within:ring-2 focus-within:ring-ia-blue/40 ${className}`}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1.5 rounded-full bg-ia-gold-tint/40 px-3 py-1 text-xs font-bold text-ia-navy"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="text-ia-navy/40 hover:text-red-500"
            aria-label={`Remove ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        list={suggestions.length ? listId : undefined}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(draft)}
        placeholder={value.length ? 'Add another...' : placeholder}
        className="min-w-[8rem] flex-1 bg-transparent text-sm outline-none"
      />
      {suggestions.length > 0 && (
        <datalist id={listId}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
    </div>
  );
}
