import { useState, useCallback } from 'react';

function useModal(initialId = null) {
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(initialId);

    const openModal = useCallback((id?: number) => {
      if (id) {
        setSelectedId(id);
      }
      setModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
      setModalOpen(false);
      if (selectedId) {
        setSelectedId(null);
      }
    }, [selectedId]);

    return {
        isModalOpen,
        selectedId,
        openModal,
        closeModal,
    };
}

export default useModal;