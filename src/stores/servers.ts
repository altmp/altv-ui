import { defineStore } from "pinia";
import { useInitializableStore } from "@/stores/storeInitializer";
import type { IHistoryServer } from "@/types/IHistoryServer";
import type { IServer } from "@/types/IServer";
import { useVersionStore } from "@/stores/version";
import { useSettingsStore } from "@/stores/settings";

export type ServerGroup = {
	id: string;
	name: string;
	servers: IServer[];
	playersCount: number;
	maxPlayersCount: number;
	verified: boolean;
	promoted: boolean;
	tags: string[];
};

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
	groupedServers: (ServerGroup | IServer)[];
	serversLookup: Record<string, number>;
	privateServers: Record<string, IServer>;
	isLoading: boolean;
	isError: boolean;
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
	Data,
}

const getTop3TagsFromGroup = (groupServers: IServer[]) => {
	const map = new Map<string, number>();
	for (const server of groupServers) {
		for (const tag of server.tags) {
			map.set(tag, (map.get(tag) ?? 0) + 1);
		}
	}
	return Array.from(map.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, 3)
		.map((e) => e[0]);
};

export const isGroup = (
	serverOrGroup: IServer | ServerGroup,
): serverOrGroup is ServerGroup => {
	return "servers" in serverOrGroup;
};

const groupServers = (servers: IServer[]) => {
	const serversWithoutGroups: IServer[] = [];
	const groups: {
		id: string;
		name: string;
		servers: IServer[];
	}[] = [];

	for (let i = 0; i < servers.length; i++) {
		const server = servers[i]!;
		if (server.group === null) {
			serversWithoutGroups.push(server);
			continue;
		}
		const groupIndex = groups.findIndex(
			(group) => group.id === server.group?.id,
		);
		if (groupIndex === -1) {
			groups.push({
				id: server.group.id,
				name: server.group.name,
				servers: [server],
			});
		} else {
			groups[groupIndex]!.servers.push(server);
		}
	}

	const result: (ServerGroup | IServer)[] = [
		...groups.map((group) => ({
			...group,
			playersCount: group.servers.reduce(
				(acc, server) => acc + server.playersCount,
				0,
			),
			maxPlayersCount: group.servers.reduce(
				(acc, server) => acc + server.maxPlayersCount,
				0,
			),
			promoted: group.servers.some((server) => server.promoted),
			verified: group.servers.every((server) => server.verified),
			tags: getTop3TagsFromGroup(group.servers),
		})),
		...serversWithoutGroups,
	];

	return result;
};

export const useServersStore = useInitializableStore(
	defineStore("servers", {
		state: (): ServersStore => {
			return {
				isError: false,
				servers: [],
				groupedServers: [],
				serversLookup: {},
				privateServers: {},
				isLoading: false,
				lastReload: 0,
				serverData: [],
				favorite: [],
				recent: [],
			};
		},
		getters: {
			favoriteIds: (state): Set<string> =>
				new Set<string>(state.favorite.filter((e) => e.id).map((e) => e.id!)),
			apiUrl: (_state) => {
				const settings = useSettingsStore();
				return settings.data.region == "asia"
					? "http://194.104.146.133/api/"
					: "https://api.alt-mp.com";
			},
			getServer:
				(state) =>
				(id: string): IServer | undefined =>
					state.servers[state.serversLookup[id]!] ?? state.privateServers[id],
		},
		actions: {
			deleteServerData(id: string, type: ServerDataType) {
				alt.emit("serverData:delete", id, type);
				const idx = this.serverData.findIndex((e) => e.id == id);
				if (idx == -1) return;
				if (
					(type == ServerDataType.Resources &&
						this.serverData[idx]!.dataSize == 0) ||
					(type == ServerDataType.Data &&
						this.serverData[idx]!.resourcesSize == 0)
				) {
					this.serverData.splice(idx, 1);
				}
			},
			toggleFavorite(id: string) {
				const idx = this.favorite.findIndex((e) => e.id == id);
				if (idx != -1) {
					this.favorite = this.favorite.filter((e) => e.id !== id);
					alt.emit("servers:favorite:remove", id);
				} else {
					const server = this.getServer(id);
					if (!server) return;

					this.favorite = [...this.favorite, { id, name: server.name }];
					alt.emit("servers:favorite:add", id, server.name);
				}
			},
			async reload() {
				if (this.isLoading) return;
				const version = useVersionStore();

				try {
					this.isError = false;
					this.isLoading = true;

					const url = new URL("/servers", this.apiUrl);
					if (version.branch !== "internal") {
						url.searchParams.set("branch", version.branch);
					}

					const res = await fetch(url);

					if (!res.ok) {
						this.isError = true;
						return;
					}
					this.servers = (await res.json()) as IServer[];
					this.serversLookup = Object.fromEntries(
						this.servers.map((server, index) => [server.publicId, index]),
					);

					const knownIds = this.servers.map((server) => server.publicId);
					const serverEntries = [
						...this.recent.slice(0, 4),
						...this.favorite,
					].filter((e) => e.id && !knownIds.includes(e.id));
					const servers = (
						await Promise.all(
							serverEntries.map((e) =>
								fetch(`${this.apiUrl}/servers/${e.id}`).then((e) =>
									e.status === 200 ? e.json() : null,
								),
							),
						)
					).filter((e) => e != null);
					this.privateServers = Object.fromEntries(
						servers.map((e) => [e.publicId, e]),
					);

					this.groupedServers = groupServers(this.servers);

					this.lastReload = Date.now();
				} catch (e) {
					this.isError = true;
				} finally {
					this.isLoading = false;
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
				alt.on("servers:recent:update", (data: IHistoryServer[]) => {
					this.recent = data.reverse();
				});
				alt.on("servers:favorite:update", (data: IHistoryServer[]) => {
					this.favorite = data;
				});
				alt.on("serverData:update", (data: IServerData[]) => {
					this.serverData = data.sort((a, b) =>
						a.type === "shared" ? -1 : b.lastVisit - a.lastVisit,
					);
				});
				alt.on("serverData:updateOne", (data: IServerData) => {
					const idx = this.serverData.findIndex((e) => e.id == data.id);
					const obj = this.serverData[idx] ? { ...this.serverData[idx] } : null;
					if (!obj) return;
					obj.dataSize = data.dataSize;
					obj.resourcesSize = data.resourcesSize;
					this.serverData[idx] = obj;
				});
				// alt.on('servers:skinIndex', (json: string) => {
				//     const data = JSON.parse(json).indexEntries as IServerSkinEntry[];
				//     this.skinServers = data.map(e => e.serverId);
				// });
			},
		},
	}),
);
