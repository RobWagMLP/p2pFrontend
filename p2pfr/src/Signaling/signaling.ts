import {Offer, Answer, RecIceCandidate, RequestRoom} from './interfaces.ts'

export class Signaling {

    onRecIceCand    : (candidate: RTCIceCandidate   , person_id: number) => void;
    onRoomInfo      : (userList:  Array<number>                        ) => void;
    onOffer         : (offer : RTCSessionDescriptionInit, person_id: number) => void;
    onAnswer        : (answer: RTCSessionDescriptionInit, person_id: number) => void;    
    onOrder         : (order : string                                  ) => void;      
    onStatus        : (status: string                                  ) => void;
    onOpen          : (                                                ) => void;
    onClose         : (reason:string                                   ) => void;
    onError         : (error:string                                    ) => void;
    onWebSocketError : (ev: Event                                       ) => void;
    
    private ws: WebSocket;

    constructor() {

    }
    
    connect(person_id?: number) {
        const addString = person_id == null && process.env.ENV === 'prod' ? `` : `?person_id=${person_id}`;

        const host = process.env.WEBSOCKET_HOST + addString; //only for dev, in prod this comes from aws tocken.

        this.ws = new WebSocket(host);
    
        //@ts-ignore
        this.ws.onerror((ev: Event) => {
            this.onWebSocketError(ev);
        })

        //@ts-ignore
        this.ws.onopen((_ev: Event) => {
            this.onOpen();
        })

        //@ts-ignore
        this.ws.onclose((ev: CloseEvent) => {
            this.onClose(ev.reason);
        })

        //@ts-ignore
        this.ws.onmessage((ev: MessageEvent<string>) => {
            const data = ev.data;
            const dataobj = JSON.parse(data);

            switch(dataobj.type) {
                case "status": {
                    this.onStatus(dataobj.status)
                }
                break;
                case "offer": {
                    this.onOffer(dataobj.offer, dataobj.person_id);
                }
                break;
                case "answer": {
                    this.onAnswer(dataobj.answer, dataobj.person_id);
                }
                break;
                case "ice_candidate": {
                    this.onRecIceCand(dataobj.candidate, dataobj.person_id);
                }
                break;
                case "order": {
                    this.onOrder(dataobj.order);
                }
                break;
                case "error": {
                    this.onError(dataobj.error);
                }
                break;
                case "room_info": {
                    this.onRoomInfo(dataobj.userlist);
                }
                break;
                default: {
                    console.log(`unknown type: ${dataobj.type}`);
                }
            }
        })
    }

    addIceCandidateListener(method: (candidate: RTCIceCandidate , person_id: number  ) => void) {
        this.onRecIceCand = method;
    }

    addOfferListener(method: (offer : RTCSessionDescriptionInit, person_id: number) => void) {
        this.onOffer = method;
    }

    addAnswerListener(method: (answer : RTCSessionDescriptionInit, person_id: number) => void) {
        this.onAnswer = method;
    }

    addStatusListener(method: (status: string   ) => void) {
        this.onStatus = method;
    }

    addOnOpenListener(method: () => void) {
        this.onOpen = method;
    }

    addOnErrorListener(method: (error: string) => void) {
        this.onError = method;
    }

    addOnCloseListener(method: (reason:string) => void) {
        this.onClose = method;
    }

    addOrderListener(method: (order: string   ) => void) {
        this.onOrder = method;
    }

    addOnRoomInfoListener(method: (userList: Array<number>   ) => void) {
        this.onRoomInfo = method;
    }

    addonWebSocketErrorListener(method: (ev: Event   ) => void) {
        this.onWebSocketError = method;
    }


    sendRoomRequest(roomRequest: RequestRoom) {
        this.ws.send(JSON.stringify(roomRequest));
    }

    sendOffer(offer: Offer) {
        this.ws.send(JSON.stringify(offer));
    }   

    sendAnswer(answer: Answer) {
        this.ws.send(JSON.stringify(answer));
    }

    sendIceCandidate(candidate: RecIceCandidate) {
        this.ws.send(JSON.stringify(candidate));
    }
}