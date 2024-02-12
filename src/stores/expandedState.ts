import { defineStore } from "pinia";
import { reactive } from "vue";

/** row id => is row expanded */
type ExpandedState = Map<string, boolean>;

export const useExpandedStateStore = defineStore(
  "server-table-expanded-state",
  () => {
    const expandedState = reactive<ExpandedState>(new Map());
    const toggleRow = (rowId: string) => {
      const isExpanded = expandedState.get(rowId) || false;
      expandedState.set(rowId, !isExpanded);
      return !isExpanded;
    };

    return { expandedState, toggleRow };
  },
);
