// import * as mm from "@magenta/music";
// import { MusicRNN, data, tf, sequences } from '@magenta/music'÷\
// let rnn:mm.MusicRNN = new mm.MusicRNN(
//     'https://storage.googleapis.com/download.magenta.tensorflow.org/tfjs_checkpoints/music_rnn/chord_pitches_improv'
//   );

//   let seedSeq = {
//     totalQuantizedSteps: 3,
//     quantizationInfo: { stepsPerQuarter: 1 },
//     notes: [
//       { pitch: 67, quantizedStartStep: 0, quantizedEndStep: 1},
//       { pitch: 71, quantizedStartStep: 1, quantizedEndStep: 2},
//       { pitch: 64, quantizedStartStep: 2, quantizedEndStep: 3},
//     ]
//   };
// import * as mm from '/Users/SamWong/codes/music-platform/music/node_modules/@magenta/music/es5/index';
// import * as Note from "tonal-note";
import { midiListItem } from "../../models";
import { sequences } from "../../../node_modules/@magenta/music/node/core"
import { tensorflow } from "../../../node_modules/@magenta/music/node/protobuf/proto";
// import INoteSequence = tensorflow.magenta.INoteSequence;
// import INote = tensorflow.magenta.NoteSequence.INote;
// import { INoteSequence,INote } from '/Users/SamWong/codes/music-platform/music/node_modules/@magenta/music/node/protobuf/index';
const model = require('@magenta/music/node/music_rnn');
const rnn = new model.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn');
rnn.initialize();
let Tone = require("tone");
// const inputNote: tensorflow.magenta.INoteSequence = {
//   notes: [
//     { pitch: 69, quantizedStartStep: 0, quantizedEndStep: 1, program: 0 },
//     { pitch: 71, quantizedStartStep: 1, quantizedEndStep: 2, program: 0 },
//     { pitch: 73, quantizedStartStep: 2, quantizedEndStep: 3, program: 0 },
//     { pitch: 74, quantizedStartStep: 3, quantizedEndStep: 4, program: 0 },
//     { pitch: 76, quantizedStartStep: 4, quantizedEndStep: 5, program: 0 },
//     { pitch: 81, quantizedStartStep: 6, quantizedEndStep: 8, program: 0 },
//     { pitch: 78, quantizedStartStep: 8, quantizedEndStep: 10, program: 0 },
//     { pitch: 81, quantizedStartStep: 10, quantizedEndStep: 12, program: 0 },
//     { pitch: 76, quantizedStartStep: 12, quantizedEndStep: 16, program: 0 }
//   ],
//   quantizationInfo: { stepsPerQuarter: 4 },
//   totalQuantizedSteps: 16,
// };

// interface INote{
//   pitch:string,
//   startTime:number,
//   endTime:number
// }

let synth = new Tone.Synth().toMaster();
// let synth1 = new Tone.Synth().toMaster();

export async function startMagenta(midiList: midiListItem[]) {
  const reference: number = midiList[0].timestamp;
  const newMidiList: midiListItem[] = midiList.slice();
  for (let midi of newMidiList) {
    midi.timestamp -= reference;
  }
  newMidiList.sort(function (a: midiListItem, b: midiListItem) {
    return a.midiData[1] - b.midiData[1];
  })
  let notes: tensorflow.magenta.NoteSequence.INote[] = []
  for (let i = 1; i <= newMidiList.length-1; i += 2) {
    let pitch: number = newMidiList[i].midiData[1];
    let startTime: number = newMidiList[i - 1].timestamp / 1000;
    let endTime: number = newMidiList[i].timestamp / 1000;
    notes.push({ pitch, startTime, endTime })
  }
  notes.sort(function (a: tensorflow.magenta.NoteSequence.INote, b: tensorflow.magenta.NoteSequence.INote) {
    if (a.startTime && b.startTime) {
      return a.startTime - b.startTime;
    }
    return 0;
  })
  const end:number|null|undefined = notes[notes.length-1].endTime
  const sequence: tensorflow.magenta.INoteSequence = {
    ticksPerQuarter: 220,
    totalTime: end,
    timeSignatures: [
      {
        time: 0,
        numerator: 4,
        denominator: 4
      }
    ],
    tempos: [
      {
        time: 0,
        qpm: 120
      }
    ],
    quantizationInfo: { stepsPerQuarter: 4 },
    totalQuantizedSteps: 16,
    notes: notes.slice(Math.max(notes.length - 20, 1))
  }
  // const sequence1 = {
  //   ticksPerQuarter: 220,
  //   totalTime: 8.5,
  //   timeSignatures: [
  //     {
  //       time: 0,
  //       numerator: 4,
  //       denominator: 4
  //     }
  //   ],
  //   tempos: [
  //     {
  //       time: 0,
  //       qpm: 120
  //     }
  //   ],
  //   notes: [
  //     { pitch: 69, startTime: 0, endTime: 1 },
  //     { pitch: 71, startTime: 1, endTime: 3.5 },
  //     { pitch: 73, startTime: 3.5, endTime: 4 },
  //     { pitch: 73, startTime: 4, endTime: 4.5 },
  //     { pitch: 76, startTime: 4.5, endTime: 5 },
  //     { pitch: 81, startTime: 5, endTime: 6 },
  //     { pitch: 78, startTime: 6, endTime: 7 },
  //     { pitch: 81, startTime: 7, endTime: 8 },
  //     { pitch: 76, startTime: 8, endTime: 8.5 },
  //   ]
  // }
  
  // const quantizedSequence1 = sequences.quantizeNoteSequence(sequence1, 1)
  const quantizedSequence = sequences.quantizeNoteSequence(sequence, 1)
  console.log({ notes });
  console.log(sequence);
  console.log(quantizedSequence);
  // console.log(quantizedSequence1);
  const continuation = await rnn.continueSequence(quantizedSequence, 10, 1.2);
  // console.log(continuation);
  // for (let note of continuation.notes) {
  //   synth.triggerAttackRelease(Note.fromMidi(note.pitch), note.quantizedEndStep - note.quantizedStartStep, note.quantizedStartStep)
  // }
  return continuation;
}

// export async function startMagenta() {
//   const continuation = await rnn.continueSequence(inputNote, 20, 0.8);
//   // synth.triggerAttackRelease('C4', 0.5, 0)
//   // synth.triggerAttackRelease('E4', 0.5, 1)
//   // synth.triggerAttackRelease('G4', 0.5, 2)
//   // synth.triggerAttackRelease('B4', 0.5, 3)
//   // for (let note of inputNote.notes){
//   //     console.log('hi')
//   //     synth.triggerAttackRelease(Note.fromMidi(note.pitch), note.quantizedEndStep - note.quantizedStartStep, note.quantizedStartStep)
//   //   }
//   // synth.dispose();
//   // synth.dispose();
//   // const globalAny: any = global;
//   // globalAny.performance = Date;
//   // globalAny.fetch = require('node-fetch');
//   // console.log(model);
//   // console.log(core);
//   // console.log(player);
//   // console.log(rnn);
//   console.log(continuation.notes);
//   console.log(Note);
//   // console.log(Tone);
//   console.log(synth);
//   // for (let note of inputNote.notes){
//   //   console.log('hi')
//   //   synth.triggerAttackRelease(Note.fromMidi(note.pitch), note.quantizedEndStep - note.quantizedStartStep, note.quantizedStartStep)
//   // }
//   // playMusic(continuation.notes,synth);
// }
// export async function startMagenta1() {
//   synth = new Tone.Synth().toMaster();
//   // const continuation = await rnn.continueSequence(inputNote, 20, 0.8);
//   // synth.triggerAttackRelease('C4', 0.5, 0)
//   // synth.triggerAttackRelease('E4', 0.5, 1)
//   // synth.triggerAttackRelease('G4', 0.5, 2)
//   // synth.triggerAttackRelease('B4', 0.5, 3)
//   // for (let note of inputNote.notes){
//   //     console.log('hi')
//   //     synth.triggerAttackRelease(Note.fromMidi(note.pitch), note.quantizedEndStep - note.quantizedStartStep, note.quantizedStartStep)
//   //   }
//   // const globalAny: any = global;
//   // globalAny.performance = Date;
//   // globalAny.fetch = require('node-fetch');
//   // console.log(model);
//   // console.log(core);
//   // console.log(player);
//   // console.log(rnn);
//   // console.log(continuation.notes);
//   // console.log(Tone);
//   // console.log(synth);
//   // for (let note of inputNote.notes){
//   //   console.log('hi')
//   //   synth.triggerAttackRelease(Note.fromMidi(note.pitch), note.quantizedEndStep - note.quantizedStartStep, note.quantizedStartStep)
//   // }
//   // for (let note of inputNote1.notes) {
//   //   synth1.triggerAttackRelease(Note.fromMidi(note.pitch), note.quantizedEndStep - note.quantizedStartStep, note.quantizedStartStep)
//   //   console.log(Note.fromMidi(note.pitch));
//   // }
//   // playMusic(continuation.notes,synth);
// }

export function dispose() {
  synth.disconnect();
}
// function playMusic(musicNotes: any, synth: any) {
//   for (let note of musicNotes) {
//     synth.triggerAttackRelease(Note.fromMidi(note.pitch), note.quantizedEndStep - note.quantizedStartStep, note.quantizedStartStep)
//     console.log(Note.fromMidi(note.pitch));
//   }
// }

// startProgram();
// const core = require('@magenta/music/node/core');

// These hacks below are needed because the library uses performance and fetch which
// exist in browsers but not in node. We are working on simplifying this!
// Your code:
// const player = new core.Player();


