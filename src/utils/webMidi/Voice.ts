import { Oscillators, MidiArray } from "../../models";


// interface ActiveVoices {
//     [midiNote: string]: Voice
// }

// specify class Voice
class Voice {

    private context: AudioContext;
    private oscillators: Oscillators;
    private amplifier: GainNode;

    // private activeVoices: ActiveVoices;
    
    private volume: number;
    private type: OscillatorType;
    private eps: number;
    private timeConstant: number;

    constructor(context: AudioContext) {
        this.context = context;
        this.oscillators = {};
        // this.synthesizers = {};
        
        this.amplifier = context.createGain();
        
        // this.activeVoices = {};
        
        this.volume = 100;
        this.type = "sine";
        this.eps = 0.001;
        this.timeConstant = 0.001;
    };

    // convert volume to gain value
    volumeToGain(volume: number) {
        const gainValue = (volume / 100) ** 2;
        // const gainValue = volume / 100;
        return gainValue;
    }

    // translate midi note to frequency
    midiNoteToFrequency(midiNote: number) {
        let frequency: number;
        if (midiNote >= 0 && midiNote < 128) {
            frequency = (2 ** ((midiNote - 69) / 12)) * 440;
        } else {
            frequency = 0;
        }
        return frequency;
    }

    adjustVolume(volume: number) {
        const gainValue = this.volumeToGain(volume);
        this.amplifier.gain.setTargetAtTime(gainValue, 0, 0.001);
    }

    // start a voice with vco & vca
    start(midiNote: number = -1, gainValue: number = this.volumeToGain(this.volume), startTime: number = 0, type: OscillatorType = this.type) {
        // initialize vco & vca
        console.log(`starting a voice at midiNote ${midiNote}...`);
        let vco: OscillatorNode = this.context.createOscillator();
        
        // specify attributes of vco and vca
        vco.type = type;
        vco.frequency.value = this.midiNoteToFrequency(midiNote);
        
        let vca: GainNode;
        if (this.context) {
            vca = this.context.createGain();
            vca.gain.value = gainValue;
            this.oscillators[midiNote] = vco;
            this.amplifier = vca;
            vco.connect(vca);
            vca.connect(this.context.destination);
            vco.start(startTime);
        }
    }

    // stop a voice
    stop(time = 0) {
        // console.log("stopping all synthesizers...");
        // const midiNotes = Object.keys(this.synthesizers);
        // console.log(this.synthesizers);
        console.log("stopping all oscillators...");
        const midiNotes: Array<string> = Object.keys(this.oscillators);
        // console.log(this.oscillators);
        for (let midiNote of midiNotes) {
            // this.synthesizers[midiNote].oscillator.stop(time);
            this.oscillators[midiNote].stop(time);
        }
        // // console.log("this.synthesizers = ", this.synthesizers);
        // console.log("this.oscillators = ", this.oscillators);
    }

    // play midi note
    playNote(midiNote: number, duration: number, startTime: number = 0, volume: number = this.volume, type: OscillatorType = this.type) {
        let time: number = startTime + duration;
        const gainValue = this.volumeToGain(volume);
        this.start(midiNote, gainValue, startTime, type);
        // this.activeVoices[midiNote] = this;
        this.stop(time);
    }

    // play a midi chord
    playChord(midiNotes: Array<number>, duration: number, startTime: number = 0, volume: number = this.volume, type: OscillatorType = this.type) {
        let time: number = startTime + duration;
        // console.log({ time, startTime, duration });
        if (midiNotes.length > 0) {
            const gainValue = this.volumeToGain(volume);
            const gain: number = gainValue / midiNotes.length;
            for (let midiNote of midiNotes) {
                this.start(midiNote, gain, startTime, type);
                this.amplifier.gain.setTargetAtTime(0, time - this.eps, this.timeConstant);
                this.stop(time);
            }
        }
        //  else {
        //     // this.amplifier.gain.setTargetAtTime(0, startTime, time);

        //     // this.start(-1, 0, startTime, type);
        //     // this.stop(time);
        // }
    }

    // play monophonic midi array
    playMonophone(midiArray: MidiArray, volume: number = this.volume, type: OscillatorType = this.type, length: number, eps: number = this.eps, timeConstant: number = this.timeConstant) {
        // console.log({ midiArray });
        if (midiArray.length > 0) {
            // this.activeVoices["-1"] = this;
            const gainValue = this.volumeToGain(volume);
            this.start(-1, gainValue, 0, type);
            let time: number = this.context.currentTime + eps;
            // console.log(`this.context.currentTime = ${this.context.currentTime}`);
            midiArray.forEach(midiItem => {
                const [midiNote, noteFraction] = midiItem;
                const freq: number = this.midiNoteToFrequency(midiNote as number);
                console.log({ midiNote, freq, noteFraction, time, eps });
                // this.synthesizers["-1"].oscillator.frequency.setTargetAtTime(0, time - eps, timeConstant);
                // this.synthesizers["-1"].oscillator.frequency.setTargetAtTime(freq, time, timeConstant);
                this.oscillators["-1"].frequency.setTargetAtTime(0, time - eps, timeConstant);
                this.oscillators["-1"].frequency.setTargetAtTime(freq, time, timeConstant);
                time += length / noteFraction;
            });
            this.stop(time);
            // setTimeout(() => {
            //     delete this.activeVoices["-1"];
            // }, time * 1000);
        }
    }

    // play polyphonic midi array
    playPolyphone(midiArray: MidiArray, volume: number = this.volume, type: OscillatorType = this.type, length: number) {
        // console.log({ midiArray });
        if (midiArray.length > 0) {
            // this.activeVoices["-1"] = this;
            let time: number = this.context.currentTime;
            let duration: number;
            // console.log(`this.context.currentTime = ${this.context.currentTime}`);
            midiArray.forEach(midiItem => {
                const [midiNotes, noteFraction] = midiItem;
                duration = length / noteFraction;
                this.playChord(midiNotes as Array<number>, duration, time, volume, type);
                time += duration;
                setTimeout(() => {
                    // delete this.synthesizers[midiNotes];
                    for (let midiNote of midiNotes as Array<number>) {
                        delete this.oscillators[midiNote];
                    }
                }, time * 1000);
            });
            // setTimeout(() => {
            //     delete this.activeVoices["-1"];
            // }, time * 1000);
        }
    }

}

export default Voice;