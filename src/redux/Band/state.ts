import { Band, AdResponse, BandAds, Track, Midi } from "../../models";
// import { Band, AdResponse, BandAds } from "./models";


export interface Member {
    id: number,
    name: string
}

export interface SearchType {
    bandName : boolean,
    AdHeadline : boolean,
    instrumnet : boolean
}

export interface IBandState {
    myBand: Band | null,
    myTracks: Array<Track>,
    myMidis: Array<Midi>,
    myBandMembers: Member[],
    joinedBands: Band[],
    adsResponse: AdResponse[]
    bandAds:BandAds[],
    searchType: SearchType | null,
    bandModal: boolean,
    adModal: boolean,
    viewAdModal: boolean,
    editModal: boolean,
    msgInfo: string | null,
    imgSrc: string
}