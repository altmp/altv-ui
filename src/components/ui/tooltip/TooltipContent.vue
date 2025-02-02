<script setup lang="ts">
import {
	TooltipContent,
	TooltipPortal,
	useEmitAsProps,
	type TooltipContentEmits,
	type TooltipContentProps,
} from "radix-vue";
import TooltipArrow from "./TooltipArrow.vue";
import { twMerge, type ClassNameValue } from "tailwind-merge";
import { computed } from "vue";
import { injectContext } from "@/utils/context";
import { TooltipRootContextKey } from "./TooltipRoot.vue";
import { PixelScaleContextKey } from "@/utils/pixelScale";

const props = withDefaults(
	defineProps<TooltipContentProps & { class?: ClassNameValue }>(),
	{
		sideOffset: 4,
		avoidCollisions: true,
		collisionPadding: () => ({ right: 20, left: 20 }),
	},
);

const { pixelScale } = injectContext(PixelScaleContextKey);
const sideOffset = computed(() => props.sideOffset * pixelScale.value);

const emit = defineEmits<TooltipContentEmits>();
const emitsAsProps = useEmitAsProps(emit);

const { open } = injectContext(TooltipRootContextKey);

const classes = computed(() => {
	return twMerge(
		"z-50 rounded bg-[#3C3C3C] px-2 py-1 text-sm font-medium text-white/90 shadow-md shadow-stone-950/20 ease-out will-change-[transform,opacity] animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
		props.class,
	);
});
</script>

<template>
	<TooltipPortal>
		<TooltipContent
			@mouseenter="() => (open = false)"
			v-bind="{
				...props,
				sideOffset,
				...emitsAsProps,
				...$attrs,
				class: classes,
			}"
		>
			<slot />
			<TooltipArrow />
		</TooltipContent>
	</TooltipPortal>
</template>
