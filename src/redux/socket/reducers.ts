import { ISocketActions } from "./actions";
import { ISocketStates } from "./state";


const initialStates: ISocketStates = {
    socket: null
};

export const socketReducer = (state: ISocketStates = initialStates, action: ISocketActions): ISocketStates => {
    switch (action.type) {
        case "SAVE_SOCKET":
            const { socket } = action;
            return {
                ...state,
                socket
            };
        default:
            return state;
    }
}