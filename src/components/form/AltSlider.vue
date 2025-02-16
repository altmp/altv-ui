<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { playSound } from "@/utils/playSound";

const props = defineProps({
	modelValue: {
		type: Number,
	},
	label: {
		type: String,
	},
	line: {
		type: Number,
		required: false,
		default: 0,
	},
});

const emit = defineEmits(["update:modelValue"]);

const input = ref<HTMLInputElement | null>(null);

function update() {
	if (!input.value) return;
	const fillPercent =
		((+input.value.value - +input.value.min) / +input.value.max) * 100;
	input.value.setAttribute(
		"style",
		`--fill: ${fillPercent}%; --line: ${props.line}%`,
	);
}

function updateSound() {
	const step = Math.round(+(input.value?.value ?? 0) / 100 / threshold);
	if (lastStep != step) {
		playSound("slider");
		lastStep = step;
	}
}

const threshold = 1 / 7;
let lastStep = 0;
function onInputChange() {
	if (!input.value) {
		return;
	}

	emit("update:modelValue", Number.parseInt(input.value.value));
	update();
	updateSound();
}

function onWheel(evt: WheelEvent) {
	if (!input.value) return;
	evt.preventDefault();
	input.value.value = (+(input.value.value ?? 0) + evt.deltaY / -5).toString();
	emit("update:modelValue", Number.parseInt(input.value.value));
	updateSound();
	update();
}

onMounted(() => {
	if (!input.value) {
		return;
	}
	update();
});

watch(
	() => props.line,
	() => {
		update();
	},
);
</script>

<template>
	<label>
		{{ label }}
		<input
			dir="ltr"
			type="range"
			min="0"
			step="0"
			max="100"
			v-bind="$attrs"
			:value="modelValue"
			@input="onInputChange"
			ref="input"
			@wheel="onWheel"
			@mouseenter="playSound('hover')"
			@mousedown="playSound('sliderEnter')"
			@mouseup="playSound('sliderLeave')"
		/>
	</label>
</template>

<style lang="scss" scoped>
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

input[type="range"] {
	width: 100%;
	-webkit-appearance: none;
	height: u($thickness);
	margin-top: u(calc(($thumbSize - $thickness) / 2) + $margin);
	border-radius: u(2.4);
	--dir: right;

	background:
		linear-gradient(
			to var(--dir),
			rgba(white, 0.5),
			rgba(white, 0.5) var(--line),
			transparent var(--line)
		),
		linear-gradient(
				to var(--dir),
				rgb(var(--primary-color-light)),
				rgb(var(--primary-color-light)) var(--fill),
				rgb(241, 242, 242, 0.15) var(--fill)
			)
			no-repeat;
	background-size: 100% 100%;
	outline: none;
	cursor: grab;

	&:active {
		cursor: grabbing;
	}

	&::-webkit-slider-runnable-track {
		-webkit-appearance: none;
		box-shadow: none;
		border: none;
		background: transparent;
	}

	&::-webkit-slider-thumb {
		appearance: none;
		height: u($thumbSize);
		width: u($thumbSize);
		border: u(3) solid rgb(var(--primary-color-light));
		border-radius: 50%;
		background-color: #313335;
	}
}
</style>
