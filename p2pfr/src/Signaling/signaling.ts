import {Offer, Answer, RecIceCandidate, RequestRoom, SingleOffer, RawMessage} from './interfaces.ts'

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

    disconnect() {
        this.ws.close();
    }
    
    connect(person_id?: number) {
        const addString = person_id == null && process.env.REACT_APP_APP_ENV === 'prod' ? `` : `?person_id=${person_id}`;
        
        const host = process.env.REACT_APP_WEBSOCKET_HOST + addString; //only for dev, in prod this comes from aws tocken.
        this.ws = new WebSocket(host);

        this.ws.onerror = (ev: Event) => {
            console.log(ev);
            this.onWebSocketError(ev);
        };

        this.ws.onopen = (_ev: Event) => {
            this.onOpen();
        };

        this.ws.onclose = (ev: CloseEvent) => {
            this.onClose(ev.reason);
        };

        this.ws.onmessage = (ev: MessageEvent<string>) => {
            const data = ev.data;
            try{
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
            } catch(err: any) {
                console.log('invalid message ', err, data);
            }
        };
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
        if(this.ws.readyState === 1) {
            this.ws.send(JSON.stringify(roomRequest));
        }
    }

    sendOffer(offer: Offer) {
        if(this.ws.readyState === 1) {
            this.ws.send(JSON.stringify(offer));
        }
    }   

    sendSingleOffer(offer: SingleOffer) {
        if(this.ws.readyState === 1) {
            this.ws.send(JSON.stringify(offer));
        }
    }   

    sendAnswer(answer: Answer) {
        if(this.ws.readyState === 1) {
            this.ws.send(JSON.stringify(answer));
        }
    }

    sendIceCandidate(candidate: RecIceCandidate) {
        if(this.ws.readyState === 1) {
            this.ws.send(JSON.stringify(candidate));
        }
    }

    sendMessage(message: RawMessage) {
        console.log(this.ws.readyState);
        if(this.ws.readyState === 1) {
            this.ws.send(JSON.stringify(message));
        }
    }
}