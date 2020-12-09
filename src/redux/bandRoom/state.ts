import { midiListItem, Band, Track, ActiveVoices, JoinedPlayer, Instrument } from "../../models";


export interface IBandRoomStates {
    band: Band,
    joinedPlayers: Array<JoinedPlayer>,
    volume: number,
    previousVolume: number,
    muted: boolean,
    isolated: boolean,
    context: AudioContext | null,
    activeVoices: ActiveVoices,
    instruments: Array<Instrument>,
    activeInstrument: Instrument,
    is_mono: boolean,
    midiList: Array<midiListItem>,
    trackList: Array<Track>
}