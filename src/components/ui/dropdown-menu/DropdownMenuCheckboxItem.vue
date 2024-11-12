<script setup lang="ts">
import {
	DropdownMenuCheckboxItem,
	type DropdownMenuCheckboxItemEmits,
	type DropdownMenuCheckboxItemProps,
	DropdownMenuItemIndicator,
	useEmitAsProps,
} from "radix-vue";
import CheckIcon from "@/icons/check.svg?component";
import { twMerge, type ClassNameValue } from "tailwind-merge";
import { computed } from "vue";

const props = defineProps<
	DropdownMenuCheckboxItemProps & { class?: ClassNameValue }
>();
const emit = defineEmits<DropdownMenuCheckboxItemEmits>();
const emitsAsProps = useEmitAsProps(emit);

const classes = computed(() => {
	return twMerge(
		"relative flex h-8 w-full cursor-default select-none items-center gap-3 gap-x-2 rounded bg-transparent py-1.5 pl-2 pr-9 text-sm text-stone-100 outline-none transition-colors duration-100 ease-out hover:bg-white/[.08] focus-visible:bg-white/[.08] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 [&>svg]:text-white/60",
		props.class,
	);
});
</script>

<template>
	<DropdownMenuCheckboxItem
		v-bind="{ ...props, ...emitsAsProps, class: classes }"
	>
		<span class="absolute right-2 flex size-3.5 items-center justify-center">
			<DropdownMenuItemIndicator>
				<CheckIcon class="size-4 stroke-1.5 text-white/60" />
			</DropdownMenuItemIndicator>
		</span>
		<slot />
	</DropdownMenuCheckboxItem>
</template>
