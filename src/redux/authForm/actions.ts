import { MsgInfo } from "../../models";


export function loginSuccess() {
    return {
        type: "LOGIN" as "LOGIN"
    };
}

export function logoutSuccess() {
    return {
        type: "LOGOUT" as "LOGOUT"
    };
}

export function registerSuccess(msgInfo: MsgInfo) {
    return {
        type: "REGISTER" as "REGISTER",
        msgInfo
    };
}

export function failed(type: FAILED, msgInfo: MsgInfo) {
    return {
        type,
        msgInfo
    };
}

type FAILED = 
    "LOGIN_FAILED" | 
    "REGISTER_FAILED";
type AuthActionCreators = typeof loginSuccess | typeof registerSuccess | typeof logoutSuccess | typeof failed;

export type IAuthActions = ReturnType<AuthActionCreators>;