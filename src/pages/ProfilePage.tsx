import { FormEvent, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { useApp } from "../state/AppContext";
import { useRouter } from "../state/RouterContext";
import type { UserProfile } from "../types";

export function ProfilePage({ standalone = false }: { standalone?: boolean }) {
  const { profile, saveProfile } = useApp();
  const { navigate } = useRouter();
  const [draft, setDraft] = useState<UserProfile>(profile);
  const requiredComplete = Boolean(
    draft.name.trim() && draft.age.trim() && draft.gender.trim()
  );

  function update<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!requiredComplete) return;
    saveProfile(draft);
    if (standalone) navigate("/");
  }

  const profileForm = (
    <>
      <PageHeader title="User profile questionnaire" />
      <form className="panel form-grid" onSubmit={submit}>
        <label>
          Name
          <input
            required
            value={draft.name}
            onChange={(event) => update("name", event.target.value)}
          />
        </label>
        <label>
          Age
          <input
            required
            value={draft.age}
            onChange={(event) => update("age", event.target.value)}
          />
        </label>
        <label>
          Gender
          <input
            required
            value={draft.gender}
            onChange={(event) => update("gender", event.target.value)}
          />
        </label>
        <label>
          Lifestyle
          <select
            value={draft.lifestyle}
            onChange={(event) => update("lifestyle", event.target.value as UserProfile["lifestyle"])}
          >
            <option>Active</option>
            <option>Semi active</option>
            <option>Sedentary</option>
          </select>
        </label>
        <label>
          Diet type
          <input
            value={draft.dietType}
            onChange={(event) => update("dietType", event.target.value)}
          />
        </label>
        <label>
          Allergies
          <input
            value={draft.allergies}
            onChange={(event) => update("allergies", event.target.value)}
          />
        </label>
        <label>
          Preferred cuisines
          <input
            value={draft.cuisines}
            onChange={(event) => update("cuisines", event.target.value)}
          />
        </label>
        <label>
          Preferred proteins
          <input
            value={draft.proteins}
            onChange={(event) => update("proteins", event.target.value)}
          />
        </label>
        <button className="primary-button" type="submit" disabled={!requiredComplete}>
          Save profile
        </button>
      </form>
    </>
  );

  if (standalone) {
    return (
      <main className="profile-setup-page">
        <section className="profile-setup-panel">{profileForm}</section>
      </main>
    );
  }

  return profileForm;
}
