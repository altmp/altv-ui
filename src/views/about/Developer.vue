<script setup lang="ts">
import BlockContainer from "@/components/container/BlockContainer.vue";
import { onMounted, onUnmounted, ref } from "vue";
import type { IDeveloper } from "@/types/IDeveloper";

const props = defineProps<{
	dev: IDeveloper;
}>();

const images = import.meta.glob("@/assets/avatars/*.png", { eager: true });

function getImage(username: string) {
	const filename = `${username.toLowerCase().replace(/[!.]/g, "")}.png`;
	return (
		Object.entries(images).find((e) => e[0].endsWith(filename))?.[1] as any
	)?.default;
}

const hoverText = ref<boolean>(false);

let hovered = false;
function mousemove(e: MouseEvent) {
	if (!props.dev.hoverRole) return;

	hovered = true;
	setTimeout(() => {
		if (!hovered) return;
		hoverText.value = true;
	}, 500);
	e.stopImmediatePropagation();
	e.stopPropagation();
}

function mousemoveGlobal(_e: MouseEvent) {
	hovered = false;
	if (hoverText.value) hoverText.value = false;
}

onMounted(
	() =>
		props.dev.hoverRole &&
		document.addEventListener("mousemove", mousemoveGlobal),
);
onUnmounted(() => document.removeEventListener("mousemove", mousemoveGlobal));
</script>

<template>
	<block-container class="developer" data-noninteractive>
		<object
			v-if="dev.picture"
			:data="dev.picture"
			type="image/png"
			class="developer__image"
		>
			<img :src="getImage(dev.name)" alt="" class="developer__image" />
		</object>
		<img v-else :src="getImage(dev.name)" alt="" class="developer__image" />
		<div class="developer__username">{{ dev.name }}</div>
		<div class="developer__desc" @mousemove="mousemove">
			<span class="hover" v-if="hoverText">{{
				dev.hoverRole ?? dev.role
			}}</span>
			<span class="normal" v-else>{{ dev.role }}</span>
		</div>
	</block-container>
</template>

<style lang="scss" scoped>
.developer {
	font-size: u(16);
	white-space: pre-wrap;
	color: #f1f2f2;
	font-weight: 500;
	display: flex;
	align-items: center;
	gap: u(12);
	pointer-events: none;

	&__image {
		height: u(32);
		width: u(32);
		border-radius: 50%;
	}

	&__username {
		font-weight: 600;
		margin-left: u(4);
	}

	@keyframes mask-left {
		100% {
			-webkit-mask-position: left;
		}
	}

	&__desc {
		pointer-events: all;
	}
}
</style>
