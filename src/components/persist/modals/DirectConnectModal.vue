<script setup lang="ts">
import AltButton from "@/components/AltButton.vue";
import AltInput from "@/components/form/AltInput.vue";
import { ref, watch } from "vue";
import { getModalProps, ModalType, useModalStore } from "@/stores/modal";
import { useConnectionStateStore } from "@/stores/connectionState";
import { useLocalization } from "@/stores/localization";
import { useVersionStore } from "@/stores/version";
import { useRouter } from "vue-router";

const connection = useConnectionStateStore();
const modal = useModalStore();
const version = useVersionStore();
const router = useRouter();
const props = getModalProps<ModalType.DirectConnect>(modal);
const { t } = useLocalization();

const address = ref(props.value.address ?? version.lastIp);
const password = ref(props.value.password ?? "");

function connect() {
	const addr = address.value?.trim() ?? "";
	if (!addr) return;

	connection.setServer(addr);
	version.updateLastIp(addr);
	alt.emit("connection:connect", addr, password.value, "", "", false);
	modal.close();
}

watch(
	() => !connection.newConnectionPossible,
	(value) => {
		if (value) modal.close();
	},
	{ immediate: true },
);
</script>

<template>
	<div class="direct-connect">
		<div class="direct-connect__content">
			<div class="direct-connect__title">
				{{ t("DIRECT_CONNECT") }}
			</div>
			<div class="direct-connect__rows">
				<div class="direct-connect__actions">
					<alt-input
						class="direct-connect__ip"
						@keydown.enter.stop="connect"
						v-model="address"
						type="text"
						:placeholder="t('SERVER_ADDRESS')"
						autocomplete="off"
					></alt-input>
				</div>
				<div class="direct-connect__actions">
					<alt-input
						class="direct-connect__password"
						@keydown.enter.stop="connect"
						v-model="password"
						type="password"
						:placeholder="t('PASSWORD_IF_NEEDED')"
						autocomplete="off"
					></alt-input>
					<alt-button color="primary" @click="connect">{{
						t("CONNECT")
					}}</alt-button>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
@import "@/assets/_palette.scss";

.direct-connect {
	//min-width: u(500);
	border-radius: u(8);
	border: solid u(2) rgba($text_light, 0.05);
	background: $back_black;
	display: flex;
	overflow: hidden;
	font-family: Inter, sans-serif;

	&__content {
		flex: 1;
		padding: u(32);
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: u(24);
		justify-content: space-between;
	}

	&__title {
		text-align: center;
		font-size: u(28);
		line-height: 120%;
		gap: u(20);
		font-weight: 500;
		color: white;
	}

	&__rows {
		display: flex;
		flex-direction: column;
		gap: u(15);
	}

	&__ip,
	&__password {
		width: u(310);
	}

	&__actions :deep(input) {
		padding-top: u(16);
		padding-bottom: u(16);
	}

	&__actions {
		font-size: u(18);
		display: flex;
		justify-content: flex-start;
		line-height: 1;
		gap: u(16);
	}
}
</style>
