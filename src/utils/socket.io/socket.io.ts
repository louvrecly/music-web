
import io from 'socket.io-client'


const { REACT_APP_API_SERVER } = process.env;

// setup socket io
export const getSocket = async () => {
    const socket: SocketIOClient.Socket = await io(`${REACT_APP_API_SERVER}`);
    return socket;
}