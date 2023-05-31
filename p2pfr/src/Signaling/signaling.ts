import {Offer, Answer, RecIceCandidate} from './interfaces.ts'

export class Signaling {

    onRecIceCand  : (candidate: RTCIceCandidate   , person_id: number) => void;
    onOffer       : (offer : RTCSessionDescription, person_id: number) => void;
    onAnswer      : (answer: RTCSessionDescription, person_id: number) => void;    
    onOrder       : (order : string                                  ) => void;      
    onStatus      : (status: string                                  ) => void;
    onOpen        : (                                                ) => void;
    onClose       : (reason:string                                   ) => void;
    
    private ws: WebSocket;

    constructor(person_id?: number) {
        const addString = person_id == null && process.env.ENV === 'local' ? `` : `?person_id=${person_id}`;

        const host = process.env.WEBSOCKET_HOST + addString; //only for dev, in prod this comes from aws tocken.

        this.ws = new WebSocket(host);

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
                default: {
                    console.log(`unknown type: ${dataobj.type}`);
                }
            }
        })
    }

    addIceCandidateListener(method: (candidate: RTCIceCandidate , person_id: number  ) => void) {
        this.onRecIceCand = method;
    }

    addOfferListener(method: (offer : RTCSessionDescription, person_id: number) => void) {
        this.onOffer = method;
    }

    addAnswerListener(method: (answer : RTCSessionDescription, person_id: number) => void) {
        this.onAnswer = method;
    }

    addStatusListener(method: (status: string   ) => void) {
        this.onStatus = method;
    }

    addOnOpenListener(method: () => void) {
        this.onOpen = method;
    }

    addOnCloseListener(method: (reason:string) => void) {
        this.onClose = method;
    }

    addOrderListener(method: (order: string   ) => void) {
        this.onOrder = method;
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