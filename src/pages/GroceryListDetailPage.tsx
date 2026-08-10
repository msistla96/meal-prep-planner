import { PageHeader } from "../components/PageHeader";
import { useApp } from "../state/AppContext";
import { AppLink, useRouter } from "../state/RouterContext";

export function GroceryListDetailPage() {
  const { deleteGroceryList, groceryLists } = useApp();
  const { navigate, path } = useRouter();
  const listId = path.replace("/grocery-lists/", "");
  const list = groceryLists.find((groceryList) => groceryList.id === listId);

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
      <PageHeader title={list.name}>
        <AppLink className="primary-button" to={`/grocery-lists/${list.id}/items/new`}>
          Add Item
        </AppLink>
        <AppLink className="secondary-button" to={`/grocery-lists/${list.id}/edit`}>
          Edit List
        </AppLink>
        <button
          className="danger-button"
          type="button"
          onClick={() => {
            deleteGroceryList(list.id);
            navigate("/grocery-lists", { replace: true });
          }}
        >
          Delete List
        </button>
        <AppLink className="primary-button" to="/grocery-lists" replace>
          Back to lists
        </AppLink>
      </PageHeader>
      <section className="panel grocery-detail">
        <div className="metadata-grid">
          <span>List Name: {list.name}</span>
          <span>Source: {list.source}</span>
          <span>Created: {list.created}</span>
          <span>Updated: {list.updated}</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Type</th>
              <th>Expiry</th>
              <th>Purchase</th>
            </tr>
          </thead>
          <tbody>
            {list.items.map((groceryItem) => (
              <tr key={groceryItem.id}>
                <td>{groceryItem.name}</td>
                <td>{groceryItem.quantity}</td>
                <td>{groceryItem.type}</td>
                <td>{groceryItem.expiryDate}</td>
                <td>{groceryItem.purchaseDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
