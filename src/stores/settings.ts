import {defineStore} from "pinia";
import {useInitializableStore} from "@/stores/storeInitializer";
import {useUIStore} from "@/stores/ui";
import {ModalType, useModalStore} from "@/stores/modal";
import {toValue, watch} from "vue";

export const useSettingsStore = useInitializableStore(defineStore('settings', {
    state: () => {
        return {
            data: {
                language: 'en',
                region: 'global',
                name: '',
                debug: false,
                disableRtl: false,
                promotedOnTop: true,
                voiceEnabled: true,
                voiceActivation: false,
                voiceNoiseSuppression: false,
                voiceAutoInputVolume: true,
                voiceInputSensitivity: 0,
                voiceActivationKey: 0x4e,
                voiceInputVolume: 100,
                voiceNormalization: true,
                voiceVolume: 100,
                uiVolume: 100,
                useExternalConsole: false,
                netgraphEnabled: true,
                crashReporterEnabled: true,
                expandedConsole: true,
                downloadSpeedLimit: 0,
                consoleHeight: 0.4,
                consoleWidth: 0.45,
                launcherSkin: '',
                voiceInputDevice: 'default',
                launcherSkinsDisabled: [] as string[],
                discordRichPresence: true
            },

            micTest: false,
            currentVolume: 0,
            devices: {} as Record<string, string>
        }
    },
    actions: {
        toggleConsole() {
            this.data.expandedConsole = !this.data.expandedConsole;
            this.save('expandedConsole');
        },
        toggleMicTest(state?: boolean) {
            this.micTest = state ?? !this.micTest;
        },
        init() {
            const ui = useUIStore();
            const modal = useModalStore();

            alt.on('settings:update', (data: Record<string, any>) => {
                for (const key in data) {
                    if (key in this.$state.data)
                        (this.data as any)[key] = data[key];
                }

                if ('netgraphEnabled' in data) ui.toggleNetgraph(data.netgraphEnabled);
            });

            alt.on('settings:currentVolume:update', (value: number) => {
                this.currentVolume = value;
            });

            alt.on('ui:ready', () => {
                if (this.data.name == 'Player') {
                    modal.open(ModalType.Nickname, {}, false);
                }
            });

            alt.on('settings:devices:update', (devices: Record<string, string>) => {
                this.$patch({
                    devices
                });
            });

            watch(() => this.micTest, () => {
                alt.emit('settings:micTest:toggle', this.micTest);
            })
        },
        save(key: keyof typeof this.$state['data']) {
            alt.emit('settings:change', key, toValue(this.data[key]));
        }
    },

}));

