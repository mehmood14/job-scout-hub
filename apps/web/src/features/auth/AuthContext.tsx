import { createContext, useContext } from "react";

import type { AccessMode } from "./api/auth";

type AuthContextValue = {
  accessMode: AccessMode;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used within an authenticated application");
  }

  return value;
}
