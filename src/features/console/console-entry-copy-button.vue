<script setup lang="ts">
import CopyIcon from "@/icons/copy.svg?component";
import CheckIcon from "@/icons/check.svg?component";
import { useElementHover } from "@vueuse/core";
import { ref } from "vue";

const props = defineProps<{ entryElement: HTMLElement | null; text: string }>();

const copied = ref(false);
const copy = () => {
	if (copied.value) return;
	alt.emit("copy", props.text);
	copied.value = true;
	setTimeout(() => {
		copied.value = false;
	}, 1200);
};

const isEntryHovered = useElementHover(() => props.entryElement);
</script>

<template>
	<button @click="copy()" class="group/copy-button size-5">
		<Transition
			v-if="isEntryHovered || copied"
			enterActiveClass="animate-in zoom-in-0 fade-in-0"
			leaveActiveClass="animate-out zoom-out-0 fade-out-0"
			mode="out-in"
		>
			<component
				:is="copied ? CheckIcon : CopyIcon"
				class="size-3.5 stroke-1.25 text-white/50 text-center group-hover/copy-button:text-white/60 inline-block"
			/>
		</Transition>
	</button>
</template>
