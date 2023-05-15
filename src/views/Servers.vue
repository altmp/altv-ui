<script setup lang="ts">

import Refresh from "../components/icons/Refresh.vue";
import ServersFilter from "@/views/servers/ServersFilter.vue";
import ServersTable from "@/views/servers/ServersTable.vue";
import Loader from "@/components/Loader.vue";
import ServersStat from "@/views/servers/ServersStat.vue";
import {useLocalization} from "@/stores/localization";
import {useServersStore} from "@/stores/servers";
import { playHoverSound, playClickSound } from "@/utils/playSound";

function reloadServers() {
    alt.emit('servers:reload');
}

// cannot use :active, cuz it triggers to every mouse button in CEF
function mouseDown(e: MouseEvent) {
    if (e.button != 0) return e.preventDefault();
    const target = e.currentTarget as HTMLDivElement;
    target.classList.add('active');
    function mouseUp() {
        target.classList.remove('active');
        document.removeEventListener('mouseup', mouseUp);
    }
    document.addEventListener('mouseup', mouseUp);
}

const { t } = useLocalization();
const servers = useServersStore();

const filters = t('FILTERS');
</script>

<template>
    <div class="view">
        <div class="left">
            <div class="menu-collapsed">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.4573 12L6.96533 3.273C6.89542 3.20267 6.84014 3.11917 6.80271 3.02734C6.76528 2.93551 6.74642 2.83717 6.74725 2.738C6.74807 2.63884 6.76855 2.54082 6.80751 2.44962C6.84646 2.35843 6.90312 2.27586 6.97419 2.2067C7.04527 2.13754 7.12935 2.08317 7.22158 2.04672C7.31381 2.01027 7.41235 1.99248 7.5115 1.99437C7.61065 1.99626 7.70844 2.01779 7.79922 2.05772C7.88999 2.09765 7.97194 2.15519 8.04033 2.227L17.0403 11.477C17.1766 11.617 17.2528 11.8047 17.2528 12C17.2528 12.1953 17.1766 12.383 17.0403 12.523L8.04033 21.773C7.97194 21.8448 7.88999 21.9023 7.79922 21.9423C7.70844 21.9822 7.61065 22.0037 7.5115 22.0056C7.41235 22.0075 7.31381 21.9897 7.22158 21.9533C7.12935 21.9168 7.04527 21.8625 6.97419 21.7933C6.90312 21.7241 6.84646 21.6416 6.80751 21.5504C6.76855 21.4592 6.74807 21.3612 6.74725 21.262C6.74642 21.1628 6.76528 21.0645 6.80271 20.9727C6.84014 20.8808 6.89542 20.7973 6.96533 20.727L15.4573 12Z" fill="white"/></svg>
                <div :data-kanji="!!filters.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/)">{{ filters }}</div>
            </div>
            <div class="menu">
                <div class="menu__header">
                    <h1>{{ t('SERVERS') }}</h1>
                    <refresh class="view__refresh" @click="reloadServers(); playClickSound();" @mousedown="mouseDown" @mouseenter="playHoverSound" />
                </div>
                <div class="menu__content">
                    <servers-filter />
                </div>
                <div class="menu__footer">
                    <servers-stat />
                </div>
            </div>
        </div>

        <div class="table">
            <div class="table__wrapper">
                <div class="table__center" v-if="servers.serversLoading"><loader /></div>
                <div class="table__center" v-else-if="servers.serversError != null">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c5.523 0 10 4.478 10 10s-4.477 10-10 10S2 17.522 2 12 6.477 2 12 2Zm0 1.667c-4.595 0-8.333 3.738-8.333 8.333 0 4.595 3.738 8.333 8.333 8.333 4.595 0 8.333-3.738 8.333-8.333 0-4.595-3.738-8.333-8.333-8.333Zm-.001 10.835a.999.999 0 1 1 0 1.998.999.999 0 0 1 0-1.998ZM11.994 7a.75.75 0 0 1 .744.648l.007.101.004 4.502a.75.75 0 0 1-1.493.103l-.007-.102-.004-4.501a.75.75 0 0 1 .75-.751Z" fill="#ffffff"/></svg>
                    <div class="msg">Ошибка загрузки списка серверов<template v-if="servers.serversError">:<br/>{{ t(servers.serversError) }}</template></div>
                </div>
                <servers-table v-else />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/assets/_palette.scss';
@import '@/assets/_util.scss';

.view {
    display: flex;
    max-height: 100vh;
    overflow: hidden;
    word-break: break-word;

    &__refresh {
        width: u(48);
        height: u(48);
        cursor: pointer;
        flex-shrink: 0;
        fill: rgba(#f1f2f2, 0.32);
        transition: fill 0.1s ease, rotate 0.5s ease;
        rotate: 360deg;

        &:hover {
            fill: rgba(#f1f2f2, 0.5);
        }

        &.active {
            rotate: 0deg;
            fill: rgba(#f1f2f2, 0.8);
            transition: fill 0.1s ease;
        }
    }

    .menu-collapsed {
        display: none;
        border-right: #f1f2f21a u(1) solid;
        padding: u(10);

        [dir=rtl] & {
            border-right: none;
            border-left: #f1f2f21a u(1) solid;

            svg {
                rotate: 180deg;
            }
        }

        @media (max-width: 135vh) {
            display: flex;
            gap: u(20);
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        div {
            transform: rotate(180deg);
            writing-mode: vertical-rl;

            &[data-kanji=true] {
                transform: none;
            }
        }

        width: u(44);
    }

    .menu {
        width: u(416);
        border-right: #f1f2f21a u(1) solid;
        display: flex;
        flex-direction: column;
        height: 100vh;

        [dir=rtl] & {
            border-right: none;
            border-left: #f1f2f21a u(1) solid;
        }

        &__header, &__content {
            border-bottom: #f1f2f21a u(1) solid;
        }

        &__content {
            flex: 1;
        }

        &__header {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        > * {
            padding: u(48);
        }

        @media (max-width: 135vh) {
            display: none;
            position: absolute;
            left: 0;
            background: $back_black;
            z-index: 10;

            [dir=rtl] & {
                left: unset;
                right: 0;
            }
        }
    }

    .left {
        display: flex;
        max-height: 100vh;
        position: relative;

        &:hover {
            .menu {
                display: flex;
            }
        }
    }

    .table {
        flex: 1;

        &__wrapper {
            height: 100%;
            //noinspection CssInvalidPropertyValue
            overflow-y: overlay;
            padding: 0;

            table {
                margin-top: u(24);
                //margin-bottom: u(24);
            }

            @include scrollbar(22);
        }

        &__center {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            font-size: u(18);
            gap: u(12);
            flex-direction: column;
            text-align: center;

            svg {
                width: u(32);
                height: u(32);
            }
        }
    }
}


</style>