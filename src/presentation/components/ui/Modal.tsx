import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useCallback } from 'react';
import type { ModalProps } from '@domain/entities/ui/ModalProps';

const Modal: React.FC<ModalProps> = ({
  isShowingModal,
  setIsShowingModal,
  children,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  preventScroll = true,
}) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  const handleClose = useCallback(() => {
    setIsShowingModal(false);
  }, [setIsShowingModal]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnBackdropClick && e.target === e.currentTarget) {
        handleClose();
      }
    },
    [closeOnBackdropClick, handleClose],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape' && isShowingModal) {
        handleClose();
      }
    };

    if (isShowingModal) {
      document.addEventListener('keydown', handleKeyDown);
      modalRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isShowingModal, closeOnEscape, handleClose]);

  useEffect(() => {
    if (preventScroll && isShowingModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isShowingModal, preventScroll]);

  return (
    <AnimatePresence mode="wait">
      {isShowingModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.dialog
            ref={modalRef}
            open={isShowingModal}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
            onClick={handleBackdropClick}
            aria-modal="true"
            aria-labelledby="modal-title"
            tabIndex={-1}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {children}
            </motion.div>
          </motion.dialog>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
