import { useWindowSize } from "@vueuse/core";
import {
	computed,
	ref,
	watch,
	type ComputedRef,
	type InjectionKey,
	type Ref,
} from "vue";

export interface PixelScaleContext {
	pixelScale: ComputedRef<number>;
	uiScale: Ref<number>;
}

export const PixelScaleContextInjectionKey = Symbol(
	"PixelScaleContext",
) as InjectionKey<PixelScaleContext>;

export const createPixelScaleContext = (): PixelScaleContext => {
	const { width, height } = useWindowSize();

	const uiScale = ref(1);
	const pixelScale = computed(() => {
		return (Math.min(width.value, height.value) / 1080) * uiScale.value;
	});

	watch(
		pixelScale,
		() => {
			document.documentElement.style.setProperty(
				"--pixel-scale",
				`${pixelScale.value.toFixed(6)}px`,
			);
		},
		{ immediate: true },
	);

	return { pixelScale, uiScale };
};
