<script setup lang="ts">
import { ModalType, useModalStore } from "@/stores/modal";
import Close from "@/components/icons/Close.vue";
import ConnectModal from "@/components/persist/modals/ConnectModal.vue";
import PermissionsModal from "@/components/persist/modals/PermissionsModal.vue";
import { onMounted, onUnmounted } from "vue";
import DirectConnectModal from "@/components/persist/modals/DirectConnectModal.vue";
import DeleteServerDataModal from "@/components/persist/modals/DeleteServerDataModal.vue";
import NicknameModal from "@/components/persist/modals/NicknameModal.vue";
import ExitModal from "@/components/persist/modals/ExitModal.vue";
import { playSound } from "@/utils/playSound";

const modal = useModalStore();

function handler(event: KeyboardEvent) {
	if (event.key != "Escape") return;
	if (modal.closeable) {
		modal.close();
		playSound("click");
	}
}

onMounted(() => document.addEventListener("keyup", handler));
onUnmounted(() => document.removeEventListener("keyup", handler));
</script>

<template>
	<div class="modals">
		<div
			id="close-modal"
			v-if="modal.closeable"
			@click="
				modal.close();
				playSound('click');
			"
			@mouseenter="playSound('hover')"
		>
			<div class="button"><close /></div>
			<div class="hint">ESC</div>
		</div>
		<connect-modal v-if="modal.type === ModalType.Connect" />
		<permissions-modal v-if="modal.type === ModalType.Permissions" />
		<direct-connect-modal v-if="modal.type === ModalType.DirectConnect" />
		<delete-server-data-modal
			v-if="modal.type === ModalType.DeleteServerData"
		/>
		<nickname-modal v-if="modal.type === ModalType.Nickname" />
		<exit-modal v-if="modal.type === ModalType.Exit" />
	</div>
</template>

<style lang="scss" scoped>
#close-modal {
	position: fixed;
	top: u(82);
	right: u(102);

	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: u(8);

	.button {
		padding: u(16);
		background: rgba($text_light, 0.03);
		border-radius: 50%;
		border: solid u(1) rgba($text_light, 0.2);
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		transition:
			background 0.2s ease,
			transform 0.2s ease;
		transform: none;

		svg {
			height: u(24);
			width: u(24);
		}

		&:hover {
			background: rgba($text_light, 0.08);
		}

		&:active {
			transform: scale(0.95);
		}
	}

	.hint {
		font-size: u(14);
		font-weight: 500; // 600 in figma
		color: rgba($text_light, 0.5);
	}
}
</style>
