import { useState } from 'react';

interface UseDeleteModalOptions<T> {
  onDelete: (item: T) => Promise<void>;
  getItemName?: (item: T) => string;
  getItemId?: (item: T) => string | number;
}

interface DeleteModalState<T> {
  isOpen: boolean;
  item: T | null;
  isDeleting: boolean;
}

export const useDeleteModal = <T>({ onDelete, getItemName, getItemId }: UseDeleteModalOptions<T>) => {
  const [state, setState] = useState<DeleteModalState<T>>({
    isOpen: false,
    item: null,
    isDeleting: false
  });

  const openModal = (item: T) => {
    setState({
      isOpen: true,
      item,
      isDeleting: false
    });
  };

  const closeModal = () => {
    setState({
      isOpen: false,
      item: null,
      isDeleting: false
    });
  };

  const confirmDelete = async () => {
    if (!state.item) return;

    setState(prev => ({ ...prev, isDeleting: true }));

    try {
      await onDelete(state.item);
      closeModal();
    } catch (error) {
      setState(prev => ({ ...prev, isDeleting: false }));
      throw error; // Re-throw to allow component to handle error display
    }
  };

  const modalProps = {
    isOpen: state.isOpen,
    onClose: closeModal,
    onConfirm: confirmDelete,
    isLoading: state.isDeleting,
    itemName: state.item && getItemName ? getItemName(state.item) : undefined,
    itemId: state.item && getItemId ? getItemId(state.item) : undefined
  };

  return {
    openModal,
    closeModal,
    confirmDelete,
    modalProps,
    isDeleting: state.isDeleting,
    selectedItem: state.item
  };
};