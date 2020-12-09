import { IBandRoomStates } from "./state";
import { IBandRoomActions } from "./actions";
import { MidiData, midiListItem, Track, JoinedPlayer } from "../../models";


const initialState: IBandRoomStates = {
    band: {
        id: 0,
        name: "",
        band_img: "",
        founder_id: 0,
        onlineClients: 0
    },
    joinedPlayers: [],
    volume: 50,
    previousVolume: 50,
    muted: false,
    isolated: false,
    context: null,
    instruments: [],
    activeInstrument: {
        id: 1,
        name: "keyboard",
        is_percussion: false
    },
    activeVoices: {},
    is_mono: true,
    midiList: [],
    trackList: []
};

export const bandRoomReducer = (state: IBandRoomStates = initialState, action: IBandRoomActions): IBandRoomStates => {
    switch (action.type) {
        case "GET_BAND":
            {
                const { band } = action;
                return {
                    ...state,
                    band
                };
            }
        case "LOAD_INSTRUMENTS":
            {
                const { instruments } = action;
                return {
                    ...state,
                    instruments
                };
            }
        case "MUTE_VOLUME":
            {
                return {
                    ...state,
                    volume: 0,
                    muted: true
                };
            }
        case "UNMUTE_VOLUME":
            {
                const volume = state.previousVolume;
                return {
                    ...state,
                    volume,
                    muted: false
                };
            }
        case "ADJUST_VOLUME":
            {
                const { volume, muted } = action;
                const previousVolume = volume;
                return {
                    ...state,
                    volume,
                    previousVolume,
                    muted
                };
            }
        case "SWTICH_ISOLATED_MODE":
            {
                const isolated = !state.isolated;
                return {
                    ...state,
                    isolated
                };
            }
        case "CLEAR_MIDI_LIST":
            {
                return {
                    ...state,
                    midiList: []
                };
            }
        case "SWITCH_PHONIC":
            {
                return {
                    ...state,
                    is_mono: !state.is_mono
                };
            }
        case "PLAYER_JOIN_ROOM":
            {
                const { newPlayer } = action;
                const joinedPlayers: Array<JoinedPlayer> = state.joinedPlayers.concat(newPlayer);
                return {
                    ...state,
                    joinedPlayers
                };
            }
        case "PLAYER_LEAVE_ROOM":
            {
                const { id } = action;
                const joinedPlayers: Array<JoinedPlayer> = state.joinedPlayers.filter(joinedPlayer => joinedPlayer.id !== id);
                return {
                    ...state,
                    joinedPlayers
                };
            }
        case "SAVE_CONTEXT":
            {
                const { context } = action;
                return {
                    ...state,
                    context
                };
            }
        case "DESTROY_CONTEXT":
            {
                return {
                    ...state,
                    context: null
                };
            }
        case "ADD_TO_ACTIVE_VOICES":
            {
                const { midiNote, voice } = action;
                const activeVoices = Object.assign(state.activeVoices, { [midiNote]: voice });
                return {
                    ...state,
                    activeVoices
                };
            }
        case "REMOVE_FROM_ACTIVE_VOICES":
            {
                const { midiNote } = action;
                delete state.activeVoices[midiNote];
                const activeVoices = Object.assign({}, state.activeVoices);
                return {
                    ...state,
                    activeVoices
                };
            }
        case "SWITCH_INSTRUMENT":
            {
                const { activeInstrument } = action;
                return {
                    ...state,
                    activeInstrument
                };
            }
        case "ADD_NOTE_TO_MIDI_LIST":
            {
                const { command, midiNote, velocity } = action;
                const midiData: MidiData = [command, midiNote, velocity];
                const timestamp: number = performance.now();
                const newMidi: Array<midiListItem> = [
                    {
                        midiData,
                        timestamp
                    }
                ];
                const midiList: Array<midiListItem> = state.midiList.concat(newMidi);
                return {
                    ...state,
                    midiList
                };
            }
        case "ADD_MIDI_TO_TRACK_LIST":
            {
                const { newTrack } = action;
                const trackList: Array<Track> = state.trackList.concat(newTrack);
                return {
                    ...state,
                    trackList
                };
            }
        case "LOAD_TRACK_LIST":
            {
                const { trackList } = action;
                return {
                    ...state,
                    trackList
                };
            }
        case "TRACK_NAME_INPUT":
            {
                const { id, name } = action;
                const trackList: Array<Track> = state.trackList.slice();
                let track = trackList.find(track => track.id === id);
                track!.name = name;
                return {
                    ...state,
                    trackList
                };
            }
        case "REMOVE_TRACK":
            {
                const { id } = action;
                const trackList: Array<Track> = state.trackList.filter(track => track.id !== id);
                return {
                    ...state,
                    trackList
                };
            }
        case "RESET_BAND_ROOM":
            return initialState;
        default:
            return state;
    }
}