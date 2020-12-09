// import axios from "axios";
import { Dispatch } from "redux";
import { IProfileActions, failed, loadPlayerSuccess, uploadProfileSuccess } from "./actions";
import { Player } from "../../models";


const { REACT_APP_API_SERVER } = process.env;

export function loadPlayer() {
    return async (dispatch: Dispatch<IProfileActions>) => {
        const res = await fetch(`${REACT_APP_API_SERVER}/player/info`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
        });
        // const player = await axios.get(`${REACT_APP_API_SERVER}/info`);
        const result = await res.json();

        if (result.isSuccess) {
            dispatch(loadPlayerSuccess(result.data as Player));
        } else {
            dispatch(failed("LOAD_PLAYER_FAILED", result.msg));
        }
    };
}

export function uploadProfile(file: File | null) {
    // export function uploadProfile(player: Player, file: File | null) {
    return async (dispatch: Dispatch<IProfileActions>) => {
        const formData = new FormData();
        // formData.append('player', JSON.stringify(player));
        if (file) {
            formData.append('profile', file);
            const res = await fetch(`${REACT_APP_API_SERVER}/player/uploadProfilePic`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });
            const result = await res.json();

            console.log({ result });
            if (result.isSuccess) {
                dispatch(uploadProfileSuccess(result.data));
            } else {
                dispatch(failed("UPLOAD_PROFILE_FAILED", result.msg));
            }
        } else {
            dispatch(failed("UPLOAD_PROFILE_FAILED", "Please select a file first!"));
        }
    }
}
export function editplayerInfo(editedPlayer: Player) {
    return async (dispatch: Dispatch<IProfileActions>) => {
        const res = await fetch(`${REACT_APP_API_SERVER}/player/edit`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`,
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify({ editedPlayer: editedPlayer })
        });
        const result = await res.json();

        if (result.isSuccess) {
            console.log(result.data);
        } else {
            dispatch(failed("EDIT_PLAYER_INFO_FAILED", result.msg));
        }
    };
}