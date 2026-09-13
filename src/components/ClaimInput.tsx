import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';
import { EXAMPLE_CLAIMS } from '../lib/api';

interface ClaimInputProps {
  value: string;
  onChange: (text: string) => void;
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

const MAX_CHARS = 1000;

export function ClaimInput({ value, onChange, onSubmit, isLoading }: ClaimInputProps) {
  const [validationError, setValidationError] = useState<string | null>(null);

  const setText = (text: string) => {
    onChange(text);
    setValidationError(null);
  };

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length < 10) {
      setValidationError('Klaim terlalu pendek, minimal 10 karakter.');
      return;
    }
    if (trimmed.length > MAX_CHARS) return;
    onSubmit(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const charCount = value.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <form onSubmit={handleSubmit} className="mt-12">
      <div className="relative rounded-3xl bg-soft transition-shadow focus-within:ring-2 focus-within:ring-line">
        <textarea
          aria-label="Teks klaim"
          rows={3}
          value={value}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Tempel klaim politik di sini…"
          className="block min-h-32 w-full resize-none bg-transparent px-6 pt-5 pb-16 text-lg leading-relaxed field-sizing-content placeholder:text-muted focus:outline-none disabled:opacity-50"
        />
        <div className="absolute inset-x-6 bottom-4 flex items-center justify-between">
          <span aria-live="polite" className={`text-xs tabular-nums ${isOverLimit ? 'text-red-500' : 'text-muted'}`}>
            {charCount > MAX_CHARS * 0.8 && `${charCount} / ${MAX_CHARS}`}
          </span>
          <button
            type="submit"
            aria-label="Periksa"
            disabled={isLoading || !value.trim() || isOverLimit}
            className="flex size-9 items-center justify-center rounded-full bg-fg text-bg transition-opacity hover:opacity-80 disabled:opacity-20"
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      {validationError && (
        <p role="alert" className="mt-3 px-6 text-sm text-red-500">
          {validationError}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 px-6 text-sm text-muted">
        {EXAMPLE_CLAIMS.map((ex) => (
          <button
            key={ex.id}
            type="button"
            disabled={isLoading}
            onClick={() => setText(ex.text)}
            className="transition-colors hover:text-fg disabled:opacity-50"
          >
            {ex.label}
          </button>
        ))}
      </div>
    </form>
  );
}
