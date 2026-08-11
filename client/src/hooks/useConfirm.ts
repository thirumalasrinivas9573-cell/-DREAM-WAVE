import { useCallback, useState } from 'react';

export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    resolve?: (ok: boolean) => void;
  }>({ open: false, title: '', message: '' });

  const confirm = useCallback((opts: { title: string; message: string; confirmLabel?: string }) => {
    return new Promise<boolean>((resolve) => {
      setState({ open: true, ...opts, resolve });
    });
  }, []);

  const handleClose = () => {
    state.resolve?.(false);
    setState((s) => ({ ...s, open: false, resolve: undefined }));
  };

  const handleConfirm = () => {
    state.resolve?.(true);
    setState((s) => ({ ...s, open: false, resolve: undefined }));
  };

  return {
    confirm,
    dialogProps: {
      open: state.open,
      title: state.title,
      message: state.message,
      confirmLabel: state.confirmLabel,
      onClose: handleClose,
      onConfirm: handleConfirm,
    },
  };
}
