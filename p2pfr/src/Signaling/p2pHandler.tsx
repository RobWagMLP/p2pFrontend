import { getIceServer } from "../Helper/util";
import { Signaling } from "./signaling";

export class P2PHandler {

    private iceServer: [];

    private static instance: P2PHandler;

    private signaling: Signaling;
    
    private roomReadyCallback: (suc: boolean, message?: string) => void;

    private errorCallback:     (error: string ) => void;

    private connectiontStateCallback: (person_id: number, state: any) => void;

    private websocketConnectionIssueCallback: (ev: Event) => void;

    private onOpenCallback: () => void;

    private lastStatus: string;

    private lastError: string;

    private canReqestRoom: boolean;

    private canEnterRoom: boolean;
    
    
    private constructor() {
        this.connections = new Map<number, RTCPeerConnection>();
        this.initialized = false;
        this.canEnterRoom = false;
        this.canReqestRoom = false;
    }

    public connections: Map<number, RTCPeerConnection>;
    public initialized: boolean;

    static getInstance() {
        if(this.instance == null) {
            this.instance = new P2PHandler;
        }
        return this.instance;
    }

    setErrorCallback(method:  (error: string ) => void) {
        this.errorCallback = method;
    }

    setonOpenCallback(method:  ( ) => void) {
        this.canReqestRoom = true;
        this.onOpenCallback = method;
    }

    setWebsocketConnectionIssueCallback(method:  (ev: Event ) => void) {
        this.canReqestRoom = false;
        this.websocketConnectionIssueCallback = method;
    }

    setConnectionStatecallback(method:  (person_id: number, state: string) => void) {
        this.connectiontStateCallback = method;
    }
    
    private setupConnection(person_id: number) : RTCPeerConnection{
        const connection = new RTCPeerConnection({iceServers: this.iceServer});
        //@ts-ignore
        connection.onicecandidate((ev: RTCPeerConnectionIceEvent) => {
            if(ev.candidate) {
                this.signaling.sendIceCandidate({type: "send_ice_candidate_to_peers", candidate: ev.candidate});
            }
        })

        connection.addEventListener('connectionstatechange', (event: Event) => {
            console.log(connection.connectionState, person_id);

            this.connectiontStateCallback(person_id, connection.connectionState);
        });

        return connection;
    }

    async init() {
        if(!this.initialized) {
            this.iceServer = await getIceServer();

            this.signaling = new Signaling();

            this.signaling.addOnOpenListener(this.onOpenCallback);

            this.signaling.addOnErrorListener((error: string) => {
                console.log(error);

                switch(error) {
                    case "no_access_to_room": {
                        this.canEnterRoom = false;
                        this.roomReadyCallback(false, error);
                    } break;
                }
            });

            this.signaling.addOnCloseListener((reason: string) => {
                console.log(`Socket connection closed due to ${reason}`);
                this.canEnterRoom = false;
                this.canReqestRoom = false;
            })

            this.signaling.addonWebSocketErrorListener((ev: Event) => {
                this.websocketConnectionIssueCallback(ev);
            })

            this.signaling.addStatusListener((status: string) => {
                console.log(status);
                switch(status) {
                    case "enter_room": {
                        this.canEnterRoom = true;
                    } break;
                    default: break;
                }
                this.lastStatus = status;
            });

            this.signaling.addOnErrorListener((error: string) => {
                console.log(error);
                this.lastError = error;
                this.errorCallback(error);
            })

            this.signaling.addOnRoomInfoListener((userList: number[]) => {
                this.roomReadyCallback(true);
                
                for(const o of userList) {
                    const connection = this.setupConnection(o);
                    this.connections.set(o, connection);
                }
            });
            
            this.signaling.addAnswerListener(async (answer: RTCSessionDescriptionInit, person_id: number) => {
                
                if(this.connections.has(person_id)) {
                    const connection = this.connections.get(person_id);
                    const remoteDescr = new RTCSessionDescription(answer);

                    await connection.setRemoteDescription(remoteDescr);

                    this.connections.set(person_id, connection);
                }
            });

            this.signaling.addIceCandidateListener(async (candidate: RTCIceCandidate, person_id: number) => {
                if(this.connections.has(person_id)) {
                    const connection = this.connections.get(person_id);
                    try {
                        await connection.addIceCandidate(candidate);
                        this.connections.set(person_id, connection);
                    } catch(err: any) {
                        console.log(`error setting ice candidate for ${person_id}, error: ${err}`)
                    }
                }
            });

            this.signaling.addOfferListener(async (offer: RTCSessionDescriptionInit, person_id: number) => {
                const connection = this.setupConnection(person_id);
                const sessionDesc = new RTCSessionDescription(offer);

                await connection.setRemoteDescription(sessionDesc);

                const answer = await connection.createAnswer();
                await connection.setLocalDescription(answer);

                this.signaling.sendAnswer({type: "accept_offer_from_peer", answer: answer});
            });

            this.signaling.connect(1);

            this.initialized = true;
        }
    }

    initRoom(room_id: number, success: (suc: boolean, message?: string) => void) {
        if(!this.canReqestRoom) {
            throw new Error('Socket not ready');
        }
        this.roomReadyCallback = success;

        this.signaling.sendRoomRequest({type: "request_room", room_id: room_id});
    }

    async sendOffer() {
        if(!this.canEnterRoom) {
            throw new Error('Room not ready');
        }
        const descriptionSet = false;
        let   offer: RTCSessionDescriptionInit;

        if(this.connections.size > 0 ){
            for(const o of this.connections) {
                if(!descriptionSet) {
                    offer = await o[1].createOffer();
                }
                await o[1].setLocalDescription(offer);
            }
            this.signaling.sendOffer({type: "send_offer_to_peers", offer: offer});
        }
    }
}