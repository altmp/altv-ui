<script setup lang="ts">
import Tooltip from "@/components/container/Tooltip.vue";
import Private from "@/components/icons/Private.vue";
import Check from "@/components/icons/Check.vue";
import Promoted from "@/components/icons/Promoted.vue";
import type { OnlineServer } from "@/types/IServer";
import { useLocalization } from "@/stores/localization";
import { type ServerGroup, isGroup } from "@/stores/servers";

defineProps<{
	item: ServerGroup | OnlineServer;
}>();
const { t } = useLocalization();
</script>

<template>
	<div v-if="isGroup(item)" class="server-icons">
		<tooltip :text="t('SERVER_VERIFIED')" v-if="item.verified">
			<check />
		</tooltip>
		<tooltip :text="t('SERVER_PROMOTED')" v-if="item.promoted">
			<promoted />
		</tooltip>
	</div>
	<div v-else class="server-icons">
		<tooltip :text="t('SERVER_LOCKED')" v-if="item.passworded">
			<private />
		</tooltip>
		<tooltip :text="t('SERVER_VERIFIED')" v-if="item.verified">
			<check />
		</tooltip>
		<tooltip :text="t('SERVER_PROMOTED')" v-if="item.promoted">
			<promoted />
		</tooltip>
	</div>
</template>

<style lang="scss" scoped>
@import "@/assets/_util.scss";

.server-icons {
	display: flex;
	gap: u(16);
	flex-shrink: 0;

	&:empty {
		display: none !important;
	}
}
</style>
