import { type ReactNode } from 'react';

export interface ModalProps {
  isShowingModal: boolean;
  setIsShowingModal: (v: boolean) => void;
  children: ReactNode;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  preventScroll?: boolean;
}

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}
