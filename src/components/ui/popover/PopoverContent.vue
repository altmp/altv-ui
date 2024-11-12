<script setup lang="ts">
import {
	PopoverContent,
	type PopoverContentEmits,
	type PopoverContentProps,
	PopoverPortal,
	useEmitAsProps,
} from "radix-vue";
import { twMerge, type ClassNameValue } from "tailwind-merge";
import { computed } from "vue";

const props = withDefaults(
	defineProps<PopoverContentProps & { class?: ClassNameValue }>(),
	{
		sideOffset: 4,
		collisionPadding: 20,
		avoidCollisions: true,
	},
);
const emit = defineEmits<PopoverContentEmits>();
const emitsAsProps = useEmitAsProps(emit);

const classes = computed(() => {
	return twMerge(
		"z-20 w-72 rounded-md bg-stone-600 p-4 shadow-[0px_10px_20px_-4px_rgba(0,0,0,0.25),0px_4px_8px_-1px_rgba(0,0,0,0.2),0px_1px_0px_0px_rgba(255,255,255,0.06)_inset] outline-none will-change-[opacity,transform] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1",
		props.class,
	);
});

defineOptions({ inheritAttrs: false });
</script>

<template>
	<PopoverPortal>
		<PopoverContent
			v-bind="{
				...props,
				...emitsAsProps,
				...$attrs,
				class: classes,
			}"
		>
			<slot />
		</PopoverContent>
	</PopoverPortal>
</template>
