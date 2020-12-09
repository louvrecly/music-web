import * as React from 'react'
import { connect } from 'react-redux';
import { IRootState, ThunkDispatch } from '../../store';
// import io from 'socket.io-client'
import { Band } from '../../models';
import { remoteLoadMyBand, remoteJoinedBands, remoteUpdateOnlinePlayers } from '../../redux/Band/action';
import { NavLink } from 'react-router-dom';
import { saveSocket } from '../../redux/socket/actions';
import { getSocket } from '../../utils/socket.io/socket.io';
import "./MyBand.css";
import "./BandStudio.css";


interface Props {
    myBand: Band | null,
    joinedBands: Band[],
    socket: SocketIOClient.Socket | null,
    loadMyBand: () => void,
    loadJoinedBands: () => void,
    updateOnlinePlayers: (bandId: number, number: number) => void,
    saveSocket: (socket: SocketIOClient.Socket) => void
}

interface States {
    onlinePlayers: number
}

class BandStudio extends React.Component<Props, States> {

    state: States = {
        onlinePlayers: 0
    }

    // socket = io('http://localhost:8000')

    async componentDidMount() {
        // initialize socket
        const socket = await getSocket();
        this.props.saveSocket(socket);

        // connect socket
        this.props.socket!.connect();

        // load my band and joined bands
        await this.props.loadMyBand();
        await this.props.loadJoinedBands();

        // get online clients of my band
        if (this.props.myBand) {
            this.props.socket!.emit('getOnline', this.props.myBand.id!);
            // this.socket.emit('getOnline', this.props.myBand.id);
        }

        // get online clients of every joined band
        this.props.joinedBands.map(band => {
            return this.props.socket!.emit('getOnline', band.id!);
            // return this.socket.emit('getOnline', band.id!);
        });

        // update online clients of any band
        this.props.socket!.on('onlineClients', (bandId: number, number: number) => {
        // this.socket.on('onlineClients', (room: number, number: number) => {
            return this.props.updateOnlinePlayers(bandId, number);
        });
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.joinedBands.length !==0 && this.props.joinedBands.length !==0){
        for (let i = 0; i < prevProps.joinedBands.length; i++) {
                if (prevProps.joinedBands[i].onlineClients !== this.props.joinedBands[i].onlineClients) {
                    this.props.socket!.emit('getOnline', this.props.joinedBands[i].id)
                    // this.socket.emit('getOnline', this.props.joinedBands[i].id)
                }
            }
        }
    }

    componentWillUnmount() {
        this.props.socket!.disconnect()
        // this.socket.disconnect()
    }

    getOnlineNumbers = (room: number) => {
        this.props.socket!.emit('getOnline', room);
        // this.socket.emit('getOnline', room);
    }

    render() {
        return (
            <div className="col-lg-4 col-md-4 col-sm-11 col-xs-11 myBand">
                <h3>Band Studio</h3>
                <div className="mainHeadRow">
                    <div className="tidy">Band</div>
                    <div className="tidy">Online</div>
                    <div className="tidy">Action</div>
                </div>
                <div className="dataRow studioList" id="bandRoomsTable">
                    {this.props.myBand && this.props.myBand.id! &&
                        <div className="row bandRoom">
                            <div className="tidy bandName">{this.props.myBand.name}</div>
                            <div className="tidy online">{this.props.myBand.onlineClients}</div>
                            <NavLink to={`/bandRoom/${this.props.myBand.id}`} className="resButton tidy enterRoom">Enter</NavLink>
                        </div>
                    }

                    {this.props.joinedBands.map(band => (

                        <div className="row bandRoom" key={band.id}>
                            <div className="tidy bandName">{band.name}</div>
                            <div className="tidy online">{band.onlineClients}</div>
                            <NavLink to={`/bandRoom/${band.id}`} className="resButton tidy enterRoom">Enter</NavLink>
                        </div>
                    ))}
                </div>
            </div>
        )
    }
}

export default connect((state: IRootState) => {
    return {
        myBand: state.band.myBand,
        joinedBands: state.band.joinedBands,
        socket: state.socket.socket
    }
}, (dispatch: ThunkDispatch) => {
    return {
        loadMyBand: () => dispatch(remoteLoadMyBand()),
        loadJoinedBands: () => dispatch(remoteJoinedBands()),
        updateOnlinePlayers: (bandId: number, number: number) => dispatch(remoteUpdateOnlinePlayers(bandId, number)),
        saveSocket: (socket: SocketIOClient.Socket) => dispatch(saveSocket(socket))
    }
})(BandStudio);