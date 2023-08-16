import {defineStore} from "pinia";
import {useInitializableStore} from "@/stores/storeInitializer";
import {useRoute, useRouter} from "vue-router";
import {watch} from "vue";

export const useUIStore = useInitializableStore(defineStore('ui', {
    state: () => {
        return {
            opened: true,
            ready: false,
            earlyAuth: false,
            startupProgress: -1,
            highlightElevent: false as string | false,
            watermarkPosition: 'bottomright',
            netgraph: {
                active: false,
                fps: 0,
                rtt: 0,
                tx: 0,
                rx: 0,
            }
        }
    },
    actions: {
        toggleUi(state?: boolean) {
            if (state == null) this.opened = !this.opened;
            else this.opened = state;
        },
        toggleNetgraph(state: boolean) {
            this.netgraph.active = state
        },
        setNavigationHighlight(element: string | false) {
            this.highlightElevent = element;
        },
        init() {
            alt.on('ui:toggle', (state?: boolean) => {
                this.toggleUi(state);
            });
            alt.on('ui:ready', () => {
                this.ready = true;
            });
            alt.on('ui:setWatermarkPosition', (idx: number) => {
                this.watermarkPosition = ['bottomright', 'topright', 'topleft', 'topcenter', 'bottomcenter'][idx] ?? 'bottomright';
            });
            alt.on('ui:updateNetgraph', (active: boolean, fps: number, rtt: number, tx: number, rx: number) => {
                this.netgraph.active = active;
                this.netgraph.fps = fps;
                this.netgraph.rtt = rtt;
                this.netgraph.tx = tx;
                this.netgraph.rx = rx;
            });
            alt.on('ui:startupProgress', (min: number, max: number) => {
                if (this.ready) return;
                this.startupProgress = min / max * 0.93;
            });
            alt.on('ui:setEarlyAuthState', (state: boolean) => {
                this.earlyAuth = state;
            });
        },
    },

}));

