import * as React from 'react'
import { connect } from 'react-redux';
import { IRootState, ThunkDispatch } from '../../store';
import { remoteLoadMyTracks } from '../../redux/Band/action';
import { Button } from "reactstrap";
import { FaPlay } from "react-icons/fa";
import { Track, Instrument } from '../../models';
import { loadInstruments } from '../../redux/bandRoom/thunks';
import { playTrackPercussion, playTrack } from '../../utils/webMidi/track';
import Voice from '../../utils/webMidi/Voice';
import { addToActiveVoices, saveContext, destroyContext } from '../../redux/bandRoom/actions';
import { getOrCreateContext } from '../../utils/webMidi/midi';
import "./MyBand.css";




interface IProps {
    myTracks: Array<Track>
    instruments: Array<Instrument>
    context: AudioContext | null,
    loadMyTracks: () => void
    loadInstruments: () => void,
    addToActiveVoices: (midiNote: number, voice: Voice) => void,
    saveContext: (context: AudioContext) => void,
    destroyContext: () => void
}

class MyTrack extends React.Component<IProps> {

    // public async componentWillMount() {
    //     // get audio context
    //     const context = getOrCreateContext();
    //     this.props.saveContext(context);
    // }



    async componentDidMount() {
        await this.props.loadInstruments();
        await this.props.loadMyTracks()

    }

    public componentWillUnmount() {
        // destroy context
        if (this.props.context) {
            this.props.context.suspend();
        }
        this.props.destroyContext();
    }

    private playTrackOnClick = async (track: Track, event: React.MouseEvent<any, MouseEvent>) => {
        // console.log({ event });
        // get audio context
        const context = getOrCreateContext();
        this.props.saveContext(context);
        const { is_percussion } = track;
        if (is_percussion) {
            // percussion track
            await playTrackPercussion(track, 100);
        } else {
            // non-percussion track
            const intervalId = setInterval(() => {
                if (this.props.context) {
                    const voice = playTrack(this.props.context, track, 100, "sine", 2, 0.001, 0.001);
                    this.props.addToActiveVoices(-1, voice);
                    clearInterval(intervalId);
                }
            }, 500);
        }
    }


    render() {
        return (
            <div className="col-lg-6 col-md-6 col-sm-11 col-xs-11 myTrack">
                <h3>My Track</h3>
                <div className="mainHeadRow">
                    <div className="tidy">Track</div>
                    <div className="tidy">Band</div>
                    <div className="tidy">Instrument</div>
                    <div className="tidy">Play</div>
                </div>
                <div className="dataRow trackList">
                    <div className="force-overflow">
                        {this.props.myTracks.map((track, i) => (
                            <div className="row trackData" key={i}>
                                <div className="tidy trackName">{track.name}</div>
                                <div className="tidy trackName">{track.band_name}</div>
                                <div className="tidy play">{this.props.instruments.find(instrument => instrument.id === track.instrument_id) && this.props.instruments.find(instrument => instrument.id === track.instrument_id)!.name}
                                </div>
                                <div className="tidy shareButton">
                                    <Button color="outline-success" className="play-track-button" onClick={this.playTrackOnClick.bind(this, track)}>
                                        <FaPlay />
                                    </Button></div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* <div className="Demo__container">
                    <div className="Demo__some-network">
                        <FacebookShareButton
                            url={shareUrl}
                            quote={title}>
                            <FacebookIcon
                                size={32}
                                round />
                        </FacebookShareButton>

                        <FacebookShareCount
                            url={shareUrl}
                            className="Demo__some-network__share-count">
                            {count => count}
                        </FacebookShareCount>
                    </div>
                </div> */}
            </div>
        )
    }
}

export default connect((state: IRootState) => {
    return {
        myTracks: state.band.myTracks,
        instruments: state.bandRoom.instruments,
        context: state.bandRoom.context
    }
}, (dispatch: ThunkDispatch) => {
    return {
        loadMyTracks: () => dispatch(remoteLoadMyTracks()),
        loadInstruments: () => dispatch(loadInstruments()),
        addToActiveVoices: (midiNote: number, voice: Voice) => dispatch(addToActiveVoices(midiNote, voice)),
        aveContext: (context: AudioContext) => dispatch(saveContext(context)),
        saveContext: (context: AudioContext) => dispatch(saveContext(context)),
        destroyContext: () => dispatch(destroyContext()),
    }
})(MyTrack);