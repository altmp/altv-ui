/// <reference types="vite/client" />
/// <reference types="@altv/types-webview" />

declare module 'vue-virtual-scroller';
declare module 'moment/min/moment-with-locales' {
    import moment from 'moment';
    export default moment;
}