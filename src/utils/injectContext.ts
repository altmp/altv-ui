import { inject, type InjectionKey } from "vue";

/**
 * @throws {Error} If context is not provided.
 */
export const injectContext = <T>(key: InjectionKey<T>): T => {
	const context = inject(key);
	if (!context) {
		throw new Error(`${key.toString()} not provided`);
	}
	return context;
};
