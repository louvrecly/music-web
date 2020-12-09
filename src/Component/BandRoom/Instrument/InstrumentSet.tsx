import React from "react";
import Voice from "../../../utils/webMidi/Voice";
import Keyboard from "./Keyboard/Keyboard";
import DrumsKit from "./DrumsKit/DrumsKit";
// import { Button } from "reactstrap";
// import { FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight } from "react-icons/fa";
import { IRootState, ThunkDispatch } from "../../../store";
import { connect } from "react-redux";
import { addNoteToMidiList, addToActiveVoices, removeFromActiveVoices, switchInstrument } from "../../../redux/bandRoom/actions";
// import { smoothScroll } from "../../../utils/domControl/domControl";
import { noteOn } from "../../../utils/webMidi/midi";
import { ActiveVoices, InstrumentItem, MidiData, Band, Player, Instrument } from "../../../models";
import { Carousel, CarouselItem, Button, ButtonGroup } from "reactstrap";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import "./InstrumentSet.css";


interface IInstrumentSetProps {
    volume: number,
    context: AudioContext | null,
    activeVoices: ActiveVoices,
    instruments: Array<Instrument>,
    activeInstrument: Instrument,
    band: Band,
    player: Player,
    socket: SocketIOClient.Socket | null,
    addToActiveVoices: (midiNote: number, voice: Voice) => void,
    removeFromActiveVoices: (midiNote: number) => void,
    addNoteToMidiList: (command: number, midiNote: number, velocity: number) => void,
    switchInstrument: (activeInstrument: Instrument) => void
}

interface IInstrumentSetStates {
    activeIndex: number
}

class InstrumentSet extends React.Component<IInstrumentSetProps, IInstrumentSetStates> {

    private animating: boolean = false;
    private instrumentItems: Array<InstrumentItem> = [
        {
            name: "Keyboard",
            instrument: <Keyboard />
        },
        {
            name: "Drums Kit",
            instrument: <DrumsKit />
        }
    ];

    constructor(props: IInstrumentSetProps) {
        super(props);
        this.state = {
            activeIndex: 0
        };
    }

    // MIDI input starts
    // on success
    private onMidiSuccess(midiAccess: WebMidi.MIDIAccess) {
        // this is all our MIDI data
        let inputs = midiAccess.inputs;
        let outputs = midiAccess.outputs;
        console.log({ inputs, outputs });
        let allInputs = inputs.values();
        // loop over all available inputs and listen for any MIDI input
        for (let input = allInputs.next(); input && !input.done; input = allInputs.next()) {
            // when a MIDI value is received call the onMIDIMessage function
            input.value.onmidimessage = this.gotMidiMessage.bind(this);
        }
    }

    // on failure
    private onMidiFailure() {
        console.warn("Not recognising MIDI controller");
    }

    // got midi message
    private gotMidiMessage(messageData: WebMidi.MIDIMessageEvent): void {

        // console.log({ messageData });
        const command = messageData.data[0];
        const midiNote = messageData.data[1];
        const velocity = messageData.data.length > 2 ? messageData.data[2] : 0;
        // console.log({ command, midiNote, velocity });

        // const keyId = `midiNote-${midiNote}`;
        // const pianoKey = document.querySelector(`#${keyId}`);

        switch (command) {
            case 144: // noteOn
                if (velocity > 0) {
                    // this.keyOn(pianoKey!, midiNote, velocity);
                    if (!this.props.activeVoices[midiNote]) {
                        this.props.addNoteToMidiList(144, midiNote, velocity);
                        const voice = noteOn(this.props.context!, midiNote, this.props.volume, "sine");
                        this.props.addToActiveVoices(midiNote, voice);
                    }
                } else {
                    // this.keyOff(pianoKey!, midiNote);
                    this.props.addNoteToMidiList(128, midiNote, 0);
                    if (this.props.activeVoices[midiNote]) {
                        this.props.activeVoices[midiNote].stop(0);
                        this.props.removeFromActiveVoices(midiNote);
                    }
                }
                break;
            case 128: // noteOff
                // this.keyOff(pianoKey!, midiNote);
                this.props.addNoteToMidiList(128, midiNote, 0);
                if (this.props.activeVoices[midiNote]) {
                    this.props.activeVoices[midiNote].stop(0);
                    this.props.removeFromActiveVoices(midiNote);
                }
                break;
            default:
                console.log(`Something went terribly wrong! \nCommand value is neither 144 nor 128: ${command}`);
        }
        
        const midiData: MidiData = [command, midiNote, velocity];
        this.props.socket!.emit('midi-signal', this.props.band.id!, this.props.player.id, midiData, false);

    }
    // MIDI input ends

    private standardizeInstrumentName(instrumentName: string) {
        return instrumentName[0].toLowerCase() + instrumentName.slice(1).split(' ').join("");
    }

    // carousel starts
    private onExiting() {
        this.animating = true;
    }

    private onExited() {
        this.animating = false;
    }

    private empty() {
        return;
    }

    private next(event: React.MouseEvent<any, MouseEvent>) {
        if (!this.animating) {
            const activeIndex = this.state.activeIndex === this.instrumentItems.length - 1 ? 0 : this.state.activeIndex + 1;
            this.setState({ activeIndex });
            const instrumentName = this.standardizeInstrumentName(this.instrumentItems[activeIndex].name);
            const activeInstrument = this.props.instruments.find(instrument => instrument.name === instrumentName);
            if (activeInstrument) {
                this.props.switchInstrument(activeInstrument);
            } else {
                console.log(`instrument not found: ${instrumentName}`);
            }
        }
    }

    private previous(event: React.MouseEvent<any, MouseEvent>) {
        if (!this.animating) {
            const activeIndex = this.state.activeIndex === 0 ? this.instrumentItems.length - 1 : this.state.activeIndex - 1;
            this.setState({ activeIndex });
            const instrumentName = this.standardizeInstrumentName(this.instrumentItems[activeIndex].name);
            const activeInstrument = this.props.instruments.find(instrument => instrument.name === instrumentName);
            if (activeInstrument) {
                this.props.switchInstrument(activeInstrument);
            } else {
                console.log(`instrument not found: ${instrumentName}`);
            }
        }
    }

    private goToIndex(activeIndex: number, event: React.MouseEvent<any, MouseEvent>) {
        if (!this.animating) {
            this.setState({ activeIndex });
            const instrumentName = this.standardizeInstrumentName(this.instrumentItems[activeIndex].name);
            const activeInstrument = this.props.instruments.find(instrument => instrument.name === instrumentName);
            if (activeInstrument) {
                this.props.switchInstrument(activeInstrument);
            } else {
                console.log(`instrument not found: ${instrumentName}`);
            }
        }
    }

    private renderIndicators = (instrumentItems: Array<InstrumentItem>) => {
        return instrumentItems.map((instrumentItem, i) => (
            <Button color="outline-warning" className="instrument-indicator" onClick={this.goToIndex.bind(this, i)} active={this.props.activeInstrument.name === this.standardizeInstrumentName(instrumentItem.name)} key={i}>
                {instrumentItem.name}
            </Button>
        ));
    }

    private renderSlides = (instrumentItems: Array<InstrumentItem>) => {
        return instrumentItems.map((instrumentItem, i) => (
            <CarouselItem onExiting={this.onExiting.bind(this)} onExited={this.onExited.bind(this)} key={i}>
                {instrumentItem.instrument}
                {/* <CarouselCaption captionText={instrumentItem.name} captionHeader={instrumentItem.name} /> */}
            </CarouselItem>
        ));
    }
    // carousel ends

    public async componentDidMount() {

        // start talking to MIDI controller
        if (navigator.requestMIDIAccess) {
            try {
                const midiAccess = await navigator.requestMIDIAccess({
                    sysex: false
                });
                midiAccess.onstatechange = (event) => {
                    // Print information about the (dis)connected MIDI controller
                    console.log("statechange", event.port.name, event.port.manufacturer, event.port.state);
                    this.onMidiSuccess(midiAccess);
                };
                this.onMidiSuccess(midiAccess);
            } catch (e) {
                this.onMidiFailure();
            }
        } else {
            console.warn("No MIDI support in your browser");
        }

    }

    public render() {
        return (
            <div className="instrument">
                
                <Carousel activeIndex={this.state.activeIndex} next={this.empty} previous={this.empty}>
                    <div className="instrument-control-panel">
                        <div className="instrument-control">
                            <Button color="outline-light" className="instrument-prev" onClick={this.previous.bind(this)}>
                            <FaCaretLeft />
                            </Button>
                            <ButtonGroup className="instrument-indicators">
                                {this.renderIndicators(this.instrumentItems)}
                            </ButtonGroup>
                            <Button color="outline-light" className="instrument-next" onClick={this.next.bind(this)}>
                                <FaCaretRight />                        
                            </Button>
                        </div>
                    </div>
                    {this.renderSlides(this.instrumentItems)}
                </Carousel>

            </div>
        );
    }

}

const mapStateToProps = (state: IRootState) => {
    return {
        volume: state.bandRoom.volume,
        context: state.bandRoom.context,
        activeVoices: state.bandRoom.activeVoices,
        instruments: state.bandRoom.instruments,
        activeInstrument: state.bandRoom.activeInstrument,
        band: state.bandRoom.band,
        player: state.profile.player,
        socket: state.socket.socket
    };
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => {
    return {
        addToActiveVoices: (midiNote: number, voice: Voice) => dispatch(addToActiveVoices(midiNote, voice)),
        removeFromActiveVoices: (midiNote: number) => dispatch(removeFromActiveVoices(midiNote)),
        addNoteToMidiList: (command: number, midiNote: number, velocity: number) => dispatch(addNoteToMidiList(command, midiNote, velocity)),
        switchInstrument: (activeInstrument: Instrument) => dispatch(switchInstrument(activeInstrument))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(InstrumentSet);