import { Plus, X } from "lucide-react";
import type { GroceryItem } from "../types";

export type DraftItem = Omit<GroceryItem, "id">;

export const emptyDraftItem: DraftItem = {
  name: "",
  quantity: "",
  type: "",
  expiryDate: "",
  purchaseDate: ""
};

const itemFields = ["name", "quantity", "type", "expiryDate", "purchaseDate"] as const;

export function GroceryItemRows({
  items,
  onChange
}: {
  items: DraftItem[];
  onChange: (items: DraftItem[]) => void;
}) {
  function updateItem(index: number, key: keyof DraftItem, value: string) {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));
  }

  function removeItem(index: number) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  function addItem() {
    onChange([...items, emptyDraftItem]);
  }

  return (
    <div className="item-rows">
      {items.map((item, index) => (
        <div className="item-row" key={index}>
          <div className="form-grid">
            {itemFields.map((key) => (
              <label key={key}>
                {key}
                <input
                  value={item[key]}
                  onChange={(event) => updateItem(index, key, event.target.value)}
                />
              </label>
            ))}
          </div>
          {items.length > 1 ? (
            <button
              className="icon-button"
              type="button"
              onClick={() => removeItem(index)}
              aria-label="Remove item"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>
      ))}
      <button className="secondary-button" type="button" onClick={addItem}>
        <Plus size={16} />
        Add another item
      </button>
    </div>
  );
}
