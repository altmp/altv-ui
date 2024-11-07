<script setup lang="ts">
import { getModalProps, ModalType, useModalStore } from "@/stores/modal";
import { computed, ref } from "vue";
import AltButton from "@/components/AltButton.vue";
import ServerIcons from "@/components/ServerIcons.vue";
import AltInput from "@/components/form/AltInput.vue";
import StarOutline from "@/components/icons/StarOutline.vue";
import Star from "@/components/icons/Star.vue";
import LanguageFlag from "@/components/LanguageFlag.vue";
import { useServersStore } from "@/stores/servers";
import { useConnectionStateStore } from "@/stores/connectionState";
import { useLocalization } from "@/stores/localization";
import AltCheckbox from "@/components/form/AltCheckbox.vue";
import { useSettingsStore } from "@/stores/settings";
import {
	playHoverSound,
	playMoveSound,
	playClickSound,
} from "@/utils/playSound";

const settings = useSettingsStore();
const connection = useConnectionStateStore();
const servers = useServersStore();
const modal = useModalStore();
const { t } = useLocalization();
const modalProps = getModalProps<ModalType.Connect>(modal);

const favorite = computed(() =>
	servers.favoriteIds.has(modalProps.value.server.publicId),
);
const bannerError = ref(false);
const bannerLoading = ref(true);
const skinChecked = computed(
	() =>
		!settings.data.launcherSkinsDisabled.includes(
			modalProps.value.server.publicId,
		),
);

function toggleSkinChecked() {
	const id = modalProps.value.server.publicId;
	const arr = settings.data.launcherSkinsDisabled;
	const index = arr.indexOf(id);
	if (index == -1) arr.push(id);
	else arr.splice(index, 1);
	settings.save("launcherSkinsDisabled");
}

let websiteUrl = modalProps.value.server.website;
if (!websiteUrl.match(/^https?:\/\//)) websiteUrl = "//" + websiteUrl;

const password = ref("");
function connect() {
	const server = modalProps.value.server;
	if (!server) return;
	connection.setServer(server.name);
	alt.emit(
		"connection:connect",
		server.address,
		password.value,
		server.publicId,
		server.name,
		server.hasCustomSkin && skinChecked.value,
	);
	modal.close();
}
</script>

<template>
	<div
		class="connect"
		:class="{ 'connect--wide': bannerError || modalProps.server.bannerUrl }"
	>
		<div
			v-if="bannerError"
			class="connect__banner connect__banner--error"
		></div>
		<template v-else-if="modalProps.server.bannerUrl">
			<img
				class="connect__banner"
				:class="{ 'connect__banner--loading': bannerLoading }"
				:src="modalProps.server.bannerUrl"
				@load="bannerLoading = false"
				@error="bannerError = true"
			/>
			<div
				class="connect__banner connect__banner--placeholder"
				v-if="bannerLoading"
			></div>
		</template>
		<div class="connect__content">
			<div class="connect__titleRow">
				<div class="connect__title">
					<server-icons :server="modalProps.server" class="connect__icons" />
					<span>{{ modalProps.server.name }}</span>
				</div>
				<div
					class="connect__favorite"
					@click="
						() => {
							servers.toggleFavorite(modalProps.server.publicId);
							playClickSound();
						}
					"
					@mouseenter="playHoverSound"
				>
					<star-outline v-if="!favorite" /><star v-if="favorite" />
				</div>
			</div>
			<div class="connect__data">
				<div class="info">
					<div class="info__element" dir="ltr">
						{{
							t(
								"SERVER_PLAYERS",
								`${modalProps.server.playersCount} / ${modalProps.server.maxPlayersCount}`,
							)
						}}
					</div>
					<div class="info__element">
						{{ modalProps.server.gameMode }}
					</div>
					<div class="info__element">
						<language-flag :language="modalProps.server.language" />
					</div>
					<div class="info__element" v-if="modalProps.server.website">
						<a
							:href="websiteUrl"
							target="_blank"
							@click="playMoveSound"
							@mouseenter="playHoverSound"
							>{{ modalProps.server.website }}</a
						>
					</div>
				</div>
				<div class="info__description">
					{{ modalProps.server.description }}
				</div>
			</div>
			<div class="connect__actions">
				<alt-input
					class="connect__password"
					@keydown.enter.stop="connect"
					type="password"
					placeholder="Password"
					autocomplete="off"
					v-if="modalProps.server.passworded"
					v-model="password"
				></alt-input>
				<alt-button color="green" @click="connect">{{
					t("CONNECT")
				}}</alt-button>
				<alt-checkbox
					class="connect__checkbox"
					:model-value="skinChecked"
					@click="toggleSkinChecked"
					v-if="
						modalProps.server.hasCustomSkin && !modalProps.server.passworded
					"
					:label="t('APPLY_SERVER_SKIN')"
				></alt-checkbox>
			</div>
			<alt-checkbox
				class="connect__checkbox connect__checkbox--newline"
				:model-value="skinChecked"
				@click="toggleSkinChecked"
				v-if="modalProps.server.hasCustomSkin && modalProps.server.passworded"
				:label="t('APPLY_SERVER_SKIN')"
			></alt-checkbox>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.connect {
	height: u(400);
	min-width: u(720);
	max-width: 60vw;
	border-radius: u(8);
	border: solid u(2) rgba($text_light, 0.05);
	background: $back_black;
	display: flex;
	font-family: Inter, sans-serif;
	position: relative;

	&--wide {
		overflow: hidden;
		min-width: u(720 + 160);
	}

	&__banner {
		width: u(160);
		height: 100%;
		opacity: 1;
		transition: opacity 0.2s ease;

		&--error {
			background: rgba(white, 0.02);
		}

		@keyframes banner-placeholder {
			from {
				background: rgba(white, 0.05);
			}
			to {
				background: rgba(white, 0.01);
			}
		}

		&--placeholder {
			position: absolute;
			top: 0;
			left: 0;
			animation: banner-placeholder 1s alternate infinite ease-in-out;
		}

		&--loading {
			opacity: 0;
		}
	}

	&__data {
		display: flex;
		gap: u(32);
		> * {
			flex-grow: 1;
		}
	}

	&__content {
		flex: 1;
		padding: u(32);
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: u(24);
		justify-content: space-between;
		width: min-content;
		line-height: 130%;
	}

	&__description {
		font-size: u(18);
	}

	&__titleRow {
		display: flex;
		align-items: flex-start;
		font-size: u(28);
		line-height: 120%;
		gap: u(20);
	}

	&__title {
		font-weight: 500; // 600 in figma
		color: white;
		display: inline;
		flex: 1;
		//background: red;
	}

	&__icons {
		display: inline-flex !important;
		margin-right: u(16);
		gap: u(8);

		[dir="rtl"] & {
			margin-left: unset;
			margin-right: u(20);
		}

		:deep(svg) {
			height: u(20);
			width: u(20);
		}
	}

	&__favorite {
		flex-shrink: 0;
		height: 1.2em; // 120% line height
		display: flex;
		justify-content: center;
		align-items: center;
		//background: red;
		cursor: pointer;

		svg {
			height: u(20);
			width: u(20);
		}
	}

	.info {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: u(12);
		color: rgba(white, 0.75);
		font-size: u(18);
		font-weight: 500;

		&__element {
			width: max-content;
		}

		&__description {
			max-height: u(130);
			max-width: u(400);
			width: auto;
			word-break: break-word;
			overflow-x: hidden;
			overflow-y: auto;
			display: block;

			[dir="rtl"] & {
				unicode-bidi: plaintext;
				text-align: right;
			}

			@include scrollbar();
		}

		a {
			color: rgba(white, 0.75);
			text-decoration: none;
			padding-bottom: u(4);
			border-bottom: solid u(2) rgb(var(--primary-color));
			box-sizing: content-box;
			display: inline-block;
			max-width: u(300);
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	&__password,
	&__password :deep(input) {
		width: u(240);
	}

	&__password :deep(input) {
		padding-top: u(16);
		padding-bottom: u(16);
	}

	&__checkbox {
		margin-left: u(16);

		&--newline {
			margin: 0;
		}
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
