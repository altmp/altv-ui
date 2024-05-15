import { defineStore } from "pinia";
import { useInitializableStore } from "@/stores/storeInitializer";

export const useUIStore = useInitializableStore(
	defineStore("ui", {
		state: () => {
			return {
				opened: true,
				ready: false,
				earlyAuth: false,
				highlightElevent: false as string | false,
				netgraph: {
					active: false,
					fps: 0,
					rtt: 0,
					tx: 0,
					rx: 0,
                	pps: 0,
				},
			};
		},
		actions: {
			toggleUi(state?: boolean) {
				if (state == null) this.opened = !this.opened;
				else this.opened = state;
			},
			toggleNetgraph(state: boolean) {
				this.netgraph.active = state;
			},
			setNavigationHighlight(element: string | false) {
				this.highlightElevent = element;
			},
			init() {
				alt.on("ui:toggle", (state?: boolean) => {
					this.toggleUi(state);
				});
				alt.on("ui:ready", () => {
					this.ready = true;
				});
				alt.on(
					"ui:updateNetgraph",
					(
						active: boolean,
						fps: number,
						rtt: number,
						tx: number,
						rx: number,
						pps: number,
					) => {
						this.netgraph.active = active;
						this.netgraph.fps = fps;
						this.netgraph.rtt = rtt;
						this.netgraph.tx = tx;
						this.netgraph.rx = rx;
                		this.netgraph.pps = pps;
					},
				);
				alt.on("ui:setEarlyAuthState", (state: boolean) => {
					this.earlyAuth = state;
				});
			},
		},
	}),
);
