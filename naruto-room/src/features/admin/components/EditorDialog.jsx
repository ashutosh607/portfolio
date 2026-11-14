import React, { useEffect, useRef } from 'react';

export default function EditorDialog({ title, onClose, children }) {
  const ref = useRef(null);
  const pickerPendingRef = useRef(false);
  const pickerReturnedAtRef = useRef(0);

  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();

    const handleFileEvent = (e) => {
      if (e.target instanceof HTMLInputElement && e.target.type === 'file') {
        if (e.type === 'click') {
          pickerPendingRef.current = true;
          return;
        }
        pickerPendingRef.current = false;
        pickerReturnedAtRef.current = Date.now();
        if (e.type === 'cancel') {
          e.stopPropagation();
        }
      }
    };

    const handleWindowFocus = () => {
      if (pickerPendingRef.current) {
        pickerPendingRef.current = false;
        pickerReturnedAtRef.current = Date.now();
      }
    };

    dialog.addEventListener('click', handleFileEvent, true);
    dialog.addEventListener('change', handleFileEvent, true);
    dialog.addEventListener('cancel', handleFileEvent, true);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      dialog.removeEventListener('click', handleFileEvent, true);
      dialog.removeEventListener('change', handleFileEvent, true);
      dialog.removeEventListener('cancel', handleFileEvent, true);
      window.removeEventListener('focus', handleWindowFocus);
      dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className="admin-modal-backdrop cms-dialog"
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        if (e.target !== e.currentTarget || e.target?.tagName === 'INPUT') return;
        if (Date.now() - pickerReturnedAtRef.current < 600) return;
        onClose();
      }}
    >
      {children}
    </dialog>
  );
}
