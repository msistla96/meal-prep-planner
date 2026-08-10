import { FormEvent, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { useApp } from "../state/AppContext";

export function AgentPage() {
  const { messages, sendAgentMessage } = useApp();
  const [draft, setDraft] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim()) return;
    sendAgentMessage(draft.trim());
    setDraft("");
  }

  return (
    <>
      <PageHeader title="Agent chat" />
      <section className="chat-layout">
        <aside className="panel chat-history">
          <h2>Chat History</h2>
          <button>Meal plan ideas</button>
          <button>Grocery check</button>
          <button>Profile changes</button>
        </aside>
        <section className="panel chat-screen" aria-label="Chat screen">
          <div className="messages">
            {messages.map((message) => (
              <p key={message.id} className={`message ${message.role}`}>
                {message.content}
              </p>
            ))}
          </div>
          <form className="chat-input" onSubmit={submit}>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask: create a meal plan"
              aria-label="Message agent"
            />
            <button className="primary-button" type="submit">
              Send
            </button>
          </form>
        </section>
      </section>
    </>
  );
}
