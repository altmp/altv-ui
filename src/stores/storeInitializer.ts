import type {
	StateTree,
	StoreDefinition,
	_ActionsTree,
	_GettersTree,
} from "pinia";
import { defineStore } from "pinia";

// https://github.com/vuejs/pinia/discussions/1176#discussioncomment-3677640

const useStoreInitializer = defineStore("initializerStore", {
	state: () => ({
		initStates: {} as Record<string, Boolean>,
	}),
	getters: {
		isInitialized: (state) => (key: string) => state.initStates[key],
	},
	actions: {
		setInitialized(key: string) {
			this.initStates[key] = true;
		},
	},
});

export function useInitializableStore<
	Id extends string,
	S extends StateTree,
	A extends _ActionsTree,
>(storeDefinition: StoreDefinition<Id, S, _GettersTree<S>, A>) {
	const obj = function () {
		const store = storeDefinition();
		const storeInitializer = useStoreInitializer();
		const storeId = store.$id;
		if (!storeInitializer.isInitialized(storeId)) {
			const anyStore = store as any;
			const initFunction = anyStore["initialize"] || anyStore["init"];
			if (typeof initFunction === "function") {
				initFunction();
				storeInitializer.setInitialized(storeId);
			}
		}
		return store;
	};
	obj.$id = storeDefinition.$id;
	return obj as StoreDefinition<Id, S, _GettersTree<S>, A>;
}
