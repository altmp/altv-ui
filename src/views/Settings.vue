<script lang="ts" setup>
import { useSettingsStore } from "@/stores/settings";
import SettingsServerData from "@/views/settings/SettingsServerData.vue";
import SettingsVoice from "@/views/settings/SettingsVoice.vue";
import SettingsGeneral from "@/views/settings/SettingsGeneral.vue";
import { useServersStore } from "@/stores/servers";
import { useLocalization } from "@/stores/localization";
import { computed } from "vue";

const settings = useSettingsStore();
const serverData = useServersStore();

const servers = computed(() => serverData.serverData);
const { t } = useLocalization();
</script>

<template>
	<div class="view">
		<div class="view__header">
			<h1>{{ t("SETTINGS") }}</h1>
		</div>

		<div class="view__header view__separated">
			<h1>{{ t("VOICE_CHAT") }}</h1>
		</div>

		<div class="view__header">
			<h1>{{ t("SERVER_DATA") }}</h1>
		</div>

		<div class="view__content menu">
			<div class="view__wrapper menu__wrapper">
				<div class="menu__list">
					<settings-general />
					<div class="menu__list view__combined">
						<settings-voice />
					</div>
				</div>
			</div>
		</div>

		<div class="view__content menu view__separated">
			<div class="view__wrapper menu__wrapper">
				<div class="menu__list">
					<settings-voice />
				</div>
			</div>
		</div>

		<div class="view__content server-data">
			<div class="view__wrapper">
				<div v-if="servers.length === 0" class="view__no-server-data">
					<h2>{{ t("YOU_DIDNT_JOIN_ANY_SERVER_YET") }}</h2>
				</div>
				<settings-server-data v-for="data in servers" v-bind="data" />
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
@import "@/assets/_util.scss";

.view {
	display: grid;
	grid-template-columns: u(416) u(462) auto;
	grid-template-rows: u(154) calc(100vh - #{u(154)});

	> * {
		padding: u(48);
	}

	&__header {
		border-bottom: #f1f2f21a u(1) solid;
		display: flex;
		align-items: center;
	}

	&__header,
	&__content {
		border-right: #f1f2f21a u(1) solid;
	}

	.menu {
		display: flex;
		flex-direction: column;
		gap: u(48);
	}

	.menu__list {
		display: flex;
		flex-direction: column;
		gap: u(32);
	}

	.menu {
		padding: 0 u(24);
		@include scrollable-block(48);
	}

	&__wrapper {
		height: 100%;
		//noinspection CssInvalidPropertyValue
		overflow-y: overlay;
		@include scrollbar(48);
		padding: u(48) u(24);
	}

	.server-data {
		padding: 0 u(24);
	}

	&__no-server-data {
		opacity: 0.75;
	}

	&__combined {
		display: none !important;
	}

	@media (max-width: 145vh) {
		grid-template-columns: u(500) auto;

		&__separated {
			display: none !important;
		}

		&__combined {
			display: flex !important;
		}
	}
}

h3 {
	margin-bottom: u(16);
}
</style>
