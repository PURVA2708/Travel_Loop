import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { X, Send, Mic, MicOff, Sparkles, User as UserIcon } from 'lucide-react';
import { useAssistantStore } from '@/store/assistantStore';
import { useAuthStore } from '@/store/authStore';
import { chatWithAssistant, type AssistantChatMessage } from './api';
import { LogoMark } from '@/components/layout/Logo';
import { getApiErrorMessage } from '@/lib/api';

type DisplayMessage = AssistantChatMessage & { id: string };

const WELCOME: DisplayMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hi! I'm your GlobeTrotter assistant. Ask me to plan a trip, look up a destination, or open a page — try the mic and just say it.",
};

// Minimal ambient typing for the Web Speech API (not in default TS lib DOM types).
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  [index: number]: { transcript: string };
}
interface SpeechRecognitionEventLike extends Event {
  results: ArrayLike<SpeechRecognitionResultLike>;
  resultIndex: number;
}
interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: Event) => void) | null;
  onend: (() => void) | null;
}

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function AssistantWidget() {
  const { isOpen, close, open } = useAssistantStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [messages, setMessages] = useState<DisplayMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setVoiceSupported(!!getSpeechRecognition());
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isSending]);

  if (!isAuthenticated) return null;

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={open}
        aria-label="Open AI assistant"
        className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-white shadow-modal transition-transform hover:scale-105 md:bottom-6 md:right-6"
      >
        <LogoMark className="h-7 w-7" />
        <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-success ring-2 ring-surface-white">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
        </span>
      </button>
    );
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    setError(null);
    const userMsg: DisplayMessage = { id: `${Date.now()}-u`, role: 'user', content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setIsSending(true);

    try {
      const history = nextMessages
        .filter((m) => m.id !== 'welcome')
        .map(({ role, content }) => ({ role, content }));
      const res = await chatWithAssistant(history);

      setMessages((prev) => [...prev, { id: `${Date.now()}-a`, role: 'assistant', content: res.reply }]);

      if (res.action?.type === 'navigate') {
        if (res.action.path.startsWith('/trips')) {
          qc.invalidateQueries({ queryKey: ['trips'] });
        }
        setTimeout(() => navigate(res.action!.path), 400);
      }
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Sorry, something went wrong reaching the assistant.');
      setError(msg);
      setMessages((prev) => [...prev, { id: `${Date.now()}-e`, role: 'assistant', content: msg }]);
    } finally {
      setIsSending(false);
    }
  }

  function toggleVoice() {
    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) return;

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (ev) => {
      let transcript = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        transcript += ev.results[i][0].transcript;
      }
      setInput(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => {
      setIsListening(false);
      setInput((current) => {
        if (current.trim()) sendMessage(current);
        return current;
      });
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-ink-border/30 bg-surface-white shadow-modal sm:bottom-6 sm:right-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 bg-gradient-to-br from-brand to-brand-dark px-4 py-3.5 text-white">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
            <LogoMark className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">GlobeTrotter Assistant</p>
            <p className="flex items-center gap-1 text-[11px] text-white/75">
              <Sparkles className="h-3 w-3" /> Ask, plan, or say it
            </p>
          </div>
        </div>
        <button
          onClick={close}
          aria-label="Close assistant"
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:bg-white/15 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex max-h-[60vh] min-h-[320px] flex-col gap-3 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex items-end gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                m.role === 'user' ? 'bg-ink text-surface-white' : 'bg-brand/20 text-brand-dark'
              }`}
            >
              {m.role === 'user' ? <UserIcon className="h-3.5 w-3.5" /> : <LogoMark className="h-3.5 w-3.5" />}
            </div>
            <div
              className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'rounded-br-sm bg-ink text-surface-white'
                  : 'rounded-bl-sm bg-surface text-ink'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex items-end gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand-dark">
              <LogoMark className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-surface px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="flex items-center gap-2 border-t border-ink-border/20 p-3"
      >
        {voiceSupported && (
          <button
            type="button"
            onClick={toggleVoice}
            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
              isListening
                ? 'animate-pulse bg-danger text-white'
                : 'bg-surface text-ink-muted hover:bg-brand/15 hover:text-brand-dark'
            }`}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
        )}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? 'Listening…' : 'Type or tap the mic…'}
          disabled={isSending}
          className="min-w-0 flex-1 rounded-full border border-ink-border/30 bg-surface px-4 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          aria-label="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-ink transition-colors hover:bg-brand-dark disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
      {error && <p className="px-4 pb-3 text-[11px] text-danger">{error}</p>}
    </div>
  );
}
