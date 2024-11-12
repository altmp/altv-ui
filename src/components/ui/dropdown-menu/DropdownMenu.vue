<script setup lang="ts">
import {
	DropdownMenuRoot,
	type DropdownMenuRootProps,
	type DropdownMenuRootEmits,
	useEmitAsProps,
} from "radix-vue";

const props = withDefaults(defineProps<DropdownMenuRootProps>(), {
	modal: true,
	open: undefined,
});

const emit = defineEmits<DropdownMenuRootEmits>();
const emitsAsProps = useEmitAsProps(emit);
</script>

<template>
	<DropdownMenuRoot v-bind="{ ...props, ...emitsAsProps }">
		<slot />
	</DropdownMenuRoot>
</template>
