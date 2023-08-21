// noinspection JSIgnoredPromiseFromCall

import alt from './alt';
import {LogType} from "@/stores/console";
import type {IHistoryServer} from "@/types/IHistoryServer";
import type {IManifest} from "@/stores/version";

if (!('alt' in window)) {
    // @ts-ignore
    window.alt = alt;
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// region Connection
let connecting = true;

function handleFailure() {
    if (connecting) return false;
    alt.viewEmit('connection:failed', 'Cancelled by user', false);
    return true;
}

async function connect(server: string) {
    alt.viewEmit('connection:setServer', server);
    alt.viewEmit('connection:connecting');
    connecting = true;
    await wait(2000);
    if (handleFailure()) return;
    for (let i = 0; i < 10; i++) {
        alt.viewEmit('connection:downloadingResources', 1000 * i, 1000 * 10);
        await wait(200);
    }
    if (handleFailure()) return;
    for (let i = 0; i < 10; i++) {
        alt.viewEmit('connection:validatingResources', i, 10);
        await wait(100);
    }
    if (handleFailure()) return;
    alt.viewEmit('connection:inQueue', 'You\'re 5th in the queue');
    if (handleFailure()) return;
    await wait(1000);
    if (handleFailure()) return;
    connecting = false;
    alt.viewEmit('connection:connected');
    alt.viewEmit('ui:toggle', false);
}

alt.viewOn('connection:connect', (...args) => {
    console.log(args);
    if (args[7]) {
        setSetting('launcherSkin', 'some id lol');
        updateManifest();
    }
})

alt.viewOn('connect:direct', (address: string, password: string) => {
    if (password != '123') return alt.viewEmit('connection:failed', 'Invalid password');
    connect(address);
});

alt.viewOn('connect:masterlist', (id: string, password: string) => {
    const server = servers.find(e => e.id == id);
    if (server.locked && password != '123') return alt.viewEmit('connection:failed', 'Invalid password');
    if (!server) return alt.viewEmit('connection:failed', 'Server offline');
    connect(server.name);
});

alt.viewOn('connection:abort', () => {
    connecting = false;
});
// endregion

// region Settings
const defaultSettings = {
    language: 'ru',
    name: 'Player',
    promotedOnTop: true,
    voiceEnabled: true,
    voiceInputDevice: 0,
    voiceActivation: false,
    voiceInputSensitivity: 0,
    voiceActivationKey: 78,
    voiceVolume: 100,
    voiceAutoInputVolume: true,
    voiceInputVolume: 100,
    voiceNoiseSuppression: true,
    useExternalConsole: false,
    launcherSkin: ''
};

type Settings = typeof defaultSettings;

alt.viewOn('settings:change', (key: string, value: any) => {
    const obj = JSON.parse(localStorage.getItem('settings') ?? '{}');
    obj[key] = value;
    localStorage.setItem('settings', JSON.stringify(obj));
});

function getSetting<T extends keyof Settings>(key: T): Settings[T] {
    return JSON.parse(localStorage.getItem('settings') ?? '{}')[key] ?? defaultSettings[key];
}

function setSetting<T extends keyof Settings>(key: T, value: Settings[T]) {
    const obj = JSON.parse(localStorage.getItem('settings') ?? '{}');
    obj[key] = value;
    localStorage.setItem('settings', JSON.stringify(obj));
    alt.viewEmit('settings:update', { [key]: value })
}

let timer: any;
let value = 0;
alt.viewOn('settings:currentVolume:toggle', (state: boolean) => {
    if (timer) clearInterval(timer);
    if (!state) return;
    timer = setInterval(() => {
        const mod = Math.random() * 5 - 2;
        value += mod;
        if (value < 0) value = 0;
        if (value > 100) value = 100;
        alt.viewEmit('settings:currentVolume:update', value);
    }, 100);
})

alt.viewOn('settings:devices:reload', () => {
    console.log('Reload audio devices!');
})
// endregion

// region Console
let consoleOpen = false;
window.addEventListener('keyup', e => {
    if (e.key == 'F8') {
        consoleOpen = !consoleOpen;
        alt.viewEmit('console:open', consoleOpen);
    }
});

function log(msg: string, resource: string, type: LogType) {
    alt.viewEmit('console:push', 14, msg);
    alt.viewEmit('console:end', resource, type);
}

alt.viewOn('console:execute', (value: string) => {
    if (value == 'test') {
        // alt.viewEmit('console:push', 'default', 'test', LogType.Default)
        log('Resource tick was too long: 2ms', 'test', LogType.Warning)
        log('Unhandled exception: error\n  at [anonymous] test.js\n  at [anonymous] test.js', 'test', LogType.Error)
        log('info', 'test', LogType.Info);
        log('debug', 'test', LogType.Debug);
    } else {
        log(value, 'manual', LogType.Info);
    }
});

alt.viewOn('console:setState', (state: boolean) => {
    consoleOpen = state;
    alt.viewEmit('console:open', consoleOpen);
})
// endregion

// region Servers
const history = [
    {name: 'Test server', id: '3f5d34fffdaeefa8e38b6096190d258e'},
    {name: 'Test server 2', id: '737b3648ac6b21bab60e7f6f37eb50e6'},
    {name: 'Test server 3', id: 'test'},
    {name: 'Test server 4', id: '75364d28be416bb061f5d768a1c3cd80'},
    {name: 'localhost:7788', url: 'localhost:7788'},
    {name: 'Test server 5', id: '6761089a930f31a9e91a3a29544f4568'}
];

let favorites = [
    {name: 'Test server', id: '3f5d34fffdaeefa8e38b6096190d258e'},
    {name: 'Test server 2', id: '737b3648ac6b21bab60e7f6f37eb50e6'},
    {name: 'Test server 3', id: 'test'},
    {name: 'Test server 4', id: '75364d28be416bb061f5d768a1c3cd80'},
    {name: 'Test server 5', id: '6761089a930f31a9e91a3a29544f4568'}
];
const serverData = Array(0).fill(null)
    .map((_, i) => ({
            id: String(i),
            name: 'Some random server ' + i,
            resourcesSize: 100 * i,
            dataSize: 10 * i,
            lastVisit: Date.now() / 1000 - 60 * 60 * 24 * i
        }
    ));

alt.viewOn('serverData:delete', (id: string, type: number) => {
    const obj = serverData.find(e => e.id == id);
    if (!obj) return;
    if (type == 0) obj.resourcesSize = 0;
    else obj.dataSize = 0;
    alt.viewEmit('serverData:updateOne', obj);
})

alt.viewOn('servers:favorite:add', (id: string, name: string) => {
    favorites.push({id, name});
});

alt.viewOn('servers:favorite:remove', (id: string) => {
    favorites = favorites.filter(e => e.id != id);
});

let servers: any[] = [];

async function loadServers() {
    alt.viewEmit('servers:update', null);

    try {
        await wait(1000);
        const res = await fetch('https://api.altv.mp/servers/list');
        servers = (await res.json()) as any[];

        alt.viewEmit('servers:update', servers);

        servers.forEach(e => {
            const ping = Math.round(Math.random() * 200);
            setTimeout(() => alt.viewEmit('servers:setPing', e.id, ping), ping)
        });
    } catch {
        alt.viewEmit('servers:update:error', '');
    }
}

alt.viewOn('servers:reload', () => loadServers());
// endregion

// region Manifest
// const manifest: IManifest = {
//     name: 'Custom name',
//     branch: 'release',
//     primaryColor: 'ffa000',
//     rss: 'http://cdn.alt-mp.com/rss/news.rss',
//     servers: [
//         {
//             name: 'Test',
//             url: '45.9.62.75:7788',
//             id: '737b3648ac6b21bab60e7f6f37eb50e6'
//         }
//     ]
// } as IManifest;
import manifest from '@/browser-test/manifest.json';

async function updateManifest() {
    const skin = !!getSetting('launcherSkin');

    alt.viewEmit('version:setManifest', skin ? JSON.stringify(manifest) : null);
    try {
        const res = await fetch('http://cdn.alt-mp.com/rss/news-short.rss');
        const rss = await res.text();
        alt.viewEmit('version:setRss', rss);
    } catch(e) {
        console.log(e);
    } finally {
        alt.viewEmit('version:setRss', null);
        alt.viewEmit('version:ready');
    }
}

async function updateSkinIndex() {
    alt.viewEmit('servers:skinIndex', '{\n' +
        '  "indexEntries": [\n' +
        '    {\n' +
        '      "serverId": "0330ffff0c5e97e277d038a707701024",\n' +
        '      "xxHash64": "8937df75b8bebe03",\n' +
        '      "fileName": "0330ffff0c5e97e277d038a707701024.bin"\n' +
        '    },\n' +
        '    {\n' +
        '      "serverId": "ddb43704e38f52865316d65a72530c7c",\n' +
        '      "xxHash64": "4df9d8439316debe",\n' +
        '      "fileName": "ddb43704e38f52865316d65a72530c7c.bin"\n' +
        '    },\n' +
        '    {\n' +
        '      "serverId": "4d8befc1a41c033e4a136c28d7cff537",\n' +
        '      "xxHash64": "a754eaa2f434bf5f",\n' +
        '      "fileName": "4d8befc1a41c033e4a136c28d7cff537.bin"\n' +
        '    }\n' +
        '  ]\n' +
        '}');
}

alt.viewOn('ui:resetSkin', () => {
    setSetting('launcherSkin', '');
    updateManifest();
})
// endregion

alt.viewOn('loaded', () => {
    alt.viewEmit('version:update', '14.0', 'internal', 'localhost', true, true);
    updateManifest();
    updateSkinIndex();
    alt.viewEmit('settings:update', {...defaultSettings, ...JSON.parse(localStorage.getItem('settings') ?? '{}')});
    alt.viewEmit('settings:devices:update', {
        default: 'Device 2',
        device1: 'Device 1',
        device2: 'Device 2',
        long: 'Super long device name lorem ipsum dolor sit amet'
    })
    alt.viewEmit('serverData:update', serverData);
    alt.viewEmit('servers:recent:update', history);
    alt.viewEmit('servers:favorite:update', favorites);
    loadServers();
    // setTimeout(() => {
    //     alt.viewEmit('ui:ready');
    // }, 5000);
    alt.viewEmit('ui:ready');
});

// region Events
document.addEventListener('keydown', (e) => {
    alt.viewEmit('keydown', e.keyCode);
});

document.addEventListener('mousedown', (e) => {
    if (e.button != 3 && e.button != 4) return;
    e.preventDefault();
    alt.viewEmit('keydown', e.button == 3 ? 5 : 6);
});

document.addEventListener('mouseup', (e) => {
    if (e.button < 3) return;
    e.preventDefault();
});
// endregion

export default {};