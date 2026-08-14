import { create } from "zustand";
import { persist } from "zustand/middleware";

type WorkspaceState = {
  /** When used anywhere in the app besides WorkspaceOverview it is considered `number`. Layout guards `null` */
  activeWorkspace: number | null;
};

type WorkspaceActions = {
  reset(): void;
  setWorkspace(id: number): void;
};

export const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>()(
  persist(
    (set) => ({
      activeWorkspace: null,
      reset: () => set({ activeWorkspace: null }),
      setWorkspace: (id) => set({ activeWorkspace: id }),
    }),
    { name: "tick/workspace" },
  ),
);
