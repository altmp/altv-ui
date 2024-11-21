<script setup lang="ts">
import { playSound } from "@/utils/playSound";

const props = defineProps<{
	"data-noninteractive"?: boolean;
}>();
</script>

<template>
	<div
		class="frame"
		v-bind="$attrs"
		@click="() => (props['data-noninteractive'] ? null : playSound('move'))"
		@mouseenter="
			() => (props['data-noninteractive'] ? null : playSound('hover'))
		"
	>
		<slot></slot>
	</div>
</template>

<style scoped lang="scss">
.frame {
	background: rgba(241, 242, 242, 0.05);
	width: 100%;
	border-radius: u(8);
	padding: u(20);
	border: transparent solid u(1);
	transition:
		outline-color 0.2s ease-in-out,
		transform 0.2s ease;
	transform: none;

	&:hover:not([data-noninteractive]) {
		border: rgba(241, 242, 242, 0.5) solid u(1);
	}

	&:active:not([data-noninteractive]):not(:has([data-clickable]:active)):not(
			:has(a:active)
		) {
		transform: scale(0.98);
	}
}
</style>
