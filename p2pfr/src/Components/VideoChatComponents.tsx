import React, { ReactElement, SyntheticEvent } from "react";
import { BottomArea, HoverBox, OffsetVideoArea, RightMenuArea, SmallVideo, VideoArea, VideoElement, VideoHeader, VideoMainGrid } from "../Style/baseStyle.css";
import { P2PHandler } from "../Signaling/p2pHandler";
import { Storage } from "../Helper/storage";
import { audioOn, audioOff, cameraOn, cameraOff, settings, shareScreen, uploadFile, chat, stop } from "../Helper/icons";

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
    screenshared: boolean;
    mainVideoArea: Array<number>;
    offsetVideoArea: Array<number>;
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
            streams: new Map<number, MediaStream>(),
            screenshared: false,
            mainVideoArea: [],
            offsetVideoArea: []
        }
    }

    componentDidMount(): void {
        
        this.p2pHandler.setErrorCallback((error: string) => {
            console.log(error);
            this.setState({
                error: error
            })
        })

        const videoSelf = document.getElementById('video_stream_self') as HTMLVideoElement;
        videoSelf.srcObject = this.state.deviceAndStream.stream;

        //this.initP2P();
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
            console.log(`state ${state} with ${person_id}.`);      

            if(state === "closed") {
                let newArr: Array<number>;

                let isMain: boolean = false;
                let isOffset: boolean = false;

                if(this.state.mainVideoArea.indexOf(person_id ) >= 0) {
                    const arr = this.state.mainVideoArea;
                    newArr = arr.splice(arr.indexOf(person_id), 1);
                    isMain = true;

                } else if (this.state.offsetVideoArea.indexOf(person_id ) >= 0) {
                    const arr = this.state.offsetVideoArea;
                    newArr = arr.splice(arr.indexOf(person_id), 1);
                    isMain = false;
                }
                const streams = this.state.streams;
                
                streams.delete(person_id);
                this.setState({
                    streams: streams,
                    mainVideoArea: isMain? newArr : this.state.mainVideoArea,
                    offsetVideoArea: isOffset ? newArr : this.state.offsetVideoArea
                })
            }
        })

        this.p2pHandler.setOnNewConnectioncallback((con: RTCPeerConnection, person_id) => {
                for(const track of this.state.deviceAndStream.stream.getTracks()) {
                    con.addTrack(track, this.state.deviceAndStream.stream);
                }
                const pushToMain = this.state.mainVideoArea.length < 4 ;
                const arr = pushToMain ? this.state.mainVideoArea : this.state.offsetVideoArea;

                arr.push(person_id);

                this.setState({
                    mainVideoArea: pushToMain ? arr : this.state.mainVideoArea,
                    offsetVideoArea: pushToMain ? this.state.offsetVideoArea : arr
                })
        });

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
                    console.log("room sucessfully initialized")
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

        for(const person_id in this.state.mainVideoArea) {
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

    setupOffsetArea() : Array<ReactElement> { 
        const out = [];
        out.push(
            <SmallVideo 
                id="video_stream_self"
            />
        );
        for(const person_id in this.state.offsetVideoArea) {
            out.push(
                <SmallVideo 
                    id={`video_stream_${person_id}`}
                />
            );
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
                    {this.setupOffsetArea()}   
                </OffsetVideoArea>

                <RightMenuArea>
                    D
                </RightMenuArea>

                <BottomArea>
                    <HoverBox>

                    </HoverBox>
                    <HoverBox onClick={() => {
                        this.onMuteAudio(!this.state.mediaEnabled.audio)
                        }}>
                        {this.state.mediaEnabled.audio ? audioOn() : audioOff()}
                        </HoverBox>
                    <HoverBox onClick={() => {
                        this.onMuteVideo(!this.state.mediaEnabled.cam)
                        }}>
                        {this.state.mediaEnabled.cam ? cameraOn() : cameraOff()}
                    </HoverBox>
                    <HoverBox onClick={(event: SyntheticEvent) => {
                        event.stopPropagation();
                        }}>
                        {settings()}
                    </HoverBox>
                    <HoverBox onClick={(event: SyntheticEvent) => {
                        event.stopPropagation();
                        }}>
                        {shareScreen()}
                    </HoverBox>
                    <HoverBox onClick={(event: SyntheticEvent) => {
                        event.stopPropagation();
                        }}>
                        {uploadFile()}
                    </HoverBox>
                    <HoverBox onClick={(event: SyntheticEvent) => {
                        event.stopPropagation();
                        }}>
                        {chat()}
                    </HoverBox>
                    <HoverBox onClick={(event: SyntheticEvent) => {
                        event.stopPropagation();
                        }}>
                        {stop()}
                    </HoverBox>
                </BottomArea>
            </VideoMainGrid>

        )
    }
}