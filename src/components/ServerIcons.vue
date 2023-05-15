<script setup lang="ts">
import Tooltip from "@/components/container/Tooltip.vue";
import Private from "@/components/icons/Private.vue";
import Check from "@/components/icons/Check.vue";
import Promoted from "@/components/icons/Promoted.vue";
import type {IServer} from "@/types/IServer";
import type {PropType} from "vue";
import {useLocalization} from "@/stores/localization";

defineProps({
    server: {
        type: Object as PropType<IServer>,
        required: true
    },
});
const { t } = useLocalization();
</script>

<template>
<div class="server-icons" v-bind="$attrs">
    <tooltip :text="t('SERVER_LOCKED')" v-if="server.locked">
        <private />
    </tooltip>
    <tooltip :text="t('SERVER_VERIFIED')" v-if="server.verified">
        <check />
    </tooltip>
    <tooltip :text="t('SERVER_PROMOTED')" v-if="server.promoted">
        <promoted />
    </tooltip>
</div>
</template>

<style lang="scss" scoped>
@import '@/assets/_util.scss';

.server-icons {
    display: flex;
    gap: u(16);
    flex-shrink: 0;

    &:empty {
        display: none !important;
    }
}
</style>