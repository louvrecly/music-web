import React from "react";
import Voice from "../../../../utils/webMidi/Voice";
import { Button } from "reactstrap";
import { FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight } from "react-icons/fa";
import { ActiveVoices, EmulatedKeys, Band, MidiData, Player, Instrument } from "../../../../models";
import { noteOn, notes, emulatedKeys } from "../../../../utils/webMidi/midi";
import { smoothScroll } from "../../../../utils/domControl/domControl";
import { IRootState, ThunkDispatch } from "../../../../store";
import { connect } from "react-redux";
import { addToActiveVoices, removeFromActiveVoices, addNoteToMidiList } from "../../../../redux/bandRoom/actions";
// import { emitMidiSignal } from "../../../../utils/socket.io/socket.io";
// import { getSocket, emitMidiSignal } from "../../../../utils/socket.io/socket.io";
// import { saveSocket } from "../../../../redux/socket/actions";
// import { loadPlayer } from "../../../../redux/profile/thunks";
import "./Keyboard.css";


interface IKeyboardProps {
    volume: number,
    isolated: boolean,
    context: AudioContext | null,
    activeVoices: ActiveVoices,
    socket: SocketIOClient.Socket | null,
    band: Band,
    player: Player,
    instruments: Array<Instrument>,
    activeInstrument: Instrument,
    addToActiveVoices: (midiNote: number, voice: Voice) => void,
    removeFromActiveVoices: (midiNote: number) => void,
    addNoteToMidiList: (command: number, midiNote: number, velocity: number) => void,
    // saveSocket: (socket: SocketIOClient.Socket) => void,
    // loadPlayer: () => void
}

interface IKeyboardStates {
    scrollLeft: number,
    emulatedKeys: EmulatedKeys,
    accessibleOctave: number
}

class Keyboard extends React.Component<IKeyboardProps, IKeyboardStates> {

    constructor(props: IKeyboardProps) {
        super(props);
        this.state = {
            scrollLeft: 0,
            emulatedKeys,
            accessibleOctave: 4
        };
    }

    // play note
    private keyOn = (pianoKey: Element, midiNote: number, velocity: number) => {
        if (pianoKey && !pianoKey.classList.contains('active')) {
            pianoKey.classList.add('active');
            const command = 144;
            this.props.addNoteToMidiList(command, midiNote, velocity);

            // play note
            const voice = noteOn(this.props.context!, midiNote, this.props.volume, "sine");
            this.props.addToActiveVoices(midiNote, voice);
            
            // emit migi-signal to the room
            const midiData: MidiData = [command, midiNote, velocity];
            this.props.socket!.emit('midi-signal', this.props.band.id!, this.props.player.id, midiData, this.props.activeInstrument.is_percussion);
        }
    }

    // stop note
    private keyOff = (pianoKey: Element, midiNote: number) => {
        if (pianoKey && pianoKey.classList.contains('active')) {
            pianoKey.classList.remove('active');
            const command = 128;
            const velocity = 0;
            this.props.addNoteToMidiList(command, midiNote, velocity);

            // stop note
            this.props.activeVoices[midiNote].stop(0);
            this.props.removeFromActiveVoices(midiNote);
            
            // emit midi-signal to the room
            const midiData: MidiData = [command, midiNote, velocity];
            this.props.socket!.emit('midi-signal', this.props.band.id!, this.props.player.id, midiData, this.props.activeInstrument.is_percussion);
        }
    }

    // keyboard on screen starts
    // key scroll
    private shiftKey = (unit: number, direction: "left" | "right") => {
        // console.log({ unit, direction });
        const pianoKeyScroll = document.querySelector(".piano-key-scroll");
        // console.log({ pianoKeyScroll });
        const pixels = unit * 48;
        smoothScroll(pianoKeyScroll!, pixels, direction);
    }

    // key pressed on screen
    private keyPressed = (midiNote: number, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        // console.log({ midiNote, event });
        const pianoKey = event.currentTarget;
        if (event.buttons) {
            this.keyOn(pianoKey, midiNote, 127);
        }
    }

    // key released on screen
    private keyReleased = (midiNote: number, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        // console.log({ midiNote, event });
        const pianoKey = event.currentTarget;
        this.keyOff(pianoKey, midiNote);
    }

    // render keyboard
    private renderKeyboard(min: number, max: number) {
        const midiNotes: Array<number> = [];
        // const notes: Array<string> = notes;
        for (let i = min; i <= max; i++) {
            midiNotes.push(i);
        }
        // console.log("midiNotes = ", midiNotes);
        return midiNotes.map(midiNote => (
            <li id={`midiNote-${midiNote}`}
                className={`
                    midiNote-${midiNote} 
                    pianoKey 
                    no-select
                    note-${notes[midiNote % notes.length]} 
                    key${notes[midiNote % notes.length].endsWith("#") ? "Black" : "White"}
                    ${Object.values(this.state.emulatedKeys).indexOf(midiNote) > -1 && "accessible"}
                `}
                onMouseDown={this.keyPressed.bind(this, midiNote)}
                onMouseOver={this.keyPressed.bind(this, midiNote)}
                onMouseUp={this.keyReleased.bind(this, midiNote)}
                onMouseLeave={this.keyReleased.bind(this, midiNote)}
                key={midiNote}>
                {/* {midiNote} */}
            </li>
        ));
    }
    // keyboard on screen ends

    // keyboard instrument starts
    // keyboard on keydown
    private onKeyboardKeyDown = (event: KeyboardEvent) => {
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
            if (event.key in this.state.emulatedKeys && !(event.ctrlKey)) {
                // emulated keys
                const midiNote = this.state.emulatedKeys[event.key];
                if (!this.props.activeVoices[midiNote]) {
                    const keyId = `midiNote-${midiNote}`;
                    const pianoKey = document.querySelector(`#${keyId}`);
                    this.keyOn(pianoKey!, midiNote, 127);
                }
            } else if (event.key.startsWith('Arrow')) {
                // arrow keys
                const direction = event.key.replace('Arrow', "")[0].toLowerCase() + event.key.replace('Arrow', "").slice(1);
                if (direction === 'up' || direction === 'down') {
                    let shift;
                    switch (direction) {
                        case 'up':
                            shift = 1;
                            break;
                        case 'down':
                            shift = -1;
                            break;
                        default:
                            console.log(`Something went terribly wrong with the direction: ${direction}!`);
                            return;
                    }
                    const accessibleOctave = this.state.accessibleOctave + shift;
                    if (accessibleOctave > -2 && accessibleOctave < 8) {
                        const keys = Object.keys(this.state.emulatedKeys);
                        const emulatedKeys = Object.assign({}, this.state.emulatedKeys);
                        for (let key of keys) {
                            emulatedKeys[key] += 12 * shift;
                        }
                        this.setState({
                            emulatedKeys,
                            accessibleOctave
                        });
                        console.log("this.state.accessibleOctave = ", this.state.accessibleOctave);
                    }
                } else if (direction === 'left' || direction === 'right') {
                    let unit;
                    if (event.ctrlKey) {
                        unit = 7;
                    } else {
                        unit = 1;
                    }
                    this.shiftKey(unit, direction);
                } else {
                    console.log(`Something went terribly wrong with the direction: ${direction}!`);
                }
            }
        }

    }

    // keyboard on keyup
    private onKeyboardKeyUp = (event: KeyboardEvent) => {
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
            if (event.key in this.state.emulatedKeys) {
                // emulated keys
                const midiNote = this.state.emulatedKeys[event.key];
                if (this.props.activeVoices[midiNote]) {
                    const keyId = `midiNote-${midiNote}`;
                    const pianoKey = document.querySelector(`#${keyId}`);
                    this.keyOff(pianoKey!, midiNote);
                }
            }
        }
    }
    // keyboard instrument ends

    public componentDidUpdate(prevProps: IKeyboardProps) {
        if (prevProps.activeInstrument.id !== this.props.activeInstrument.id) {
            if (this.props.activeInstrument.name === "keyboard") {
                // addd keydown and keyup listener
                document.addEventListener("keydown", this.onKeyboardKeyDown);
                document.addEventListener("keyup", this.onKeyboardKeyUp);
            } else {
                // remove keydown and keyup listener
                document.removeEventListener("keydown", this.onKeyboardKeyDown);
                document.removeEventListener("keyup", this.onKeyboardKeyUp);
            }
        }
    }

    public async componentDidMount() {

        // scroll to accessible keys
        const viewWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        let pixels: number;
        if (viewWidth > 912) {
            pixels = 1690 - (viewWidth - 942) / 2;
        } else {
            pixels = 1690;
        }
        console.log({ viewWidth, pixels });
        const pianoKeyScroll = document.querySelector(".piano-key-scroll");
        // console.log({ pianoKeyScroll });
        smoothScroll(pianoKeyScroll!, pixels, "right");

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
                                console.log(`percussive midi signal received: ${midiData}`);
                            } else {
                                // non-percussive instruments
                                const [command, midiNote, velocity] = midiData;
                                switch (command) {
                                    case 144: // noteOn
                                        if (velocity > 0) {
                                            if (!this.props.activeVoices[midiNote]) {
                                                const voice = noteOn(this.props.context!, midiNote, this.props.volume, "sine");
                                                this.props.addToActiveVoices(midiNote, voice);
                                            }
                                        } else {
                                            if (this.props.activeVoices[midiNote]) {
                                                this.props.activeVoices[midiNote].stop(0);
                                                this.props.removeFromActiveVoices(midiNote);
                                            }
                                        }
                                        break;
                                    case 128: // noteOff
                                        if (this.props.activeVoices[midiNote]) {
                                            this.props.activeVoices[midiNote].stop(0);
                                            this.props.removeFromActiveVoices(midiNote);
                                        }
                                        break;
                                    default:
                                        console.log(`Something went terribly wrong! \nCommand value is neither 144 nor 128: ${command}`);
                                }
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

        setTimeout(() => {
            if (this.props.activeInstrument.name === "keyboard") {
                // addd keydown and keyup listener
                document.addEventListener("keydown", this.onKeyboardKeyDown);
                document.addEventListener("keyup", this.onKeyboardKeyUp);
            }
        }, 3000);

    }

    public componentWillUnmount() {
        // remove keydown and keyup listener
        document.removeEventListener("keydown", this.onKeyboardKeyDown);
        document.removeEventListener("keyup", this.onKeyboardKeyUp);
    }

    public render() {
        return (
            <div className="keyboard">
                <div className="keyboard-control">
                    <Button id="shiftKey-left-7" color="outline-light" className="shiftKey-left-7" onClick={this.shiftKey.bind(this, 7, "left")}>
                        <FaAngleDoubleLeft />
                    </Button>
                    <Button id="shiftKey-left-1" color="outline-light" className="shiftKey-left-1" onClick={this.shiftKey.bind(this, 1, "left")}>
                        <FaAngleLeft />
                    </Button>
                    <span className="keyboard-title">Keyboard</span>
                    {/* <Button id="magenta" color="outline-light" className="magenta" onClick={this.initRNN.bind(this)}>
                        Magenta
                    </Button> */}
                    <Button id="shiftKey-right-1" color="outline-light" className="shiftKey-right-1" onClick={this.shiftKey.bind(this, 1, "right")}>
                        <FaAngleRight />
                    </Button>
                    <Button id="shiftKey-right-7" color="outline-light" className="shiftKey-right-7" onClick={this.shiftKey.bind(this, 7, "right")}>
                        <FaAngleDoubleRight />
                    </Button>
                </div>
                <div className="piano-key-scroll">
                    <ul className="pianoKeys force-overflow">
                        {this.renderKeyboard(0, 127)}
                    </ul>
                </div>
            </div>
        )
    };

}

const mapStateToProps = (state: IRootState) => {
    return {
        volume: state.bandRoom.volume,
        isolated: state.bandRoom.isolated,
        context: state.bandRoom.context,
        activeVoices: state.bandRoom.activeVoices,
        socket: state.socket.socket,
        band: state.bandRoom.band,
        player: state.profile.player,
        instruments: state.bandRoom.instruments,
        activeInstrument: state.bandRoom.activeInstrument
    };
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => {
    return {
        addToActiveVoices: (midiNote: number, voice: Voice) => dispatch(addToActiveVoices(midiNote, voice)),
        removeFromActiveVoices: (midiNote: number) => dispatch(removeFromActiveVoices(midiNote)),
        addNoteToMidiList: (command: number, midiNote: number, velocity: number) => dispatch(addNoteToMidiList(command, midiNote, velocity)),
        // saveSocket: (socket: SocketIOClient.Socket) => dispatch(saveSocket(socket)),
        // loadPlayer: () => dispatch(loadPlayer())
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Keyboard);