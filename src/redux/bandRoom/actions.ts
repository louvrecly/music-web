import { Band, Track, JoinedPlayer, Instrument } from "../../models";
import Voice from "../../utils/webMidi/Voice";


export function getBandSuccess(band: Band) {
    return {
        type: "GET_BAND" as "GET_BAND",
        band
    };
}

export function loadInstrumentsSuccess(instruments: Array<Instrument>) {
    return {
        type: "LOAD_INSTRUMENTS" as "LOAD_INSTRUMENTS",
        instruments
    };
}

export function muteOrUnmute(volume: number) {
    if (volume > 0) {
        return {
            type: "MUTE_VOLUME" as "MUTE_VOLUME",
        };
    } else {
        return {
            type: "UNMUTE_VOLUME" as "UNMUTE_VOLUME",
        };
    }
}

export function volumeAdjust(volume: number) {
    if (volume > 0) {
        return {
            type: "ADJUST_VOLUME" as "ADJUST_VOLUME",
            volume,
            muted: false
        };
    } else {
        return {
            type: "MUTE_VOLUME" as "MUTE_VOLUME"
        };
    }
}

export function switchIsolatedMode() {
    return {
        type: "SWTICH_ISOLATED_MODE" as "SWTICH_ISOLATED_MODE"
    };
}

export function clearMidiList() {
    return {
        type: "CLEAR_MIDI_LIST" as "CLEAR_MIDI_LIST"
    };
}

export function switchPhonic() {
    return {
        type: "SWITCH_PHONIC" as "SWITCH_PHONIC"
    };
}

export function playerJoinRoom(newPlayer: JoinedPlayer) {
    return {
        type: "PLAYER_JOIN_ROOM" as "PLAYER_JOIN_ROOM",
        newPlayer
    };
}

export function playerLeaveRoom(id: number) {
    return {
        type: "PLAYER_LEAVE_ROOM" as "PLAYER_LEAVE_ROOM",
        id
    };
}

export function saveContext(context: AudioContext) {
    return {
        type: "SAVE_CONTEXT" as "SAVE_CONTEXT",
        context
    };
}

export function destroyContext() {
    return {
        type: "DESTROY_CONTEXT" as "DESTROY_CONTEXT"
    };
}

export function addToActiveVoices(midiNote: number, voice: Voice) {
    return {
        type: "ADD_TO_ACTIVE_VOICES" as "ADD_TO_ACTIVE_VOICES",
        midiNote,
        voice
    };
}

export function removeFromActiveVoices(midiNote: number) {
    return {
        type: "REMOVE_FROM_ACTIVE_VOICES" as "REMOVE_FROM_ACTIVE_VOICES",
        midiNote
    };
}

export function switchInstrument(activeInstrument: Instrument) {
    return {
        type: "SWITCH_INSTRUMENT" as "SWITCH_INSTRUMENT",
        activeInstrument
    };
}

export function addNoteToMidiList(command: number, midiNote: number, velocity: number) {
    return {
        type: "ADD_NOTE_TO_MIDI_LIST" as "ADD_NOTE_TO_MIDI_LIST",
        command,
        midiNote,
        velocity
    };
}

export function addMidiToTrackListSuccess(newTrack: Track) {
    return {
        type: "ADD_MIDI_TO_TRACK_LIST" as "ADD_MIDI_TO_TRACK_LIST",
        newTrack
    };
}

export function loadTrackListSuccess(trackList: Array<Track>) {
    return {
        type: "LOAD_TRACK_LIST" as "LOAD_TRACK_LIST",
        trackList
    };
}

export function trackNameInputSuccess(id: number, name: string) {
    return {
        type: "TRACK_NAME_INPUT" as "TRACK_NAME_INPUT",
        id,
        name
    };
}

export function removeTrackSuccess(id: number) {
    return {
        type: "REMOVE_TRACK" as "REMOVE_TRACK",
        id
    };
}

export function resetBandRoom() {
    return {
        type: "RESET_BAND_ROOM" as "RESET_BAND_ROOM"
    };
}

export function failed(type: FAILED, msg: string) {
    return {
        type,
        msg
    };
}

type FAILED = 
    "GET_BAND_FAILED" | 
    "LOAD_INSTRUMENTS_FAILED" | 
    "ADD_MIDI_TO_TRACK_LIST_FAILED" | 
    "LOAD_TRACK_LIST_FAILED" | 
    "TRACK_NAME_INPUT_FAILED" | 
    "REMOVE_TRACK_FAILED" | 
    "EXPORT_TRACK_FAILED";

type BandRoomActionCreators = 
    typeof getBandSuccess | 
    typeof loadInstrumentsSuccess | 
    typeof muteOrUnmute | 
    typeof volumeAdjust | 
    typeof switchIsolatedMode | 
    typeof clearMidiList | 
    typeof switchPhonic | 
    typeof playerJoinRoom | 
    typeof playerLeaveRoom | 
    typeof saveContext | 
    typeof destroyContext | 
    typeof addToActiveVoices | 
    typeof removeFromActiveVoices | 
    typeof switchInstrument | 
    typeof addNoteToMidiList | 
    typeof addMidiToTrackListSuccess | 
    typeof loadTrackListSuccess | 
    typeof trackNameInputSuccess | 
    typeof removeTrackSuccess | 
    typeof resetBandRoom | 
    typeof failed;

export type IBandRoomActions = ReturnType<BandRoomActionCreators>;