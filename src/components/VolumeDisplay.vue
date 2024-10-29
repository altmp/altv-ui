<script setup lang="ts">
import { defineEmits, onMounted, ref, watch } from "vue";
import {
	playHoverSound,
	playSliderEnterSound,
	playSliderLeaveSound,
	playSliderSound,
} from "@/utils/playSound";
import { clamp } from "@/utils/clamp";

const props = defineProps<{ value: number; label: string }>();

const emit = defineEmits(["update:modelValue"]);

const input = ref<HTMLInputElement | null>(null);
</script>

<template>
	<label>
		{{ label }}
		<span class="line" ref="input">
			<span class="fill" :style="{ width: props.value + '%' }"></span>
		</span>
	</label>
</template>

<style lang="scss" scoped>
@import "@/assets/_util.scss";

$thumbSize: 20;
$thickness: 4;
$margin: 16;

label {
	display: block;
	position: relative;
	font-weight: 500;
	font-size: u(18);
	color: #f1f2f280;
}

.line {
	display: block;
	width: 100%;
	height: u($thickness);
	margin-top: u(calc(($thumbSize - $thickness) / 2) + $margin);
	border-radius: u(2.4);
	background: rgb(241, 242, 242, 0.15);
	outline: none;
}

.fill {
	display: block;
	transition: width 0.05s linear;
	border-radius: u(2);
	height: 100%;
	background: rgb(var(--primary-color-light));
}
</style>
