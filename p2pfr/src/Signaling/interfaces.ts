export interface SocketMessage {
    type: string;
}

export interface RequestRoom extends SocketMessage {
    room_id: number;
}
export interface Offer extends SocketMessage {
    offer: RTCSessionDescriptionInit;
}

export interface Answer extends SocketMessage {
    answer: RTCSessionDescriptionInit;
}

export interface RecIceCandidate extends SocketMessage {
    candidate: RTCIceCandidate;
}