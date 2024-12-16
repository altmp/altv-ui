<script setup lang="ts">
import QuestionCircleIcon from "@/icons/question-circle.svg?component";
import { playSound } from "@/utils/playSound";
import Tooltip from "@/components/container/Tooltip.vue";

defineProps({
	modelValue: {
		type: Boolean,
	},
	label: {
		type: String,
	},
	help: {
		type: String,
	},
	disabled: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(["update:modelValue"]);

function onInput(event: Event) {
	emit("update:modelValue", (event.currentTarget! as any).checked);
}
</script>

<template>
	<label
		class="checkbox tw"
		@mouseup="playSound('click')"
		@mouseenter="playSound('hover')"
	>
		<input
			type="checkbox"
			v-bind="$attrs"
			:disabled="disabled"
			:checked="modelValue"
			@input="onInput"
		/>
		<span class="box"></span>
		<div class="flex">
			<span class="label">{{ label }}</span>
			<Tooltip :text="help" class="ml-2.5" position="top">
				<button class="align-middle">
					<QuestionCircleIcon class="text-white/50 size-4.5 stroke-1.5" />
				</button>
			</Tooltip>
		</div>
	</label>
</template>

<style lang="scss" scoped>
.checkbox {
	min-height: u(24);
	display: flex;
	align-items: center;
	justify-content: flex-start;
	gap: u(16);
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

input:disabled ~ span.box {
	opacity: 0.5;
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
