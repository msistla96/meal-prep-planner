import { PageHeader } from "../components/PageHeader";
import { useApp } from "../state/AppContext";
import { AppLink } from "../state/RouterContext";

export function GroceryListPage() {
  const { deleteGroceryList, groceryLists } = useApp();
  const recentLists = groceryLists.slice(0, 5);

  return (
    <>
      <PageHeader title="Grocery lists">
        <AppLink className="primary-button" to="/grocery-lists/create">
          Create list
        </AppLink>
      </PageHeader>
      <section className="panel">
        <div className="explorer-list" aria-label="Recent grocery lists">
          <div className="explorer-row explorer-heading">
            <span>Name</span>
            <span>Source</span>
            <span>Created</span>
            <span>Updated</span>
            <span>Items</span>
            <span>Actions</span>
          </div>
          {recentLists.map((groceryList) => (
            <div className="explorer-row" key={groceryList.id}>
              <AppLink to={`/grocery-lists/${groceryList.id}`}>
                <strong>{groceryList.name}</strong>
              </AppLink>
              <span>{groceryList.source}</span>
              <span>{groceryList.created}</span>
              <span>{groceryList.updated}</span>
              <span>{groceryList.items.length}</span>
              <span className="explorer-actions">
                <AppLink className="secondary-button" to={`/grocery-lists/${groceryList.id}/edit`}>
                  Edit List
                </AppLink>
                <button
                  className="danger-button"
                  type="button"
                  onClick={() => deleteGroceryList(groceryList.id)}
                >
                  Delete List
                </button>
              </span>
            </div>
          ))}
          {recentLists.length === 0 ? (
            <p className="empty-state">No grocery lists yet.</p>
          ) : null}
        </div>
      </section>
    </>
  );
}
