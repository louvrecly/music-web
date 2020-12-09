import { IProfileStates } from "./state";
import { IProfileActions } from "./actions";


const initialState: IProfileStates = {
    player: {
        id: 0,
        name: "",
        gender: "",
        date_of_birth: new Date(),
        profile_img: ""
    },
    imgSrc: "",
    msgInfo: ""
};

export const profileReducer = (state: IProfileStates = initialState, action: IProfileActions): IProfileStates => {
    switch (action.type) {
        case "LOAD_PLAYER":
            {
                const { player } = action;
                return {
                    player,
                    imgSrc: player.profile_img,
                    msgInfo: ""
                };
            }
        case "LOAD_PLAYER_FAILED":
            {
                const { msg } = action;
                return {
                    ...state,
                    msgInfo: msg
                };
            }
        case "UPLOAD_PROFILE":
            {
                const { imgSrc } = action;
                return {
                    ...state,
                    imgSrc
                };
            }
        case "UPLOAD_PROFILE_FAILED":
                {
                    const { msg } = action;
                    return {
                        ...state,
                        msgInfo: msg
                    };
                }
        case "BROWSE_FILE":
            {
                const { msg } = action;
                return {
                    ...state,
                    msgInfo: msg
                };
            }
        case "RESET_PROFILE":
            return initialState;
        default:
            return state;
    }
}