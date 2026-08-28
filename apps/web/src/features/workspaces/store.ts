import type { components } from "@/lib/api.d";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type WorkspaceState = {
  /** When used anywhere in the app besides WorkspaceOverview it is considered `number`. Layout guards `null` */
  activeWorkspace: number | null;

  /** used to differentiate workspace permissions
   * - `member`: can track time
   * - `admin`: can invite people, update clients, update workspace
   * - `owner`: `...admin`, can delete workspace
   */
  role: components["schemas"]["WorkspaceRole"];
};

type WorkspaceActions = {
  reset(): void;
  setWorkspace(id: number): void;
  setRole(r: components["schemas"]["WorkspaceRole"]): void;
};

export const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>()(
  persist(
    (set) => ({
      activeWorkspace: null,
      role: "member",
      reset: () => set({ activeWorkspace: null }),
      setWorkspace: (id) => set({ activeWorkspace: id }),
      setRole: (role) => set({ role }),
    }),
    { name: "tick/workspace" },
  ),
);
