import { FormEvent, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { useApp } from "../state/AppContext";
import { AppLink, useRouter } from "../state/RouterContext";

export function GroceryManualPage() {
  const { createGroceryList } = useApp();
  const { navigate } = useRouter();
  const [listName, setListName] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!listName.trim()) return;
    createGroceryList({ name: listName.trim(), source: "Manual" });
    navigate("/grocery-lists", { replace: true });
  }

  return (
    <>
      <PageHeader title="Create grocery list">
        <AppLink className="primary-button" to="/grocery-lists" replace>
          Back to lists
        </AppLink>
      </PageHeader>
      <section className="panel grocery-form-page">
        <form className="form-stack" onSubmit={submit}>
          <label>
            List name
            <input value={listName} onChange={(event) => setListName(event.target.value)} />
          </label>
          <button className="primary-button" type="submit" disabled={!listName.trim()}>
            Create list
          </button>
        </form>
      </section>
    </>
  );
}
