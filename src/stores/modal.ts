import {defineStore} from "pinia";
import {useInitializableStore} from "@/stores/storeInitializer";
import {computed} from "vue";
import type {IServer} from "@/types/IServer";
import {playErrorSound, playMoveSound} from "@/utils/playSound";

export enum ModalType {
    None,
    Connect,
    Permissions,
    DirectConnect,
    DeleteServerData,
    Nickname,
    Exit
}

export type IModalProps = {
    [ModalType.None]: {};
    [ModalType.Connect]: { server: IServer };
    [ModalType.Permissions]: { required: number[]; optional: number[] };
    [ModalType.DirectConnect]: { address?: string; password?: string };
    [ModalType.DeleteServerData]: { id: string; name: string; size: number; type: number; };
    [ModalType.Nickname]: {};
    [ModalType.Exit]: {};
}

export interface IModalState {
    type: ModalType;
    props: any;
    closeable: boolean;
}

export const useModalStore = useInitializableStore(defineStore('modal', {
    state: (): IModalState => {
        return {
            type: ModalType.None,
            props: {},
            closeable: false,
        }
    },
    actions: {
        close() {
            this.$patch({
                type: ModalType.None,
                closeable: false
            });
            this.props = {};
        },
        open(type: ModalType, props: IModalProps[ModalType], closeable = true) {
            this.$patch({
                type,
                closeable
            });
            this.props = props;
        },
        init() {
            alt.on('connection:requestPermissions', (required, optional) => {
                this.open(ModalType.Permissions, { required, optional }, false);
                playErrorSound();
            });

            alt.on('exit', () => {
                if (this.type == ModalType.Exit) return;
                this.open(ModalType.Exit, {}, true);
                playMoveSound();
            });

            if (import.meta.env.DEV) {
                // @ts-expect-error
                window.closeModal = this.close;
                // @ts-expect-error
                window.openModal = this.open;
            }
        }
    },
}));

export const getModalProps = <T extends ModalType>(store: ReturnType<typeof useModalStore>) => computed(() => store.props as IModalProps[T]);