import * as React from 'react'
import { Input } from 'reactstrap';
import moment from 'moment';
// import io from 'socket.io-client'
import { WiMoonAltNew } from "react-icons/wi";
import { smoothScroll } from '../../../utils/domControl/domControl';
import { connect } from 'react-redux';
import { ThunkDispatch, IRootState } from '../../../store';
import { Player, Band, Message, JoinedPlayer } from '../../../models';
import { loadPlayer } from '../../../redux/profile/thunks';
import { withRouter, RouteComponentProps } from 'react-router-dom';
// import { getSocket } from '../../utils/socket.io/socket.io';
import { saveSocket } from '../../../redux/socket/actions';
import "./ChatRoom.css"


// const { REACT_APP_API_SERVER } = process.env;

interface IProps {
    player: Player,
    myBand: Band | null,
    joinedBands: Band[],
    band: Band,
    joinedPlayers: Array<JoinedPlayer>,
    // match: {
    //     params: {
    //         id: string
    //     }
    // },
    socket: SocketIOClient.Socket | null,
    loadPlayer: () => void,
    saveSocket: (socket: SocketIOClient.Socket) => void
}

interface IState {
    // band: Band,
    messages: Message[],
    // joinedPlayers: {
    //     id: number,
    //     name: string,
    //     color: string
    // }[]
    messageInput: string
}

class ChatRoom extends React.Component<IProps & RouteComponentProps, IState> {

    state: IState = {
        // band: {
        //     id: 0,
        //     name: "",
        //     band_img: "",
        //     founder: 0,
        //     onlineClients: 0
        // },
        messages: [],
        // joinedPlayers: [],
        messageInput: ""
    }
    // socket = io(`${REACT_APP_API_SERVER}`);
    // // socket = io('http://localhost:8000');

    private onMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            messageInput: event.currentTarget.value
        });
    }

    // private getBandInfo = (id: number) => {
    //     if (this.props.myBand && this.props.myBand.id === id) {
    //         this.setState({
    //             band: this.props.myBand
    //         })
    //         const band = this.props.joinedBands.find(band =>
    //             band.id === id)
    //         if (band) {
    //             this.setState({
    //                 band: band
    //             })
    //         }
    //     }
    // }

    private onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.keyCode === 13) {
            this.setState({
                messageInput: ''
            });
            if (this.state.messageInput !== "") {
                this.sendMessage(this.state.messageInput)
            }
        }
    }

    // private newPlayer(id: number, name: string) {
    //     const color = this.get_random_color()
    //     const newPlayer = Object.assign({}, {
    //         id,
    //         name,
    //         color
    //     });
    //     this.setState({
    //         joinedPlayers: this.state.joinedPlayers.concat([newPlayer])
    //     });
    // }

    // private deletePlayer(id: number) {
    //     this.setState({
    //         joinedPlayers: this.state.joinedPlayers.filter(player => player.id !== id)
    //     });
    // }

    private sendMessage(message: string) {
        const newMessage: Message = {
            // messageId: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10),
            speakerId: this.props.player.id,
            speakerName: this.props.player.name,
            content: message,
            timeStamp: moment().format('LTS')
        };
        this.props.socket!.emit('msg', this.props.band.id, newMessage)
        // this.socket.emit('msg', 1, newMessage)
    }

    // private loadNewMessage(msg: Message) {
    //     console.log({ msg });
    //     this.setState({
    //         message: this.state.message.concat([msg])
    //     });
    // }

    // private get_random_color() {
    //     let letters = '012345'.split('');
    //     let color = '#';
    //     color += letters[Math.round(Math.random() * 5)];
    //     letters = '0123456789ABCDEF'.split('');
    //     for (let i = 0; i < 5; i++) {
    //         color += letters[Math.round(Math.random() * 15)];
    //     }
    //     return color;
    // }

    private getPlayerColor(id: number) {
        const player = this.props.joinedPlayers.find(player => player.id! === id)
        // const player = this.state.joinedPlayers.find(player => player.id! === id)
        if (player) {
            return player.color;
        } else {
            return undefined;
        }
    }

    public componentDidUpdate() {
        const convoScroll = document.querySelector('.convoScroll');
        smoothScroll(convoScroll!, convoScroll!.scrollHeight, "down");
    }

    public async componentDidMount() {
        // // initialize socket
        // const socket = await getSocket();
        // this.props.saveSocket(socket);
        // this.props.socket!.connect();

        // // load player
        // await this.props.loadPlayer();
        // // this.getBandInfo(parseInt(this.props.match.params.id));

        // this.socket.connect();

        // // socket emits joining request to the band room
        // this.props.socket!.emit('i-wanna-join-room', this.props.band.id, this.props.player.id, this.props.player.name);

        // this.socket.emit('i-wanna-join-room', this.props.band.id, this.props.player.id, this.props.player.name);
        // console.log("this.props.band = ", this.props.band);
        // console.log("this.props.player = ", this.props.player);
        // this.socket.emit('i-wanna-join-room', this.props.match.params.id, this.props.player.id, this.props.player.name);
        // this.socket.on('player-joined', (playersList:

        // // socket listens to incoming player joining the band room
        // this.props.socket!.on('player-joined', (playersList:
        //     {
        //         roomId: number,
        //         players: [{
        //             id: number,
        //             name: string
        //         }]
        //     }) => {
        //     if (playersList.players) {
        //         for (let player of playersList.players) {
        //             const existed = this.state.joinedPlayers.find(joinedPlayer => joinedPlayer.id === player.id);
        //             if (!existed) {
        //                 this.newPlayer(player.id, player.name);
        //             }
        //         }
        //     }
        // });

        // this.socket.on('updatePlayers', (id: number) => {

        // // socket listens to any player leaving the band room     
        // this.props.socket!.on('updatePlayers', (id: number) => {
        //     this.deletePlayer(id);
        // });

        // this.socket.on('got-msg', (msg: Message) => {

        // attempt to use the socket every 0.5 second
        const intervalId = setInterval(() => {
            if (this.props.socket) {

                // socket listens to any chat messages from other players in the chat room
                this.props.socket.on('got-msg', (msg: Message) => {
                    // this.loadNewMessage(msg);

                    const messages: Array<Message> = this.state.messages.concat([msg])
                    this.setState({
                        messages
                    });
                });

                clearInterval(intervalId);

            } else {
                console.log("Waiting for the socket to connect...");
            }
        }, 500);

    }

    // componentWillUnmount = () => {
    //     // disconnect socket
    //     this.props.socket!.emit('disconnected', this.props.band.id, this.props.player.id);
    //     // this.socket.emit('disconnected', this.props.band.id, this.props.player.id);
    //     // this.socket.emit('disconnected', this.props.match.params.id, this.props.player.id);
    //     this.props.socket!.disconnect();
    //     // this.socket.disconnect();
    // }

    public render() {

        return (
            <div className="chatRow">
                <div className="chatRoomCol chatRoomExt">
                    <div className="chatControl invitation">
                        <div className="chatInput">Online</div>
                    </div>
                    <div className="scrollbar scrollbar-primary chatListScroll">
                        <div className="force-overflow">
                            <ul className="list-group contact-list" id="contact-list">
                                {this.props.joinedPlayers.filter(player => player.id !== 0).map(player => (
                                    // {this.state.joinedPlayers.filter(player => player.id !== 0).map(player => (

                                    <div className="list-group-item list-group-item-action chatRoomDoor" key={player.id}>
                                        {player.name}
                                        <WiMoonAltNew color="green" />
                                    </div>

                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="chatRoomCol chatRoomInt">
                    <div className="chatRoomHead theme-color-bg-3">
                        <img className="bandPhoto" src={this.props.band.band_img} alt="bandr#" />
                        {/* <img className="bandPhoto" src={this.state.band.band_img} alt="bandr#" /> */}
                        <h5 className="bandName">{this.props.band.name}</h5>
                        {/* <h5 className="bandName">{this.state.band.name}</h5> */}
                        <button className="bandProfile themeButton">View Band</button>
                    </div>
                    <div className="join">
                        Room:
                        <input type="text" id="room-number" readOnly />
                        <button id="join">Join</button>
                    </div>

                    <div className="row no-gutters convoLog">

                        <div className="scrollbar scrollbar-primary convoScroll">

                            {/* <div className="force-overflow"> */}
                                <div className="col-12 dialog force-overflow" id="dialog">
                                    {this.state.messages.map((message, i) => (

                                        <div key={i} className={`${message.speakerId === this.props.player.id ? "myDialog" : "friendsDialog"}`}>
                                        {/* <div key={message.messageId} className={`${message.speakerId === this.props.player.id ? "myDialog" : "friendsDialog"}`}> */}
                                            <div style={{
                                                color: this.getPlayerColor(message.speakerId)
                                            }} className="speakerName">{message.speakerId !== this.props.player.id ? message.speakerName : ""}</div>
                                            <p>{message.content}</p>
                                            <div className="timeStamp">{message.timeStamp}</div>
                                        </div>
                                    ))}
                                </div>
                            {/* </div> */}

                        </div>
                    </div>
                    <div className="communicationForm">
                        <div className="chatControl send">
                            <input type="text" className="room sendRoom" placeholder="room" readOnly />
                            <Input className="message chatInput sendMessage" placeholder="Press enter to send" onKeyDown={this.onKeyDown} value={this.state.messageInput} onChange={this.onMessageChange} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(connect((state: IRootState) => {
    return {
        player: state.profile.player,
        myBand: state.band.myBand,
        joinedBands: state.band.joinedBands,
        band: state.bandRoom.band,
        joinedPlayers: state.bandRoom.joinedPlayers,
        socket: state.socket.socket
    }
}, (dispatch: ThunkDispatch) => {
    return {
        loadPlayer: () => dispatch(loadPlayer()),
        saveSocket: (socket: SocketIOClient.Socket) => dispatch(saveSocket(socket))
    }
})(ChatRoom));