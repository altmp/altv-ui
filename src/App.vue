<script setup lang="ts">
import { RouterView } from 'vue-router';
import SideNavigation from '@/components/persist/SideNavigation.vue';
import Watermark from "@/components/persist/Watermark.vue";
import DialogContainer from "@/components/container/DialogContainer.vue";
import Console from "@/components/persist/console/Console.vue";
import { useUIStore } from "@/stores/ui";
import { useConnectionStateStore } from "@/stores/connectionState";
import Netgraph from "@/components/persist/Netgraph.vue";
import { useLocalization } from "@/stores/localization";
import { computed, onMounted, ref, watch } from "vue";
import { useSettingsStore } from "@/stores/settings";
import Logo from "@/components/icons/Logo.vue";
import { useVersionStore } from "@/stores/version";

const ui = useUIStore();
const connection = useConnectionStateStore();
const locale = useLocalization();
const settings = useSettingsStore();
const version = useVersionStore();

watch(() => locale.dir, (value) => {
    document.dir = value;
});

watch(() => version.manifest, (value) => {
    let style = '';

    if (value?.primaryColor && value.primaryColor.length == 6) {
        const color = value.primaryColor.match(/\w\w/g)?.map(x => parseInt(x, 16)).join(', ');
        if (color) {
            style += `--primary-color: ${color};`;
            style += `--primary-color-light: ${color};`;
        }
    }

    if (value?.imageBackground64) {
        style += `--background-dark: linear-gradient(to bottom, rgba(10, 10, 10, 35%), rgba(10, 10, 10, 35%)), url(data:image/png;base64,${value.imageBackground64});`;
        style += `--background: url(data:image/png;base64,${value.imageBackground64});`;
    }

    document.body.setAttribute('style', style);
});

watch(() => ui.ready && (ui.opened || !connection.connected || ui.earlyAuth), (value) => {
    console.log('Send UI open request', value);
    alt.emit('ui:open', value);
}, { immediate: true });

const logo = ref<HTMLDivElement>();

onMounted(() => {
    if (version.orange) {
        document.body.classList.add("orange");

        const dvd = logo.value;
        if (dvd) {
            dvd.style.position = "fixed";
            dvd.style.top = "0px";
            dvd.style.left = "0px";

            const { width: dvdWidth, height: dvdHeight } = dvd.getBoundingClientRect();
            const speed = 2;
            let x = 0, y = 0, dirX = 1, dirY = 1;

            function animate() {
                if (!dvd) return;
                const screenHeight = document.body.clientHeight;
                const screenWidth = document.body.clientWidth;

                if (y + dvdHeight >= screenHeight || y < 0) {
                    dirY *= -1;
                }
                if (x + dvdWidth >= screenWidth || x < 0) {
                    dirX *= -1;
                }
                x += dirX * speed;
                y += dirY * speed;
                dvd.style.left = x + "px";
                dvd.style.top = y + "px";
                window.requestAnimationFrame(animate);
            }

            window.requestAnimationFrame(animate);
        }
    }
})
</script>

<template>
    <div id="loading" :data-ready="ui.ready" v-if="!version.earlyLoad">
        <logo class="logo" custom-logo :logoRef="(el) => logo = el" />
        <div class="progress">
            <div class="progress__bar" dir="ltr">
                <div class="progress__fill progress__fill--indeterminate"></div>
                <div class="progress__fill" :style="{ width: ui.startupProgress * 100 + '%' }"></div>
            </div>
        </div>
    </div>
    <router-view :dir="locale.dir" v-slot="{ Component }">
        <transition name="fade" :duration="200">
            <div id="page" dir="ltr" v-if="ui.ready && (ui.opened || !connection.connected)">
                <side-navigation/>
                <component :is="Component" />
            </div>
        </transition>
    </router-view>
    <dialog-container />
    <netgraph v-if="ui.netgraph.active && ui.ready" />
    <watermark />
    <console />
    <div id="early-auth-overlay" :data-enabled="ui.earlyAuth"></div>
    <div id="loading-overlay" :data-enabled="version.earlyLoad ? !ui.ready : !version.initialized"></div>
</template>

<style lang="scss">
@import "@/assets/base.scss";
@import "@/assets/_util.scss";

#page {
    height: 100vh;
    background: var(--background-dark) no-repeat center, $back_black;
    background-size: cover;
    display: grid;
    grid-template-columns: u(96) auto;
    grid-gap: 0;
}

#loading {
    background: var(--background) no-repeat center, $back_black;
    background-size: cover;
    position: absolute;
    z-index: 200;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: u(80);

    opacity: 1;
    transition: opacity 0.2s ease-in-out;

    &[data-ready=true] {
        opacity: 0;
        pointer-events: none;
        transition-delay: 0.2s;
    }

    .logo {
        z-index: 1;
    }

    .progress {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: u(24);

        &__bar {
            width: u(250);
            height: u(8);
            border-radius: u(100);
            background: #262626;
            overflow: hidden;
            position: relative;
        }

        &__fill {
            height: 100%;
            background: #F1F2F2;
            border-radius: u(100);
            transition: width 0.2s linear;
            position: absolute;
            top: 0;
            left: 0;

            &--indeterminate {
                $width: 50%;
                width: $width;
                opacity: 0.15;

                @keyframes indeterminate-progress-startup {
                    0% {
                        margin-left: -$width - 1%
                    }

                    100% {
                        margin-left: 101%
                    }
                }

                animation: indeterminate-progress-startup 1.5s infinite ease-in-out;
            }
        }
    }

    @keyframes logo-anim {
        from {
            transform: translateY(0);
        }

        to {
            transform: translateY(u(-20));
        }
    }

    .logo {
        width: u(120);
        height: u(120);
    }
}

#early-auth-overlay {
    position: fixed;
    z-index: 999999;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: var(--background-dark) no-repeat center, $back_black;
    background-size: cover;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;

    &[data-enabled=true] {
        opacity: 1;
        pointer-events: all;
    }
}

#loading-overlay {
    position: fixed;
    z-index: 999999;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: black;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
    transition-delay: 0.2s;

    &[data-enabled=true] {
        opacity: 1;
        pointer-events: all;
    }
}
</style>
