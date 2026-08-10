import { FormEvent, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { useApp } from "../state/AppContext";
import { AppLink, useRouter } from "../state/RouterContext";

export function GroceryUploadPage() {
  const { createGroceryList } = useApp();
  const { navigate } = useRouter();
  const [listName, setListName] = useState("Imported grocery list");
  const [fileName, setFileName] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!listName.trim() || !fileName) return;
    createGroceryList({
      name: listName.trim(),
      source: "PDF",
      items: [
        {
          name: "Imported item",
          quantity: "Review",
          type: "Imported",
          expiryDate: "",
          purchaseDate: ""
        }
      ]
    });
    navigate("/grocery-lists", { replace: true });
  }

  return (
    <>
      <PageHeader title="Upload file">
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
          <label>
            Grocery file
            <input
              type="file"
              accept=".pdf,image/*,.txt"
              onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
            />
          </label>
          <button className="primary-button" type="submit" disabled={!listName.trim() || !fileName}>
            Create list
          </button>
        </form>
      </section>
    </>
  );
}
