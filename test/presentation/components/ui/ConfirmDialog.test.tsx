import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmDialog from '@presentation/components/ui/ConfirmDialog';

const setup = (open = true) => {
  const onClose = vi.fn();
  const onConfirm = vi.fn();
  render(
    <ConfirmDialog open={open} onClose={onClose} onConfirm={onConfirm}
      title="Eliminar lugar" message="Esta acción no se puede deshacer" />,
  );
  return { onClose, onConfirm };
};

describe('ConfirmDialog', () => {
  it('no renderiza nada si open es false', () => {
    setup(false);
    expect(screen.queryByText('Eliminar lugar')).not.toBeInTheDocument();
  });

  it('muestra título y mensaje cuando está abierto', () => {
    setup();
    expect(screen.getByText('Eliminar lugar')).toBeInTheDocument();
    expect(screen.getByText('Esta acción no se puede deshacer')).toBeInTheDocument();
  });

  it('al confirmar llama onConfirm y luego onClose', async () => {
    const { onConfirm, onClose } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('al cancelar solo llama onClose', async () => {
    const { onConfirm, onClose } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
