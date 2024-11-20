import { useSettingsStore } from "@/stores/settings";

import hover from "@/assets/sounds/hover.mp3?url";
import move from "@/assets/sounds/move.mp3?url";
import error from "@/assets/sounds/error.mp3?url";
import click from "@/assets/sounds/click.mp3?url";
import sliderEnter from "@/assets/sounds/sliderEnter.mp3?url";
import sliderLeave from "@/assets/sounds/sliderLeave.mp3?url";
import slider from "@/assets/sounds/slider.mp3?url";
import karby from "@/assets/sounds/karby.mp3?url";
import emoji from "@/assets/sounds/emoji.mp3?url";

const SOUNDS = Object.freeze({
	hover,
	move,
	error,
	click,
	sliderEnter,
	sliderLeave,
	slider,
	karby,
	emoji,
}) satisfies Readonly<Record<string, string>>;

type SoundKey = keyof typeof SOUNDS;

let audioContext: AudioContext | null = null;
const audioBufferCache: Map<SoundKey, AudioBuffer> = new Map();

async function loadAudioBuffer(key: SoundKey): Promise<AudioBuffer> {
	const cachedBuffer = audioBufferCache.get(key);
	if (cachedBuffer) return cachedBuffer;

	const response = await fetch(SOUNDS[key]);
	if (!response.ok) {
		throw new Error(`Failed to fetch audio buffer for ${key}`);
	}
	const arrayBuffer = await response.arrayBuffer();

	audioContext ??= new AudioContext();
	const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
	audioBufferCache.set(key, audioBuffer);
	return audioBuffer;
}

export async function playSound(soundKey: SoundKey) {
	const settings = useSettingsStore();
	if (settings.data.uiVolume === 0) return;

	const audioBuffer = await loadAudioBuffer(soundKey);
	audioContext ??= new AudioContext();
	const sourceNode = audioContext.createBufferSource();
	sourceNode.buffer = audioBuffer;

	const gainNode = audioContext.createGain();
	gainNode.connect(audioContext.destination);
	gainNode.gain.value = (settings.data.uiVolume / 100) * 0.8;

	sourceNode.connect(gainNode);
	sourceNode.start();
}
