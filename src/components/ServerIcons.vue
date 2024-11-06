<script setup lang="ts">
import Tooltip from "@/components/container/Tooltip.vue";
import Private from "@/components/icons/Private.vue";
import Promoted from "@/components/icons/Promoted.vue";
import type { IServer } from "@/types/IServer";
import { useLocalization } from "@/stores/localization";
import Verified from "@/components/icons/Verified.vue";

defineProps<{
	server: IServer;
}>();
const { t } = useLocalization();
</script>

<template>
	<div class="server-icons">
		<tooltip :text="t('SERVER_LOCKED')" v-if="server.passworded">
			<private style="height: 1.9vmin; width: 1.9vmin" />
		</tooltip>
		<tooltip :text="t('SERVER_VERIFIED')" v-if="server.verified">
			<verified style="height: 1.9vmin; width: 1.9vmin" />
		</tooltip>
		<tooltip :text="t('SERVER_PROMOTED')" v-if="server.promoted">
			<promoted style="height: 1.9vmin; width: 1.9vmin" />
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
