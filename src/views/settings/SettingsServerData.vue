<script setup lang="ts">
import BlockContainer from "@/components/container/BlockContainer.vue";
import prettyBytes from "pretty-bytes";
import { ModalType, useModalStore } from "@/stores/modal";
import { useLocalization } from "@/stores/localization";
import { playSound } from "@/utils/playSound";
import { computed } from "vue";
import { useConnectionStateStore } from "@/stores/connectionState";
import moment from "moment/min/moment-with-locales";

const props = defineProps<{
	id: string;
	type: string;
	name: string;
	lastVisit: number;
	resourcesSize: number;
	dataSize: number;
}>();
const modal = useModalStore();
const connectionState = useConnectionStateStore();
const canDelete = computed(
	() => !connectionState.connectedCacheKeys.includes(props.id),
);

function deleteData(type: number) {
	modal.open(ModalType.DeleteServerData, {
		id: props.id,
		type,
		size: type === 0 ? props.resourcesSize : props.dataSize,
		name: props.name,
	});
	playSound("error");
}

const { t } = useLocalization();
</script>

<template>
	<block-container class="server">
		<div class="server__server-info">
			<div class="server__server-name">
				{{ type === "shared" ? t("SHARED_RESOURCES", props.name) : props.name }}
			</div>
			<div class="server__server-usage">
				<span>{{ t("RESOURCES_SIZE", prettyBytes(props.resourcesSize)) }}</span>
				<span v-if="type === 'server'">{{
					t("DATA_SIZE", prettyBytes(props.dataSize))
				}}</span>
				<span v-if="type === 'server'">
					{{
						t(
							"LAST_VISIT",
							moment(Math.floor(props.lastVisit * 1000)).fromNow(),
						)
					}}
				</span>
			</div>
		</div>
		<div class="server__server-actions">
			<a
				class="server__server-action"
				:class="{ inactive: !canDelete }"
				@click="deleteData(0)"
			>
				{{ t("DELETE_RESOURCES") }}
			</a>
			<a
				class="server__server-action"
				:class="{ inactive: !canDelete }"
				v-if="type === 'server'"
				@click="deleteData(1)"
			>
				{{ t("DELETE_DATA") }}
			</a>
		</div>
	</block-container>
</template>

<style lang="scss" scoped>
.server {
	display: flex;
	font-size: u(16);
	outline: none !important;
	transform: none !important;

	+ * {
		margin-top: u(16);
	}

	&__server-info {
		display: flex;
		flex-direction: column;
		gap: u(12);
		flex: 1;
	}

	&__server-name {
		font-weight: 500; // 600 in figma
		line-height: u(16);
		unicode-bidi: plaintext;
	}

	&__server-usage {
		color: rgba(white, 0.5);
		display: flex;
		gap: u(12);
		font-size: u(14);
		line-height: u(14);
		flex-wrap: wrap;
	}

	&__server-actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		column-gap: u(24);
		flex-wrap: wrap;
		max-width: 40%;
	}

	&__server-action {
		cursor: pointer;
		height: max-content;

		&.inactive {
			opacity: 0.5;
		}
	}
}
</style>
