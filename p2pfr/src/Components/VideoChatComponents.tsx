import React, { ReactElement } from "react";
import { BottomArea, OffsetVideoArea, RightMenuArea, VideoArea, VideoHeader, VideoMainGrid } from "../Style/baseStyle.css";
import { P2PHandler } from "../Signaling/p2pHandler";
import { Storage } from "../Helper/storage";

interface IProps {
    room_id: number;
}

interface IState {
    connections: Map<number, RTCPeerConnection>;
    mediaEnabled: {cam: boolean, audio: boolean};
    deviceAndStream: {devices: Array<MediaDeviceInfo>;
                      stream:  MediaStream          };
    username: string;
    error?: string;
}

export class VideoChatComponent extends React.Component<IProps, IState> {
    private p2pHandler = P2PHandler.getInstance();
    
    constructor(props: IProps) {
        super(props);
        const mediaEnabled      = Storage.getInstance().getCamAndAudio();
        const deviceAndStream   = Storage.getInstance().getMediaDeviceAndStream();
        const username          = Storage.getInstance().getUserName();

        this.state = {
            username: username,
            mediaEnabled: mediaEnabled,
            deviceAndStream: deviceAndStream,
            connections: this.p2pHandler.connections
        }
    }

    componentDidMount(): void {
        
        this.p2pHandler.setErrorCallback((error: string) => {
            console.log(error);
            this.setState({
                error: error
            })
        })

        this.p2pHandler.setWebsocketConnectionIssueCallback((ev: Event) => {
            const error = "Websocket connection Issue"
            console.log(error);
            this.setState({
                error: error
            });
        })

        this.p2pHandler.setonOpenCallback(() => {
            this.startConnecting();
        })

        this.p2pHandler.setConnectionStatecallback((person_id: number, state: string) => {

        })

        if(!this.p2pHandler.initialized) {
            this.p2pHandler.init();
        } else {
            this.startConnecting();
        }
    }

    startConnecting() {
        try {
            this.p2pHandler.initRoom(this.props.room_id, (suc: boolean, message: string) => {
                if(suc) {
                    try{
                        this.p2pHandler.sendOffer();
                        this.setState({
                            connections: this.p2pHandler.connections
                        })
                    } catch(error: any) {
                        console.log(error);
                        this.setState({
                            error: error.cause
                        })
                    }
                } else {
                    console.log(message);
                    this.setState({
                        error: message
                    });
                }
            })
        } catch(error: any) {
            console.log(error);
            this.setState({
                error: error.cause
            })
        }
    }

    setupVideoArea() : Array<ReactElement> {
        const out = [];

        return out;
    }

    render(){
        return(
            <VideoMainGrid>
                <VideoHeader>
                    A
                </VideoHeader>
                
                <VideoArea>
                    B
                </VideoArea>

                <OffsetVideoArea>
                    C   
                </OffsetVideoArea>
                
                <RightMenuArea>
                    D
                </RightMenuArea>

                <BottomArea>
                    E
                </BottomArea>
            </VideoMainGrid>

        )
    }
}