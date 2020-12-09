import Voice from "./utils/webMidi/Voice";

export type AuthFormType = "login" | "register";
export type Msg = string | null;
export type MidiData = [number, number, number]; 
// export type ActiveInstrument = 
//     "keyboard" | 
//     "drumsKit";

export interface MsgInfo {
    isSuccess: boolean,
    msg: Msg
}

export enum Status {
    PENDING = 'requesting',
    ACCEPTED = 'accepted',
    DECLINED = 'declined'
}

export interface RoomMember {
    id: number,
    name: string
}

export interface Band {
    id?: number, 
    name: string, 
    band_img: string, 
    founder_id: number,
    onlineClients: number
}

export interface BandAds {
    id?: number, 
    name: string, 
    description: string, 
    message:string,
    instruments:string,
    valid: boolean,
    band_id:number,
    bandName?:string
}

export interface AdResponse {
    resId?: number, 
    message: string,  
    status:Status,
    band_ads_id: number,
    playerId:number,
    name?: string
}

export interface BandAds {
    id?: number, 
    name: string, 
    description: string, 
    message:string,
    instruments:string,
    valid: boolean,
    band_id:number
}

// export interface PublicProfile {
//     id: number,
//     name: string,
//     date_of_birth: Date,
//     gender: string,
//     profile_img: string
// }

export interface Player {
    id: number,
    name: string,
    date_of_birth: Date,
    gender: string,
    profile_img: string,
    user_id?: number
}

export interface midiListItem {
    midiData: MidiData,
    timestamp: number
}

export interface aiFeed {
    pitch: number,
    quantizedStartStep: number,
    quantizedEndStep: number
}

// export interface Match {
//     params: {
//         id: string
//     }
// }

export interface Oscillators {
    [midiNote: string]: OscillatorNode
}

export type Duration = number;
export type Pitch = number | Array<number>;
export type MidiItem = [Pitch, Duration];
export type MidiArray = Array<MidiItem>;

export interface NoteEvent {
    pitch: Pitch,
    duration: Duration
}

export interface Instrument {
    id?: number,
    name: string,
    is_percussion: boolean,
    created_at?: Date,
    updated_at?: Date
}

export interface InstrumentItem {
    instrument: JSX.Element,
    name: string
}

export interface NoteTimeline {
    [timestamp: string]: Array<number>
}

export interface ActiveVoices {
    [midiNote: string]: Voice
}

export interface Track {
    id?: number,
    name: string,
    is_mono: boolean,
    midi_array: MidiArray
    band_id: number,
    band_name?:string,
    instrument_id: number,
    is_percussion: boolean,
    created_at?: Date,
    updated_at?: Date
}

export interface Midi {
    id?: number,
    name: string,
    band_name?: string
    band_id: number,
    src: string,
    created_at?: Date,
    updated_at?: Date
}

export interface TrackStates {
    selected: boolean,
    instrumentClass: string | undefined,
    instrumentOption: number
}

export interface TrackSelection {
    [id: number]: TrackStates
}

export interface TrackExport {
    track: Track,
    instrument_number: number
}

export interface EmulatedKeys {
    [key: string]: number
}

export interface EmulatedDrums {
    [key: string]: number
}

export interface MidiInstrument {
    id: number,
    class: string,
    instrument: string
}

export interface Message {
    // messageId: string,
    speakerId: number,
    speakerName: string,
    content: string,
    timeStamp: string
}

export interface JoinedPlayer {
    id: number,
    name: string,
    color: string
}
