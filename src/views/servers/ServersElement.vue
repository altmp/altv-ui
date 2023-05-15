<script setup lang="ts">
import type {PropType} from "vue";
import {computed} from "vue";
import LanguageFlag from "../../components/LanguageFlag.vue";
import PlayerCount from "../../components/PlayerCount.vue";
import Tooltip from "@/components/container/Tooltip.vue";
import Star from "@/components/icons/Star.vue";
import type {IServer} from "@/types/IServer";
import ServerIcons from "@/components/ServerIcons.vue";
import {ModalType, useModalStore} from "@/stores/modal";
import {useServersStore} from "@/stores/servers";
import {useLocalization} from "@/stores/localization";

const modal = useModalStore();
const servers = useServersStore();
const { t } = useLocalization();

const props = defineProps({
    item: {
        type: Object as PropType<IServer>,
        required: true
    },
})

const favorite = computed(() => servers.favoriteIds.has(props.item?.id ?? ""));
</script>

<template>
    <tr class="server" @click="modal.open(ModalType.Connect, { server: item })">
        <td class="name">
            <div class="name__row">
                <div class="name__content">
                    <Tooltip class="name__favorite" :text="t('SERVER_FAVORITE')" v-if="favorite">
                        <star />
                    </Tooltip>
                    <span>{{ item.name }}</span>
                </div>
                <server-icons :server="item" />
            </div>
            <div class="tags">
                <span v-for="tag in item.tags.filter(Boolean)" class="tags__element">{{ tag }}</span>
            </div>
        </td>
        <td class="players">
            <player-count :online="true" dir="ltr" :players="item.players" :max-players="item.maxPlayers"></player-count>
        </td>
<!--        <td class="ping">-->
<!--            <div class="ping__value" v-if="item.ping === 65535">...</div>-->
<!--            <div class="ping__value" v-else-if="item.ping == null || item.ping === 0">N/A</div>-->
<!--            <template v-else>-->
<!--                <span class="ping__value">{{ item.ping }}</span>-->
<!--                <span class="ping__indicator" :class="{ good: item.ping < 30, bad: item.ping > 100 }"></span>-->
<!--            </template>-->
<!--        </td>-->
        <td class="gameMode">
            <span>{{ item.gameMode }}</span>
        </td>
        <td class="language">
            <language-flag :language="item.language"></language-flag>
        </td>
    </tr>
</template>

<style lang="scss" scoped>
.server {
    .name {
        &__row {
            display: flex;
            justify-content: space-between;
            gap: u(12);
            padding-right: u(24);

            [dir=rtl] & {
                padding-right: unset;
                padding-left: u(24);
                direction: rtl;
            }

            svg {
                height: u(12);
            }
        }

        &__favorite {
            margin-right: u(8);
            [dir=rtl] & {
                margin-right: unset;
                margin-left: u(8);
            }
            display: inline-block;
        }

        .tags {
            margin-top: u(12);
            display: flex;
            gap: u(4);
            overflow-x: hidden;
            flex-wrap: wrap;

            &:empty {
                display: none;
            }

            &__element {
                padding: u(6);
                font-size: u(12);
                line-height: u(12);
                color: #FFFFFF;
                background: rgba(255, 255, 255, 0.1);
                border-radius: u(4);
                font-weight: 500; // 600 in figma, figma is bad with scaling font weight for some reason
                white-space: nowrap;
            }
        }
    }

    .ping {
        &__value {
            display: inline-block;
            vertical-align: middle;
            font-weight: 500;
        }

        &__indicator {
            display: inline-block;
            width: u(8);
            height: u(8);
            border-radius: 50%;
            vertical-align: middle;
            margin-left: u(12);
            transition: background-color 0.2s ease-in-out;

            background: #FFB900;

            &.good {
                background: #00AD56;
            }

            &.bad {
                background: #E20338;
            }

            &.notAvailable {
                background: transparent;
            }
        }
    }
}
</style>