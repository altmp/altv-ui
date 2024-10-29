<script setup lang="ts">
import keys from "../../assets/json/keys.json";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { playHoverSound, playClickSound } from "@/utils/playSound";

defineProps({
	modelValue: {
		type: Number,
		default: 0,
	},
});
const active = ref(false);

const emit = defineEmits(["update:modelValue", "change"]);

watch(
	() => active.value,
	(newActive, oldActive, onCleanup) => {
		if (!newActive) return;
		const domHandler = (event: KeyboardEvent) => {
			event.preventDefault();
		};

		const handler = (key: number) => {
			if (key < 4) return;
			emit("update:modelValue", key);
			emit("change", key);
			active.value = false;
		};

		alt.on("keydown", handler);
		document.addEventListener("keydown", domHandler);

		onCleanup(() => {
			alt.off("keydown", handler);
			document.removeEventListener("keydown", domHandler);
		});
	},
);

function handler() {
	active.value = false;
}

onMounted(() => document.addEventListener("click", handler));
onUnmounted(() => document.removeEventListener("click", handler));

function getKeyName(value: number) {
	return (
		(keys as Record<number, string>)[value] ||
		String.fromCharCode(value) ||
		"UNKNOWN"
	);
}
</script>

<template>
	<div
		v-bind="$attrs"
		@click.stop="
			() => {
				active = !active;
				playClickSound();
			}
		"
		:class="{ active }"
		@mouseenter="playHoverSound"
	>
		{{ active ? "..." : getKeyName(modelValue) }}
	</div>
</template>

<style lang="scss" scoped>
@import "@/assets/_util.scss";

div {
	width: max-content;
	height: u(50);
	line-height: u(50);
	background: rgba(241, 242, 242, 0.02);
	transition:
		background-color 0.1s ease-in-out,
		transform 0.2s ease;
	border: u(1) solid rgba(241, 242, 242, 0.1);
	border-radius: u(8);
	padding: 0 u(16);
	min-width: u(80);
	text-align: center;
	font-weight: 400;
	text-decoration: none;
	color: #f1f2f2;
	font-size: u(18);
	font-family: "Inter", sans-serif;
	cursor: pointer;

	&:hover {
		background: rgba(241, 242, 242, 0.05);
	}

	&.active {
		background: rgba(241, 242, 242, 0.1);
	}

	&:focus {
		outline: none;
	}

	&::placeholder {
		color: #f1f2f280;
		font-weight: 400;
	}
}
</style>
