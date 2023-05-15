<script lang="ts" setup>
import {useVersionStore} from "@/stores/version";
import {computed, ref} from "vue";

const colors: Record<string, string> = {
    release: '#008935',
    rc: '#E26E2D',
    dev: '#055DC5',
    internal: '#782FEF',
};

const props = defineProps<{ customLogo?: boolean, logoRef: (el: HTMLDivElement) => void }>();
const version = useVersionStore();
const customLogo = computed(() => props.customLogo && version.manifest?.imageLogo64);
const color = computed(() => colors[version.branch] ?? colors.release);
</script>

<template>
    <div :ref="logoRef" v-bind="$attrs">
        <template v-if="!customLogo">
            <svg width="49" height="48" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" v-if="version.orange">
                <mask id="mask0_207_9" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="22" width="468"
                      height="468">
                    <path d="M447.5 223.75C474.076 237.038 474.076 274.962 447.5 288.25L52.1812 485.909C28.2073 497.896 0 480.463 0 453.66V58.3404C0 31.5368 28.2073 14.1037 52.1812 26.0906L447.5 223.75Z"
                          fill="#D9D9D9"/>
                </mask>
                <g mask="url(#mask0_207_9)">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                          d="M447.601 288.199C474.135 274.932 474.135 237.067 447.601 223.8L52.0997 26.0497C28.1632 14.0815 0 31.4873 0 58.2491V453.751C0 480.512 28.1632 497.918 52.0997 485.95L131.782 446.109C158.759 485.873 204.328 512 256 512C338.843 512 406 444.843 406 362C406 344.871 403.129 328.412 397.841 313.079L447.601 288.199ZM339.698 342.151L397.841 313.079C377.557 254.256 321.713 212 256 212C173.157 212 106 279.157 106 362C106 393.171 115.508 422.121 131.782 446.109L189.918 417.041C205.693 435.96 229.441 448 256 448C303.496 448 342 409.496 342 362C342 355.168 341.203 348.523 339.698 342.151ZM339.698 342.151L189.918 417.041C177.482 402.127 170 382.937 170 362C170 314.504 208.504 276 256 276C296.665 276 330.738 304.224 339.698 342.151Z"
                          fill="#FF9000"/>
                </g>
            </svg>
            <svg width="49" height="48" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" v-else>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M40.3108 0.495497L427.544 57.0333C449.747 60.2749 469.613 81.2467 472.037 103.878L511.76 474.734C514.15 497.064 498.447 513.687 476.566 511.863L95.0943 480.101C70.654 478.066 48.5091 457.12 45.7704 433.305L0.282897 37.6656C-2.49424 13.5121 15.4921 -3.12807 40.3108 0.495497Z" :fill="color"/>
                <path opacity="0.15" fill-rule="evenodd" clip-rule="evenodd" d="M25.2275 54.0783L25.2275 54.0783L67.0724 418.036C69.3088 437.482 87.6904 454.991 107.894 456.673L458.818 485.891C467.475 486.613 474.595 483.695 479.333 478.691C484.084 473.674 486.766 466.209 485.807 457.251L449.266 116.092C447.272 97.4828 430.694 80.0575 412.585 77.4137L56.3604 25.4034C46.2151 23.9221 37.9556 26.6241 32.552 31.6362C27.1727 36.6257 24.1116 44.3728 25.2275 54.0783ZM20.2602 54.6494L62.1052 418.607C64.6246 440.514 84.9962 459.784 107.479 461.655L458.403 490.874C478.533 492.552 492.978 477.26 490.779 456.718L454.238 115.56C452.007 94.7406 433.732 75.4482 413.307 72.4661L57.0828 20.4558C34.2516 17.1224 17.7055 32.43 20.2602 54.6494Z" fill="#F1F2F2"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M143 158L256 354.18L369 158H218.43L255.998 223.524L274.832 191.089H312.302L256 288.525L180.764 158H143Z" fill="#F1F2F2"/>
            </svg>
        </template>
        <img :src="'data:image/png;base64,' + customLogo" alt="" v-else>
    </div>
</template>

<style lang="scss" scoped>
svg {
  shape-rendering: geometricPrecision;
  width: 100%;
  height: 100%;
}

img {
  object-fit: contain;
  object-position: center;
  width: 100%;
  height: 100%;
}

div {
  width: u(49);
  height: u(49);
}
</style>