import { Dispatch } from "redux";
import { IAuthActions, failed, loginSuccess, logoutSuccess, registerSuccess } from "./actions";
import { push, CallHistoryMethodAction } from "connected-react-router";
import { resetProfile, IProfileActions } from "../profile/actions";
import { resetBand, BandActions } from "../Band/action";
import { resetBandRoom, IBandRoomActions } from "../bandRoom/actions";


const { REACT_APP_API_SERVER } = process.env;

export function login(username: string, password: string) {
    return async (dispatch: Dispatch<IAuthActions | CallHistoryMethodAction>) => {
        const res = await fetch(`${REACT_APP_API_SERVER}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify({
                username,
                password
            })
        });
        const result = await res.json();

        if (res.status === 200) {
            localStorage.setItem("token", result.token);
            dispatch(loginSuccess());
            dispatch(push('/'));
        } else {
            dispatch(failed("LOGIN_FAILED", {
                isSuccess: result.isSuccess,
                msg: result.msg
            }));
        }
    };
}

export function register(username: string, password: string) {
    return async (dispatch: Dispatch<IAuthActions>) => {
        const res = await fetch(`${REACT_APP_API_SERVER}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify({
                username,
                password
            })
        });
        const result = await res.json();

        if (result.isSuccess) {
            dispatch(registerSuccess({
                isSuccess: result.isSuccess,
                msg: result.msg
            }));
        } else {
            dispatch(failed("REGISTER_FAILED", {
                isSuccess: result.isSuccess,
                msg: result.msg
            }));
        }
    };
}

export function logout() {
    return async (dispatch: Dispatch<
        IAuthActions | 
        IProfileActions | 
        CallHistoryMethodAction | 
        BandActions | 
        IBandRoomActions
    >) => {
        localStorage.removeItem("token");
        dispatch(logoutSuccess());
        dispatch(resetProfile());
        dispatch(resetBand());
        dispatch(resetBandRoom());
        dispatch(push('/'));
    };
}