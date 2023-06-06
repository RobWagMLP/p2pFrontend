
import { getIceServer } from "../Helper/util";
import { Signaling } from "./signaling";
import { Storage }from "../Helper/storage"

export class P2PHandler {

    private iceServer: [];

    private static instance: P2PHandler;

    private signaling: Signaling;
    
    private roomReadyCallback: (suc: boolean, message?: string) => void;

    private errorCallback:     (error: string ) => void;

    private connectiontStateCallback: (person_id: number, state: any) => void;

    private websocketConnectionIssueCallback: (ev: Event) => void;

    private onTrackReceived: (person_id: number, ev: RTCTrackEvent) => void;

    private notify:  (message: string) => void;

    private onOpenCallback: () => void;

    private onOrder: (order: string) => void;

    private onNewConnection: (con: RTCPeerConnection, person_id: number) => void;

    private statusHistory: Array<string>;

    private errorHistory: Array<string>;

    private canReqestRoom: boolean;

    private canEnterRoom: boolean;
    
    private negoiatation: Map<number, {polite: boolean, sendingOffer: boolean}>;

    public constructor() {
        this.connections = new Map<number, RTCPeerConnection>();
        this.negoiatation = new Map<number, {polite: boolean, sendingOffer: boolean}>;
        this.initialized = false;
        this.canEnterRoom = false;
        this.canReqestRoom = false;
        this.errorHistory = [];
        this.statusHistory = [];
    }

    public connections: Map<number, RTCPeerConnection>;
    public initialized: boolean;

    setErrorCallback(method:  (error: string ) => void) {
        this.errorCallback = method;
    }

    setNotify(method: (message: string) => void) {
        this.notify = method; 
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

    setOnTrackcallback(method: (person_id: number, ev: RTCTrackEvent) => void) {
        this.onTrackReceived = method;
    }

    setOnOrdercallback(method: (order: string) => void) {
        this.onOrder = method;
    }

    setOnNewConnectioncallback(method: (con: RTCPeerConnection, person_id: number) => void) {
        this.onNewConnection = method;
    }
    
    private async setupConnection(person_id: number) : Promise<RTCPeerConnection>{
        const connection = await new RTCPeerConnection({iceServers: this.iceServer.splice(3, 2)});

        this.negoiatation.set(person_id, {polite: person_id > Storage.getInstance().getPersonID(), sendingOffer: false});

        connection.onicecandidate = (ev: RTCPeerConnectionIceEvent) => {
            if(ev.candidate) {
                this.signaling.sendIceCandidate({type: "send_ice_candidate_to_peers", candidate: ev.candidate, person_id_receive: person_id});
            }
        }
        
        connection.addEventListener('connectionstatechange', (event: Event) => {
            console.log(connection.connectionState, person_id);
            if(connection.connectionState === "closed") {
                this.connections.delete(person_id);
            }
            this.connectiontStateCallback(person_id, connection.connectionState);
        });

        connection.onnegotiationneeded = (ev: Event) => {
            try{
                this.negoiatation.get(person_id).sendingOffer = true;
                this.sendSingleOffer(person_id);
            } catch(err: any) {
                this.errorCallback(err.cause);
            } finally {
                this.negoiatation.get(person_id).sendingOffer = false;
            }
        };

        connection.oniceconnectionstatechange = () => {
            if(connection.connectionState === 'failed') {
                connection.restartIce();
            }
        }

        //ts-ignore
        connection.ontrack = (ev: RTCTrackEvent) => {
            this.onTrackReceived(person_id, ev);
        }

        return Promise.resolve(connection);
    }

    ignoreRequest(person_id: number): boolean {
        return  this.negoiatation.has(person_id) && 
               !this.negoiatation.get(person_id).polite && 
              ( this.negoiatation.get(person_id).sendingOffer || this.connections.get(person_id).signalingState !== 'stable');
    }

    disconnect() {
        if(this.signaling) {
            this.signaling.disconnect();
        }
    }

    async init(person_id: number) {
        if(!this.initialized) {
            this.iceServer = await getIceServer();

            this.signaling = new Signaling();

            this.signaling.addOnOpenListener(this.onOpenCallback);

            this.signaling.addOnErrorListener((error: string) => {
                console.log(error);
                this.errorHistory.push(error);

                switch(error) {
                    case "no_access_to_room": {
                        this.canEnterRoom = false;
                        this.roomReadyCallback(false, error);
                    } break;
                    default: this.errorCallback(error);
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
                    default: this.notify(status);
                }
                this.statusHistory.push(status);
            });

            this.signaling.addOnRoomInfoListener( async (userList: number[]) =>  {
                this.roomReadyCallback(true);

                this.canEnterRoom = true;

                for(const o of userList) {
                    const connection = await this.setupConnection(o);
                    this.connections.set(o, connection);

                    this.onNewConnection(connection, o);
                }
            });
            
            this.signaling.addAnswerListener(async (answer: RTCSessionDescriptionInit, person_id: number) => {
                this.notify(`anser received from person ${person_id}`);

                if(this.connections.has(person_id)) {
                    const connection = this.connections.get(person_id);
                    const remoteDescr = new RTCSessionDescription(answer);

                    await connection.setRemoteDescription(remoteDescr);

                    this.connections.set(person_id, connection);
                }
            });

            this.signaling.addIceCandidateListener(async (candidate: RTCIceCandidateInit | RTCIceCandidate, person_id: number) => {
                this.notify(`ice candidate received from person ${person_id}`);
                
                if(this.connections.has(person_id)) {
                    const connection = this.connections.get(person_id);
                    try {                  
                        //@ts-ignore
                        candidate.usernameFragment = null;
                        await connection.addIceCandidate(candidate);
                        this.connections.set(person_id, connection);
                    } catch(err: any) {
                        console.log(`error setting ice candidate for ${person_id}, error: ${err}`);
                    }
                }
            });

            this.signaling.addOfferListener(async (offer: RTCSessionDescriptionInit, person_id: number) => {
                this.notify(`offer received from person ${person_id}`);
                
                if(this.ignoreRequest(person_id)) {
                    console.log("Ignoring request", this.negoiatation);
                    return;
                }

                const connection = await this.setupConnection(person_id);
                const sessionDesc = new RTCSessionDescription(offer);

                await connection.setRemoteDescription(sessionDesc);

                //const answer = await connection.createAnswer();
                await connection.setLocalDescription();


                this.connections.set(person_id, connection);
                
                this.onNewConnection(connection, person_id);

                this.signaling.sendAnswer({type: "accept_offer_from_peer", answer: connection.localDescription});

            });

            this.signaling.addOrderListener((order: string) => {
                switch (order) {
                    case "disconnect": {
                        this.onOrder(order);
                        for(const o of this.connections) {
                            o[1].close();
                        }
                        this.connections.clear();
                    }
                    break;
                    default: this.onOrder(order);
                }
            })

            this.signaling.connect(person_id);

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

    async sendSingleOffer(person_id: number) {
        if(!this.canEnterRoom) {
            throw new Error('Room not ready');
        }

        if(this.connections.size > 0 ){
            const connection = this.connections.get(person_id);
            //const offer = await connection.createOffer();         

            await connection.setLocalDescription();

            this.signaling.sendSingleOffer({type: "send_offer_to_single_peers", offer: connection.localDescription, person_id_receive: person_id});
        }
    }

    async sendOffer() {
        if(!this.canEnterRoom) {
            throw new Error('Room not ready');
        }
        const descriptionSet = false;
        let   offer: RTCSessionDescriptionInit;

        if(this.connections.size > 0 ){
            for(const o of this.connections) {
                await o[1].setLocalDescription();
                if(!descriptionSet) {
                    offer = o[1].localDescription
                }
            }
            this.signaling.sendOffer({type: "send_offer_to_peers", offer: offer});
        }
    }

    sendMessage(message: string) {
        this.signaling.sendMessage({type: "message", message: message});
    }
}