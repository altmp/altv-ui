<script setup lang="ts">
import { useFilterStore } from "@/stores/filter";
import AltInput from "../../components/form/AltInput.vue";
import AltCheckbox from "../../components/form/AltCheckbox.vue";
import Search from "@/components/icons/Search.vue";
import { useSettingsStore } from "@/stores/settings";
import { useLocalization } from "@/stores/localization";

const filters = useFilterStore();
const settings = useSettingsStore();
const { t } = useLocalization();
</script>

<template>
	<div class="filter">
		<alt-input v-model="filters.search" :placeholder="t('SEARCH')">
			<search />
		</alt-input>
		<div class="filter__group">
			<h3>{{ t("CURRENT_PLAYERS") }}</h3>
			<div class="filter__input-grid">
				<alt-input
					v-model="filters.minPlayers"
					placeholder="0"
					:pattern="/\D/g"
				></alt-input>
				<alt-input
					v-model="filters.maxPlayers"
					:placeholder="'4\xa0096'"
					:pattern="/\D/g"
				></alt-input>
				<h4>{{ t("MIN") }}</h4>
				<h4>{{ t("MAX") }}</h4>
			</div>
		</div>

		<div class="filter__group">
			<h3>{{ t("PLAYER_SLOTS") }}</h3>
			<div class="filter__input-grid">
				<alt-input
					v-model="filters.minSlots"
					placeholder="0"
					:pattern="/\D/g"
				></alt-input>
				<alt-input
					v-model="filters.maxSlots"
					:placeholder="'4\xa0096'"
					:pattern="/\D/g"
				></alt-input>
				<h4>{{ t("MIN") }}</h4>
				<h4>{{ t("MAX") }}</h4>
			</div>
		</div>

		<!--        <div class="filter__group">-->
		<!--            <h3>{{ t('MAX_PING') }}</h3>-->
		<!--            <alt-input v-model="filters.maxPing" placeholder="∞" :pattern="/\D/g"></alt-input>-->
		<!--        </div>-->
		<alt-checkbox
			v-model="settings.data.promotedOnTop"
			@change="settings.save('promotedOnTop')"
			:label="t('PROMOTED_ON_TOP')"
		></alt-checkbox>

		<div class="filter__group">
			<h3>{{ t("HIDE_SERVERS") }}</h3>
			<div class="filter__group-checkboxes">
				<alt-checkbox
					v-model="filters.hideFull"
					:label="t('HIDE_FULL')"
				></alt-checkbox>
				<alt-checkbox
					v-model="filters.hideEmpty"
					:label="t('HIDE_EMPTY')"
				></alt-checkbox>
				<alt-checkbox
					v-model="filters.hideLocked"
					:label="t('HIDE_LOCKED')"
				></alt-checkbox>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
h3 {
	margin-bottom: u(16);
}

.filter {
	display: flex;
	flex-direction: column;
	gap: u(32);

	&__group-checkboxes {
		display: flex;
		flex-direction: column;
		gap: u(18);
	}

	&__input-grid {
		display: grid;
		gap: u(8);
		grid-template-columns: 1fr 1fr;

		h4 {
			color: rgba($text_light, 0.5);
			font-size: u(14);
			font-weight: 600;
			text-transform: uppercase;
		}
	}
}
</style>
