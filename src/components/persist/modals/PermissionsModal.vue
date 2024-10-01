<script setup lang="ts">
import { getModalProps, ModalType, useModalStore } from "@/stores/modal";
import { reactive, ref } from "vue";
import AltButton from "@/components/AltButton.vue";
import AltCheckbox from "@/components/form/AltCheckbox.vue";
import { useLocalization } from "@/stores/localization";
import Tooltip from "@/components/container/Tooltip.vue";
import { playHoverSound, playClickSound } from "@/utils/playSound";

const modal = useModalStore();
const { t } = useLocalization();
const modalProps = getModalProps<ModalType.Permissions>(modal);
const values = ref<Record<string, boolean>>({});

function accept() {
	alt.emit("connection:accept", Object.keys(values.value));
	modal.close();
}

function acceptRequired() {
	alt.emit("connection:accept", []);
	modal.close();
	playClickSound();
}

function deny() {
	alt.emit("connection:deny");
	modal.close();
}

function getPermissionName(id: number) {
	return t(`PERMISSION_${id}`);
}
</script>

<template>
	<div class="modal">
		<div class="modal__header">
			<div class="modal__title">{{ t("PERMISSION_REQUEST") }}</div>
			<div class="modal__subTitle">{{ t("PERMISSION_REQUEST_IF_DENY") }}</div>
		</div>
		<div class="modal__permissionGroups">
			<div
				class="permissions permissions--required"
				v-if="modalProps.required && modalProps.required.length"
			>
				<div class="permissions__title">{{ t("REQUIRED_PERMISSIONS") }}</div>
				<div class="permissions__list">
					<alt-checkbox
						:label="getPermissionName(perm)"
						disabled
						:model-value="true"
						v-for="perm in modalProps.required"
					/>
				</div>
			</div>
			<div
				class="permissions"
				v-if="modalProps.optional && modalProps.optional.length"
			>
				<div class="permissions__title">{{ t("OPTIONAL_PERMISSIONS") }}</div>
				<div class="permissions__list">
					<alt-checkbox
						:label="getPermissionName(perm)"
						v-model="values[perm]"
						v-for="perm in modalProps.optional"
					/>
				</div>
			</div>
		</div>
		<div class="modal__actions">
			<div class="modal__buttons">
				<alt-button color="green" @click="accept">{{ t("ACCEPT") }}</alt-button>
				<alt-button color="red" @click="deny">{{ t("DENY") }}</alt-button>
			</div>
			<a
				href="#"
				v-if="modalProps.optional.length"
				@click="acceptRequired()"
				@mouseenter="playHoverSound"
				>{{ t("ALLOWED_REQUIRED_ONLY") }}</a
			>
		</div>
		<div class="modal__additionalAction"></div>
	</div>
</template>

<style lang="scss" scoped>
@import "@/assets/_palette.scss";

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
		font-size: u(16);
		font-weight: 400;
		color: rgba($text_light, 0.5);
	}

	&__permissionGroups {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: u(48);

		.permissions {
			font-size: u(18);

			&__title {
				margin-bottom: u(24);
				text-align: center;
				font-weight: 500;
				font-size: u(16);
				color: rgba($text_light, 0.5);
			}

			&__list {
				> * + * {
					margin-top: u(16);
				}
			}

			&__element {
				display: flex;
				align-items: center;
				gap: u(8);

				svg {
					opacity: 0.5;
					margin-bottom: u(-5);
					width: u(24);
					height: u(24);
				}
			}

			&--required .permissions__list {
				opacity: 0.5;
				pointer-events: none;
			}
		}
	}

	&__actions a {
		display: block;
		margin-top: u(24);
		text-align: center;
		color: rgba(white, 0.5);
		line-height: u(16);
		font-size: u(16);
	}

	&__buttons {
		display: flex;
		gap: u(24);
		font-size: u(18);
	}
}
</style>
