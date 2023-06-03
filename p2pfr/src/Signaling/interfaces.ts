export interface SocketMessage {
    type: string;
}

export interface RequestRoom extends SocketMessage {
    room_id: number;
}

export interface SingleOffer extends SocketMessage {
    offer: RTCSessionDescriptionInit;
    person_id_receive: number
}

export interface Offer extends SocketMessage {
    offer: RTCSessionDescriptionInit;
}

export interface Answer extends SocketMessage {
    answer: RTCSessionDescriptionInit;
}

export interface RecIceCandidate extends SocketMessage {
    candidate: RTCIceCandidate;
    person_id_receive: number
}