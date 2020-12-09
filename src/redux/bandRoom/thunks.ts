import { MidiArray, Track, TrackExport } from "../../models";
import { Dispatch } from "redux";
import { IBandRoomActions, failed, addMidiToTrackListSuccess, getBandSuccess, loadTrackListSuccess, removeTrackSuccess, trackNameInputSuccess, loadInstrumentsSuccess } from "./actions";
import { downloadFromUrl } from "../../utils/domControl/domControl";


const { REACT_APP_API_SERVER } = process.env;

export function getBand(id: number) {
    return async (dispatch: Dispatch<IBandRoomActions>) => {
        const res = await fetch(`${REACT_APP_API_SERVER}/bands/${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`,
            }
        });
        const result = await res.json();

        if (result.isSuccess) {
            dispatch(getBandSuccess(result.data));
        } else {
            dispatch(failed("GET_BAND_FAILED", result.msg));
        }
    }
}

export function loadInstruments() {
    return async (dispatch: Dispatch<IBandRoomActions>) => {
        const res = await fetch(`${REACT_APP_API_SERVER}/music/instrument`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`,
            }
        });
        const result = await res.json();

        if (result.isSuccess) {
            dispatch(loadInstrumentsSuccess(result.data));
        } else {
            dispatch(failed("LOAD_INSTRUMENTS_FAILED", result.msg));
        }
    }
}

export function addMidiToTrackList(name: string, is_mono: boolean, midi_array: MidiArray, band_id: number, instrument_id: number, is_percussion: boolean) {
    return async (dispatch: Dispatch<IBandRoomActions>) => {
        let newTrack: Track = {
            name,
            is_mono,
            midi_array,
            band_id,
            instrument_id,
            is_percussion
        };
        const res = await fetch(`${REACT_APP_API_SERVER}/music/track/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`,
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify({ newTrack })
        });
        const result = await res.json();

        if (result.isSuccess) {
            newTrack = {
                id: result.data,
                ...newTrack
            };
            dispatch(addMidiToTrackListSuccess(newTrack));
        } else {
            dispatch(failed("ADD_MIDI_TO_TRACK_LIST_FAILED", result.msg));
        }
    };
}

export function loadTrackList(band_id: number) {
    return async (dispatch: Dispatch<IBandRoomActions>) => {
        const res = await fetch(`${REACT_APP_API_SERVER}/music/track/list/${band_id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
        });
        const result = await res.json();

        if (result.isSuccess) {
            dispatch(loadTrackListSuccess(result.data));
        } else {
            dispatch(failed("LOAD_TRACK_LIST_FAILED", result.msg));
        }
    };
}

export function trackNameInput(track: Track, name: string) {
    return async (dispatch: Dispatch<IBandRoomActions>) => {
        let editedTrack: Track = {
            ...track,
            name
        };
        const res = await fetch(`${REACT_APP_API_SERVER}/music/track/${track.id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`,
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify({ editedTrack })
        });
        const result = await res.json();

        if (result.isSuccess) {
            dispatch(trackNameInputSuccess(result.data, name));
        } else {
            dispatch(failed("TRACK_NAME_INPUT_FAILED", result.msg));
        }
    };
}

export function removeTrack(id: number) {
    return async (dispatch: Dispatch<IBandRoomActions>) => {
        const res = await fetch(`${REACT_APP_API_SERVER}/music/track/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
        });
        const result = await res.json();

        if (result.isSuccess) {
            dispatch(removeTrackSuccess(result.data));
        } else {
            dispatch(failed("REMOVE_TRACK_FAILED", result.msg));
        }
    };
}

export function exportTrack(midiName: string, exportTracks: Array<TrackExport>, band_id: number) {
    return async (dispatch: Dispatch<IBandRoomActions>) => {
        const res = await fetch(`${REACT_APP_API_SERVER}/music/midi/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`,
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify({ midiName, exportTracks, band_id })
        });
        const result = await res.json();

        if (result.isSuccess) {
            console.log({ result });
            downloadFromUrl(result.data, midiName);
        } else {
            dispatch(failed("EXPORT_TRACK_FAILED", result.msg));
        }
    }
}