import { FormEvent, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { useApp } from "../state/AppContext";
import { AppLink, useRouter } from "../state/RouterContext";

const emptyItem = {
  name: "",
  quantity: "",
  type: "",
  expiryDate: "",
  purchaseDate: ""
};

export function GroceryItemCreatePage() {
  const { addGroceryItem, groceryLists } = useApp();
  const { navigate, path } = useRouter();
  const listId = path.replace("/grocery-lists/", "").replace("/items/new", "");
  const list = groceryLists.find((groceryList) => groceryList.id === listId);
  const [item, setItem] = useState(emptyItem);

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

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!item.name.trim()) return;
    addGroceryItem(listId, item);
    navigate(`/grocery-lists/${listId}`, { replace: true });
  }

  return (
    <>
      <PageHeader title={`Add item to ${list.name}`}>
        <AppLink className="primary-button" to={`/grocery-lists/${list.id}`} replace>
          Back to list
        </AppLink>
      </PageHeader>
      <section className="panel grocery-form-page">
        <form className="form-stack" onSubmit={submit}>
          <div className="form-grid">
            {(["name", "quantity", "type", "expiryDate", "purchaseDate"] as const).map((key) => (
              <label key={key}>
                {key}
                <input
                  value={item[key]}
                  onChange={(event) => setItem((current) => ({ ...current, [key]: event.target.value }))}
                />
              </label>
            ))}
          </div>
          <button className="primary-button" type="submit" disabled={!item.name.trim()}>
            Add item
          </button>
        </form>
      </section>
    </>
  );
}
