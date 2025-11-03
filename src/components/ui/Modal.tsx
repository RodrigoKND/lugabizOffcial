import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useCallback } from "react";

interface ModalProps {
    isShowingModal: boolean;
    setIsShowingModal: React.Dispatch<React.SetStateAction<boolean>>;
    children: React.ReactNode;
    closeOnBackdropClick?: boolean;
    closeOnEscape?: boolean;
    preventScroll?: boolean;
}

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
        [closeOnBackdropClick, handleClose]
    );

    // Manejo de tecla Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (closeOnEscape && e.key === "Escape" && isShowingModal) {
                handleClose();
            }
        };

        if (isShowingModal) {
            document.addEventListener("keydown", handleKeyDown);
            // Focus en el modal cuando se abre
            modalRef.current?.focus();
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isShowingModal, closeOnEscape, handleClose]);

    // Prevenir scroll del body cuando el modal está abierto
    useEffect(() => {
        if (preventScroll && isShowingModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isShowingModal, preventScroll]);

    return (
        <AnimatePresence mode="wait">
            {isShowingModal && (
                <>
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                    />
                    <motion.dialog
                        ref={modalRef}
                        open={isShowingModal}
                        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
                        onClick={handleBackdropClick}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        aria-modal="true"
                        aria-labelledby="modal-title"
                        tabIndex={-1}
                    >
                        {/* Backdrop con animación */}

                        {/* Contenido del modal con animación */}
                        <motion.div
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