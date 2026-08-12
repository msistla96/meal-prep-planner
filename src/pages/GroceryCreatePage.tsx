import { FileUp, PencilLine } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { AppLink } from "../state/RouterContext";

export function GroceryCreatePage() {
  return (
    <>
      <PageHeader title="Create grocery list">
        <AppLink className="primary-button" to="/grocery-lists" replace>
          Back to lists
        </AppLink>
      </PageHeader>
      <section className="create-list-options">
        <AppLink className="panel create-list-option" to="/grocery-lists/upload" replace>
          <FileUp size={22} />
          <div>
            <strong>Upload file</strong>
            <span>Import a grocery list from a PDF, image, or text file.</span>
          </div>
        </AppLink>
        <AppLink className="panel create-list-option" to="/grocery-lists/manual" replace>
          <PencilLine size={22} />
          <div>
            <strong>Fill manually</strong>
            <span>Create a list by entering grocery details yourself.</span>
          </div>
        </AppLink>
      </section>
    </>
  );
}
