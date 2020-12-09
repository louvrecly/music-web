import Voice from "./Voice";
import { MidiArray, NoteTimeline, EmulatedKeys, MidiInstrument, EmulatedDrums, aiFeed } from "../../models";
import { midiListItem } from "../../models";
import { soundUrl } from "../../Component/BandRoom/Instrument/DrumsKit/DrumsKit";


// interface ActiveVoices {
//     [midiNote: string]: Voice
// }

// let context: AudioContext | null;
// let activeVoices: ActiveVoices = {};

// initialize context
export function getOrCreateContext() {
    // if (!context) {
    //     context = new AudioContext();
    // }
    const context = new AudioContext();
    return context;
}

// // destroy context
// export function destroyContext(context: AudioContext | null) {
// // export function destroyContext() {
//     context = null;
//     activeVoices = {};
//     return context;
// }

// specify noteOn function
export function noteOn(context: AudioContext, midiNote: number, volume: number, type: OscillatorType) {
    // export function noteOn(midiNote: number, volume: number, type: OscillatorType) {
    // context = getOrCreateContext();
    let voice = new Voice(context);
    const gainValue = voice.volumeToGain(volume);
    voice.start(midiNote, gainValue, 0, type);
    // activeVoices[midiNote] = voice;
    return voice;
}

// // specify noteOff function
// export function noteOff(midiNote: number) {
//     activeVoices[midiNote].stop(0);
//     delete activeVoices[midiNote];
// }

// // specify pause sound function
// export function pauseSound() {
//     if (context) {
//         context.suspend();
//     }
// }


// // play tetris midi
// function playTetrisMidi(length, eps = 0.01, gainValue = volumeToGain(volume)) {
//     playMonophonicMidi(tetris, length, eps, gainValue, type, timeConstant);
// };


// convert midi list to midi array for non-percussion
export function convertToMidiArray(is_mono: boolean, midiList: Array<midiListItem>, length: number) {
    let midi_array: MidiArray;
    if (is_mono) {
        // mono
        let onNote: number;
        let filteredNoteItems = midiList.filter(midiListItem => {
            const { midiData } = midiListItem;
            const [command, midiNote, velocity] = midiData;
            const isNoteOff = command === 128 || velocity === 0;
            if (!isNoteOff) {
                onNote = midiNote;
            }
            const mismatchOnNote = midiNote !== onNote;
            return !(isNoteOff && mismatchOnNote);
        });
        midi_array = filteredNoteItems.map((midiListItem, i) => {
            const { midiData, timestamp } = midiListItem;
            const [command, midiNote, velocity] = midiData;
            const nextTimestamp = filteredNoteItems[i + 1] ? filteredNoteItems[i + 1].timestamp : (timestamp + length * 50);
            const elapsedTime = (nextTimestamp - timestamp) / 1000 > 0 ? (nextTimestamp - timestamp) / 1000 : 0.01;
            const noteFraction = length / elapsedTime;
            if (command === 144 && velocity !== 0) {
                return [midiNote, noteFraction];
            } else if (command === 128 || velocity === 0) {
                return [-1, noteFraction];
            } else {
                console.log(`Invalid command: ${command}\ncommand could only be 144 or 128!`);
                return [-1, 8];
            }
        });
    } else {
        // poly
        let onNotes: Array<number> = [];
        let noteTimeline: NoteTimeline = {};
        midiList.forEach(midiListItem => {
            const { midiData, timestamp } = midiListItem;
            const [command, midiNote, velocity] = midiData;
            if (!(timestamp in noteTimeline)) {
                noteTimeline[timestamp] = [];
            }
            if (command === 144 && velocity !== 0) {
                onNotes.push(midiNote);
            } else if (command === 128 || velocity === 0) {
                onNotes = onNotes.filter(onNote => onNote !== midiNote);
            } else {
                console.log("Invalid midiListItem: ", midiListItem);
            }
            noteTimeline[timestamp].push(...onNotes);
        });
        // console.log({ noteTimeline });
        const noteRecords = Object.entries(noteTimeline);
        // console.log({ noteRecords });
        midi_array = noteRecords.map((noteRecord, i, arr) => {
            const [timestampString, midiNotes] = noteRecord;
            const timestamp = parseFloat(timestampString);
            const nextTimestamp = arr[i + 1] ? parseFloat(arr[i + 1][0]) : (timestamp + length * 100);
            const elapsedTime = (nextTimestamp - timestamp) / 1000 > 0 ? (nextTimestamp - timestamp) / 1000 : 0.01;
            const noteFraction = length / elapsedTime;
            return [midiNotes, noteFraction];
        });
    }
    return midi_array;
}

// convert midi list to midi array for percussion
export function convertToMidiArrayPercussion(midiList: Array<midiListItem>) {
    let midi_array: MidiArray;
    const filteredNoteItems = midiList.filter(midiListItem => {
        const { midiData } = midiListItem;
        const command = midiData[0];
        const velocity = midiData[2];
        const isNoteOff = command === 128 || velocity === 0;
        return !isNoteOff;
    });
    let noteTimeline: NoteTimeline = {};
    filteredNoteItems.forEach(midiListItem => {
        const { midiData, timestamp } = midiListItem;
        // const [command, midiNote, velocity] = midiData;
        const midiNote = midiData[1];
        if (!(timestamp in noteTimeline)) {
            noteTimeline[timestamp] = [];
        }
        noteTimeline[timestamp].push(midiNote);
    });
    // console.log({ noteTimeline });
    const noteRecords = Object.entries(noteTimeline);
    // console.log({ noteRecords });
    const offset = parseFloat(noteRecords[0][0]);
    midi_array = noteRecords.map(noteRecord => {
        const [timestampString, midiNotes] = noteRecord;
        const timestamp = parseFloat(timestampString);
        const elapsedTime = (timestamp - offset) / 1000;
        return [midiNotes, elapsedTime];
    });
    return midi_array;
}

// convert ai feed to midi array
export function convertToMidiArrayAiFeed(notes: Array<aiFeed>, length: number = 2) {
    let midi_array: MidiArray = [];
    notes.forEach(note => {
        const { pitch, quantizedStartStep, quantizedEndStep } = note;
        const elapsedTime = quantizedEndStep - quantizedStartStep;
        const noteFraction = length / elapsedTime;
        midi_array.push([pitch, noteFraction]);
    });
    return midi_array;
}


// play midi array for non-percussion
export function playMidiArray(context: AudioContext, is_mono: boolean, midi_array: MidiArray, volume: number, type: OscillatorType = "sine", length: number = 2, eps: number = 0.001, timeConstant: number = 0.001) {
    // export function playMidiArray(is_mono: boolean, midi_array: MidiArray, volume: number, type: OscillatorType = "sine", length: number = 2, eps: number = 0.001, timeConstant: number = 0.001) {
    if (is_mono) {
        // mono
        return playMonophonicMidi(context, midi_array, volume, type, length, eps, timeConstant);
        // playMonophonicMidi(midi_array, volume, type, length, eps, timeConstant);
    } else {
        // poly
        return playPolyphonicMidi(context, midi_array, volume, type, length);
        // playPolyphonicMidi(midi_array, volume, type, length);
    }
};

// play monophonic midi array
function playMonophonicMidi(context: AudioContext, midi_array: MidiArray, volume: number, type: OscillatorType = "sine", length: number = 2, eps: number = 0.001, timeConstant: number = 0.001) {
    // function playMonophonicMidi(midi_array: MidiArray, volume: number, type: OscillatorType = "sine", length: number = 2, eps: number = 0.001, timeConstant: number = 0.001) {
    // context = getOrCreateContext();
    let voice = new Voice(context);
    // activeVoices["-1"] = voice;
    voice.playMonophone(midi_array, volume, type, length, eps, timeConstant);
    // delete activeVoices["-1"];
    return voice;
}

// play polyphonic midi array
function playPolyphonicMidi(context: AudioContext, midi_array: MidiArray, volume: number, type: OscillatorType = "sine", length: number = 2) {
    // function playPolyphonicMidi(midi_array: MidiArray, volume: number, type: OscillatorType = "sine", length: number = 2) {
    // context = getOrCreateContext();
    let voice = new Voice(context);
    // activeVoices["-1"] = voice;
    voice.playPolyphone(midi_array, volume, type, length);
    // delete activeVoices["-1"];
    return voice;
}

// play midi array for percussion
export function playMidiArrayPercussion(midi_array: MidiArray, volume: number) {
    const delay = (t: number) => new Promise(resolve => setTimeout(resolve, t));
    for (let midiItem of midi_array) {
        const [midiNotes, elapsedTime] = midiItem;
        const offset = elapsedTime * 1000;
        delay(offset).then(() => {
            for (let midiNote of midiNotes as Array<number>) {
                const audio = new Audio((soundUrl as any)[midiNote as number]);
                audio.volume = volume / 100;
                audio.play();
            }
        });
    }
};


// notes
export const notes: Array<string> = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// keyboard emulation
export const emulatedKeys: EmulatedKeys = {
    "z": 60,
    "s": 61,
    "x": 62,
    "d": 63,
    "c": 64,
    "v": 65,
    "g": 66,
    "b": 67,
    "h": 68,
    "n": 69,
    "j": 70,
    "m": 71,
    ",": 72,
    "l": 73,
    ".": 74,
    ";": 75,
    "/": 76,
    "q": 72,
    "2": 73,
    "w": 74,
    "3": 75,
    "e": 76,
    "r": 77,
    "5": 78,
    "t": 79,
    "6": 80,
    "y": 81,
    "7": 82,
    "u": 83,
    "i": 84,
    "9": 85,
    "o": 86,
    "0": 87,
    "p": 88,
    "[": 89,
    "=": 90,
    "]": 91
};

export const emulatedDrums: EmulatedDrums = {
    "a": 65,
    "s": 83,
    "d": 68,
    "f": 70,
    "g": 71,
    "h": 72,
    "j": 74,
    "k": 75,
    "l": 76
};

// // midi instruments types
// export const midiInstrumentTypes = {
//     0: "Piano",
//     1: "Chromatic Percussion",
//     2: "Organ",
//     3: "Guitar",
//     4: "Bass",
//     5: "Strings",
//     6: "Ensemble",
//     7: "Brass",
//     8: "Reed",
//     9: "Pipe",
//     10: "Synth Lead",
//     11: "Synth Pad",
//     12: "Synth Effects",
//     13: "Ethnic",
//     14: "Percussive",
//     15: "Sound Effects"
// }

// midi instruments types
export const midiInstrumentTypes: Array<string> = [
    "Piano",
    "Chromatic Percussion",
    "Organ",
    "Guitar",
    "Bass",
    "Strings",
    "Ensemble",
    "Brass",
    "Reed",
    "Pipe",
    "Synth Lead",
    "Synth Pad",
    "Synth Effects",
    "Ethnic",
    "Percussive",
    "Sound Effects"
]

// // midi instrument names
// export const midiInstruments = {
//     0: { class: "Piano", instrument: "Acoustic Grand Piano" },
//     1: { class: "Piano", instrument: "Bright Acoustic Piano" },
//     2: { class: "Piano", instrument: "Electric Grand Piano" },
//     3: { class: "Piano", instrument: "Honky-tonk Piano" },
//     4: { class: "Piano", instrument: "Rhodes Piano" },
//     5: { class: "Piano", instrument: "Chorused Piano" },
//     6: { class: "Piano", instrument: "Harpsichord" },
//     7: { class: "Piano", instrument: "Clavinet" },
//     8: { class: "Chromatic Percussion", instrument: "Celesta" },
//     9: { class: "Chromatic Percussion", instrument: "Glockenspiel" },
//     10: { class: "Chromatic Percussion", instrument: "Music box" },
//     11: { class: "Chromatic Percussion", instrument: "Vibraphone" },
//     12: { class: "Chromatic Percussion", instrument: "Marimba" },
//     13: { class: "Chromatic Percussion", instrument: "Xylophone" },
//     14: { class: "Chromatic Percussion", instrument: "Tubular Bells" },
//     15: { class: "Chromatic Percussion", instrument: "Dulcimer" },
//     16: { class: "Organ", instrument: "Hammond Organ" },
//     17: { class: "Organ", instrument: "Percussive Organ" },
//     18: { class: "Organ", instrument: "Rock Organ" },
//     19: { class: "Organ", instrument: "Church Organ" },
//     20: { class: "Organ", instrument: "Reed Organ" },
//     21: { class: "Organ", instrument: "Accordion" },
//     22: { class: "Organ", instrument: "Harmonica" },
//     23: { class: "Organ", instrument: "Tango Accordion" },
//     24: { class: "Guitar", instrument: "Acoustic Guitar (nylon)" },
//     25: { class: "Guitar", instrument: "Acoustic Guitar (steel)" },
//     26: { class: "Guitar", instrument: "Electric Guitar (jazz)" },
//     27: { class: "Guitar", instrument: "Electric Guitar (clean)" },
//     28: { class: "Guitar", instrument: "Electric Guitar (muted)" },
//     29: { class: "Guitar", instrument: "Overdriven Guitar" },
//     30: { class: "Guitar", instrument: "Distortion Guitar" },
//     31: { class: "Guitar", instrument: "Guitar Harmonics" },
//     32: { class: "Bass", instrument: "Acoustic Bass" },
//     33: { class: "Bass", instrument: "Electric Bass (finger)" },
//     34: { class: "Bass", instrument: "Electric Bass (pick)" },
//     35: { class: "Bass", instrument: "Fretless Bass" },
//     36: { class: "Bass", instrument: "Slap Bass 1" },
//     37: { class: "Bass", instrument: "Slap Bass 2" },
//     38: { class: "Bass", instrument: "Synth Bass 1" },
//     39: { class: "Bass", instrument: "Synth Bass 2" },
//     40: { class: "Strings", instrument: "Violin" },
//     41: { class: "Strings", instrument: "Viola" },
//     42: { class: "Strings", instrument: "Cello" },
//     43: { class: "Strings", instrument: "Contrabass" },
//     44: { class: "Strings", instrument: "Tremolo Strings" },
//     45: { class: "Strings", instrument: "Pizzicato Strings" },
//     46: { class: "Strings", instrument: "Orchestral Harp" },
//     47: { class: "Strings", instrument: "Timpani" },
//     48: { class: "Ensemble", instrument: "String Ensemble 1" },
//     49: { class: "Ensemble", instrument: "String Ensemble 2" },
//     50: { class: "Ensemble", instrument: "Synth Strings 1" },
//     51: { class: "Ensemble", instrument: "Synth Strings 2" },
//     52: { class: "Ensemble", instrument: "Choir Aahs" },
//     53: { class: "Ensemble", instrument: "Voice Oohs" },
//     54: { class: "Ensemble", instrument: "Synth Voice" },
//     55: { class: "Ensemble", instrument: "Orchestra Hit" },
//     56: { class: "Brass", instrument: "Trumpet" },
//     57: { class: "Brass", instrument: "Trombone" },
//     58: { class: "Brass", instrument: "Tuba" },
//     59: { class: "Brass", instrument: "Muted Trumpet" },
//     60: { class: "Brass", instrument: "French Horn" },
//     61: { class: "Brass", instrument: "Brass Section" },
//     62: { class: "Brass", instrument: "Synth Brass 1" },
//     63: { class: "Brass", instrument: "Synth Brass 2" },
//     64: { class: "Reed", instrument: "Soprano Sax" },
//     65: { class: "Reed", instrument: "Alto Sax" },
//     66: { class: "Reed", instrument: "Tenor Sax" },
//     67: { class: "Reed", instrument: "Baritone Sax" },
//     68: { class: "Reed", instrument: "Oboe" },
//     69: { class: "Reed", instrument: "English Horn" },
//     70: { class: "Reed", instrument: "Bassoon" },
//     71: { class: "Reed", instrument: "Clarinet" },
//     72: { class: "Pipe", instrument: "Piccolo" },
//     73: { class: "Pipe", instrument: "Flute" },
//     74: { class: "Pipe", instrument: "Recorder" },
//     75: { class: "Pipe", instrument: "Pan Flute" },
//     76: { class: "Pipe", instrument: "Bottle Blow" },
//     77: { class: "Pipe", instrument: "Shakuhachi" },
//     78: { class: "Pipe", instrument: "Whistle" },
//     79: { class: "Pipe", instrument: "Ocarina" },
//     80: { class: "Synth Lead", instrument: "Lead 1 (square)" },
//     81: { class: "Synth Lead", instrument: "Lead 2 (sawtooth)" },
//     82: { class: "Synth Lead", instrument: "Lead 3 (calliope lead)" },
//     83: { class: "Synth Lead", instrument: "Lead 4 (chiffer lead)" },
//     84: { class: "Synth Lead", instrument: "Lead 5 (charang)" },
//     85: { class: "Synth Lead", instrument: "Lead 6 (voice)" },
//     86: { class: "Synth Lead", instrument: "Lead 7 (fifths)" },
//     87: { class: "Synth Lead", instrument: "Lead 8 (brass + lead)" },
//     88: { class: "Synth Pad", instrument: "Pad 1 (new age)" },
//     89: { class: "Synth Pad", instrument: "Pad 2 (warm)" },
//     90: { class: "Synth Pad", instrument: "Pad 3 (polysynth)" },
//     91: { class: "Synth Pad", instrument: "Pad 4 (choir)" },
//     92: { class: "Synth Pad", instrument: "Pad 5 (bowed)" },
//     93: { class: "Synth Pad", instrument: "Pad 6 (metallic)" },
//     94: { class: "Synth Pad", instrument: "Pad 7 (halo)" },
//     95: { class: "Synth Pad", instrument: "Pad 8 (sweep)" },
//     96: { class: "Synth Effects", instrument: "FX 1 (rain)" },
//     97: { class: "Synth Effects", instrument: "FX 2 (soundtrack)" },
//     98: { class: "Synth Effects", instrument: "FX 3 (crystal)" },
//     99: { class: "Synth Effects", instrument: "FX 4 (atmosphere)" },
//     100: { class: "Synth Effects", instrument: "FX 5 (brightness)" },
//     101: { class: "Synth Effects", instrument: "FX 6 (goblins)" },
//     102: { class: "Synth Effects", instrument: "FX 7 (echoes)" },
//     103: { class: "Synth Effects", instrument: "FX 8 (sci-fi)" },
//     104: { class: "Ethnic", instrument: "Sitar" },
//     105: { class: "Ethnic", instrument: "Banjo" },
//     106: { class: "Ethnic", instrument: "Shamisen" },
//     107: { class: "Ethnic", instrument: "Koto" },
//     108: { class: "Ethnic", instrument: "Kalimba" },
//     109: { class: "Ethnic", instrument: "Bagpipe" },
//     110: { class: "Ethnic", instrument: "Fiddle" },
//     111: { class: "Ethnic", instrument: "Shana" },
//     112: { class: "Percussive", instrument: "Tinkle Bell" },
//     113: { class: "Percussive", instrument: "Agogo" },
//     114: { class: "Percussive", instrument: "Steel Drums" },
//     115: { class: "Percussive", instrument: "Woodblock" },
//     116: { class: "Percussive", instrument: "Taiko Drum" },
//     117: { class: "Percussive", instrument: "Melodic Tom" },
//     118: { class: "Percussive", instrument: "Synth Drum" },
//     119: { class: "Percussive", instrument: "Reverse Cymbal" },
//     120: { class: "Sound Effects", instrument: "Guitar Fret Noise" },
//     121: { class: "Sound Effects", instrument: "Breath Noise" },
//     122: { class: "Sound Effects", instrument: "Seashore" },
//     123: { class: "Sound Effects", instrument: "Bird Tweet" },
//     124: { class: "Sound Effects", instrument: "Telephone Ring" },
//     125: { class: "Sound Effects", instrument: "Helicopter" },
//     126: { class: "Sound Effects", instrument: "Applause" },
//     127: { class: "Sound Effects", instrument: "Gunshot"}
// };

// midi instrument names
export const midiInstruments: Array<MidiInstrument> = [
    { id: 0, class: "Piano", instrument: "Acoustic Grand Piano" },
    { id: 1, class: "Piano", instrument: "Bright Acoustic Piano" },
    { id: 2, class: "Piano", instrument: "Electric Grand Piano" },
    { id: 3, class: "Piano", instrument: "Honky-tonk Piano" },
    { id: 4, class: "Piano", instrument: "Rhodes Piano" },
    { id: 5, class: "Piano", instrument: "Chorused Piano" },
    { id: 6, class: "Piano", instrument: "Harpsichord" },
    { id: 7, class: "Piano", instrument: "Clavinet" },
    { id: 8, class: "Chromatic Percussion", instrument: "Celesta" },
    { id: 9, class: "Chromatic Percussion", instrument: "Glockenspiel" },
    { id: 10, class: "Chromatic Percussion", instrument: "Music box" },
    { id: 11, class: "Chromatic Percussion", instrument: "Vibraphone" },
    { id: 12, class: "Chromatic Percussion", instrument: "Marimba" },
    { id: 13, class: "Chromatic Percussion", instrument: "Xylophone" },
    { id: 14, class: "Chromatic Percussion", instrument: "Tubular Bells" },
    { id: 15, class: "Chromatic Percussion", instrument: "Dulcimer" },
    { id: 16, class: "Organ", instrument: "Hammond Organ" },
    { id: 17, class: "Organ", instrument: "Percussive Organ" },
    { id: 18, class: "Organ", instrument: "Rock Organ" },
    { id: 19, class: "Organ", instrument: "Church Organ" },
    { id: 20, class: "Organ", instrument: "Reed Organ" },
    { id: 21, class: "Organ", instrument: "Accordion" },
    { id: 22, class: "Organ", instrument: "Harmonica" },
    { id: 23, class: "Organ", instrument: "Tango Accordion" },
    { id: 24, class: "Guitar", instrument: "Acoustic Guitar (nylon)" },
    { id: 25, class: "Guitar", instrument: "Acoustic Guitar (steel)" },
    { id: 26, class: "Guitar", instrument: "Electric Guitar (jazz)" },
    { id: 27, class: "Guitar", instrument: "Electric Guitar (clean)" },
    { id: 28, class: "Guitar", instrument: "Electric Guitar (muted)" },
    { id: 29, class: "Guitar", instrument: "Overdriven Guitar" },
    { id: 30, class: "Guitar", instrument: "Distortion Guitar" },
    { id: 31, class: "Guitar", instrument: "Guitar Harmonics" },
    { id: 32, class: "Bass", instrument: "Acoustic Bass" },
    { id: 33, class: "Bass", instrument: "Electric Bass (finger)" },
    { id: 34, class: "Bass", instrument: "Electric Bass (pick)" },
    { id: 35, class: "Bass", instrument: "Fretless Bass" },
    { id: 36, class: "Bass", instrument: "Slap Bass 1" },
    { id: 37, class: "Bass", instrument: "Slap Bass 2" },
    { id: 38, class: "Bass", instrument: "Synth Bass 1" },
    { id: 39, class: "Bass", instrument: "Synth Bass 2" },
    { id: 40, class: "Strings", instrument: "Violin" },
    { id: 41, class: "Strings", instrument: "Viola" },
    { id: 42, class: "Strings", instrument: "Cello" },
    { id: 43, class: "Strings", instrument: "Contrabass" },
    { id: 44, class: "Strings", instrument: "Tremolo Strings" },
    { id: 45, class: "Strings", instrument: "Pizzicato Strings" },
    { id: 46, class: "Strings", instrument: "Orchestral Harp" },
    { id: 47, class: "Strings", instrument: "Timpani" },
    { id: 48, class: "Ensemble", instrument: "String Ensemble 1" },
    { id: 49, class: "Ensemble", instrument: "String Ensemble 2" },
    { id: 50, class: "Ensemble", instrument: "Synth Strings 1" },
    { id: 51, class: "Ensemble", instrument: "Synth Strings 2" },
    { id: 52, class: "Ensemble", instrument: "Choir Aahs" },
    { id: 53, class: "Ensemble", instrument: "Voice Oohs" },
    { id: 54, class: "Ensemble", instrument: "Synth Voice" },
    { id: 55, class: "Ensemble", instrument: "Orchestra Hit" },
    { id: 56, class: "Brass", instrument: "Trumpet" },
    { id: 57, class: "Brass", instrument: "Trombone" },
    { id: 58, class: "Brass", instrument: "Tuba" },
    { id: 59, class: "Brass", instrument: "Muted Trumpet" },
    { id: 60, class: "Brass", instrument: "French Horn" },
    { id: 61, class: "Brass", instrument: "Brass Section" },
    { id: 62, class: "Brass", instrument: "Synth Brass 1" },
    { id: 63, class: "Brass", instrument: "Synth Brass 2" },
    { id: 64, class: "Reed", instrument: "Soprano Sax" },
    { id: 65, class: "Reed", instrument: "Alto Sax" },
    { id: 66, class: "Reed", instrument: "Tenor Sax" },
    { id: 67, class: "Reed", instrument: "Baritone Sax" },
    { id: 68, class: "Reed", instrument: "Oboe" },
    { id: 69, class: "Reed", instrument: "English Horn" },
    { id: 70, class: "Reed", instrument: "Bassoon" },
    { id: 71, class: "Reed", instrument: "Clarinet" },
    { id: 72, class: "Pipe", instrument: "Piccolo" },
    { id: 73, class: "Pipe", instrument: "Flute" },
    { id: 74, class: "Pipe", instrument: "Recorder" },
    { id: 75, class: "Pipe", instrument: "Pan Flute" },
    { id: 76, class: "Pipe", instrument: "Bottle Blow" },
    { id: 77, class: "Pipe", instrument: "Shakuhachi" },
    { id: 78, class: "Pipe", instrument: "Whistle" },
    { id: 79, class: "Pipe", instrument: "Ocarina" },
    { id: 80, class: "Synth Lead", instrument: "Lead 1 (square)" },
    { id: 81, class: "Synth Lead", instrument: "Lead 2 (sawtooth)" },
    { id: 82, class: "Synth Lead", instrument: "Lead 3 (calliope lead)" },
    { id: 83, class: "Synth Lead", instrument: "Lead 4 (chiffer lead)" },
    { id: 84, class: "Synth Lead", instrument: "Lead 5 (charang)" },
    { id: 85, class: "Synth Lead", instrument: "Lead 6 (voice)" },
    { id: 86, class: "Synth Lead", instrument: "Lead 7 (fifths)" },
    { id: 87, class: "Synth Lead", instrument: "Lead 8 (brass + lead)" },
    { id: 88, class: "Synth Pad", instrument: "Pad 1 (new age)" },
    { id: 89, class: "Synth Pad", instrument: "Pad 2 (warm)" },
    { id: 90, class: "Synth Pad", instrument: "Pad 3 (polysynth)" },
    { id: 91, class: "Synth Pad", instrument: "Pad 4 (choir)" },
    { id: 92, class: "Synth Pad", instrument: "Pad 5 (bowed)" },
    { id: 93, class: "Synth Pad", instrument: "Pad 6 (metallic)" },
    { id: 94, class: "Synth Pad", instrument: "Pad 7 (halo)" },
    { id: 95, class: "Synth Pad", instrument: "Pad 8 (sweep)" },
    { id: 96, class: "Synth Effects", instrument: "FX 1 (rain)" },
    { id: 97, class: "Synth Effects", instrument: "FX 2 (soundtrack)" },
    { id: 98, class: "Synth Effects", instrument: "FX 3 (crystal)" },
    { id: 99, class: "Synth Effects", instrument: "FX 4 (atmosphere)" },
    { id: 100, class: "Synth Effects", instrument: "FX 5 (brightness)" },
    { id: 101, class: "Synth Effects", instrument: "FX 6 (goblins)" },
    { id: 102, class: "Synth Effects", instrument: "FX 7 (echoes)" },
    { id: 103, class: "Synth Effects", instrument: "FX 8 (sci-fi)" },
    { id: 104, class: "Ethnic", instrument: "Sitar" },
    { id: 105, class: "Ethnic", instrument: "Banjo" },
    { id: 106, class: "Ethnic", instrument: "Shamisen" },
    { id: 107, class: "Ethnic", instrument: "Koto" },
    { id: 108, class: "Ethnic", instrument: "Kalimba" },
    { id: 109, class: "Ethnic", instrument: "Bagpipe" },
    { id: 110, class: "Ethnic", instrument: "Fiddle" },
    { id: 111, class: "Ethnic", instrument: "Shana" },
    { id: 112, class: "Percussive", instrument: "Tinkle Bell" },
    { id: 113, class: "Percussive", instrument: "Agogo" },
    { id: 114, class: "Percussive", instrument: "Steel Drums" },
    { id: 115, class: "Percussive", instrument: "Woodblock" },
    { id: 116, class: "Percussive", instrument: "Taiko Drum" },
    { id: 117, class: "Percussive", instrument: "Melodic Tom" },
    { id: 118, class: "Percussive", instrument: "Synth Drum" },
    { id: 119, class: "Percussive", instrument: "Reverse Cymbal" },
    { id: 120, class: "Sound Effects", instrument: "Guitar Fret Noise" },
    { id: 121, class: "Sound Effects", instrument: "Breath Noise" },
    { id: 122, class: "Sound Effects", instrument: "Seashore" },
    { id: 123, class: "Sound Effects", instrument: "Bird Tweet" },
    { id: 124, class: "Sound Effects", instrument: "Telephone Ring" },
    { id: 125, class: "Sound Effects", instrument: "Helicopter" },
    { id: 126, class: "Sound Effects", instrument: "Applause" },
    { id: 127, class: "Sound Effects", instrument: "Gunshot"}
];