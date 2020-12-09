export function saveSocket(socket: SocketIOClient.Socket) {
    return {
        type: "SAVE_SOCKET" as "SAVE_SOCKET",
        socket
    };
}

type SocketActionCreators = typeof saveSocket;

export type ISocketActions = ReturnType<SocketActionCreators>;