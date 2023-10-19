import {defineStore} from "pinia";
import {useInitializableStore} from "@/stores/storeInitializer";
import {nthIndexOf} from "@/utils/nthIndexOf";

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

const maxNewlines = 50;
const maxLength = 10000;

let newLastCount = 0;
let newLastDate = '';

let last: LogEntry | null = null;
let queue: LogEntry[] = [];
let dataBuffer = '';
let htmlBuffer = '';
let messageLength = 0;
let messageNewlines = 0;

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
                let content = stripHtml(value);
                dataBuffer += value;

                if (messageNewlines >= maxNewlines || messageLength >= maxLength) return;

                const heightLimitIndex = nthIndexOf(content, '\n', maxNewlines - messageNewlines);
                let trimmedText = (heightLimitIndex == -1 ? content : content.substring(0, heightLimitIndex + 1)).substring(0, maxLength - messageLength);
                messageNewlines += trimmedText.match(/\n/g)?.length ?? 0;
                messageLength += trimmedText.length;

                if (color != 14) htmlBuffer += `<span style="color: ${colorsArr[color] ?? colors.w}">${trimmedText}</span>`; // not white
                else htmlBuffer += trimmedText; // white
            });

            alt.on('console:reset', () => {
                htmlBuffer = '';
                dataBuffer = '';
                messageLength = 0;
                messageNewlines = 0;
            });

            alt.on('console:end', (resource: string, type: number) => {
                const date = new Date();
                const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
                htmlBuffer = htmlBuffer.trim();

                if (last && last.message == htmlBuffer && last.resource == resource && last.type == type) {
                    // if last item is still in queue
                    if (queue.length) {
                        last.count++;
                        last.time = time;
                    }

                    newLastCount++;
                    newLastDate = time;

                    htmlBuffer = '';
                    return;
                }

                const postfix = dataBuffer.length > messageLength ? `... ${(dataBuffer.length - messageLength)} chars more ...` : '';

                const entry = {
                    id: this.id++,
                    time,
                    message: dataBuffer,
                    html: format(htmlBuffer) + postfix,
                    count: 1,
                    type,
                    resource
                };

                queue.push(entry);
                last = entry;
                newLastCount = 1;

                htmlBuffer = '';
                dataBuffer = '';
                messageLength = 0;
                messageNewlines = 0;
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