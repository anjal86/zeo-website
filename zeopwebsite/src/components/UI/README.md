Item: Everest Base Camp Trek

# DeleteModal Component

A reusable, professional delete confirmation modal component with loading states and proper UX patterns.

## Features

- ✅ Professional design with warning indicators
- ✅ Loading states during deletion
- ✅ Backdrop click to close
- ✅ Keyboard accessibility (ESC to close)
- ✅ Customizable messages and button text
- ✅ Two variants: `danger` (red) and `warning` (yellow)
- ✅ Shows item name being deleted
- ✅ Prevents accidental deletions with clear warnings

## Basic Usage

```tsx
import DeleteModal from "../UI/DeleteModal";

const MyComponent = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteItem(itemToDelete.id);
      setShowDeleteModal(false);
      // Refresh data
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setItemToDelete(item);
          setShowDeleteModal(true);
        }}
      >
        Delete Item
      </button>

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        message="Are you sure you want to delete this item?"
        itemName={itemToDelete?.name}
        isLoading={isDeleting}
        confirmText="Delete Item"
        variant="danger"
      />
    </>
  );
};
```

## Using with the Hook (Recommended)

For even easier usage, use the `useDeleteModal` hook:

```tsx
import { useDeleteModal } from "../../hooks/useDeleteModal";
import DeleteModal from "../UI/DeleteModal";

const MyComponent = () => {
  const deleteItem = async (item) => {
    const response = await fetch(`/api/items/${item.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Failed to delete item");
    }

    // Refresh your data here
    await fetchItems();
  };

  const deleteModal = useDeleteModal({
    onDelete: deleteItem,
    getItemName: (item) => item.name,
    getItemId: (item) => item.id,
  });

  return (
    <>
      <button onClick={() => deleteModal.openModal(item)}>Delete Item</button>

      <DeleteModal
        {...deleteModal.modalProps}
        title="Delete Item"
        message="Are you sure you want to delete this item?"
        confirmText="Delete Item"
        variant="danger"
      />
    </>
  );
};
```

## Props

| Prop     | Type      | Default | Description               |
| -------- | --------- | ------- | ------------------------- |
| `isOpen` | `boolean` | -       | Whether the modal is open |
