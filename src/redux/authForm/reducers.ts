import { IAuthStates } from "./state";
import { IAuthActions } from "./actions";


const initialState: IAuthStates = {
    isAuthenticated: (localStorage.getItem("token") !== null),
    msgInfo: null
};

export const authReducers = (state: IAuthStates = initialState, action: IAuthActions): IAuthStates => {
    switch (action.type) {
        case "LOGIN":
            {
                return {
                    ...state,
                    isAuthenticated: true,
                    msgInfo: null
                };
            }
        case "LOGOUT":
            {
                return {
                    ...state,
                    isAuthenticated: false,
                    msgInfo: null
                };
            }
        case "REGISTER":
            {
                const { msgInfo } = action;
                return {
                    ...state,
                    msgInfo
                };
            }
        case "LOGIN_FAILED":
            {
                const { msgInfo } = action;
                return {
                    ...state,
                    isAuthenticated: false,
                    msgInfo
                };    
            }
        case "REGISTER_FAILED":
            {
                const { msgInfo } = action;
                return {
                    ...state,
                    msgInfo
                };    
            }
        default:
            return state;
    }
}