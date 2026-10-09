import { useContext } from "react";
import { PortalCtx } from "./portal-context";

export function usePortal() {
  const c = useContext(PortalCtx);
  if (!c) throw new Error("usePortal outside PortalProvider");
  return c;
}
