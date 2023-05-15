<script setup lang="ts">

</script>

<template>
<div class="loader" v-bind="$attrs"></div>
</template>


<style lang="scss" scoped>

$speed: 0.7s;
$colorDark: rgba(white, 0.2);
$colorLight: rgba(white, 0.7);

.loader {

    position: relative;
    width: 10px;
    height: 10px;
    border-radius: 5px;
    background-color: $colorDark;
    color: $colorDark;
    animation: dot-flashing $speed infinite linear alternate;
    animation-delay: calc($speed / 3);

    &::before, &::after {
        content: "";
        display: inline-block;
        position: absolute;
        top: 0;
    }

    &::before {
        left: -15px;
        width: 10px;
        height: 10px;
        border-radius: 5px;
        background-color: $colorDark;
        color: $colorDark;
        animation: dot-flashing $speed infinite alternate;
        animation-delay: 0s;
    }

    &::after {
        left: 15px;
        width: 10px;
        height: 10px;
        border-radius: 5px;
        background-color: $colorDark;
        color: $colorDark;
        animation: dot-flashing $speed infinite alternate;
        animation-delay: calc($speed / 3) * 2;
    }
}

@keyframes dot-flashing {
    0%, 50% {
        background-color: $colorDark;
    }
    100% {
        background-color: $colorLight;
    }
}
</style>