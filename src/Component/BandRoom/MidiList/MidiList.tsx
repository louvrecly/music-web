import React from "react";
import Voice from "../../../utils/webMidi/Voice";
import { Button, ButtonGroup } from "reactstrap";
import { FaFile, FaPlay } from "react-icons/fa";
import { midiListItem, Track, MidiArray, Band, Instrument } from "../../../models";
import { IRootState, ThunkDispatch } from "../../../store";
import { connect } from "react-redux";
import { clearMidiList, switchPhonic, addToActiveVoices, saveContext, destroyContext } from "../../../redux/bandRoom/actions";
import { convertToMidiArray, playMidiArray, playMidiArrayPercussion, convertToMidiArrayPercussion, convertToMidiArrayAiFeed, getOrCreateContext } from "../../../utils/webMidi/midi";
import { smoothScroll } from "../../../utils/domControl/domControl";
import { startMagenta } from "../../../utils/magenta/magenta";
import { addMidiToTrackList } from "../../../redux/bandRoom/thunks";
import { soundUrl } from "../Instrument/DrumsKit/DrumsKit"
import "./MidiList.css";

interface IMidiListProps {
    band: Band,
    volume: number,
    is_mono: boolean,
    midiList: Array<midiListItem>,
    trackList: Array<Track>,
    context: AudioContext | null,
    activeInstrument: Instrument,
    saveContext: (context: AudioContext) => void,
    destroyContext: () => void,
    addToActiveVoices: (midiNote: number, voice: Voice) => void,
    clearMidiList: () => void,
    switchPhonic: () => void,
    addMidiToTrackList: (name: string, is_mono: boolean, midi_array: MidiArray, band_id: number, instrument_id: number, is_percussion: boolean) => void
}

interface IMidiListStates {
    connectedAi: boolean
}

class MidiList extends React.Component<IMidiListProps, IMidiListStates> {

    private timer: number = 0

    soundUrl: Object = soundUrl

    state: IMidiListStates = {
        connectedAi: false
    }

    private aiFeedbackOnClick = (event: React.MouseEvent<any, MouseEvent>) => {
        // console.log({ event });
        this.setState({
            connectedAi: !this.state.connectedAi
        });
        if (!this.state.connectedAi) {
            console.log('HIHI');
            let period: number = 5;
            this.timer = window.setInterval(async () => {
                const midiList = this.props.midiList;
                // console.log({ midiList });
                const continuation = await startMagenta(midiList);
                console.log({ continuation });
                // console.log('say hi every 5000ms');
                const { notes } = continuation;
                const midi_array = convertToMidiArrayAiFeed(notes, 2);
                // console.log({ midi_array });
                const volume = this.props.volume;
                const voice = playMidiArray(this.props.context!, true, midi_array, volume, "sine", 1, 0.001, 0.001);
                this.props.addToActiveVoices(-1, voice);
                const duration = notes.length / 2;
                period = duration + 5;
            }, period * 1000);
            console.log(this.timer)
        } else if (this.state.connectedAi) {
            console.log(`clearing ${this.timer}`)
            clearInterval(this.timer)
        }
        // midiToAiInput(midiList);  // ...
    }

    // // private playDrumsOnclick = (event: React.MouseEvent<any, MouseEvent>) => {
    // private playDrumsOnclick = () => {
    //     const delay = (t: number) => new Promise(resolve => setTimeout(resolve, t));
    //     const midiList = this.props.midiList
    //     const offset = midiList[0].timestamp;
    //     for (let midiItem of midiList) {
    //         // console.log((midiItem.timestamp - offset))
    //         delay((midiItem.timestamp - offset)).then(() => {
    //             const audio = new Audio((this.soundUrl as any)[midiItem.midiData[1] as number]);
    //             audio.play();
    //         });
    //     }
    // }

    private clearMidiOnClick = (event: React.MouseEvent<any, MouseEvent>) => {
        // console.log({ event });
        this.props.clearMidiList();
    }

    private playMidiOnClick = async (event: React.MouseEvent<any, MouseEvent>) => {
        const midiList = this.props.midiList
        const volume = this.props.volume;
        if (this.props.activeInstrument.is_percussion) {
            // percussion instrument active
            const midi_array = convertToMidiArrayPercussion(midiList);
            await playMidiArrayPercussion(midi_array, volume);
        } else {
            // non-percussion instrument active
            const is_mono = this.props.is_mono;
            const midi_array = convertToMidiArray(is_mono, midiList, 2);
            // console.log({ midi_array });
            const voice = playMidiArray(this.props.context!, is_mono, midi_array, volume, "sine", 2, 0.001, 0.001);
            this.props.addToActiveVoices(-1, voice);
        }
    }

    private phonicStyleOnClick = (event: React.MouseEvent<any, MouseEvent>) => {
        // console.log({ event });
        this.props.switchPhonic();
    }

    private addToTrackOnClick = async (event: React.MouseEvent<any, MouseEvent>) => {
        // console.log({ event });
        const midiList = this.props.midiList
        // console.log({ midiList });
        if (midiList.length > 0) {
            const name = `Track_${this.props.trackList.length + 1}`;
            const is_mono = this.props.is_mono;
            const band_id = this.props.band.id;
            let midi_array: MidiArray;
            if (this.props.activeInstrument.is_percussion) {
                // percussion instrument active
                midi_array = convertToMidiArrayPercussion(midiList);
                // console.log({ midi_array });
            } else {
                // non-percussion instrument active
                midi_array = convertToMidiArray(is_mono, midiList, 2);
                // console.log({ midi_array });
            }
            this.props.addMidiToTrackList(name, is_mono, midi_array, band_id!, this.props.activeInstrument.id!, this.props.activeInstrument.is_percussion);
            const trackListScroll = document.querySelector('.track-list-scroll');
            console.log({ trackListScroll });
            smoothScroll(trackListScroll!, trackListScroll!.scrollHeight, "down");
        }
    }

    public componentDidUpdate(prevProps: IMidiListProps, prevStates: IMidiListStates) {
        if (prevProps.midiList.length < this.props.midiList.length) {
            const midiListScroll = document.querySelector('.midi-list-scroll');
            console.log({ midiListScroll });
            smoothScroll(midiListScroll!, midiListScroll!.scrollHeight, "down");
        }
        if (prevStates.connectedAi !== this.state.connectedAi) {
            if (!this.state.connectedAi) {
                // destroy context
                if (this.props.context) {
                    this.props.context.suspend();
                }
                this.props.destroyContext();
    
                // get audio context
                const context = getOrCreateContext();
                this.props.saveContext(context);
            }
        }
    }

    public render() {
        return (
            <div className="midi-list-container">

                <div className="midi-list-head">
                    <h3>MIDI List</h3>
                    <Button color={this.state.connectedAi ? "outline-danger" : "outline-info"} className="play-with-ai" onClick={this.aiFeedbackOnClick.bind(this)}>
                        Play with AI
                    </Button>
                    <Button color="outline-light" className="clear-midi-list" onClick={this.clearMidiOnClick.bind(this)}>
                        <FaFile />
                    </Button>
                </div>

                <div className="midi-list-table">

                    <div className="midi-header-row">
                        <div className="midi-header-col">Command</div>
                        <div className="midi-header-col">MidiNote</div>
                        <div className="midi-header-col">Velocity</div>
                        <div className="midi-header-col">Timestamp</div>
                    </div>

                    <div className="midi-list-scroll">
                        {/* <div className="force-overflow"> */}
                            <section id="midi-data" className="force-overflow">
                                <ul className="midi-list">
                                    {this.props.midiList.map((midiListItem, i) => (
                                        <li className="midi-list-item" key={i}>
                                            <div className="midi-data-row">
                                                <div className="midi-data-col">{midiListItem.midiData[0]}</div>
                                                <div className="midi-data-col">{midiListItem.midiData[1]}</div>
                                                <div className="midi-data-col">{midiListItem.midiData[2]}</div>
                                                <div className="midi-data-col">{midiListItem.timestamp}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        {/* </div> */}
                    </div>
                </div>

                <div className="midi-list-control">
                    <Button color="outline-success" className="play-button" onClick={this.playMidiOnClick.bind(this)}>
                        <FaPlay />
                    </Button>
                    <ButtonGroup className="mono-poly-btn-group">
                        <Button color="outline-primary" className="mono-btn" onClick={this.phonicStyleOnClick.bind(this)} active={this.props.is_mono}>MONO</Button>
                        <Button color="outline-primary" className="poly-btn" onClick={this.phonicStyleOnClick.bind(this)} active={!this.props.is_mono}>POLY</Button>
                    </ButtonGroup>
                    <Button color="outline-warning" className="add-to-track" onClick={this.addToTrackOnClick.bind(this)}>Save</Button>
                </div>

            </div>
        );
    }

}

const mapStateToProps = (state: IRootState) => {
    return {
        band: state.bandRoom.band,
        volume: state.bandRoom.volume,
        is_mono: state.bandRoom.is_mono,
        midiList: state.bandRoom.midiList,
        trackList: state.bandRoom.trackList,
        context: state.bandRoom.context,
        activeInstrument: state.bandRoom.activeInstrument
    };
};

const mapDispatchToProps = (dispatch: ThunkDispatch) => {
    return {
        saveContext: (context: AudioContext) => dispatch(saveContext(context)),
        destroyContext: () => dispatch(destroyContext()),
        addToActiveVoices: (midiNote: number, voice: Voice) => dispatch(addToActiveVoices(midiNote, voice)),
        clearMidiList: () => dispatch(clearMidiList()),
        switchPhonic: () => dispatch(switchPhonic()),
        addMidiToTrackList: (name: string, is_mono: boolean, midi_array: MidiArray, band_id: number, instrument_id: number, is_percussion: boolean) => dispatch(addMidiToTrackList(name, is_mono, midi_array, band_id, instrument_id, is_percussion))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(MidiList);