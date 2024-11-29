import { createContext } from "react";
import { UserProps } from "./App";

export type AuthContextType = {
  clientUser: UserProps | undefined;
  setClientUser: (newUser: UserProps) => void;
  handleLogout: () => void;
  toggleDarkMode: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
