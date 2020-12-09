import { Track } from "../../models";
import { playMidiArray, playMidiArrayPercussion } from "./midi";


// play track for non-percussion
export function playTrack(context: AudioContext, track: Track, volume: number, type: OscillatorType, length: number, eps: number, timeConstant: number) {
    const { is_mono, midi_array } = track;
    return playMidiArray(context, is_mono, midi_array, volume, type, length, eps, timeConstant);
}

// play track for percussion
export async function playTrackPercussion(track: Track, volume: number) {
    const { midi_array } = track;
    return await playMidiArrayPercussion(midi_array, volume);
}