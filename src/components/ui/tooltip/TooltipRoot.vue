<script lang="ts">
export interface TooltipRootContext {
	open: Ref<boolean>;
}

export const TooltipRootContextInjectionKey = Symbol(
	"TooltipRootContextInjectionKey",
) as InjectionKey<TooltipRootContext>;
</script>

<script setup lang="ts">
import { TooltipRoot, type TooltipRootProps } from "radix-vue";
import { type InjectionKey, provide, type Ref } from "vue";

const props = withDefaults(defineProps<Omit<TooltipRootProps, "open">>(), {
	ignoreNonKeyboardFocus: undefined,
	disableHoverableContent: undefined,
	disableClosingTrigger: undefined,
});
const open = defineModel<boolean>("open", { default: false });

provide(TooltipRootContextInjectionKey, { open });
</script>

<template>
	<TooltipRoot
		v-model:open="open"
		:delay-duration="props.delayDuration"
		:disable-closing-trigger="props.disableClosingTrigger"
		:disable-hoverable-content="props.disableHoverableContent"
		:ignore-non-keyboard-focus="props.ignoreNonKeyboardFocus"
	>
		<slot />
	</TooltipRoot>
</template>
