<script setup lang="ts">
import { playHoverSound, playClickSound } from "@/utils/playSound";

defineProps({
	modelValue: {
		type: Boolean,
	},
	label: {
		type: String,
	},
});

const emit = defineEmits(["update:modelValue"]);

function onInput(event: Event) {
	emit("update:modelValue", (event.currentTarget! as any).checked);
}
</script>

<template>
	<label
		class="checkbox"
		@mouseup="playClickSound"
		@mouseenter="playHoverSound"
	>
		<input
			type="checkbox"
			v-bind="$attrs"
			:checked="modelValue"
			@input="onInput"
		/>
		<span class="box"></span>
		<span class="label">{{ label }}</span>
	</label>
</template>

<style lang="scss" scoped>
@import "@/assets/_util.scss";

.checkbox {
	min-height: u(24);
	display: flex;
	align-items: center;
	justify-content: flex-start;
	gap: u(16);
}

span.label {
	margin-bottom: u(-1.5); // optical alignment
}

span.box {
	height: u(24);
	width: u(24);
	flex-shrink: 0;
	border-radius: u(5);
	transition: background-color 0.1s ease-in-out;
	background-color: rgba(241, 242, 242, 0.15);

	&:after {
		content: "";
		position: absolute;
		opacity: 0;
		transition: opacity 0.1s ease-in-out;
		left: u(8);
		top: u(4);
		width: u(5);
		height: u(10);
		box-sizing: content-box;
		border: solid rgb(var(--primary-color));
		border-width: 0 u(3) u(3) 0;
		transform: rotate(45deg);
	}
}

label {
	display: block;
	position: relative;
	font-size: u(18);
	color: #f1f2f2;
	font-weight: 500;
	line-height: u(24);
	cursor: pointer;

	input:checked ~ span.box {
		background-color: rgba(151, 151, 151, 0.15);

		&:after {
			opacity: 1;
		}
	}
}

input {
	position: absolute;
	opacity: 0;
	height: 0;
	widows: 0;
}
</style>
