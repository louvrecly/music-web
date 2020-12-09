// import { Band, AdResponse , BandAds} from "./models";
import { Dispatch } from "redux";
import { Member } from "./state";
import axios, { AxiosRequestConfig } from 'axios'
import { MsgInfo, Band, AdResponse, BandAds } from "../../models";

const { REACT_APP_API_SERVER } = process.env;

export interface ILoadMyBandAction {
    type: '@@myBand/LOAD_MYBAND'
    myBand: Band
}

export interface ILoadMyTracksAction {
    type: '@@myBand/LOAD_MYTRACKS'
    myTracks: []
}

export interface ILoadMyMidisAction {
    type: '@@myBand/LOAD_MYMIDIS'
    myMidis: []
}

export interface ILoadBandMembersAction {
    type: '@@myBand/LOAD_BANDMEMBERS'
    memberIds: Member[]
}

export interface ILoadAdsResAction {
    type: '@@myBand/LOAD_ADSRES',
    adsResponses: AdResponse[]
}

export interface ILoadJoinedBandsAction {
    type: '@@myBand/LOAD_JOINEDBANDS',
    joinedBands: Band[]
}

export interface ICreateBandAction {
    type: '@@myBand/CREATE_BAND',
    band: Band
}
export interface IEditBandAction {
    type: '@@myBand/EDIT_BAND',
    band: Band
}

export interface IKickMemberAction {
    type: '@@myBand/KICK_MEMBER',
    memberId: number
}

export interface IQuitBandAction {
    type: '@@myBand/QUIT_BAND'
    bandId: number
}

export interface IAccpetAdsAction {
    type: '@@bandAds/ACCEPT_ADS'
    adId: number,
    member: Member
}

export interface IDeclineAdsAction {
    type: '@@bandAds/DECLINE_ADS'
    adId: number
}

export interface ILoadBandAdsAction {
    type: '@@bandAds/LOAD_BANDADS',
    bandAds:BandAds[]
}

export interface ICreateBandAdsAction {
    type: '@@bandAds/CREATE_BANDADS'
    bandAds:BandAds
}

export interface ISearchBandAction {
    type: '@@bandAds/SEARCH_BANDS',
    bandAds: BandAds[]
}

export interface IJoinBandAction {
    type:'@@bandAds/JOIN_BAND',
    message: string
}

export interface IResetBandAction {
    type: '@@myBand/RESET_BAND'
}

export interface IBandModdalToggleAction {
    type: '@@bandAds/TOGGLE_BANDMODAL'
}

export interface IAdModalToggleAction  {
    type: '@@bandAds/TOGGLE_ADMODAL'
}

export interface IEditBandToggleAction  {
    type: '@@myband/TOGGLE_EDITMODAL'
}

export interface IViewAdToggleAction  {
    type: '@@bandAds/TOGGLE_VIEWADMODAL'
}

export interface IResponseAdsAction {
    type: '@@bandAds/RESPONSE_ADS'
}

export interface IDeleteAdsAction {
    type: '@@bandAds/DELETE_ADS',
    adId: number
}

export interface IOnlinePlayersAdsAction {
    type: '@@myBand/UPDATE_NUMBERS',
    bandId: number,
    number: number
}

export interface IBrowseFileAction {
    type: '@@myBand/BROWSE_FILE',
    msg: string
}

export interface IUploadLogoAction {
    type: '@@myBand/UPLOAD_LOGO',
    imgSrc: string
}

export interface IFailedAction{
    type: FAILED
    msgInfo: string
}

type FAILED = '@@bandAds/CREATEBAND_FAILED' | '@@bandAds/CREATEBANDADS_FAILED' | '@@bandAds/RESPONSEADS_FAILED' | '@@bandAds/UPLOAD_LOGO_FAILED'


export type BandActions = ILoadMyBandAction | ILoadAdsResAction 
            | ILoadJoinedBandsAction | IKickMemberAction | IQuitBandAction 
            | IAccpetAdsAction | IDeclineAdsAction | ILoadBandMembersAction
            | ILoadBandAdsAction | ICreateBandAdsAction | ISearchBandAction 
            | IJoinBandAction | IResetBandAction | ICreateBandAction | IBandModdalToggleAction 
            | IAdModalToggleAction | IViewAdToggleAction| IResponseAdsAction
            | IDeleteAdsAction | IOnlinePlayersAdsAction | IBrowseFileAction 
            | IUploadLogoAction | ICreateBandAction| IEditBandToggleAction 
            | IEditBandAction| ILoadMyTracksAction | ILoadMyMidisAction 
            |IFailedAction

            
export function failed (type: FAILED, msgInfo:MsgInfo|string) {
    return {
        type,
        msgInfo
    }
}

// export function cannotConnectToServer (msgInfo:MsgInfo|string) {
//     return {
//         "@@error/CANNOT_CONNECT_TO_SERVER" as "@error/CANNOT_CONNECT_TO_SERVER"
//         msgInfo
//     }
// }

export function loadMyBand(myBand:Band):ILoadMyBandAction {
    return {
        type:'@@myBand/LOAD_MYBAND',
        myBand : myBand
    }
}

export function loadMyTracks(myTracks:[]):ILoadMyTracksAction {
    return {
        type:'@@myBand/LOAD_MYTRACKS',
        myTracks : myTracks
    }
}

export function loadMyMidis(myMidis:[]):ILoadMyMidisAction {
    return {
        type:'@@myBand/LOAD_MYMIDIS',
        myMidis : myMidis
    }
}

export function joinedBands(bands:Band[]):ILoadJoinedBandsAction {
    return {
        type:'@@myBand/LOAD_JOINEDBANDS',
        joinedBands : bands
    }
}

export function acceptBandAd(adId:number,memberId:number,playerName:string):IAccpetAdsAction  {
    const newMember = {
        id: memberId,
        name: playerName
    }
    return {
        type:'@@bandAds/ACCEPT_ADS',
        adId,
        member:newMember
    }
}

export function declineBandAd(adId:number):IDeclineAdsAction  {
    return {
        type:'@@bandAds/DECLINE_ADS',
        adId
    }
}
export function loadBandMembers(memberIds:Member[]):ILoadBandMembersAction {
    return {
        type:'@@myBand/LOAD_BANDMEMBERS',
        memberIds : memberIds
    }
}

export function kickMember(memberId:number):IKickMemberAction {
    return {
        type:'@@myBand/KICK_MEMBER',
        memberId
    }
}

export function editBand(band:Band):IEditBandAction {
    return {
        type:'@@myBand/EDIT_BAND',
        band
    }
}

export function quitBand(bandId:number):IQuitBandAction {
    return {
        type:'@@myBand/QUIT_BAND',
        bandId
    }
}

export function loadAdsRes(adsResponses:AdResponse[]):ILoadAdsResAction {
    return {
        type:'@@myBand/LOAD_ADSRES',
        adsResponses: adsResponses
    }
}

export function loadBandAds(bandAds:BandAds[]):ILoadBandAdsAction {
    return {
        type:'@@bandAds/LOAD_BANDADS',
        bandAds:bandAds
    }
}

export function createBandAds(bandAds:BandAds):ICreateBandAdsAction {
    return {
        type:'@@bandAds/CREATE_BANDADS',
        bandAds:bandAds
    }
}


export function searchBand(bandAds:BandAds[]):ISearchBandAction {
    return {
        type: '@@bandAds/SEARCH_BANDS',
        bandAds:bandAds
    }
}

export function joinBand(message:string):IJoinBandAction {
    return {
        type:'@@bandAds/JOIN_BAND',
        message: message
    }
}

export function createBand(band:Band):ICreateBandAction {
    return {
        type:'@@myBand/CREATE_BAND',
        band:band
    }
}

export function resetBand(): IResetBandAction {
    return {
        type: '@@myBand/RESET_BAND'
    };
}

export function remoteBandModalToggle():IBandModdalToggleAction{
    return {
        type: '@@bandAds/TOGGLE_BANDMODAL'
    }
}

export function remoteEditBandToggle():IEditBandToggleAction{
    return {
        type: '@@myband/TOGGLE_EDITMODAL'
    }
}



export function remoteAdModalToggle():IAdModalToggleAction{
    return {
        type:'@@bandAds/TOGGLE_ADMODAL'
    }
}

export function remoteViewAdModalToggle():IViewAdToggleAction{
    return {
        type:'@@bandAds/TOGGLE_VIEWADMODAL'
    }
}

export function responseAds():IResponseAdsAction {
    return {
        type:'@@bandAds/RESPONSE_ADS'
    }
}

export function deleteAds(adId:number):IDeleteAdsAction {
    return {
        type:'@@bandAds/DELETE_ADS',
        adId: adId
    }
}

export function browseFile(fileName: string):IBrowseFileAction {
    return {
        type: "@@myBand/BROWSE_FILE",
        msg: fileName
    };
}

export function uploadLogoSuccess(imgSrc: string) {
    return {
        type: "@@myBand/UPLOAD_LOGO" as "@@myBand/UPLOAD_LOGO",
        imgSrc
    };
}

export function remoteLoadMyBand(){
    return async (dispatch:Dispatch) =>{
        const res = await axios.get<Band>(`${REACT_APP_API_SERVER}/bands/ownBand`, {headers: {Authorization : `Bearer ${localStorage.getItem('token')}`}})

        dispatch(loadMyBand(res.data))

        if (res.data !==null && res.data.id !== undefined){
            const members = await axios.get<Member[]>(`${REACT_APP_API_SERVER}/bands/bandMembers/${res.data.id}`, {headers: {Authorization : `Bearer ${localStorage.getItem('token')}`}})
            
            dispatch(loadBandMembers(members.data))
            const ads = await axios.get<AdResponse[]>(`${REACT_APP_API_SERVER}/bandAds/loadAdResponse/${res.data.id}`, {headers: {Authorization : `Bearer ${localStorage.getItem('token')}`}})

            dispatch(loadAdsRes(ads.data))
            }
    }
}

export function remoteLoadMyTracks(){
    return async (dispatch:Dispatch) =>{
        const res = await axios.get(`${REACT_APP_API_SERVER}/music/track/player`, {headers: {Authorization : `Bearer ${localStorage.getItem('token')}`}})
        if (res.data.isSuccess){
        dispatch(loadMyTracks(res.data.data))
     }
    }
}

export function remoteLoadMyMidis(){
    return async (dispatch:Dispatch) =>{
        const res = await axios.get(`${REACT_APP_API_SERVER}/music/midi/player`, {headers: {Authorization : `Bearer ${localStorage.getItem('token')}`}})
        if (res.data.isSuccess){
        dispatch(loadMyMidis(res.data.data))
     }
    }
}

export function remoteLoadBandAds(){
    return async (dispatch:Dispatch) =>{

            const bandAds = await axios.get<BandAds[]>(`${REACT_APP_API_SERVER}/bandAds/loadBandAds`, {headers: {Authorization : `Bearer ${localStorage.getItem('token')}`}})        
            dispatch(loadBandAds(bandAds.data))
    }
}

export function remoteSearchAds(bandName:string, headline:string, instruments:string){
    return async (dispatch:Dispatch) =>{
        const res = await axios.post<BandAds[]>(`${REACT_APP_API_SERVER}/bandAds/searchBandAds`, {name: bandName, headline: headline, instruments:instruments} ,{headers: {Authorization : `Bearer ${localStorage.getItem('token')}`}})
        console.log(res.data)
        dispatch(searchBand(res.data))

    }
}

export function remoteJoinedBands(){
    return async (dispatch:Dispatch) =>{
        const res = await axios.get<Band[]>(`${REACT_APP_API_SERVER}/bands/loadJoinedBands`, {headers: {Authorization : `Bearer ${localStorage.getItem('token')}`}})

        dispatch(joinedBands(res.data))
    }
}

export function remoteKickMember(bandId:number, memberId:number){
    return async (dispatch:Dispatch) =>{
        await axios.delete<number>(`${REACT_APP_API_SERVER}/bands/kickMember/${bandId}&${memberId}`, {headers: {Authorization : `Bearer ${localStorage.getItem('token')}`}})

        dispatch(kickMember(memberId))
    }
}

export function remoteEditBand(bandId:number, bandName:string, band_img:string){
    return async (dispatch:Dispatch) =>{
        const res = await axios.put<any>(`${REACT_APP_API_SERVER}/bands/editBand`, {bandName: bandName, bandId:bandId, band_img:band_img}, {headers: {Authorization : `Bearer ${localStorage.getItem('token')}`}})

        dispatch(editBand(res.data.edit))
    }
}

export function remoteCreateBand(bandName:string, band_img:string){
    return async (dispatch:Dispatch) =>{
        const res = await axios.post<any>(`${REACT_APP_API_SERVER}/bands/createBand`, {bandName, band_img}, {headers: {Authorization : `Bearer ${localStorage.getItem('token')}`}})
        if (res.data.band !== null){
        dispatch(createBand(res.data.band))
        }
        else {
            dispatch(failed('@@bandAds/CREATEBAND_FAILED',res.data.result))
        }
    }
}

export function remoteResponseAds(adId:number, message:string){
    return async (dispatch:Dispatch) =>{
        const res = await axios.post<any>(`${REACT_APP_API_SERVER}/bandAds/responseBandAds`, {adId, message}, {headers: {Authorization : `Bearer ${localStorage.getItem('token')}`}})
        if (res.data.isSuccess === true){
        dispatch(responseAds())
        }else
        dispatch(failed('@@bandAds/RESPONSEADS_FAILED',res.data.result))
    }
}

export function remoteDeleteAds(id:number){
    return async (dispatch:Dispatch) =>{
        const res = await axios.delete<number>(`${REACT_APP_API_SERVER}/bandAds/deleteAds/${id}`, {headers: {Authorization : `Bearer ${localStorage.getItem('token')}`}})
        dispatch(deleteAds(res.data))
        console.log(res.data)
    }
}

export function remoteCreateBandAds(headline:string, description:string, message:string, instruments:string[]){
    return async (dispatch:Dispatch) =>{
        const res = await axios.get<any>(`${REACT_APP_API_SERVER}/bands/ownBand`, {headers: {Authorization : `Bearer ${localStorage.getItem('token')}`}})
        if (res.data)
        {
            const newAds = await axios.post<any>(`${REACT_APP_API_SERVER}/bandAds/createBandAds`, {headline, description, message, instruments,band_id:res.data.id}, {headers: {Authorization : `Bearer ${localStorage.getItem('token')}`}})
            if (newAds.data.ad !== null){
            dispatch(createBandAds(newAds.data.ad))
            } else {
                dispatch(failed('@@bandAds/CREATEBAND_FAILED',newAds.data.result))
            }
        }
        else {
                dispatch(failed('@@bandAds/CREATEBAND_FAILED',res.data.result))
            }
        }
}

export function remoteQuitBand(bandId:number){
    return async (dispatch:Dispatch) =>{
        await axios.delete<number>(`${REACT_APP_API_SERVER}/bands/quitBand/${bandId}`, {headers: {Authorization : `Bearer ${localStorage.getItem('token')}`}})

        dispatch(quitBand(bandId))
    }
}

export function remoteAcceptBandAd(adId:number,bandId:number,playerId:number,playerName:string){
    return async (dispatch:Dispatch) =>{
        await axios.post<number>(`${REACT_APP_API_SERVER}/bandAds/replyAds/accept`, {adId, bandId, playerId}, {headers: {Authorization : `Bearer ${localStorage.getItem('token')}`}})

        dispatch(acceptBandAd(adId,playerId,playerName))
    }
}

export function remoteDeclineBandAd(adId:number){
    return async (dispatch:Dispatch) =>{
        const res = await axios.post<number>(`${REACT_APP_API_SERVER}/bandAds/replyAds/decline/`, {adId}, {headers: {Authorization : `Bearer ${localStorage.getItem('token')}`}});
        if(res.status === 500){
            //  dispatch(cannotConnectToServer(res.data))
        }
        dispatch(declineBandAd(adId))
    }
}

// Unify API call, standard error handling procedure
export async function myPost(url:string,config?: AxiosRequestConfig){
    const res = await axios.post(url,config);
    if(res.status === 200){
        return res.data;
    }else{
        //  dispatch(cannotConnectToServer(res.data))
    }
}

export function remoteUpdateOnlinePlayers(bandId:number, number:number):IOnlinePlayersAdsAction{
   return {
       type:'@@myBand/UPDATE_NUMBERS',
       bandId,
       number
   }
}


export function remoteUploadBand(file: File | null) {
    // export function uploadProfile(player: Player, file: File | null) {
    return async (dispatch: Dispatch) => {
        const formData = new FormData();
        // formData.append('player', JSON.stringify(player));
        if (file) {
            formData.append('uploadImg', file);
            const res = await fetch(`${REACT_APP_API_SERVER}/bands/previewLogoPic`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });
            const result = await res.json();
            console.log({ result });
            if (result.isSuccess) {
                dispatch(uploadLogoSuccess(result.img));
            } else {
                dispatch(failed("@@bandAds/UPLOAD_LOGO_FAILED", result.msg));
            }
        } else {
            dispatch(failed("@@bandAds/UPLOAD_LOGO_FAILED", "Please select a file first!"));
        }
    }
}