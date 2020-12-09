import { MsgInfo } from "../../models";


export interface IAuthStates {
    isAuthenticated: boolean,
    msgInfo: MsgInfo | null
}