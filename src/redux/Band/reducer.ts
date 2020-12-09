import { IBandState } from "./state";
import { BandActions } from "./action";
import { Status, Band } from "../../models";
// import { Status } from "../../models";
// import { Band } from '../../models';

const initialState: IBandState = {
    myBand: null,
    myTracks: [],
    myMidis: [],
    myBandMembers: [],
    joinedBands: [],
    adsResponse: [],
    bandAds: [],
    searchType: null,
    adModal: false,
    bandModal: false,
    viewAdModal: false,
    editModal: false,
    msgInfo: null,
    imgSrc: ""
}

export const BandReducer = (state: IBandState = initialState, action: BandActions): IBandState => {
    console.log({ action })
    switch (action.type) {
        case '@@myBand/LOAD_MYBAND':
            return {
                ...state,
                myBand: action.myBand,
                // myBandMembers:action.memberIds
            }
        case '@@myBand/LOAD_MYTRACKS':
            return {
                ...state,
                myTracks: action.myTracks
            }

        case '@@myBand/LOAD_MYMIDIS':
            return {
                ...state,
                myMidis: action.myMidis
            }
        case '@@myBand/LOAD_BANDMEMBERS':
            return {
                ...state,
                myBandMembers: action.memberIds
            }
        case '@@myBand/KICK_MEMBER':
            return {
                ...state,
                myBandMembers: state.myBandMembers.filter(member => member.id !== action.memberId)
            }

        case '@@myBand/QUIT_BAND':
            return {
                ...state,
                joinedBands: state.joinedBands.filter(band => band.id !== action.bandId)
            }

        case '@@myBand/LOAD_JOINEDBANDS':
            return {
                ...state,
                joinedBands: action.joinedBands
            }

        case '@@myBand/LOAD_ADSRES':
            return {
                ...state,
                adsResponse: action.adsResponses
            }

        case '@@bandAds/LOAD_BANDADS':
            const { bandAds } = action
            return {

                ...state,
                bandAds
            }

        case '@@bandAds/SEARCH_BANDS':
            return {
                ...state,
                bandAds: action.bandAds
            }

        case '@@bandAds/CREATE_BANDADS':
            return {
                ...state,
                bandAds: state.bandAds.concat([action.bandAds]),
                adModal: !state.adModal
            }

        case '@@bandAds/CREATEBANDADS_FAILED':
            return {
                ...state,
                msgInfo: action.msgInfo
            }

        case '@@bandAds/RESPONSEADS_FAILED':
            return {
                ...state,
                msgInfo: action.msgInfo
            }
        case '@@bandAds/TOGGLE_BANDMODAL':

            return {
                ...state,
                bandModal: !state.bandModal,
                msgInfo: null,
                imgSrc: ""
            }

        case '@@bandAds/TOGGLE_ADMODAL':

            return {
                ...state,
                adModal: !state.adModal,
                msgInfo: null
            }

        case '@@myband/TOGGLE_EDITMODAL':

            return {
                ...state,
                editModal: !state.editModal,
                msgInfo: null
            }
        case '@@bandAds/RESPONSE_ADS': {
            return {
                ...state,
                viewAdModal: !state.viewAdModal
            }
        }

        case '@@bandAds/TOGGLE_VIEWADMODAL': {
            return {
                ...state,
                viewAdModal: !state.viewAdModal,
                msgInfo: null
            }
        }

        case '@@bandAds/DECLINE_ADS':
            {
                return {
                    ...state,
                    adsResponse: state.adsResponse.filter(ad => ad.resId !== action.adId)
                }
            }

        case '@@bandAds/DELETE_ADS':
            {
                return {
                    ...state,
                    bandAds: state.bandAds.filter(ad => ad.id !== action.adId),
                    viewAdModal: !state.viewAdModal
                }
            }

        case '@@myBand/CREATE_BAND':
            {
                return {
                    ...state,
                    bandModal: !state.bandModal,
                    myBand: action.band
                }
            }

        case '@@myBand/EDIT_BAND':
            {
                action.band.onlineClients = state.myBand!.onlineClients
                return {
                    ...state,
                    editModal: !state.editModal,
                    myBand: action.band
                }
            }

        case '@@myBand/UPLOAD_LOGO':
            {
                return {
                    ...state,
                    imgSrc: action.imgSrc
                }
            }

        case '@@bandAds/CREATEBAND_FAILED':
            {
                return {
                    ...state,
                    msgInfo: action.msgInfo
                }
            }

        case '@@bandAds/ACCEPT_ADS':
            {
                return {
                    ...state,
                    adsResponse: state.adsResponse.map(ad => {
                        if (ad.resId !== action.adId) {
                            return ad;
                        } else {
                            return {
                                ...ad,
                                status: Status.ACCEPTED
                            }
                        }
                    }),
                    myBandMembers: state.myBandMembers.concat([action.member])

                }
            }
        case '@@myBand/UPDATE_NUMBERS':
            {
                if (state.myBand && state.myBand.id === action.bandId) {
                    const updatedBand: Band = Object.assign({}, state.myBand);
                    updatedBand.onlineClients = action.number;
                    return {
                        ...state,
                        myBand: updatedBand
                    };
                } else {
                    const { bandId, number } = action;
                    const joinedBands: Array<Band> = state.joinedBands.slice();
                    const updatedBand = joinedBands.find(joinedBand => joinedBand.id === bandId);
                    if (updatedBand) {
                        updatedBand.onlineClients = number;
                        return {
                            ...state,
                            joinedBands
                        };
                    } else {
                        return state;
                    }
                    // return {
                    //     ...state,
                    //     joinedBands: state.joinedBands.map(band => {
                    //         if (band.id !== action.bandId) {
                    //             return band;
                    //         } else {
                    //             return {
                    //                 ...band,
                    //                 onlineClients: action.number
                    //             }
                    //         }
                    //     })
                    // }
                }
            }

        case "@@myBand/BROWSE_FILE":
            {
                const { msg } = action;
                return {
                    ...state,
                    msgInfo: msg
                };
            }
        case '@@myBand/RESET_BAND':
            return initialState;
    }


    return state;
}