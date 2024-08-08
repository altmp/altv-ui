import {defineStore} from "pinia";
import {useInitializableStore} from "@/stores/storeInitializer";
import {useUIStore} from "@/stores/ui";
import { playErrorSound } from "@/utils/playSound";
import {useRouter} from "vue-router";
import {useSettingsStore} from "@/stores/settings";
import {useVersionStore} from "@/stores/version";

export enum ProgressType {
    None,
    Determinate,
    Indeterminate
}

export interface IConnectionState {
    wasConnected: boolean;
    connected: boolean;
    connectedServerId: string;
    connectedCacheKeys: string[];

    // if true cancel button just closes connection ui
    inProgress: boolean;
    disconnected: boolean;
    server: string;

    action: string;
    message?: string | null;
    cancelAction?: string | null;
    showReconnect: boolean;
    showReconnectPassword: boolean;
    showDisconnect: boolean;

    progressType: ProgressType;
    progressAction: string;
    progressValue: number;
    progressTotal: number;
    progressSpeed?: number | null;
    progressInBytes: boolean;
    progressHidden: boolean;
}

export const useConnectionStateStore = useInitializableStore(defineStore('connectionState', {
    state: (): IConnectionState => {
        return {
            wasConnected: false,
            connected: false,
            connectedServerId: '',
            connectedCacheKeys: [],

            inProgress: false,
            disconnected: false,
            server: '',

            action: 'JOINING_SERVER',
            message: null,
            cancelAction: 'CANCEL',
            showReconnect: false,
            showReconnectPassword: false,
            showDisconnect: false,

            progressType: ProgressType.None,
            progressAction: '',
            progressValue: 0,
            progressTotal: 0,
            progressSpeed: null,
            progressInBytes: false,
            progressHidden: false,
        }
    },
    getters: {
        uiActive(state) {
            return state.connected || state.inProgress || state.disconnected;
        },
        newConnectionPossible(state) {
            return !state.connected && !state.inProgress && !state.wasConnected;
        },
        reconnectPossible(state) {
            const settings = useSettingsStore();
            const version = useVersionStore();
            return !state.inProgress && (settings.data.debug || version.branch === 'internal' || (!state.wasConnected && !state.connected && state.disconnected))
        },
        uiNavigationControlsInactive(state) {
            return state.connected || state.inProgress;
        }
    },
    actions: {
        reset() {
            this.connected = false;
            this.inProgress = true;
            this.action = 'JOINING_SERVER';
            this.message = null;
            this.cancelAction = 'CANCEL';
            this.showReconnect = false;
            this.showReconnectPassword = false;
            this.showDisconnect = false;
            this.progressType = ProgressType.None;
            this.progressAction = '';
            this.progressValue = 0;
            this.progressTotal = 0;
            this.progressSpeed = null;
            this.progressInBytes = false;
            this.progressHidden = false;
            this.disconnected = false;
        },
        setServer(server: string) {
            this.server = server;
        },
        abort() {
            alt.emit('connection:abort');
        },
        init() {
            const router = useRouter();
            const ui = useUIStore();

            alt.on('connection:idle', () => {
                this.reset();
                this.inProgress = false;
            });

            alt.on('connection:setServer', (server: string) => {
                this.server = server;
            });

            alt.on('connection:setCacheKeys', (resourceCacheKey?: string, dataCacheKey?: string) => {
                this.connectedCacheKeys = [resourceCacheKey, dataCacheKey].filter(Boolean) as string[];
            });

            alt.on('connection:connecting', (serverName?: string) => {
                this.reset();
                if (serverName != null) this.server = serverName;
                this.progressAction = 'CONNECTING_TO_THE_SERVER';
                this.progressType = ProgressType.Indeterminate;
                this.cancelAction = null;
                router.push('/connection');
            });

            alt.on('connection:joining', () => {
                this.reset();
                this.progressAction = 'JOINING_THE_GAME';
                this.progressType = ProgressType.Indeterminate;
                this.cancelAction = null;
            });

            alt.on('connection:startingResources', () => {
                this.reset();
                this.progressAction = 'STARTING_RESOURCES';
                this.progressType = ProgressType.Indeterminate;
                this.cancelAction = null;
            });

            alt.on('connection:preloadingMods', () => {
                this.reset();
                this.progressAction = 'PRELOADING_MODS';
                this.progressType = ProgressType.Indeterminate;
                this.cancelAction = null;
            });

            alt.on('connection:reloadingGameMap', () => {
                this.reset();
                this.progressAction = 'RELOADING_GAME_MAP';
                this.progressType = ProgressType.Indeterminate;
                this.cancelAction = null;
            });

            alt.on('connection:startingGame', (progress, progressTotal) => {
                this.reset();
                this.progressAction = 'STARTING_THE_GAME';
                this.progressType = ProgressType.Determinate;
                this.progressValue = progress;
                this.progressTotal = progressTotal;
                this.cancelAction = null;
                this.progressHidden = true;
                this.wasConnected = true;
            });

            alt.on('connection:downloadingResources', (bytesDownloaded: number, bytesTotal: number, speed?: number) => {
                this.reset();
                this.progressAction = 'DOWNLOADING_RESOURCES';
                this.progressType = ProgressType.Determinate;
                this.progressValue = bytesDownloaded;
                this.progressTotal = bytesTotal;
                this.progressInBytes = true;
                this.progressSpeed = speed;
            });

            alt.on('connection:validatingResources', (resourcesValidated: number, resourcesTotal: number) => {
                this.reset();
                this.progressAction = 'VALIDATING_RESOURCES';
                this.progressType = ProgressType.Determinate;
                this.progressValue = resourcesValidated;
                this.progressTotal = resourcesTotal;

                if (resourcesValidated == resourcesTotal) {
                    this.cancelAction = null;
                }
            });

            alt.on('connection:downloadingRuntimes', (bytesDownloaded: number, bytesTotal: number, speed?: number) => {
                this.reset();
                this.progressAction = 'DOWNLOADING_RUNTIMES';
                this.progressType = ProgressType.Determinate;
                this.progressValue = bytesDownloaded;
                this.progressTotal = bytesTotal;
                this.progressInBytes = true;
                this.progressSpeed = speed;
                this.cancelAction = null;
            });

            alt.on('connection:validatingRuntimes', (bytesDownloaded: number, bytesTotal: number, speed?: number) => {
                this.reset();
                this.progressAction = 'VALIDATING_RUNTIMES';
                this.progressType = ProgressType.Determinate;
                this.progressValue = bytesDownloaded;
                this.progressTotal = bytesTotal;
                this.progressInBytes = true;
                this.progressSpeed = speed;
                this.cancelAction = null;
            });

            alt.on('connection:inQueue', (message: string) => {
                this.reset();
                this.action = 'IN_QUEUE';
                this.message = message || null;
                this.cancelAction = 'LEAVE_QUEUE';
            });

            alt.on('connection:downloadingAdditionalResources', (bytesDownloaded: number, bytesTotal: number, speed?: number) => {
                this.reset();
                this.connected = true;
                this.action = 'SERVER_UPDATE';
                this.progressAction = 'DOWNLOADING_ADDITIONAL_RESOURCES';
                this.progressType = ProgressType.Determinate;
                this.progressValue = bytesDownloaded;
                this.progressTotal = bytesTotal;
                this.progressInBytes = true;
                this.progressSpeed = speed;
                this.cancelAction = null;
            });

            alt.on('connection:validatingAdditionalResources', (bytesDownloaded: number, bytesTotal: number, speed?: number) => {
                this.reset();
                this.connected = true;
                this.action = 'SERVER_UPDATE';
                this.progressAction = 'VALIDATING_ADDITIONAL_RESOURCES';
                this.progressType = ProgressType.Determinate;
                this.progressValue = bytesDownloaded;
                this.progressTotal = bytesTotal;
                this.progressInBytes = true;
                this.progressSpeed = speed;
                this.cancelAction = null;
            });

            alt.on('connection:disconnected', (message: string) => {
                this.reset();
                this.action = 'DISCONNECTED';
                this.message = message;
                this.inProgress = false;
                this.disconnected = true;
                this.cancelAction = null;
                this.showReconnect = true;
                this.connectedCacheKeys = [];
                playErrorSound();

                if (!ui.opened) router.push('/connection');
            });

            alt.on('connection:failed', (message: string) => {
                this.reset();
                this.action = 'CONNECTION_FAILED';
                this.message = message;
                this.inProgress = false;
                this.disconnected = true;
                this.cancelAction = null;
                this.showReconnect = true;
                this.showReconnectPassword = message === 'WRONG_PASSWORD';
                this.connectedCacheKeys = [];
                playErrorSound();

                if (!ui.opened) router.push('/connection');
            });

            alt.on('connection:connected', (serverId?: string) => {
                const wasConnected = this.connected;

                this.reset();
                this.action = 'CONNECTED';
                this.cancelAction = null;
                this.showDisconnect = true;
                this.inProgress = false;
                this.connected = true;
                this.wasConnected = true;
                if (serverId != null) this.connectedServerId = serverId;

                if (!wasConnected) ui.toggleUi(false);
            });
        }
    }
}));