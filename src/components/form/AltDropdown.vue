<script setup lang="ts">
import Chevron from "@/components/icons/Chevron.vue";
import type { PropType } from "vue";
import {
	computed,
	onMounted,
	onUnmounted,
	reactive,
	ref,
	watchEffect,
} from "vue";
import { playHoverSound, playClickSound } from "@/utils/playSound";

const open = reactive({ state: false });
const search = ref<string>("");
const searchRef = ref<HTMLInputElement | null>(null);
const props = defineProps({
	modelValue: {
		type: String,
		default: "",
	},
	elements: {
		type: Array as PropType<Array<{ value: string; label: string }>>,
		required: true,
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	unknownElement: {
		type: String,
		default: "",
	},
});

watchEffect(() => {
	if (props.disabled) {
		open.state = false;
	}

	if (open.state) {
		searchRef.value?.focus();
	} else {
		search.value = "";
	}
});

function handler() {
	open.state = false;
}

onMounted(() => document.addEventListener("click", handler));
onUnmounted(() => document.removeEventListener("click", handler));

function toggle() {
	open.state = !open.state;
}

const current = computed(
	() =>
		props.elements!.find((e) => e.value === props.modelValue)?.label ??
		props.unknownElement,
);
</script>

<template>
	<div
		class="dropdown"
		:class="{ open: open.state, disabled: props.disabled }"
		@click.stop="
			toggle();
			playClickSound();
		"
		@mouseenter="playHoverSound"
	>
		<div class="value">
			<input
				type="text"
				ref="searchRef"
				v-model="search"
				v-if="open.state"
				:placeholder="current"
			/>
			{{ !open.state ? current : "" }}
		</div>
		<div class="chevron">
			<chevron />
		</div>
		<div v-if="open.state" class="menu">
			<div
				class="element"
				:class="{ active: modelValue === el.value }"
				v-for="el in elements.filter(
					(e) =>
						e.label.toLowerCase().startsWith(search.toLowerCase()) ||
						e.value.toLowerCase().startsWith(search.toLowerCase()),
				)"
				@click.stop="
					() => {
						$emit('update:modelValue', el.value);
						$emit('change', el.value);
						open.state = false;
						playClickSound();
					}
				"
				@mouseenter="playHoverSound"
			>
				{{ el.label }}
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.dropdown {
	width: 100%;
	height: u(50);
	line-height: u(50);
	background: rgba(241, 242, 242, 0.02);
	border: u(1) solid rgba(241, 242, 242, 0.1);
	border-radius: u(8);
	padding: 0 u(16);
	font-weight: 400;
	text-decoration: none;
	color: #f1f2f2;
	font-size: u(18);
	font-family: "Inter", Tahoma, sans-serif;
	cursor: pointer;
	display: flex;
	gap: u(16);
	justify-content: space-between;
	position: relative;
	align-items: center;
	white-space: nowrap;

	.value {
		overflow: hidden;
		text-overflow: ellipsis;
		flex: 1;
	}

	input {
		color: #f1f2f2;
		background: transparent;
		border: none;
		outline: none;
		line-height: u(20);
		unicode-bidi: plaintext;
		width: 100%;
		text-overflow: ellipsis;
		overflow: hidden;

		&:placeholder-shown {
			text-overflow: ellipsis;
		}

		[dir="rtl"] & {
			text-align: right;
		}
	}

	.chevron svg {
		transition: transform 0.2s ease;
	}

	&.open {
		.chevron svg {
			transform: rotate(180deg);
		}
	}

	&:focus {
		outline: none;
	}

	&::placeholder {
		color: rgba(#f1f2f2, 0.6);
		font-weight: 400;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	.menu {
		position: absolute;
		top: u(50);
		left: 0;
		width: 100%;
		z-index: 10;
		background: #151617;
		max-height: u(300);
		overflow-y: scroll;

		@include scrollbar;

		.element {
			padding: 0 u(16);
			overflow: hidden;
			text-overflow: ellipsis;

			&:hover {
				background: rgba(white, 0.05);
			}

			&.active {
				background: rgba(white, 0.07);
			}
		}

		border-bottom-left-radius: u(4);
		border-bottom-right-radius: u(4);
	}

	&.disabled {
		pointer-events: none;
		color: #949494;
	}
}
</style>
