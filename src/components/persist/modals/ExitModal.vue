<script setup lang="ts">
import { useModalStore } from "@/stores/modal";
import AltButton from "@/components/AltButton.vue";
import { useLocalization } from "@/stores/localization";
import { onMounted, onUnmounted } from "vue";
import { playSound } from "@/utils/playSound";

const modal = useModalStore();
const { t } = useLocalization();

function exit() {
	alt.emit("exit");
}

function handler(event: KeyboardEvent) {
	if (event.key != "Enter") return;
	playSound("move");
	exit();
}

onMounted(() => document.addEventListener("keydown", handler));
onUnmounted(() => document.removeEventListener("keydown", handler));

function cancel() {
	modal.close();
}
</script>

<template>
	<div class="modal">
		<div class="modal__header">
			<div class="modal__title">{{ t("CONFIRM") }}</div>
			<div class="modal__subTitle">{{ t("ARE_YOU_SURE_EXIT") }}</div>
		</div>
		<div class="modal__actions">
			<div class="modal__buttons">
				<alt-button color="green" @click="exit">{{
					t("EXIT_TO_DESKTOP")
				}}</alt-button>
				<alt-button color="red" @click="cancel">{{ t("CANCEL") }}</alt-button>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.modal {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: u(64);

	&__header {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: u(24);
	}

	&__title {
		font-size: u(48);
		font-weight: 600;
		color: $text_light;
	}

	&__subTitle {
		font-size: u(24);
		font-weight: 500;
		color: rgba($text_light, 0.75);
	}

	&__buttons {
		display: flex;
		gap: u(24);
		font-size: u(18);
	}
}
</style>
