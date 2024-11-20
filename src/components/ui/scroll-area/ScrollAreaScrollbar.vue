<script setup lang="ts">
import {
	ScrollAreaScrollbar,
	type ScrollAreaScrollbarProps,
	ScrollAreaThumb,
} from "radix-vue";
import { twMerge, type ClassNameValue } from "tailwind-merge";
import { computed } from "vue";

const props = defineProps<
	ScrollAreaScrollbarProps & { class?: ClassNameValue }
>();

const classes = computed(() => {
	return twMerge(
		"group flex touch-none select-none p-0.5 transition-colors animate-in fade-in-0 data-[orientation=horizontal]:h-[--scrollbar-size] data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-[--scrollbar-size] data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:border-t data-[orientation=vertical]:border-l data-[orientation=horizontal]:border-t-transparent data-[orientation=vertical]:border-l-transparent data-[state=hidden]:animate-out data-[state=hidden]:fade-out-0",
		props.class,
	);
});
</script>

<template>
	<ScrollAreaScrollbar v-bind="{ ...props, class: classes }">
		<ScrollAreaThumb
			class="relative w-full flex-1 rounded-full bg-white/25 transition-colors duration-150 group-hover:bg-white/40"
		/>
	</ScrollAreaScrollbar>
</template>
