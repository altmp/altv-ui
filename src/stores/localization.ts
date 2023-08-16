import {defineStore} from "pinia";
import {watch} from "vue";
import {useSettingsStore} from "@/stores/settings";

export interface Locale {
    code: string;
    name: string;
    rtl?: boolean;
    data: Record<string, string>;
    intlCode?: string;
    preparedStrings?: Map<string, string>;
}

export interface LocaleStore {
    locales: Map<string, Locale>;
    defaultLocale: string;
    currentLocale: Locale;
    dir: 'ltr' | 'rtl';
}

export const useLocalization = defineStore('localization', {
    state: (): LocaleStore => {
        return {
            locales: new Map<string, Locale>(),
            dir: 'ltr',
            defaultLocale: 'unk',
            currentLocale: {
                code: 'unk',
                name: 'Unknown',
                data: {}
            },
        }
    },
    actions: {
        init(locales: Locale[], defaultLocale = 'en') {
            this.defaultLocale = defaultLocale;
            this.locales = new Map(locales.map(e => [
                e.code,
                {
                    ...e,
                    intlCode: e.code.replace('_', '-')
                }
            ]));

            if (!this.locales.has(this.defaultLocale)) {
                console.error(`Default locale (${this.defaultLocale}) does not exist.`);
            }

            if (import.meta.env.DEV) {
                this.locales.set('test', {
                    code: 'test',
                    name: 'Test',
                    data: Object.fromEntries(Object.entries(this.locales.get(defaultLocale)?.data ?? {})
                        .map(([k, v]) => [k, k]))
                });
                this.locales.set('test2', {
                    code: 'test2',
                    name: 'Long test',
                    data: Object.fromEntries(Object.entries(this.locales.get(defaultLocale)?.data ?? {})
                        .map(([k, v]) => [k, 'abcdefjklmnop qrstuv']))
                });
            }

            const settings = useSettingsStore();
            this.setLocale(settings.data.language);
            watch(() => settings.data.language, () => {
                this.setLocale(settings.data.language);
            });
            watch(() => !!this.currentLocale.rtl && !settings.data.disableRtl, (value) => this.dir = value ? 'rtl' : 'ltr');

            alt.on('ui:customLocales', (data) => {
                const parsed = JSON.parse(data) as Record<string, any>;
                for (const [key, value] of Object.entries(parsed)) {
                    this.locales.set(key, {
                        code: key,
                        name: value.name,
                        data: value.strings,
                        rtl: value.rtl
                    })
                }

                this.setLocale(settings.data.language);
            });
        },

        formatString(str: string, args: (string | number)[]) {
            return str.replace(/{(\d+)}/g, (m, i) =>
                i < args.length ? String(args[i]) : m
            );
        },

        prepareLocale(locale: Locale) {
            if (locale.preparedStrings) return;
            const defaultLocale = this.locales.get(this.defaultLocale) ?? { code: this.defaultLocale, data: {} };

            const strings = locale.data;

            if (locale.code != this.defaultLocale) {
                for (let [key, value] of Object.entries(defaultLocale.data)) {
                    key = key.replace(/:OTHER$/, '');
                    if (key.includes(':')) continue;
                    if (strings[key]) continue;

                    if (!key.startsWith('LAUNCHER_')) console.warn(
                        'No localized string found for ' +
                        key +
                        ' in locale ' +
                        locale.code
                    );
                    strings[key] = value;
                }
            }

            locale.preparedStrings = new Map(Object.entries(strings));
        },
        setLocale(locale: string) {
            const localeObj = this.locales.get(locale);
            if (!localeObj) {
                if (locale == this.defaultLocale) return;
                this.setLocale(this.defaultLocale);
                return;
            }
            this.prepareLocale(localeObj);
            this.currentLocale = localeObj;
        }
    },
    getters: {
        t(this: any, state) {
            return (key: string, ...args: (string | number)[]) => this.formatString(state.currentLocale.preparedStrings?.get(key) || key, args);
        },
        tRaw(this: any, state) {
            return (key: string) => String(state.currentLocale.preparedStrings?.get(key) || key);
        },
        tPlural(this: any, state) {
            const rules = new Intl.PluralRules(state.currentLocale.intlCode);
            const strings = state.currentLocale.preparedStrings;
            return (key: string, value: number | string, ...args: (string | number)[]) => {
                const numValue = isNaN(+value) ? 0 : +value;
                return this.formatString(strings?.get(`${key}:${rules.select(numValue).toUpperCase()}`) || strings?.get(key) || strings?.get(`${key}:OTHER`) || key, [value, ...args]);
            }
        }
    }
});