import { createContext, useContext } from "react";

const ToastContext = createContext({
  toast: (_opts: any) => {},
});

export function useToast() {
  return useContext(ToastContext);
}
