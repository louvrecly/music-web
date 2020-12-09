import React from "react";
import MidiList from "./MidiList/MidiList";
import TrackList from "./TrackList/TrackList";
import ChatRoom from "./ChatRoom/ChatRoom";
import InstrumentSet from "./Instrument/InstrumentSet";
import Unauthorized from "../System/Unauthorized";
import { Button, CustomInput, UncontrolledCollapse, ButtonGroup } from "reactstrap";
// import { Button, ButtonGroup, CustomInput } from "reactstrap";
import { FaVolumeUp, FaVolumeMute, FaUserAlt, FaUsers } from "react-icons/fa";
// import { FaFile, FaPlay, FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import { IRootState, ThunkDispatch } from "../../store";
import { connect } from "react-redux";
import { muteOrUnmute, volumeAdjust, saveContext, playerJoinRoom, playerLeaveRoom, destroyContext, switchIsolatedMode } from "../../redux/bandRoom/actions";
import { getBand, loadInstruments } from "../../redux/bandRoom/thunks";
import { Band, ActiveVoices, Player, JoinedPlayer, RoomMember } from "../../models";
// import { Match, Band } from "../../models";
// import { muteOrUnmute, volumeAdjust, switchPhonic, clearMidiList } from "../../redux/bandRoom/actions";
// import { midiListItem } from "../../models";
// import { smoothScroll } from "../../utils/domControl/domControl";
// import { convertToMidiArray, playMidiArray } from "../../utils/webMidi/midiList";
import { RouteComponentProps } from "react-router";
import { remoteLoadMyBand, remoteJoinedBands, remoteUpdateOnlinePlayers } from "../../redux/Band/action";
import { getOrCreateContext } from "../../utils/webMidi/midi";
import { getSocket } from "../../utils/socket.io/socket.io";
import { saveSocket } from "../../redux/socket/actions";
import { loadPlayer } from "../../redux/profile/thunks";
import "./BandRoom.css"


interface IBandRoomProps extends RouteComponentProps<{ id: string }> {
    // match: Match,
    socket: SocketIOClient.Socket | null,
    player: Player,
    band: Band,
    myBand: Band | null,
    joinedBands: Array<Band>,
    joinedPlayers: Array<JoinedPlayer>,
    volume: number,
    previousVolume: number,
    muted: boolean,
    isolated: boolean,
    context: AudioContext | null,
    activeVoices: ActiveVoices,
    saveSocket: (socket: SocketIOClient.Socket) => void,
    loadPlayer: () => void,
    getBand: (id: number) => void,
    loadMyBand: () => void,
    loadJoinedBands: () => void,
    playerJoinRoom: (newPlayer: JoinedPlayer) => void,
    playerLeaveRoom: (id: number) => void,
    updateOnlinePlayers: (bandId: number, number: number) => void,
    loadInstruments: () => void,
    saveContext: (context: AudioContext) => void,
    destroyContext: () => void,
    muteOrUnmute: (volume: number) => void,
    volumeAdjust: (volume: number) => void,
    switchIsolatedMode: () => void
}

interface IBandRoomStates {
    authorized: boolean,
    tracksOpen: boolean,
    chatOpen: boolean
}

class BandRoom extends React.Component<IBandRoomProps, IBandRoomStates> {

    constructor(props: IBandRoomProps) {
        super(props);
        this.state = {
            authorized: true,
            tracksOpen: false,
            chatOpen: false
        };
    }

    private getRandomColor() {
        let letters = '012345'.split('');
        let color = '#';
        color += letters[Math.round(Math.random() * 5)];
        letters = '0123456789ABCDEF'.split('');
        for (let i = 0; i < 5; i++) {
            color += letters[Math.round(Math.random() * 15)];
        }
        return color;
    }

    private muteOnClick = (event: React.MouseEvent<any, MouseEvent>) => {
        // console.log({ event });
        let volume = this.props.volume;
        // console.log({ volume });
        this.props.muteOrUnmute(volume);
        const notes = Object.keys(this.props.activeVoices);
        for (let note of notes) {
            this.props.activeVoices[note].adjustVolume(volume);
        }
    }

    private volumeOnSlide = (event: React.ChangeEvent<HTMLInputElement>) => {
        // console.log({ event });
        const volume = parseInt(event.currentTarget.value, 10);
        this.props.volumeAdjust(volume);
        const notes = Object.keys(this.props.activeVoices);
        for (let note of notes) {
            this.props.activeVoices[note].adjustVolume(volume);
        }
    }

    private checkboxOnClick = (field: "tracksOpen" | "chatOpen", event: React.MouseEvent<any, MouseEvent>) => {
        // console.log({ event });
        const checkboxState: any = Object.assign({}, { [field]: !this.state[field] });
        this.setState(checkboxState);
    }

    private isolateOnClick = (event: React.MouseEvent<any, MouseEvent>) => {
        // console.log({ event });
        this.props.switchIsolatedMode();
    }

    public async componentWillMount() {
        // initialize socket
        const socket = await getSocket();
        this.props.saveSocket(socket);
        this.props.socket!.connect();

        // load player
        await this.props.loadPlayer();

        // load band
        await this.props.loadMyBand();
        await this.props.loadJoinedBands();
        const id = parseInt(this.props.match.params.id, 10);
        const myBand = this.props.myBand;
        const band = this.props.joinedBands.find(band => band.id === id);
        console.log("myBand.id = ", myBand!.id);
        console.log("band = ", band);
        
        // get audio context
        const context = getOrCreateContext();
        this.props.saveContext(context);

        // check for authorization
        if (myBand!.id === id || band) {
            await this.props.getBand(id);
        } else {
            console.log("Unauthorized!");
            this.setState({
                authorized: false
            });
        }

        // socket emits joining request to the band room
        this.props.socket!.emit('join-room-request', this.props.band.id, this.props.player.id, this.props.player.name);

        // socket listens to incoming player joining the band room
        this.props.socket!.on('member-joined', (members: Array<RoomMember>) => {
            for (let member of members) {
                const player = this.props.joinedPlayers.find(joinedPlayer => joinedPlayer.id === member.id);
                if (!player) {
                    const color = this.getRandomColor();
                    const newPlayer: JoinedPlayer = {
                        ...member,
                        color
                    };
                    this.props.playerJoinRoom(newPlayer);
                }
            }
        });

        // socket listens to any player leaving the band room     
        this.props.socket!.on('updatePlayers', (id: number) => {
            this.props.playerLeaveRoom(id);
        });

        // load instruments
        await this.props.loadInstruments();

    }

    public componentWillUnmount() {
        // disconnect socket
        this.props.socket!.emit('disconnected', this.props.band.id, this.props.player.id);
        this.props.socket!.disconnect();

        // destroy context
        if (this.props.context) {
            this.props.context.suspend();
        }
        this.props.destroyContext();
    }

    public render() {
        return (
            <div className="band-room-root">
                <div className="band-room-content">
                    {!this.state.authorized && <Unauthorized />}
                    <div className="band-room-head-row">
                        <div className="band-room-head-col">
                            <div className="band-room-head-section">
                                <div className="band-room-head">

                                    <img className="band-room-img" src={this.props.band.band_img} alt={this.props.band.name}></img>

                                    <h1>{this.props.band.name}</h1>

                                    <div className="slide-container">
                                        <Button color="outline-light" className="volume-button" onClick={this.muteOnClick.bind(this)}>
                                            {this.props.muted ? <FaVolumeMute /> : <FaVolumeUp />}
                                        </Button>
                                        <CustomInput type="range" className="volume-slider" id="volume-slider" min={0} max={100} onChange={this.volumeOnSlide.bind(this)} value={this.props.volume.toString()} />
                                        <span className="output-volume">{this.props.volume}</span>
                                    </div>

                                    <ButtonGroup className="window-togglers">

                                        <Button color="outline-danger" id="track-list-toggler" className="track-list-toggler" onClick={this.checkboxOnClick.bind(this, 'tracksOpen')} active={this.state.tracksOpen}>
                                            Tracks
                                        </Button>

                                        <Button color="outline-success" id="chat-room-toggler" className="chat-room-toggler" onClick={this.checkboxOnClick.bind(this, 'chatOpen')} active={this.state.chatOpen}>
                                            Chat
                                        </Button>

                                    </ButtonGroup>

                                    <Button color={this.props.isolated ? "light" : "outline-light"} className="isolate-button" onClick={this.isolateOnClick.bind(this)}>
                                        {this.props.isolated ? <FaUserAlt /> : <FaUsers />}
                                    </Button>

                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="work-section-row">
                        <div className="work-section-col">

                            <UncontrolledCollapse className="track-list-section" toggler="#track-list-toggler">
                                <TrackList />
                            </UncontrolledCollapse>

                            <div className="midi-list-section">
                                <MidiList />
                            </div>

                            <UncontrolledCollapse className="chat-room-section" toggler="#chat-room-toggler">
                                <ChatRoom />
                            </UncontrolledCollapse>

                        </div>
                    </div>
                </div>
                <div className="instrument-section">
                    <InstrumentSet />
                </div>
                
            </div>

        );
    }

}

const mapStateToProps = (state: IRootState) => {
    return {
        socket: state.socket.socket,
        player: state.profile.player,
        band: state.bandRoom.band,
        myBand: state.band.myBand,
        joinedBands: state.band.joinedBands,
        joinedPlayers: state.bandRoom.joinedPlayers,
        volume: state.bandRoom.volume,
        previousVolume: state.bandRoom.previousVolume,
        muted: state.bandRoom.muted,
        isolated: state.bandRoom.isolated,
        context: state.bandRoom.context,
        activeVoices: state.bandRoom.activeVoices
    };
};

const mapDispatchToProps = (dispatch: ThunkDispatch) => {
    return {
        saveSocket: (socket: SocketIOClient.Socket) => dispatch(saveSocket(socket)),
        loadPlayer: () => dispatch(loadPlayer()),
        getBand: (id: number) => dispatch(getBand(id)),
        loadMyBand: () => dispatch(remoteLoadMyBand()),
        loadJoinedBands: () => dispatch(remoteJoinedBands()),
        playerJoinRoom: (newPlayer: JoinedPlayer) => dispatch(playerJoinRoom(newPlayer)),
        playerLeaveRoom: (id: number) => dispatch(playerLeaveRoom(id)),
        updateOnlinePlayers: (bandId: number, number: number) => dispatch(remoteUpdateOnlinePlayers(bandId, number)),
        loadInstruments: () => dispatch(loadInstruments()),
        saveContext: (context: AudioContext) => dispatch(saveContext(context)),
        destroyContext: () => dispatch(destroyContext()),
        muteOrUnmute: (volume: number) => dispatch(muteOrUnmute(volume)),
        volumeAdjust: (volume: number) => dispatch(volumeAdjust(volume)),
        switchIsolatedMode: () => dispatch(switchIsolatedMode())
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(BandRoom);