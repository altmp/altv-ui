import {defineStore} from "pinia";
import {useInitializableStore} from "@/stores/storeInitializer";
import type {IHistoryServer} from "@/types/IHistoryServer";
import type {IServer} from "@/types/IServer";
import {useVersionStore} from "@/stores/version";
import {useSettingsStore} from "@/stores/settings";

export interface IServerData {
    id: string;
    name: string;
    lastVisit: number;
    resourcesSize: number;
    dataSize: number;
    type: string;
}

export interface ServersStore {
    servers: IServer[];
    serversLookup: Record<string, number>;
    privateServers: Record<string, IServer>;
    serversError: string | null;
    serversLoading: boolean;
    lastReload: number;
    serverData: IServerData[];
    favorite: IHistoryServer[];
    recent: IHistoryServer[];
}

export interface IServerSkinEntry {
    serverId: string;
    xxHash64: string;
    fileName: string;
}

export enum ServerDataType {
    Resources,
    Data
}

export const useServersStore = useInitializableStore(defineStore('servers', {
    state: (): ServersStore => {
        return {
            servers: [],
            serversLookup: {},
            privateServers: {},
            serversError: null,
            serversLoading: false,
            lastReload: 0,
            serverData: [],
            favorite: [],
            recent: []
        }
    },
    getters: {
        favoriteIds: (state): Set<string> => new Set<string>(state.favorite.filter(e => e.id).map(e => e.id!)),
        apiUrl: (state) => {
            const settings = useSettingsStore();
            return settings.data.region == 'asia' ? 'https://api-cn.alt-mp.com' : 'https://api.alt-mp.com'
        },
        getServer: (state) => (id: string): IServer | undefined => state.servers[state.serversLookup[id]] ?? state.privateServers[id],
    },
    actions: {
        deleteServerData(id: string, type: ServerDataType) {
            alt.emit('serverData:delete', id, type);
            const idx = this.serverData.findIndex(e => e.id == id);
            if (idx == -1) return;
            if (
                (type == ServerDataType.Resources && this.serverData[idx].dataSize == 0)
                || (type == ServerDataType.Data && this.serverData[idx].resourcesSize == 0)
            )
                this.serverData.splice(idx, 1);
        },
        toggleFavorite(id: string) {
            const idx = this.favorite.findIndex(e => e.id == id);
            if (idx != -1) {
                this.favorite = this.favorite.filter(e => e.id !== id);
                alt.emit('servers:favorite:remove', id);
            } else {
                const server = this.getServer(id);
                if (!server) return;

                this.favorite = [...this.favorite, {id, name: server.name}]
                alt.emit('servers:favorite:add', id, server.name);
            }
        },
        async reload() {
            if (this.serversLoading) return;
            const version = useVersionStore();

            try {
                this.serversError = null;
                this.serversLoading = true;

                const data = await fetch(`${this.apiUrl}/servers${version.branch != 'internal' ? '?branch=' + version.branch : ''}`);
                const json = await data.json() as IServer[];

                this.servers = json;
                this.serversLookup = Object.fromEntries(json.map((e, i) => [e.publicId, i]));

                const knownIds = json.map(e => e.publicId);
                const serverEntries = [...this.recent.slice(0, 4), ...this.favorite].filter(e => e.id && !knownIds.includes(e.id));
                const servers = (await Promise.all(serverEntries.map(e =>
                    fetch(`${this.apiUrl}/servers/${e.id}`)
                        .then(e => e.status === 200 ? e.json() : null)
                ))).filter(e => e != null);
                this.privateServers = Object.fromEntries(servers.map(e => [e.publicId, e]));

                this.lastReload = Date.now();
                this.serversLoading = false;
            } catch(e) {
                this.serversLoading = false;
                this.serversError = String(e);
            }
        },
        init() {
            // alt.on('servers:update', (data: IServer[] | null) => {
            //     this.serversError = null;
            //     if (data == null) {
            //         this.servers = [];
            //         this.serversLoading = true;
            //     } else {
            //         this.servers = data;
            //         this.serversLoading = false;
            //     }
            // });
            // alt.on('servers:update:error', (error?: string) => {
            //     this.serversError = error ?? '';
            //     this.serversLoading = false;
            // });
            // alt.on('servers:setPing', (id: string, ping: number) => {
            //     const server = this.servers.find(e => e.publicId == id);
            //     if (!server) return;
            //     server.ping = ping;
            // })
            alt.on('servers:recent:update', (data: IHistoryServer[]) => {
                this.recent = data.reverse();
            });
            alt.on('servers:favorite:update', (data: IHistoryServer[]) => {
                this.favorite = data;
            });
            alt.on('serverData:update', (data: IServerData[]) => {
                this.serverData = data.sort((a, b) => a.type === 'shared' ? -1 : (b.lastVisit - a.lastVisit));
            });
            alt.on('serverData:updateOne', (data: IServerData) => {
                const idx = this.serverData.findIndex(e => e.id == data.id);
                const obj = this.serverData[idx] ? {...this.serverData[idx]} : null;
                if (!obj) return;
                obj.dataSize = data.dataSize;
                obj.resourcesSize = data.resourcesSize;
                this.serverData[idx] = obj;
            });
            // alt.on('servers:skinIndex', (json: string) => {
            //     const data = JSON.parse(json).indexEntries as IServerSkinEntry[];
            //     this.skinServers = data.map(e => e.serverId);
            // });
        }
    }
}));