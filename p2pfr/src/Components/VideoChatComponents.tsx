import React, { ReactElement } from "react";
import { BottomArea, OffsetVideoArea, RightMenuArea, VideoArea, VideoElement, VideoHeader, VideoMainGrid } from "../Style/baseStyle.css";
import { P2PHandler } from "../Signaling/p2pHandler";
import { Storage } from "../Helper/storage";

interface IProps {
    room_id: number;
}

interface IState {
    connections: Map<number, RTCPeerConnection>;
    streams:      Map<number, MediaStream>;
    mediaEnabled: {cam: boolean, audio: boolean};
    deviceAndStream: {devices: Array<MediaDeviceInfo>;
                      stream:  MediaStream          };
    username: string;
    error?: string;
}

const gridmax = {row: 2, column: 2};

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
            connections: this.p2pHandler.connections,
            streams: new Map<number, MediaStream>()
        }
    }

    componentDidMount(): void {
        
        this.p2pHandler.setErrorCallback((error: string) => {
            console.log(error);
            this.setState({
                error: error
            })
        })
        this.initP2P();
    }

    initP2P() {
        this.p2pHandler.setNotify((message: string) => {
            console.log(message);
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
        });

        this.p2pHandler.setOnTrackcallback((person_id: number, ev: RTCTrackEvent) => {
            const streams = this.state.streams;
     
            const stream: MediaStream = ev.streams[0];
            streams.set(person_id, stream);

            const video: HTMLVideoElement = document.getElementById(`video_stream_${person_id}`) as HTMLVideoElement;
            if(video) {
                video.srcObject = stream;
            }

            this.setState({
                streams: streams
            })
        })

        this.p2pHandler.setConnectionStatecallback((person_id: number, state: string) => {
            if(state === "connected") {
                console.log(`connected to ${person_id}. Sending Stream`);

                const connections = this.state.connections;
                const connection = connections.get(person_id);
                for(const track of this.state.deviceAndStream.stream.getTracks()) {
                    connection.addTrack(track, this.state.deviceAndStream.stream);
                }
            }

        })

        this.p2pHandler.setOnOrdercallback((order: string) => {
            if(order === "disconnect") {
                this.setState({
                    error: "Connections closed due to Server request -> Room closed"
                })
            } else{
                console.log(order);
            }
        })

        if(!this.p2pHandler.initialized) {
            this.p2pHandler.init();
        } else {
            this.startConnecting();
        }
    }

    onMuteAudio(audio: boolean) {
        const stream = this.state.deviceAndStream.stream;
        stream.getAudioTracks()[0].enabled = audio;
        this.setState({
            mediaEnabled: {cam: this.state.mediaEnabled.cam, audio: audio}
        });
        
    }

    onMuteVideo(video: boolean) {
        const stream = this.state.deviceAndStream.stream;
        stream.getVideoTracks()[0].enabled = video;
        this.setState({
            mediaEnabled: {cam: video, audio: this.state.mediaEnabled.audio}
        });
        
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
        const participans = this.state.connections.size;
        const colspan = participans > 1 ? 1: 2;
        const rowspan = participans > 1 ? 1: 2;
 
        let i = 1, j = 1;
        let count = 0;

        for(const person_id in this.state.connections) {
            if(count >= gridmax.row*gridmax.column) {
                break;
            }
            out.push(
                <VideoElement
                    colspan={colspan}
                    rowspan={rowspan}
                    row={j}
                    column={i}
                    id={`video_stream_${person_id}`}
                     />
            );
            if( i >= gridmax.column) {
                i = 1;
                ++j;
            } else {
                ++i;
            }
            ++count;
        }
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