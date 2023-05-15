<script setup lang="ts">

import {useServersStore} from "@/stores/servers";
import {computed} from "vue";
import {useLocalization} from "@/stores/localization";
import Loader from "@/components/Loader.vue";

const servers = useServersStore();
const serversCount = computed(() => servers.servers.length);
const playersCount = computed(() => servers.servers.reduce((prev, curr) => prev + curr.players, 0));
const { tPlural: t } = useLocalization();
</script>

<template>
    <h3 class="stat__servers">{{ t('SERVERS_ONLINE', servers.serversLoading ? '...' : serversCount) }}</h3>
    <h3 class="stat__players">{{ t('PLAYERS_ONLINE', servers.serversLoading ? '...' : playersCount) }}</h3>
</template>

<style lang="scss" scoped>
h3 + h3 {
    margin-top: u(16);
}

.loader-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: calc(2em + #{u(20)});
}
</style>