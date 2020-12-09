
import React from "react";
import Voice from "../../../../utils/webMidi/Voice";
// import { Button } from "reactstrap";
// import { FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight } from "react-icons/fa";
import { IRootState, ThunkDispatch } from "../../../../store";
import { connect } from "react-redux";
import { addNoteToMidiList, addToActiveVoices, removeFromActiveVoices } from "../../../../redux/bandRoom/actions";
// import { addNoteToMidiList, saveContext, addToActiveVoices } from "../../../redux/bandRoom/actions";
// import { smoothScroll } from "../../../utils/domControl/domControl";
import { emulatedKeys, emulatedDrums } from "../../../../utils/webMidi/midi";
// import {startMagenta} from "../../../utils/magenta/magenta"
import { ActiveVoices, EmulatedKeys, EmulatedDrums, Band, Player, MidiData, Instrument } from '../../../../models';
import clap from '../../../../resources/clap.wav'
import boom from '../../../../resources/boom.wav'
import hihat from '../../../../resources/hihat.wav'
import kick from '../../../../resources/kick.wav'
import openhat from '../../../../resources/openhat.wav'
import ride from '../../../../resources/ride.wav'
import snare from '../../../../resources/snare.wav'
import tink from '../../../../resources/tink.wav'
import tom from '../../../../resources/tom.wav'
import "./DrumsKit.css";


export const soundUrl: Object = {
    71: boom,
    65: clap,
    83: hihat,
    68: kick,
    70: openhat,
    72: ride,
    74: snare,
    76: tink,
    75: tom
}

interface IDrumsProps {
    volume: number,
    isolated: boolean,
    context: AudioContext | null,
    activeVoices: ActiveVoices,
    band: Band,
    player: Player,
    socket: SocketIOClient.Socket | null,
    instruments: Array<Instrument>,
    activeInstrument: Instrument,
    addToActiveVoices: (midiNote: number, voice: Voice) => void,
    removeFromActiveVoices: (midiNote: number) => void,
    addNoteToMidiList: (command: number, midiNote: number, velocity: number) => void
}

interface IDrumsStates {
    scrollLeft: number,
    emulatedKeys: EmulatedKeys,
    emulatedDrums: EmulatedDrums
    accessibleOctave: number
}

class DrumsKit extends React.Component<IDrumsProps, IDrumsStates> {

    soundUrl:Object = soundUrl

    constructor(props: IDrumsProps) {
        super(props);
        this.state = {
            scrollLeft: 0,
            emulatedKeys,
            emulatedDrums,
            accessibleOctave: 4
        };
    }

    private drumsOn = (drumKey: Element, midiNote: number, velocity: number) => {
        console.log(drumKey)
        console.log('HIHIHIHIHIHIHIHIHI')
        if (!drumKey.classList.contains('playing')) {
            drumKey.classList.add('playing');
            const command = 144;
            this.props.addNoteToMidiList(command, midiNote, velocity);
            const audio = new Audio((this.soundUrl as any)[midiNote as number]);
            audio.currentTime = 0;
            audio.play();
            const midiData: MidiData = [command, midiNote, velocity]
            this.props.socket!.emit('midi-signal', this.props.band.id!, this.props.player.id, midiData, this.props.activeInstrument.is_percussion);
        }
    }

    private drumsOff = (drumKey: Element, midiNote: number) => {
        if (drumKey.classList.contains('playing')) {
            drumKey.classList.remove('playing');
            // this.props.addNoteToMidiList(128, midiNote, 0);
        }
    }

    private drumsHit = (midiNote: number, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        // console.log({ midiNote, event });
        const drumKey = event.currentTarget;
        // // if (event.buttons && !event.currentTarget.classList.contains('active')) {
        // if (event.buttons && !key.classList.contains('active')) {
        if (event.buttons) {
            //     // // event.currentTarget.classList.add('active');
            //     // key.classList.add('active');
            // this.props.addNoteToMidiList(144, midiNote, 127);
            this.drumsOn(drumKey, midiNote, 127);
            //     // const voice = noteOn(this.props.context!, midiNote, this.props.volume, "sine");
            //     // this.props.addToActiveVoices(midiNote, voice);
        }
    }

    private drumsReleased = (midiNote: number, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        // console.log({ midiNote, event });
        const drumKey = event.currentTarget;
        // // if (event.currentTarget.classList.contains('active')) {
        // if (key.classList.contains('active')) {
        //     // // event.currentTarget.classList.remove('active');
        //     // key.classList.remove('active');
        // this.props.addNoteToMidiList(128, midiNote, 0);
        this.drumsOff(drumKey, midiNote);
        //     // this.props.activeVoices[midiNote].stop(0);
        //     // // noteOff(midiNote);
        // }
    }

    private onKeyboardKeyDownDrums = (event: KeyboardEvent) => {
        // console.log({event});
        const activeElement = document.activeElement;
        
        // console.log({ activeElement });
        if (activeElement && (
            activeElement.classList.contains('track-name') || 
            activeElement.classList.contains('midi-name') || 
            activeElement.classList.contains('chatInput') || 
            activeElement.classList.contains('instrument-class') || 
            activeElement.classList.contains('instrument-option'))) {
            // console.log((activeElement as HTMLInputElement).value);
        } else {
            if (event.key in this.state.emulatedDrums && !(event.ctrlKey)) {
                // emulated keys
                const midiNote = this.state.emulatedDrums[event.key];
                const keyId = `drums-midiNote-${midiNote}`;
                const drumKey = document.querySelector(`#${keyId}`);
                // this.props.addNoteToMidiList(114, midiNote, 127);
                this.drumsOn(drumKey!, midiNote, 127);
            }
        }
        
    }

    private onKeyboardKeyUpDrums = (event: KeyboardEvent) => {
        // console.log({event});
        const activeElement = document.activeElement;
        // console.log({ activeElement });
        if (activeElement && (
            activeElement.classList.contains('track-name') || 
            activeElement.classList.contains('midi-name') || 
            activeElement.classList.contains('chatInput') || 
            activeElement.classList.contains('instrument-class') || 
            activeElement.classList.contains('instrument-option'))) {
            // console.log((activeElement as HTMLInputElement).value);
        } else {
            if (event.key in this.state.emulatedDrums) {
                // emulated keys
                const midiNote = this.state.emulatedDrums[event.key];
                const keyId = `drums-midiNote-${midiNote}`;
                const drumKey = document.querySelector(`#${keyId}`);
                // this.props.addNoteToMidiList(128, midiNote, 0);
                this.drumsOff(drumKey!, midiNote);
            }
        }
    }

    public componentDidUpdate(prevProps: IDrumsProps) {
        if (prevProps.activeInstrument.id !== this.props.activeInstrument.id) {
            if (this.props.activeInstrument.name === "drumsKit") {
                // addd keydown and keyup listener
                document.addEventListener("keydown", this.onKeyboardKeyDownDrums);
                document.addEventListener("keyup", this.onKeyboardKeyUpDrums);
            } else {
                // remove keydown and keyup listener
                document.removeEventListener("keydown", this.onKeyboardKeyDownDrums);
                document.removeEventListener("keyup", this.onKeyboardKeyUpDrums);
            }
        }
    }

    public async componentDidMount() {

        if (this.props.activeInstrument.name === "drumsKit") {
            // addd keydown and keyup listener
            document.addEventListener("keydown", this.onKeyboardKeyDownDrums);
            document.addEventListener("keyup", this.onKeyboardKeyUpDrums);
        }

        // // get drumsKitId
        // const drumsKit = this.props.instruments.find(instrument => instrument.name === "drumsKit");
        // if (drumsKit) {
        //     this.drumsKitId = drumsKit.id!;
        // }
        
        // attempt to use the socket every 0.5 second
        const intervalId = setInterval(() => {
            if (this.props.socket) {
                
                // socket listens to midi-signal
                this.props.socket.on('midi-signal', (player_id: number, midiData: MidiData, is_percussion: boolean) => {
                    if (!this.props.isolated) {
                        // isolated mode off
                        if (this.props.player.id !== player_id) {
                            // midi-signal from other players
                            if (is_percussion) {
                                // percussive instruments
                                const [command, midiNote, velocity] = midiData;
                                switch (command) {
                                    case 144: // noteOn
                                        if (velocity > 0) {
                                            const audio = new Audio((this.soundUrl as any)[midiNote as number]);
                                            audio.currentTime = 0;
                                            audio.play();
                                        } else {
                                            console.log(`non-positive velocity: ${velocity}`);
                                        }
                                        break;
                                    case 128: // noteOff
                                        console.log(`noteOff signal received: ${midiData}`);
                                        break;
                                    default:
                                        console.log(`Something went terribly wrong! \nCommand value is neither 144 nor 128: ${command}`);
                                }
                            } else {
                                // non-percussive instruments
                                console.log(`non-percussive midi signal received: ${midiData}`);
                            }
                        } else {
                            // midi-signal from current player
                            console.log("midi-signal is echoed!");
                        }
                    } else {
                        // isolated mode on
                        console.log("midi-signal is received and filted!");
                    }
                });

                clearInterval(intervalId);

            } else {
                console.log("Waiting for the socket to connect...");
            }
        }, 500);
        
    }

    public componentWillUnmount() {
        // remove keydown and keyup listener
        document.removeEventListener("keydown", this.onKeyboardKeyDownDrums);
        document.removeEventListener("keyup", this.onKeyboardKeyUpDrums);
    }

    render() {

        return (
            <div className="drumskits">
                
                <div className="drums-kit-title">Drums</div>

                <div className="drums-kit-container">
               
                    <div className="kitRow">
                        <div data-key={65} id="drums-midiNote-65" className="key midiNote-65 no-select" onMouseDown={this.drumsHit.bind(this, 65)}
                            onMouseOver={this.drumsHit.bind(this, 65)}
                            onMouseUp={this.drumsReleased.bind(this, 65)}
                            onMouseLeave={this.drumsReleased.bind(this, 65)}>
                            <kbd>A</kbd>
                            <span className="sound">clap</span>
                        </div>
                        <div data-key={83} id="drums-midiNote-83" className="key midiNote-83 no-select" onMouseDown={this.drumsHit.bind(this, 83)}
                            onMouseOver={this.drumsHit.bind(this, 83)}
                            onMouseUp={this.drumsReleased.bind(this, 83)}
                            onMouseLeave={this.drumsReleased.bind(this, 83)}>
                            <kbd>S</kbd>
                            <span className="sound">hihat</span>
                        </div>
                        <div data-key={68} id="drums-midiNote-68" className="key midiNote-68 no-select" onMouseDown={this.drumsHit.bind(this, 68)}
                            onMouseOver={this.drumsHit.bind(this, 68)}
                            onMouseUp={this.drumsReleased.bind(this, 68)}
                            onMouseLeave={this.drumsReleased.bind(this, 68)}>
                            <kbd>D</kbd>
                            <span className="sound">kick</span>
                        </div>
                        <div data-key={70} id="drums-midiNote-70" className="key midiNote-70 no-select" onMouseDown={this.drumsHit.bind(this, 70)}
                            onMouseOver={this.drumsHit.bind(this, 70)}
                            onMouseUp={this.drumsReleased.bind(this, 70)}
                            onMouseLeave={this.drumsReleased.bind(this, 70)}>
                            <kbd>F</kbd>
                            <span className="sound">openhat</span>
                        </div>
                        <div data-key={71} id="drums-midiNote-71" className="key midiNote-71 no-select" onMouseDown={this.drumsHit.bind(this, 71)}
                            onMouseOver={this.drumsHit.bind(this, 71)}
                            onMouseUp={this.drumsReleased.bind(this, 71)}
                            onMouseLeave={this.drumsReleased.bind(this, 71)}>
                            <kbd>G</kbd>
                            <span className="sound">boom</span>
                        </div>
                        <div data-key={72} id="drums-midiNote-72" className="key midiNote-72 no-select" onMouseDown={this.drumsHit.bind(this, 72)}
                            onMouseOver={this.drumsHit.bind(this, 72,)}
                            onMouseUp={this.drumsReleased.bind(this, 72)}
                            onMouseLeave={this.drumsReleased.bind(this, 72)}>
                            <kbd>H</kbd>
                            <span className="sound">ride</span>
                        </div>
                        <div data-key={74} id="drums-midiNote-74" className="key midiNote-74 no-select" onMouseDown={this.drumsHit.bind(this, 74)}
                            onMouseOver={this.drumsHit.bind(this, 74)}
                            onMouseUp={this.drumsReleased.bind(this, 74)}
                            onMouseLeave={this.drumsReleased.bind(this, 74)}>
                            <kbd>J</kbd>
                            <span className="sound">snare</span>
                        </div>
                        <div data-key={75} id="drums-midiNote-75" className="key midiNote-75 no-select" onMouseDown={this.drumsHit.bind(this, 75)}
                            onMouseOver={this.drumsHit.bind(this, 75)}
                            onMouseUp={this.drumsReleased.bind(this, 75)}
                            onMouseLeave={this.drumsReleased.bind(this, 75)}>
                            <kbd>K</kbd>
                            <span className="sound">tom</span>
                        </div>
                        <div data-key={76} id="drums-midiNote-76" className="key midiNote-76 no-select" onMouseDown={this.drumsHit.bind(this, 76)}
                            onMouseOver={this.drumsHit.bind(this, 76)}
                            onMouseUp={this.drumsReleased.bind(this, 76)}
                            onMouseLeave={this.drumsReleased.bind(this, 76)}>
                            <kbd>L</kbd>
                            <span className="sound">tink</span>
                        </div>
                    </div>
                
                </div>

            </div>
        )
    }
}

const mapStateToProps = (state: IRootState) => {
    return {
        volume: state.bandRoom.volume,
        isolated: state.bandRoom.isolated,
        context: state.bandRoom.context,
        activeVoices: state.bandRoom.activeVoices,
        band: state.bandRoom.band,
        player: state.profile.player,
        socket: state.socket.socket,
        instruments: state.bandRoom.instruments,
        activeInstrument: state.bandRoom.activeInstrument
    };
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => {
    return {
        // saveContext: (context: AudioContext) => dispatch(saveContext(context)),
        addToActiveVoices: (midiNote: number, voice: Voice) => dispatch(addToActiveVoices(midiNote, voice)),
        removeFromActiveVoices: (midiNote: number) => dispatch(removeFromActiveVoices(midiNote)),
        addNoteToMidiList: (command: number, midiNote: number, velocity: number) => dispatch(addNoteToMidiList(command, midiNote, velocity))
    };
}

// export default Instrument;
export default connect(mapStateToProps, mapDispatchToProps)(DrumsKit);