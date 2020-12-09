import { Player } from "../../models";


export function loadPlayerSuccess(player: Player) {
    return {
        type: "LOAD_PLAYER" as "LOAD_PLAYER",
        player
    };
}

export function uploadProfileSuccess(imgSrc: string) {
    return {
        type: "UPLOAD_PROFILE" as "UPLOAD_PROFILE",
        imgSrc
    };
}

export function browseFile(fileName: string) {
    return {
        type: "BROWSE_FILE" as "BROWSE_FILE",
        msg: fileName
    };
}

export function resetProfile() {
    return {
        type: "RESET_PROFILE" as "RESET_PROFILE"
    };
}

export function failed(type: FAILED, msg: string) {
    return {
        type,
        msg
    };
}

type FAILED = 
    "LOAD_PLAYER_FAILED" | 
    "UPLOAD_PROFILE_FAILED" | 
    "EDIT_PLAYER_INFO_FAILED";
type ProfileActionCreators = typeof loadPlayerSuccess | typeof uploadProfileSuccess | typeof browseFile | typeof resetProfile | typeof failed;

export type IProfileActions = ReturnType<ProfileActionCreators>;