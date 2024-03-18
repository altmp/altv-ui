import hoverSoundFile from '@/assets/sounds/hover.mp3';
import moveSoundFile from '@/assets/sounds/move.mp3';
import errorSoundFile from '@/assets/sounds/error.mp3';
import clickSoundFile from '@/assets/sounds/click.mp3';
import sliderEnterSoundFile from '@/assets/sounds/sliderEnter.mp3';
import sliderLeaveSoundFile from '@/assets/sounds/sliderLeave.mp3';
import sliderSoundFile from '@/assets/sounds/slider.mp3';
import karbySoundFile from '@/assets/sounds/karby.mp3';
import emojiSoundFile from '@/assets/sounds/emoji.mp3';
import {useSettingsStore} from "@/stores/settings";

let audioContext: AudioContext;
let audioBufferCache: Map<string, AudioBuffer> = new Map();

async function loadAudioBuffer(url: string) {
    if (audioBufferCache.has(url)) {
        return audioBufferCache.get(url) ?? null;
    }

    audioContext ??= new window.AudioContext();

    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    audioBufferCache.set(url, audioBuffer);

    return audioBuffer;
}

async function playSound(soundUrl: string) {
    const audioBuffer = await loadAudioBuffer(soundUrl);
    const sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = audioBuffer;
    const settings = useSettingsStore();
    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = (settings.data.uiVolume / 100) * 0.8;
    sourceNode.connect(gainNode);
    sourceNode.start();
}

export function playMoveSound() {
    playSound(moveSoundFile);
}
export function playHoverSound() {
    playSound(hoverSoundFile);
}
export function playErrorSound() {
    playSound(errorSoundFile);
}
export function playClickSound() {
    playSound(clickSoundFile);
}
export function playSliderEnterSound() {
    playSound(sliderEnterSoundFile);
}
export function playSliderLeaveSound() {
    playSound(sliderLeaveSoundFile);
}
export function playSliderSound() {
    playSound(sliderSoundFile);
}
export function playKarbySound() {
    playSound(karbySoundFile);
}
export function playEmojiSound() {
    playSound(emojiSoundFile);
}