import { ToasterRef } from "@/components/ui/toast";

let globalToasterRef: ToasterRef | null = null;

export const setGlobalToasterRef = (ref: ToasterRef | null) => {
  globalToasterRef = ref;
};

type ToastProps = Parameters<ToasterRef['show']>[0];

export const toast = (props: ToastProps | string) => {
  if (!globalToasterRef) {
    console.warn("Global toaster ref not set. Make sure <Toaster /> is rendered in your App.");
    return;
  }

  if (typeof props === 'string') {
    globalToasterRef.show({ message: props });
  } else {
    globalToasterRef.show(props);
  }
};

toast.success = (message: string, props?: Partial<ToastProps>) => {
  toast({ message, variant: 'success', ...props });
};

toast.error = (message: string, props?: Partial<ToastProps>) => {
  toast({ message, variant: 'error', ...props });
};

toast.warning = (message: string, props?: Partial<ToastProps>) => {
  toast({ message, variant: 'warning', ...props });
};

toast.info = (message: string, props?: Partial<ToastProps>) => {
  toast({ message, variant: 'default', ...props });
};

toast.dismiss = () => {
  // Note: sonnerToast.dismiss() can be used directly if needed, 
  // but for simplicity we focus on the show API.
};
