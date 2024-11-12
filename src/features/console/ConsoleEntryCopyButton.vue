<script setup lang="ts">
import CopyIcon from "@/icons/copy.svg?component";
import CheckIcon from "@/icons/check.svg?component";
import { useClipboard, useElementHover } from "@vueuse/core";

const props = defineProps<{ entryElement: HTMLElement | null; text: string }>();

const { copy, copied } = useClipboard({
	source: props.text,
	copiedDuring: 1200,
});
const isHovered = useElementHover(() => props.entryElement);
</script>

<template>
	<button
		v-if="isHovered"
		type="button"
		@click="copy()"
		class="group/copy-button p-0.5"
	>
		<Transition
			enterActiveClass="animate-in zoom-in-0 fade-in-0"
			leaveActiveClass="animate-out zoom-out-0 fade-out-0"
			mode="out-in"
		>
			<component
				:is="copied ? CheckIcon : CopyIcon"
				class="m-px size-3.5 shrink-0 stroke-1.25 text-white/50 transition-colors group-hover/copy-button:text-white/60"
			/>
		</Transition>
	</button>
</template>
