import {defineStore} from "pinia";
import {useInitializableStore} from "@/stores/storeInitializer";

export enum LogType {
    Info,
    Warning,
    Error,
    Debug,
}

export interface LogEntry {
    id: number;
    time: string;
    message: string;
    html: string;
    count: number;
    type: LogType;
    resource: string;
}

export interface IConsoleState {
    entries: LogEntry[];
    history: string[];
    open: boolean;
    id: number;
    transparent: boolean;
}

const colors: Record<string, string> = {
    k: '#1e1e1e', // BLACK
    lk: '#666666', // LBLACK
    r: '#bd3f39', // RED
    lr: '#df5853', // LRED
    g: '#55b87f', // GREEN
    lg: '#63cd91', // LGREEN
    b: '#3972c2', // BLUE
    lb: '#508ee3', // LBLUE
    y: '#e6e34d', // YELLOW
    ly: '#f6f366', // LYELLOW
    m: '#ae4cb6', // MAGENTA
    lm: '#c978d1', // LMAGENTA
    c: '#4ba6c9', // CYAN
    lc: '#59b6d7', // LCYAN
    w: '#C0C0C0', // WHITE
    lw: '#FFFFFF' // LWHITE
};

const colorsArr = Object.values(colors);

function stripHtml(string: string) {
    return string.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function format(string: string) {
    return string
        .replace(/https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/g,
            '<a href="$&" target="_blank">$&</a>')!;
}

let newLastCount = 0;
let newLastDate = '';

let last: LogEntry | null = null;
let queue: LogEntry[] = [];
let buffer = '';

export const useLogStore = useInitializableStore(defineStore('logs', {
    state: (): IConsoleState => {
        return {
            entries: [],
            history: [],
            open: false,
            transparent: false,
            id: 0
        };
    },
    actions: {
        clearLogs() {
            this.entries = [];
            last = null;
            queue = [];
        },
        toggle(state?: boolean) {
            this.open = state ?? !this.open;
            // if (state) this.transparent = false;
        },
        enableTransparentMode(state?: boolean) {
            this.transparent = state ?? !this.transparent;
            if (this.transparent) alt.emit('console:setState', false);
        },
        init() {
            setInterval(() => {
                if (!queue.length) {
                    if (!last || newLastCount == last.count) return;
                    const lastEntry = this.entries[this.entries.length - 1];
                    if (!lastEntry) return;
                    lastEntry.count = newLastCount;
                    lastEntry.time = newLastDate;
                    return;
                }
                this.entries.push(...queue);
                if (this.entries.length > 300) this.entries.splice(0, this.entries.length - 300);
                queue = [];
            }, 16);

            alt.on('console:push', (color: number, value: string) => {
                const content = stripHtml(value);
                if (color != 14) buffer += `<span style="color: ${colorsArr[color] ?? colors.w}">${content}</span>`; // not white
                else buffer += content; // white
            });
            alt.on('console:reset', () => {
                buffer = '';
            });
            alt.on('console:end', (resource: string, type: number) => {
                const date = new Date();
                const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
                buffer = buffer.trim();

                if (last && last.message == buffer && last.resource == resource && last.type == type) {
                    // if last item is still in queue
                    if (queue.length) {
                        last.count++;
                        last.time = time;
                    }

                    newLastCount++;
                    newLastDate = time;

                    buffer = '';
                    return;
                }

                const entry = {
                    id: this.id++,
                    time,
                    message: buffer,
                    html: format(buffer),
                    count: 1,
                    type,
                    resource
                };

                queue.push(entry);
                last = entry;
                newLastCount = 1;

                buffer = '';
            });
            alt.on('console:open', this.toggle.bind(this));
            alt.on('console:clear', this.clearLogs.bind(this));
            alt.on('console:forceTransparent', () => this.enableTransparentMode(true))
        },
        addHistoryEntry(entry: string) {
            if (this.history[0] == entry) return;
            this.history.unshift(entry);
            while (this.history.length > 50) this.history.pop();
        }
    }
}));