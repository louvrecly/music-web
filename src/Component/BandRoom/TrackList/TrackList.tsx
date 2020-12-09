import React from "react";
import Voice from "../../../utils/webMidi/Voice";
import { IRootState, ThunkDispatch } from "../../../store";
import { connect } from "react-redux";
import { Button, Input, Label, CustomInput, InputGroup } from "reactstrap";
import { FaTimes, FaPlay, FaFileDownload } from "react-icons/fa";
import { Track, MidiInstrument, Instrument, TrackExport, TrackSelection, TrackStates, Band } from "../../../models";
import { loadTrackList, removeTrack, trackNameInput, exportTrack } from "../../../redux/bandRoom/thunks";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { playTrack, playTrackPercussion } from "../../../utils/webMidi/track";
import { addToActiveVoices } from "../../../redux/bandRoom/actions";
import { midiInstruments, midiInstrumentTypes } from "../../../utils/webMidi/midi";
import "./TrackList.css";


interface ITrackListProps extends RouteComponentProps<{ id: string }> {
    // match: Match,
    volume: number,
    trackList: Array<Track>,
    context: AudioContext | null,
    instruments: Array<Instrument>,
    band: Band,
    addToActiveVoices: (midiNote: number, voice: Voice) => void,
    loadTrackList: (band_id: number) => void,
    trackNameInput: (track: Track, name: string) => void,
    removeTrack: (id: number) => void,
    exportTrack: (midiName: string, exportTracks: Array<TrackExport>, band_id: number) => void
}

interface ITrackListStates {
    trackSelection: TrackSelection,
    // trackSelection: { [id: number]: boolean },
    allSelected: boolean,
    instrumentClass: string | undefined,
    instrumentOption: number,
    midiName: string
}

class TrackList extends React.Component<ITrackListProps, ITrackListStates> {

    constructor(props: ITrackListProps) {
        super(props);
        this.state = {
            trackSelection: {},
            allSelected: false,
            instrumentClass: undefined,
            instrumentOption: 0,
            midiName: ""
        };
    }

    private masterSelectOptionChange = (field: "instrumentClass" | "instrumentOption", event: React.ChangeEvent<HTMLInputElement>) => {
        // console.log({ event });
        const selectOption = Object.assign({}, { [field]: event.currentTarget.value });
        let trackSelection: TrackSelection = { ...this.state.trackSelection };
        const currentIds = Object.keys(trackSelection);
        currentIds.forEach(currentId => {
            const id = parseInt(currentId, 10);
            const editedTrackStates: TrackStates = {
                ...this.state.trackSelection[id],
                ...selectOption
            };
            trackSelection = {
                ...trackSelection,
                [id]: editedTrackStates
            };
        });
        this.setState({
            ...selectOption,
            trackSelection
        });
    }

    private selectOptionChange = (id: number, field: "instrumentClass" | "instrumentOption", event: React.ChangeEvent<HTMLInputElement>) => {
        // console.log({ event });
        const selectOption: any = Object.assign({}, { [field]: event.currentTarget.value });
        const editedTrackStates: TrackStates = {
            ...this.state.trackSelection[id],
            ...selectOption
        };
        const trackSelection: TrackSelection = {
            ...this.state.trackSelection,
            [id]: editedTrackStates
        };
        this.setState({ trackSelection });
    }

    private selectTrackOnClick = (id: number, event: React.MouseEvent<any, MouseEvent>) => {
        // console.log({ event });
        // const trackSelection = Object.assign(this.state.trackSelection, { [id]: !this.state.trackSelection[id] });
        const selected: boolean = !this.state.trackSelection[id].selected;
        const editedTrackStates: TrackStates = {
            ...this.state.trackSelection[id],
            selected
        };
        const trackSelection: TrackSelection = {
            ...this.state.trackSelection,
            [id]: editedTrackStates
        };
        // trackSelection[id].selected = !this.state.trackSelection[id].selected;
        let allSelected = true;
        const currentIds = Object.keys(trackSelection);
        currentIds.forEach(currentId => {
            const id = parseInt(currentId, 10);
            allSelected = allSelected && trackSelection[id].selected;
        });
        this.setState({ trackSelection, allSelected });
    }

    private trackNameOnChange = (track: Track, event: React.ChangeEvent<HTMLInputElement>) => {
        // console.log({event});
        const name = event.currentTarget.value;
        this.props.trackNameInput(track, name);
    }

    private removeTrackOnClick = (id: number, event: React.MouseEvent<any, MouseEvent>) => {
        // console.log({ event });
        this.props.removeTrack(id);
        const trackSelection: TrackSelection = { ...this.state.trackSelection };
        delete trackSelection[id];
        let allSelected = true;
        const currentIds = Object.keys(trackSelection);
        currentIds.forEach(currentId => {
            const id = parseInt(currentId, 10);
            allSelected = allSelected && trackSelection[id].selected;
        });
        this.setState({ trackSelection, allSelected });
    }

    private playTrackOnClick = async (track: Track, event: React.MouseEvent<any, MouseEvent>) => {
        // console.log({ event });
        const { is_percussion } = track;
        const volume = this.props.volume;
        if (is_percussion) {
            // percussion track
            await playTrackPercussion(track, volume);
        } else {
            // non-percussion track
            const voice = playTrack(this.props.context!, track, volume, "sine", 2, 0.001, 0.001);
            this.props.addToActiveVoices(-1, voice);
        }
    }

    // private exportTrackOnClick = (track: Track, event: React.MouseEvent<any, MouseEvent>) => {
    //     // console.log({ event });
    //     const instrument_number = this.state.instrumentOption;
    //     this.props.exportTrack(track, instrument_number);
    // }

    private masterSelectOnClick = (event: React.MouseEvent<any, MouseEvent>) => {
        // console.log({ event });
        const allSelected = !this.state.allSelected;
        let trackSelection: TrackSelection = { ...this.state.trackSelection };
        const currentIds = Object.keys(trackSelection);
        currentIds.forEach(currentId => {
            const id = parseInt(currentId, 10);
            trackSelection[id].selected = allSelected;
        });
        this.setState({ trackSelection, allSelected });
    }

    private textInputOnChange = (field: string, event: React.ChangeEvent<HTMLInputElement>) => {
        // console.log({event});
        const textInputState: any = Object.assign({}, {[field]: event.currentTarget.value});
        this.setState(textInputState);
    }

    private exportMultiTrackOnClick = (event: React.MouseEvent<any, MouseEvent>) => {
        // console.log({ event });
        const trackSelection: TrackSelection = { ...this.state.trackSelection };
        const currentIds = Object.keys(this.state.trackSelection);
        const exportIds = currentIds
            .filter(currentId => {
                const id = parseInt(currentId, 10);
                return trackSelection[id].selected;
            })
            .map(filteredId => {
                const id = parseInt(filteredId, 10);
                return id;
            });
        if (exportIds.length > 0) {
            const midiName = this.state.midiName;
            if (midiName.length > 0) {
                let exportTracks: Array<TrackExport> = [];
                exportIds.forEach(exportId => {
                    const track = this.props.trackList.find(track => track.id === exportId);
                    const instrument_number = trackSelection[exportId].instrumentOption;
                    if (track) {
                        exportTracks.push({
                            track,
                            instrument_number
                        });
                    }
                });
                const band_id = this.props.band.id!;
                this.props.exportTrack(midiName, exportTracks, band_id);
            } else {
                console.log("please input a file name first!");
            }
        }
    }

    private renderExportInstrumentClass() {
        return midiInstrumentTypes
            .map((midiInstrumentType, i) => (
                <option value={midiInstrumentType} key={i}>{midiInstrumentType}</option>
            ));
    }

    private renderExportInstrumentOptions(instrumentClass: string | undefined) {
        let instrumentOptions: Array<MidiInstrument>;
        if (instrumentClass) {
            instrumentOptions = midiInstruments.filter(midiInstruments => midiInstruments.class === instrumentClass)
        } else {
            instrumentOptions = midiInstruments;
        }
        return instrumentOptions
            .map((instrumentOption, i) => (
                <option value={instrumentOption.id} key={i}>{instrumentOption.instrument}</option>
            ));
    }

    public componentDidUpdate(prevProps: ITrackListProps) {
        if (prevProps.trackList.length < this.props.trackList.length) {
            const trackSelection: TrackSelection = { ...this.state.trackSelection };
            const newTrackState: TrackStates = {
                selected: false,
                instrumentClass: undefined,
                instrumentOption: 0
            };
            this.props.trackList.forEach(track => {
                if (!(track.id!.toString() in this.state.trackSelection)) {
                    trackSelection[track.id!] = newTrackState;
                }
            });
            const allSelected = false;
            this.setState({ trackSelection, allSelected });
        }
    }

    public async componentDidMount() {
        const band_id = parseInt(this.props.match.params.id, 10);
        await this.props.loadTrackList(band_id);
        const trackSelection: TrackSelection = {};
        const newTrackState: TrackStates = {
            selected: false,
            instrumentClass: undefined,
            instrumentOption: 0
        };
        this.props.trackList.forEach(track => {
            trackSelection[track.id!] = newTrackState;
        });
        this.setState({ trackSelection });
    }

    public render() {
        return (
            <div className="track-list-container">
                <div className="track-list-head">

                    <h3 className="track-list-title">Tracks</h3>

                    <div className="export-instrument">

                        <Label for="export-instrument" className="export-instrument-label">Export Instrument</Label>

                        <InputGroup className="export-instrument-select">
                            <CustomInput type="select" id="instrument-class" className="instrument-class" onChange={this.masterSelectOptionChange.bind(this, "instrumentClass")} value={this.state.instrumentClass}>
                                <option value={undefined}>Class</option>
                                {this.renderExportInstrumentClass()}
                            </CustomInput>

                            <CustomInput type="select" id="instrument-option" className="instrument-option" onChange={this.masterSelectOptionChange.bind(this, "instrumentOption")} value={this.state.instrumentOption}>
                                <option value={0}>Option</option>
                                {this.renderExportInstrumentOptions(this.state.instrumentClass)}
                            </CustomInput>
                        </InputGroup>

                    </div>

                </div>

                <div className="track-list-scroll">

                    {/* <div className="force-overflow"> */}
                        <section id="track-data" className="force-overflow">
                            <ul className="track-list">
                                {this.props.trackList.map(track => (
                                    <li className="track-list-item" key={track.id}>

                                        <Button color="outline-primary" className="select-track-button" onClick={this.selectTrackOnClick.bind(this, track.id!)} active={this.state.trackSelection[track.id!] && this.state.trackSelection[track.id!].selected}>
                                            {/* <FaSquareFull /> */}
                                        </Button>

                                        <Input type="text" className="track-name" onChange={this.trackNameOnChange.bind(this, track)} value={track.name} />
                                        <p className="compose-instrument">{this.props.instruments.find(instrument => instrument.id === track.instrument_id) && this.props.instruments.find(instrument => instrument.id === track.instrument_id)!.name}</p>
                                        <div className="track-item-scroll">
                                            <div className="force-overflow">
                                                {JSON.stringify(track)}
                                            </div>
                                        </div>

                                        <InputGroup className="export-instrument-select">
                                            <CustomInput type="select" id="instrument-class" className="instrument-class" onChange={this.selectOptionChange.bind(this, track.id!, "instrumentClass")} value={this.state.trackSelection[track.id!] ? this.state.trackSelection[track.id!].instrumentClass : undefined}>
                                                <option value={undefined}>Class</option>
                                                {this.renderExportInstrumentClass()}
                                            </CustomInput>

                                            <CustomInput type="select" id="instrument-option" className="instrument-option" onChange={this.selectOptionChange.bind(this, track.id!, "instrumentOption")} value={this.state.trackSelection[track.id!] ? this.state.trackSelection[track.id!].instrumentOption : 0}>
                                                <option value={0}>Option</option>
                                                {this.renderExportInstrumentOptions(this.state.trackSelection[track.id!] ? this.state.trackSelection[track.id!].instrumentClass : undefined)}
                                            </CustomInput>
                                        </InputGroup>

                                        <Button color="outline-success" className="play-track-button" onClick={this.playTrackOnClick.bind(this, track)}>
                                            <FaPlay />
                                        </Button>
                                        <Button color="outline-danger" className="remove-track-button" onClick={this.removeTrackOnClick.bind(this, track.id!)}>
                                            <FaTimes />
                                        </Button>

                                        {/* <Button color="outline-warning" className="export-track-button" onClick={this.exportTrackOnClick.bind(this, track)}>
                                            <FaFileDownload />
                                        </Button> */}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    {/* </div> */}

                </div>

                <div className="track-list-control">

                    <Button color="outline-primary" className="master-select-button" onClick={this.masterSelectOnClick.bind(this)} active={this.state.allSelected} disabled={this.props.trackList.length < 1}>
                        {this.state.allSelected ? "Deselect All" : "Select All"}
                    </Button>

                    {/* <ButtonGroup className="mono-poly-btn-group">
                        <Button color="outline-primary" className="mono-btn" onClick={this.phonicStyleOnClick.bind(this)} active={this.props.is_mono}>MONO</Button>
                        <Button color="outline-primary" className="poly-btn" onClick={this.phonicStyleOnClick.bind(this)} active={!this.props.is_mono}>POLY</Button>
                    </ButtonGroup> */}

                    <Input type="text" className="midi-name" onChange={this.textInputOnChange.bind(this, "midiName")} placeholder="MIDI File Name" value={this.state.midiName} />

                    <Button color="outline-warning" className="export-midi-button" onClick={this.exportMultiTrackOnClick.bind(this)}>
                        <FaFileDownload />
                        <span>Export</span>
                    </Button>

                </div>

            </div>
        );
    }

}

const mapStateToProps = (state: IRootState) => {
    return {
        volume: state.bandRoom.volume,
        trackList: state.bandRoom.trackList,
        context: state.bandRoom.context,
        instruments: state.bandRoom.instruments,
        band: state.bandRoom.band
    };
};

const mapDispatchToProps = (dispatch: ThunkDispatch) => {
    return {
        addToActiveVoices: (midiNote: number, voice: Voice) => dispatch(addToActiveVoices(midiNote, voice)),
        loadTrackList: (band_id: number) => dispatch(loadTrackList(band_id)),
        trackNameInput: (track: Track, name: string) => dispatch(trackNameInput(track, name)),
        removeTrack: (id: number) => dispatch(removeTrack(id)),
        exportTrack: (midiName: string, exportTracks: Array<TrackExport>, band_id: number) => dispatch(exportTrack(midiName, exportTracks, band_id))
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TrackList));