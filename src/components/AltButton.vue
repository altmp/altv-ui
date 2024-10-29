<script lang="ts" setup>
import type { PropType } from "vue";
import { playHoverSound, playMoveSound } from "@/utils/playSound";

defineProps({
	color: String as PropType<"red" | "green" | "gray">,
});
</script>

<template>
	<div
		class="button"
		:class="color"
		v-bind="$attrs"
		@mouseenter="playHoverSound"
		@click="playMoveSound"
	>
		<slot />
	</div>
</template>

<style lang="scss" scoped>
@import "@/assets/_palette.scss";

.button {
	padding: 0 u(16);
	display: flex;
	justify-content: center;
	align-items: center;
	height: u(50);
	font-size: 1em;
	color: $text_light;
	border-radius: u(8);
	text-align: center;
	background: rgba($text_light, 0.05);
	border: solid u(1) rgba($text_light, 0.1);
	cursor: pointer;
	box-sizing: border-box;
	transition: transform 0.2s ease;
	transform: none;

	&:active {
		transform: scale(0.95);
	}

	&.red {
		border-color: #e20338;
	}

	&.green {
		border-color: $text_link;
	}

	&.primary {
		border-color: rgb(var(--primary-color));
	}
}
</style>
