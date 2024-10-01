import { defineStore } from "pinia";

export const useFilterStore = defineStore("server-filters", {
	state: () => {
		return {
			search: "",
			minPlayers: "",
			maxPlayers: "",
			minSlots: "",
			maxSlots: "",
			maxPing: "",
			hideFull: false,
			hideEmpty: false,
			hideLocked: false,
		};
	},
});
