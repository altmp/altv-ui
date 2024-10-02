import { defineStore } from "pinia";
import { useInitializableStore } from "@/stores/storeInitializer";
import type { IHistoryServer } from "@/types/IHistoryServer";
import type Parser from "rss-parser";
// @ts-ignore
import RssParser from "rss-parser/dist/rss-parser";
import { useServersStore } from "@/stores/servers";

export interface IManifest {
	name: string;
	rss?: string;
	logo?: string;
	uiBackground?: string;
	primaryColor?: string;
	servers: IHistoryServer[];
	isRssHidden: boolean;
}

export interface VersionStore {
	version: string;
	branch: string;
	debug: boolean;
	lastIp: string;
	manifest: IManifest | null;
	rss: Parser.Output<any> | null;
	initialized: boolean;
	orange: boolean; // april fools GTA:Orange looks
}

export const useVersionStore = useInitializableStore(
	defineStore("version", {
		state: (): VersionStore => {
			return {
				version: "",
				branch: "",
				debug: false,
				lastIp: "",
				manifest: null,
				rss: null,
				initialized: false,
				orange: false,
			};
		},
		actions: {
			updateLastIp(ip: string) {
				this.lastIp = ip;
			},
			init() {
				const date = new Date();
				this.orange = date.getDate() == 1 && date.getMonth() == 3;

				alt.on(
					"version:update",
					async (
						version: string,
						branch: string,
						lastIp: string,
						debug: boolean,
					) => {
						this.version = version;
						this.branch = branch;
						this.lastIp = lastIp;
						this.debug = debug;
					},
				);

				alt.on("version:setManifest", async (manifest?: string) => {
					this.manifest = manifest ? JSON.parse(manifest) : null;
				});

				alt.on("version:setRss", async (rss?: string) => {
					if (rss) {
						try {
							const parser = new RssParser() as Parser;
							this.rss = await parser.parseString(rss);
						} catch (e) {
							console.warn(
								"Failed to parse RSS feed!",
								(e as any)?.message ?? e,
							);
						}
					} else {
						this.rss = null;
					}
				});

				alt.on("version:ready", () => {
					this.initialized = true;

					const servers = useServersStore();
					servers.reload();
				});
			},
		},
	}),
);
