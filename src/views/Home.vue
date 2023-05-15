<script setup lang="ts">
import StarOutline from "@/components/icons/StarOutline.vue";
import HomeNews from "./home/HomeNews.vue";
import HomeServerGroup from "@/views/home/HomeServerGroup.vue";
import {useServersStore} from "@/stores/servers";
import {useLocalization} from "@/stores/localization";
import {useVersionStore} from "@/stores/version";
import Logo from "@/components/icons/Logo.vue";

const servers = useServersStore();
const version = useVersionStore();
const { t } = useLocalization();

</script>

<template>
    <div class="view" :class="{ 'view--no-news': !version.rss }">
        <div class="view__header">
            <logo custom-logo class="view__logo" v-if="version.manifest?.imageLogo64"></logo>
            <h1>{{ t('WELCOME_TO', version.manifest?.name || (version.orange ? "GTA:Orange" : 'alt:V Multiplayer') )}}</h1>
        </div>

        <div class="view__header news-block" v-if="version.rss">
            <h1>{{ version.rss?.title || t('LATEST_NEWS') }}</h1>
        </div>

        <div class="view__servers">
            <div class="view__servers-wrapper">
                <div class="view__servers-list">
                    <div class="view__group" v-if="version.manifest">
                        <h3>{{ t('SERVERS') }}</h3>

                        <home-server-group :servers="version.manifest.servers">
                            <template #empty>
                            </template>
                        </home-server-group>
                    </div>

                    <div class="view__group">
                        <h3>{{ t('RECENT_SERVERS') }}</h3>

                        <home-server-group :servers="servers.recent.slice(0, 4)">
                            <template #empty>
                                <div>{{ t('NO_RECENT_SERVERS') }}</div>
                            </template>
                        </home-server-group>
                    </div>

                    <div class="view__group">
                        <h3>{{ t('FAVORITE_SERVERS') }}</h3>

                        <home-server-group :servers="[...servers.favorite].reverse()">
                            <template #empty>
                                <div>{{ t('NO_FAVORITE_SERVERS') }}</div>
                                <star-outline/>
                            </template>
                        </home-server-group>
                    </div>
                </div>
            </div>

        </div>

        <div class="view__news news-block">
            <div class="view__news-wrapper">
                <home-news v-if="version.rss"/>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/assets/_util.scss';

.view {
    display: grid;
    grid-template-columns: 9fr 10fr;
    grid-template-rows: u(212) calc(100vh - #{u(212)});
    @include grid-borders(2, #f1f2f21a u(1) solid);

    @mixin no-news {
        grid-template-columns: 1fr;
        @include grid-borders(1, #f1f2f21a u(1) solid);

        .news-block {
            display: none;
        }
    }

    &--no-news {
        @include no-news;
    }

    @media (max-width: 135vh) {
        @include no-news;
    }

    > * {
        padding: u(48);
    }

    &__news {
        @include scrollable-block(48);
        width: 100%;
        overflow: hidden;
    }

    &__header {
        display: flex;
        align-items: flex-end;
        word-wrap: break-word;
        overflow: hidden;
        white-space: pre-line;
        //text-overflow: ellipsis;

        h1 {
            max-width: 100%;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
    }

    &__logo {
        height: u(116);
        width: u(116);
        margin-right: u(48);
    }

    &__servers {
        @include scrollable-block(48);
    }

    &__servers-list {
        display: flex;
        flex-direction: column;
        gap: u(48);
    }

    &--no-news &__servers-list {
        width: calc(#{calc(9 / 19) * 100%} - #{u(48 + 3)});
    }

    &__group {
        > h3 {
            margin-bottom: u(24);
        }
    }
}
</style>