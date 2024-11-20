<script setup lang="ts">
import { twMerge, type ClassNameValue } from "tailwind-merge";
import {
	CheckboxRoot,
	CheckboxIndicator,
	type CheckboxRootEmits,
	type CheckboxRootProps,
} from "radix-vue";
import CheckIcon from "@/icons/check.svg?component";
import { computed } from "vue";

const props = defineProps<CheckboxRootProps & { class?: ClassNameValue }>();

const emit = defineEmits<CheckboxRootEmits>();

const classes = computed(() => {
	return twMerge(
		"inline-flex size-4 shrink-0 items-center justify-center rounded-[0.1875rem] border border-white/25 outline-none ring-green-200/75 ring-offset-2 ring-offset-stone-900 transition-[border-color,filter,background-color] ease-out-quint hover:bg-white/5 hover:brightness-[1.2] focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-white/10 data-[state=checked]:bg-primary-500 disabled:data-[state=checked]:bg-white/10",
		props.class,
	);
});
</script>

<template>
	<CheckboxRoot
		@update:checked="emit('update:checked', $event)"
		v-bind="{ ...props, class: classes }"
	>
		<Transition
			class="duration-100 ease-out-quint"
			enter-active-class="animate-in fade-in-0"
			leave-active-class="animate-out fade-out-0"
		>
			<CheckboxIndicator>
				<CheckIcon class="pointer-events-none size-3 stroke-1.75 text-white" />
			</CheckboxIndicator>
		</Transition>
	</CheckboxRoot>
</template>
