import {defineStore} from "pinia";
import {useInitializableStore} from "@/stores/storeInitializer";
import {useUIStore} from "@/stores/ui";
import { playErrorSound } from "@/utils/playSound";

export enum ProgressType {
    None,
    Determinate,
    Indeterminate
}

export interface IConnectionState {
    wasConnected: boolean;
    connected: boolean;
    connectedServerId: string;

    // if true cancel button just closes connection ui
    active: boolean;
    failed: boolean;
    server: string;

    action: string;
    message?: string | null;
    cancelAction?: string | null;
    showExit: boolean;
    showReconnect: boolean;

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

            active: false,
            failed: false,
            server: '',

            action: 'JOINING_SERVER',
            message: null,
            cancelAction: 'CANCEL',
            showExit: false,
            showReconnect: false,

            progressType: ProgressType.None,
            progressAction: '',
            progressValue: 0,
            progressTotal: 0,
            progressSpeed: null,
            progressInBytes: false,
            progressHidden: false,
        }
    },
    actions: {
        reset() {
            this.connected = false;
            this.active = true;
            this.action = 'JOINING_SERVER';
            this.message = null;
            this.cancelAction = 'CANCEL';
            this.showExit = false;
            this.showReconnect = false;
            this.progressType = ProgressType.None;
            this.progressAction = '';
            this.progressValue = 0;
            this.progressTotal = 0;
            this.progressSpeed = null;
            this.progressInBytes = false;
            this.progressHidden = false;
            this.failed = false;
        },
        setServer(server: string) {
            this.server = server;
        },
        abort() {
            if (this.failed) this.active = false;
            else alt.emit('connection:abort');
        },
        init() {
            alt.on('connection:idle', () => {
                this.reset();
                this.active = false;
            });

            alt.on('connection:setServer', (server: string) => {
                this.server = server;
            });

            alt.on('connection:connecting', (serverName?: string) => {
                this.reset();
                if (serverName != null) this.server = serverName;
                this.progressAction = 'CONNECTING_TO_THE_SERVER';
                this.progressType = ProgressType.Indeterminate;
                this.cancelAction = null;
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
                this.cancelAction = null;
                this.showExit = true;
                this.showReconnect = true;
                playErrorSound();
            });

            alt.on('connection:failed', (message: string) => {
                this.reset();
                this.action = 'CONNECTION_FAILED';
                this.message = message;
                this.failed = !this.wasConnected;
                this.cancelAction = this.wasConnected ? null : 'CLOSE';
                this.showExit = this.wasConnected;
                this.showReconnect = true;
                playErrorSound();
            });

            alt.on('connection:connected', (serverId?: string) => {
                const wasConnected = this.connected;

                this.reset();
                this.active = false;
                this.connected = true;
                this.wasConnected = true;
                if (serverId != null) this.connectedServerId = serverId;

                // don't close ui if 'connected' was emitted to close 'downloadingAdditionalResources'
                // todo handle this differently
                const ui = useUIStore();
                ui.toggleUi(false);
            });
        }
    }
}));