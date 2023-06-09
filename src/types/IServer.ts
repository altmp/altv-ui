export interface IServer {
    id: string,
    maxPlayers: number,
    players: number,
    name: string,
    locked: boolean,
    host: string,
    port: number,
    gameMode: string,
    website: string,
    language: string,
    description: string,
    verified: boolean,
    promoted: boolean,
    useEarlyAuth: boolean,
    earlyAuthUrl: string,
    useCdn: boolean,
    cdnUrl: string,
    useVoiceChat: boolean,
    tags: string[],
    bannerUrl: string,
    branch: string,
    build: number,
    version: string,
    lastUpdate: number,
    ping?: number,
    offline?: true, // added in UI in some places
}