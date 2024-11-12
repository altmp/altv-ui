<script setup lang="ts">
import {
	DropdownMenuContent,
	useEmitAsProps,
	DropdownMenuPortal,
	type DropdownMenuContentProps,
	type DropdownMenuContentEmits,
} from "radix-vue";
import { twMerge, type ClassNameValue } from "tailwind-merge";
import { computed } from "vue";

const props = withDefaults(
	defineProps<DropdownMenuContentProps & { class?: ClassNameValue }>(),
	{ sideOffset: 4, avoidCollisions: true },
);

const classes = computed(() => {
	return twMerge(
		"pointer-events-auto z-50 flex min-w-[10rem] flex-col rounded-md bg-stone-600/80 p-1 shadow-[0px_10px_20px_-4px_rgba(0,0,0,0.25),0px_4px_8px_-1px_rgba(0,0,0,0.2),0px_1px_0px_0px_rgba(255,255,255,0.06)_inset] outline-none backdrop-blur-[10px] backdrop-brightness-[0.8] backdrop-contrast-[0.7] backdrop-saturate-[1.9] will-change-[opacity,transform] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1",
		props.class,
	);
});

const emit = defineEmits<DropdownMenuContentEmits>();
const emitsAsProps = useEmitAsProps(emit);

defineOptions({ inheritAttrs: false });
</script>

<template>
	<DropdownMenuPortal>
		<DropdownMenuContent
			v-bind="{
				...props,
				...emitsAsProps,
				...$attrs,
				class: classes,
			}"
		>
			<slot />
		</DropdownMenuContent>
	</DropdownMenuPortal>
</template>
