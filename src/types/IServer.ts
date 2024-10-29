export interface IServer {
	publicId: string;
	maxPlayersCount: number;
	playersCount: number;
	name: string;
	passworded: boolean;
	host: string;
	port: number;
	gameMode: string;
	website: string;
	language: string;
	description: string;
	verified: boolean;
	promoted: boolean;
	useEarlyAuth: boolean;
	earlyAuthUrl: string;
	useCdn: boolean;
	cdnUrl: string;
	useVoiceChat: boolean;
	tags: string[];
	bannerUrl: string;
	branch: string;
	build: number;
	address: string;
	version: string;
	lastUpdate: number;
	ping?: number;
	offline?: true; // added in UI in some places
	hasCustomSkin: boolean;
	group: { id: string; name: string } | null;
}
