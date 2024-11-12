<script setup lang="ts">
import {
	DropdownMenuItem,
	useEmitAsProps,
	type DropdownMenuItemEmits,
	type DropdownMenuItemProps,
} from "radix-vue";
import { twMerge, type ClassNameValue } from "tailwind-merge";
import { computed } from "vue";

const props = defineProps<DropdownMenuItemProps & { class?: ClassNameValue }>();
const emit = defineEmits<DropdownMenuItemEmits>();
const emitsAsProps = useEmitAsProps(emit);

const classes = computed(() => {
	return twMerge(
		"relative flex h-8 w-full cursor-default select-none items-center gap-3 gap-x-2 rounded bg-transparent py-1.5 pl-2 pr-4 text-sm text-stone-100 outline-none hover:bg-white/[.08] focus-visible:bg-white/[.08] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 [&>svg]:text-white/60",
		props.class,
	);
});
</script>

<template>
	<DropdownMenuItem v-bind="{ ...props, ...emitsAsProps, class: classes }">
		<slot />
	</DropdownMenuItem>
</template>
