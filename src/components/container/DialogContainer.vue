<script lang="ts" setup>
import { ModalType, useModalStore } from "@/stores/modal";
import Modals from "@/components/persist/modals/Modals.vue";
import { playClickSound } from "@/utils/playSound";

const modal = useModalStore();

function closeModal() {
	if (modal.type == ModalType.None || !modal.closeable) return;
	modal.close();
	playClickSound();
}
</script>

<template>
	<teleport to="body">
		<div
			class="dialog-container"
			:class="{ visible: modal.type !== ModalType.None }"
			@mousedown.self="closeModal"
		>
			<transition name="fade">
				<modals v-if="modal.type !== ModalType.None" />
			</transition>
		</div>
	</teleport>
</template>

<style lang="scss" scoped>
.dialog-container {
	position: absolute;
	width: 100vw;
	height: 100vh;
	top: 0;
	left: 0;
	z-index: 15;
	background: rgba(16, 16, 16, 0.9);
	opacity: 1;
	transition: opacity 0.2s ease;
	display: flex;
	justify-content: center;
	align-items: center;

	> * {
		position: absolute;
	}

	&:not(.visible) {
		opacity: 0;
		pointer-events: none;
	}
}
</style>
