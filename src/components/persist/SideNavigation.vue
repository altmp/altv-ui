<script setup lang="ts">
import {RouterLink} from 'vue-router';
import Logo from '@/components/icons/Logo.vue';
import Server from '@/components/icons/Server.vue';
import Home from '@/components/icons/Home.vue';
import DirectConnect from '@/components/icons/DirectConnect.vue';
import Information from '@/components/icons/Information.vue';
import Settings from '@/components/icons/Settings.vue';
import Quit from '@/components/icons/Quit.vue';
import Connection from "@/components/icons/Connection.vue";
import {ModalType, useModalStore} from "@/stores/modal";
import {useVersionStore} from "@/stores/version";
import Tooltip from "@/components/container/Tooltip.vue";
import {useLocalization} from "@/stores/localization";
import {ref} from "vue";
import {playEmojiSound, playErrorSound, playHoverSound, playKarbySound, playMoveSound} from "@/utils/playSound";
import {useUIStore} from "@/stores/ui";
import {ProgressType, useConnectionStateStore} from "@/stores/connectionState";
import Download from "@/components/icons/Download.vue";

const modal = useModalStore();
const version = useVersionStore();
const ui = useUIStore();
const connection = useConnectionStateStore();
const {t} = useLocalization();

const clicked = ref(0);
const lastClicked = ref(0);
const active = ref(false);

function click() {
    if (active.value) return;
    const now = Date.now()
    if (now - lastClicked.value > 1000) clicked.value = 0;
    lastClicked.value = now;
    clicked.value++;
    playEmojiSound();
    if (clicked.value == 8) {
        active.value = true;
        playKarbySound();
        setTimeout(() => active.value = false, 7000);
    }
}

function clickItem() {
    playMoveSound();
    ui.setNavigationHighlight(false);
}
function exit() {
    modal.open(ModalType.Exit, {}, true);
    playErrorSound();
}
</script>

<template>
    <nav class="navigation">
        <div class="navigation__group">
            <div class="navigation__branch">
                <div v-if="version.branch !== 'release'">{{ version.branch.toUpperCase() }}</div>
                <div v-if="version.debug">{{ 'DEBUG' }}</div>
            </div>
            <div class="navigation__logo" @click="click">
                <logo :class="{ active }"/>
            </div>
            <img id="karby" :class="{ active }" src="@/assets/img/karby.png" alt="">

            <router-link
                    :to="{ name: 'home' }"
                    :class="{ disabled: connection.active }"
                    tabindex="-1"
                    @click="clickItem" @mouseenter="playHoverSound">
                <tooltip :text="t('HOME')" position="right">
                    <home/>
                </tooltip>
            </router-link>

            <router-link :to="{ name: 'server-list' }"
                         :class="{ highlighted: ui.highlightElevent == 'servers', disabled: connection.active }"
                         v-if="version.branch === 'release' || version.branch === 'internal'"
                         tabindex="-1"
                         @click="clickItem" @mouseenter="playHoverSound">
                <tooltip :text="t('SERVERS')" position="right">
                    <server/>
                </tooltip>
            </router-link>

            <a @click="() => {modal.open(ModalType.DirectConnect, {}, true); clickItem()}"
               :class="{ highlighted: ui.highlightElevent == 'direct-connect', disabled: connection.active }"
               tabindex="-1"
               @mouseenter="playHoverSound">
                <tooltip :text="t('DIRECT_CONNECT')" position="right">
                    <direct-connect/>
                </tooltip>
            </a>
        </div>

        <div class="navigation__group">
            <router-link :to="{ name: 'connection' }" v-if="connection.active" tabindex="-1" @click="clickItem" @mouseenter="playHoverSound">
                <tooltip :text="t(connection.action)" position="right">
                    <connection v-if="['CONNECTED', 'DISCONNECTED', 'CONNECTION_FAILED', 'IN_QUEUE'].includes(connection.action)" />
                    <download v-else/>
                    <svg class="progressCircle"
                         viewBox="0 0 65 65"
                         v-if="connection.progressType !== ProgressType.None"
                         :style="{ '--dashoffset': Math.PI * 60 * (1 - (connection.progressType === ProgressType.Indeterminate ? 0.3 : (connection.progressValue / connection.progressTotal))) }"
                         :class="{ indeterminate: connection.progressType === ProgressType.Indeterminate }">
                        <circle class="circle" cx="32.5" cy="32.5" r="30" stroke-width="3" fill="none" :stroke-dasharray="2 * Math.PI * 30" transform="rotate(-90 32.5 32.5)" />
                    </svg>
                    <div class="notification"
                         v-if="['CONNECTED', 'DISCONNECTED', 'CONNECTION_FAILED', 'IN_QUEUE'].includes(connection.action)"
                         :class="{
                             yellow: connection.action === 'IN_QUEUE',
                             green: connection.action === 'CONNECTED',
                         }"></div>
                </tooltip>
            </router-link>

            <router-link :to="{ name: 'settings' }" tabindex="-1" @click="clickItem" @mouseenter="playHoverSound">
                <tooltip :text="t('SETTINGS')" position="right">
                    <settings/>
                </tooltip>
            </router-link>

            <router-link :to="{ name: 'about' }" tabindex="-1" @click="clickItem" @mouseenter="playHoverSound">
                <tooltip :text="t('ABOUT')" position="right">
                    <information/>
                </tooltip>
            </router-link>

            <a @click="exit" tabindex="-1" @mouseenter="clickItem">
                <tooltip :text="t('EXIT')" position="right">
                    <quit/>
                </tooltip>
            </a>
        </div>
    </nav>
</template>

<style lang="scss" scoped>
@import '@/assets/_util.scss';
@import '@/assets/_palette.scss';

.navigation {
    border-right: #f1f2f21a u(1) solid;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding-bottom: u(12);
    padding-top: u(24);
    height: 100vh;
    width: u(96);

    &__branch {
        display: flex;
        flex-direction: column;
        gap: u(4);

        &:empty {
            display: none;
        }

        div {
            font-size: u(12);
            text-transform: uppercase;
            font-weight: 800;
            text-align: center;
        }
    }

    &__logo {
        svg, img {
            width: u(48);
            height: u(48);
        }

        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: u(16);
        margin-bottom: u(32);

        &:active {
            transform: scale(0.95)
        }

        @keyframes hue-rotate {
            0% {
                filter: hue-rotate(0deg);
            }
            100% {
                filter: hue-rotate(360deg);
            }
        }

        & .active {
            animation: hue-rotate 7s linear;
        }
    }

    &__group {
        display: flex;
        flex-direction: column;
        align-items: center;

        @keyframes highlighted-navlink {
            from {
                transform: scale(1);
            }

            to {
                transform: scale(1.1);
            }
        }

        .highlighted {
            svg {
                animation: highlighted-navlink 0.8s ease-in-out infinite alternate;
                border: solid 2px $text_link !important;
            }
        }

        @keyframes circleProgress-indeterminate {
            from {
                transform: rotate(0deg);
            }

            to {
                transform: rotate(360deg);
            }
        }

        .notification {
            position: absolute;
            top: u(4);
            right: u(4);
            width: u(8);
            height: u(8);
            border-radius: 50%;
            background: #EB3640;
            box-shadow: 0 0 8px 1px rgba(#eb3640, 0.70);

            &.yellow {
                background: #FFB900;
                box-shadow: 0 0 8px 1px rgba(#FFB900, 0.70);
            }

            &.green {
                background: #00AD56;
                box-shadow: 0 0 8px 1px rgba(#00AD56, 0.70);
            }
        }

        .progressCircle {
            position: absolute;
            top: u(-1);
            left: u(-3);
            width: u(62);
            height: u(62);
            border: none;
            stroke: rgba($text_link, 1);
            transition: stroke-dashoffset 0.2s;
            stroke-dashoffset: var(--dashoffset);

            &.indeterminate {
                animation: circleProgress-indeterminate 1.5s linear infinite;
            }
        }

        a {
            padding: u(12) u(20);
            width: u(96);
            height: u(80);
            cursor: pointer;
            position: relative;

            svg:not(.progressCircle) {
                border-radius: 50%;
                width: u(60);
                height: u(60);
                margin-left: u(-2); // to compensate for the 2px border (which should be outline but old CEF doesn't apply border-radius to outlines)
                box-sizing: border-box;
                padding: u(16);
                fill: #F1F2F2;
                border: transparent #{u(2)} solid;
                transition: background-color 0.15s ease-in-out, fill 0.15s ease-in-out, transform 0.2s ease, border 0.2s ease;

                &:hover {
                    background: rgba(241, 242, 242, 0.03);
                    fill: rgba(#F1F2F2, 0.75);
                }

                &:active {
                    transform: scale(0.95);
                }
            }

            &.router-link-active svg:not(.progressCircle) {
                border: #{u(2)} solid rgba(241, 242, 242, 0.25);
                background: rgba(241, 242, 242, 0.03);
                fill: #F1F2F2;
            }
        }

        .disabled {
            pointer-events: none;

            svg {
                fill: #949494 !important;
            }
        }
    }
}

#karby {
    display: none;

    @keyframes karby {
        from {
            left: u(-200);
        }

        to {
            left: 100%;
        }
    }

    &.active {
        display: block;
        position: fixed;
        width: u(200);
        bottom: 0;
        left: u(-200);
        animation: karby 1 6s cubic-bezier(0.64, 0, 0.78, 0);
        animation-fill-mode: forwards;
        z-index: 1000;
    }
}
</style>
