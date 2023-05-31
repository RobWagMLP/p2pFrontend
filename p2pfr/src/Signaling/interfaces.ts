export interface SocketMessage {
    type: string;
}

export interface Offer extends SocketMessage {
    offer: RTCSessionDescription;
    room_id: number;
}

export interface Answer extends SocketMessage {
    answer: RTCSessionDescription;
}

export interface RecIceCandidate extends SocketMessage {
    candidate: RTCIceCandidate;
}