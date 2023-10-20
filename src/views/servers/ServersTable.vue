<script lang="ts" setup>
import {computed, ref} from "vue";
import SortAsc from "@/components/icons/SortAsc.vue";
import SortDesc from "@/components/icons/SortDesc.vue";
import ServersElement from "@/views/servers/ServersElement.vue";
import {useFilterStore} from "@/stores/filter";
import {useSettingsStore} from "@/stores/settings";
import {useServersStore} from "@/stores/servers";
import {useLocalization} from "@/stores/localization";
import { playHoverSound, playMoveSound, playClickSound } from "@/utils/playSound";

const filter = useFilterStore();
const settings = useSettingsStore();
const servers = useServersStore();
const { t, locales } = useLocalization();

const headers = computed( () => {
    return [
        {id: "name", name: t('SERVER_NAME')},
        {id: "playersCount", name: t('PLAYERS')},
        // {id: "ping", name: t('PING')},
        {id: "gameMode", name: t('GAMEMODE')},
        {id: "language", name: t('LANGUAGE')},
    ]
});

const sortBy = ref<string>("playersCount");
const sortDirection = ref<number>(1); // 1 is desc, -1 is asc

function changeSortBy(newSortBy: string) {
    if (sortBy.value === newSortBy) sortDirection.value = -sortDirection.value;
    else {
        sortBy.value = newSortBy;
        sortDirection.value = 1;
    }
}

const sortedData = computed(() => {
    const maxPlayers = !filter.maxPlayers || isNaN(+filter.maxPlayers) ? null : +filter.maxPlayers;
    const minPlayers = !filter.minPlayers || isNaN(+filter.minPlayers) ? null : +filter.minPlayers;
    const maxSlots = !filter.maxSlots || isNaN(+filter.maxSlots) ? null : +filter.maxSlots;
    const minSlots = !filter.minSlots || isNaN(+filter.minSlots) ? null : +filter.minSlots;
    // const maxPing = !filter.maxPing || isNaN(+filter.maxPing) ? null : +filter.maxPing;
    const query = filter.search.trim().toLowerCase();

    return servers.servers
        .filter((e) => {
            if (filter.hideFull && e.maxPlayersCount == e.playersCount) return false;
            if (filter.hideEmpty && e.playersCount == 0) return false;
            if (filter.hideLocked && e.passworded) return false;

            if (maxPlayers != null && e.playersCount > maxPlayers) return false;
            if (minPlayers != null && e.playersCount < minPlayers) return false;

            if (maxSlots != null && e.maxPlayersCount > maxSlots) return false;
            if (minSlots != null && e.maxPlayersCount < minSlots) return false;

            // if (maxPing != null && e.ping != -1 && e.ping != null && e.ping > maxPing) return false;

            return (
                e.name.toLowerCase().includes(query) ||
                locales.get(e.language)?.name.toLowerCase().includes(query) ||
                e.tags.some(e => e.toLowerCase().includes(query))
            );
        })
        .sort((a: any, b: any) => {
            if (settings.data.promotedOnTop && a.promoted != b.promoted) {
                return a.promoted ? -1 : 1;
            }

            if (!sortBy.value) {
                return 0;
            }

            if (a[sortBy.value] > b[sortBy.value]) {
                return -1 * sortDirection.value;
            }

            if (a[sortBy.value] < b[sortBy.value]) {
                return 1 * sortDirection.value;
            }

            return 0;
        });
});
</script>

<template>
    <table class="servers-table">
        <thead>
        <tr>
            <th v-for="header in headers" @click="changeSortBy(header.id); playClickSound();" :class="{ active: sortBy === header.id, [header.id]: true }" @mouseenter="playHoverSound">
                <span>{{ header.name }}</span>
                <sort-desc v-if="sortBy === header.id && sortDirection === 1" />
                <sort-asc v-if="sortBy === header.id && sortDirection === -1" />
            </th>
        </tr>
        </thead>
        <tbody>
        <servers-element v-for="item in sortedData" :key="item.publicId" :item="item" @click="playMoveSound" @mouseenter="playHoverSound" />
        </tbody>
    </table>
</template>

<style lang="scss">
@import "@/assets/_util.scss";
@import "@/assets/_palette.scss";

table.servers-table {
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
    //padding-left: u(24);

    tr {
        cursor: pointer;
    }

    tbody tr {
        background: transparent;
        transition: background 0.2s ease;

        &:hover {
            background: rgba(white, 0.03);
        }

        &:active {
            background: rgba(white, 0.05);
        }
    }

    td,
    th {
        text-align: left;
        padding: u(24) 0;
        border-bottom: u(1) solid rgba(241, 242, 242, .1);
        vertical-align: top;
        font-weight: 500;

        &:not(:first-child) {
            width: u(160);
            overflow-x: hidden;
            text-overflow: ellipsis;

            &.gameMode {
                width: u(192);

                padding-right: u(32);

                [dir=rtl] & {
                    //padding-left: u(32);
                    padding-right: unset;
                }
            }
        }

        td {
            &:not(:first-child) {
                &.gameMode {
                    span {
                        display: -webkit-box;
                        -webkit-line-clamp: 3;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                }
            }
        }

        [dir=rtl] & {
            &.players, &.gameMode, &.language {
                text-align: center;
            }
        }

        &:first-child {
            padding-left: u(44);
        }

        &:last-child {
            padding-right: u(22);
        }

        [dir=rtl] & {
            text-align: right;

            &:first-child {
                padding-left: unset;
                padding-right: u(44);
            }

            &:last-child {
                padding-right: unset;
                padding-left: u(22);
            }
        }
    }

    th {
        padding: u(24) 0;
        font-size: u(18);
        color: rgba($text_light, 0.5);

        &.active {
            color: white;
        }

        svg {
            margin-left: u(12);

            [dir=rtl]  & {
                margin-left: unset;
                margin-right: u(12);
            }

            height: u(12)
        }
    }
}
</style>