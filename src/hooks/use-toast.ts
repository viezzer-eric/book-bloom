import { toast as customToast } from "@/lib/toast-utils";

export const useToast = () => {
  return {
    toast: customToast,
    dismiss: customToast.dismiss,
  };
};

export const toast = customToast;
