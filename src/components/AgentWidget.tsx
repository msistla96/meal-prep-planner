import { Bot, ChevronDown, Send } from "lucide-react";
import { FormEvent, useState } from "react";
import { useApp } from "../state/AppContext";

export function AgentWidget({ initiallyOpen = false }: { initiallyOpen?: boolean }) {
  const { messages, sendAgentMessage } = useApp();
  const [open, setOpen] = useState(initiallyOpen);
  const [draft, setDraft] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim()) return;
    sendAgentMessage(draft.trim());
    setDraft("");
    setOpen(true);
  }

  if (!open) {
    return (
      <button
        className="agent-launcher"
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open agent chat"
      >
        <Bot size={18} />
        Ask Agent
      </button>
    );
  }

  return (
    <section className="agent-widget" aria-label="Agent chat widget">
      <header className="agent-widget-header">
        <div>
          <Bot size={18} />
          <strong>Agent</strong>
        </div>
        <button type="button" onClick={() => setOpen(false)} aria-label="Minimize agent chat">
          <ChevronDown size={18} />
        </button>
      </header>
      <div className="agent-widget-body">
        {messages.slice(-4).map((message) => (
          <p key={message.id} className={`message ${message.role}`}>
            {message.content}
          </p>
        ))}
      </div>
      <form className="agent-compose" onSubmit={submit}>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask about meals or groceries"
          aria-label="Agent message"
        />
        <button type="submit" aria-label="Send message">
          <Send size={16} />
        </button>
      </form>
    </section>
  );
}
