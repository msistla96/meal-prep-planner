import { FormEvent, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { useApp } from "../state/AppContext";
import { AppLink, useRouter } from "../state/RouterContext";
import type { GroceryList } from "../types";

const sources: GroceryList["source"][] = ["Manual", "PDF", "Image", "Text"];

export function GroceryEditPage() {
  const { groceryLists, updateGroceryList } = useApp();
  const { navigate, path } = useRouter();
  const listId = path.replace("/grocery-lists/", "").replace("/edit", "");
  const list = groceryLists.find((groceryList) => groceryList.id === listId);
  const [name, setName] = useState(list?.name ?? "");
  const [source, setSource] = useState<GroceryList["source"]>(list?.source ?? "Manual");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!list || !name.trim()) return;
    updateGroceryList(list.id, { name: name.trim(), source });
    navigate("/grocery-lists", { replace: true });
  }

  if (!list) {
    return (
      <>
        <PageHeader title="List not found">
          <AppLink className="primary-button" to="/grocery-lists" replace>
            Back to lists
          </AppLink>
        </PageHeader>
        <section className="panel">This grocery list does not exist.</section>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Edit grocery list">
        <AppLink className="primary-button" to="/grocery-lists" replace>
          Back to lists
        </AppLink>
      </PageHeader>
      <section className="panel grocery-form-page">
        <form className="form-stack" onSubmit={submit}>
          <label>
            List name
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            Source
            <select
              value={source}
              onChange={(event) => setSource(event.target.value as GroceryList["source"])}
            >
              {sources.map((nextSource) => (
                <option key={nextSource}>{nextSource}</option>
              ))}
            </select>
          </label>
          <button className="primary-button" type="submit" disabled={!name.trim()}>
            Save changes
          </button>
        </form>
      </section>
    </>
  );
}
