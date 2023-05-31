export interface SocketMessage {
    type: string;
}

export interface RequestRoom extends SocketMessage {
    room_id: number;
}
export interface Offer extends SocketMessage {
    offer: RTCSessionDescription;
}

export interface Answer extends SocketMessage {
    answer: RTCSessionDescription;
}

export interface RecIceCandidate extends SocketMessage {
    candidate: RTCIceCandidate;
}