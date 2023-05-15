import {defineStore} from "pinia";
import {useInitializableStore} from "@/stores/storeInitializer";
import type {IHistoryServer} from "@/types/IHistoryServer";
import type {IServer} from "@/types/IServer";

export interface IServerData {
    id: string;
    name: string;
    lastVisit: number;
    resourcesSize: number;
    dataSize: number;
}

export interface ServersStore {
    servers: IServer[];
    serversError: string | null;
    serversLoading: boolean;
    serverData: IServerData[];
    favorite: IHistoryServer[];
    recent: IHistoryServer[];
    skinServers: string[];
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
            serversError: null,
            serversLoading: true,
            serverData: [],
            favorite: [],
            recent: [],
            skinServers: []
        }
    },
    getters: {
        favoriteIds: (state): Set<string> => new Set<string>(state.favorite.filter(e => e.id).map(e => e.id!)),
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
                const server = this.servers.find(e => e.id == id);
                if (!server) return;

                this.favorite = [...this.favorite, {id, name: server.name}]
                alt.emit('servers:favorite:add', id, server.name);
            }
        },
        init() {
            alt.on('servers:update', (data: IServer[] | null) => {
                this.serversError = null;
                if (data == null) {
                    this.servers = [];
                    this.serversLoading = true;
                } else {
                    this.servers = data;
                    this.serversLoading = false;
                }
            });
            alt.on('servers:update:error', (error?: string) => {
                this.serversError = error ?? '';
                this.serversLoading = false;
            });
            alt.on('servers:setPing', (id: string, ping: number) => {
                const server = this.servers.find(e => e.id == id);
                if (!server) return;
                server.ping = ping;
            })
            alt.on('servers:recent:update', (data: IHistoryServer[]) => {
                this.recent = data.reverse();
            });
            alt.on('servers:favorite:update', (data: IHistoryServer[]) => {
                this.favorite = data;
            });
            alt.on('serverData:update', (data: IServerData[]) => {
                this.serverData = data.sort((a, b) => b.lastVisit - a.lastVisit);
            });
            alt.on('serverData:updateOne', (data: IServerData) => {
                const idx = this.serverData.findIndex(e => e.id == data.id);
                const obj = this.serverData[idx] ? {...this.serverData[idx]} : null;
                if (!obj) return;
                obj.dataSize = data.dataSize;
                obj.resourcesSize = data.resourcesSize;
                this.serverData[idx] = obj;
            });
            alt.on('servers:skinIndex', (json: string) => {
                const data = JSON.parse(json).indexEntries as IServerSkinEntry[];
                this.skinServers = data.map(e => e.serverId);
            });
        }
    }
}));