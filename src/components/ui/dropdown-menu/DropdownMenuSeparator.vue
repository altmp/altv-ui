<script setup lang="ts">
import { twMerge, type ClassNameValue } from "tailwind-merge";
import {
	DropdownMenuSeparator,
	type DropdownMenuSeparatorProps,
} from "radix-vue";

const props = defineProps<
	DropdownMenuSeparatorProps & { class?: ClassNameValue }
>();
</script>

<template>
	<DropdownMenuSeparator
		v-bind="{
			...props,
			class: twMerge('-mx-1 my-1 h-px bg-white/10', props.class),
		}"
	/>
</template>
