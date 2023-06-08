import React, { ReactElement, SyntheticEvent } from "react";
import { BottomArea, HoverBox, MenuItemWrapper, OffsetVideoArea, RightMenuArea, SmallVideo, VideoArea, VideoElement, VideoHeader, VideoMainGrid } from "../Style/baseStyle.css";
import { P2PHandler } from "../Signaling/p2pHandler";
import { Storage } from "../Helper/storage";
import { audioOn, audioOff, cameraOn, cameraOff, settings, shareScreen, uploadFile, chat, stop, stopShareScreen } from "../Helper/icons";

interface PeerData {
    name?: string;
    stream?: MediaStream;
    audio?: boolean;
    video?: boolean
}

interface IProps {

}

interface IState {
    connections: Map<number, RTCPeerConnection>;
    streams:      Map<number, PeerData>;
    mediaEnabled: {cam: boolean, audio: boolean};
    deviceAndStream: {devices: Array<MediaDeviceInfo>;
                      stream:  MediaStream          };
    username: string;
    error?: string;
    screenshared: boolean;
    mainVideoArea: Array<number>;
    offsetVideoArea: Array<number>;
    canShareScreen?: boolean;
    screenShared?: boolean;
    senders: Map<number, Array<RTCRtpSender>>;
    screenMedia?: MediaStream;
}

const gridmax = {row: 2, column: 2};

export class VideoChatComponent extends React.Component<IProps, IState> {

    private p2pHandler  = Storage.getInstance().getP2pHandler();
    private maxMainView = 4;

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
            streams: new Map<number, PeerData>(),
            screenshared: false,
            mainVideoArea: [],
            offsetVideoArea: [],
            canShareScreen: true,
            screenShared: false,
            senders: new Map()
        }
    }

    componentDidMount(): void {
        
        this.p2pHandler.setErrorCallback((error: string) => {
            console.log(error);
            this.setState({
                error: error
            })
        })

    
        this.setSelfVideoTrack(this.state.deviceAndStream.stream);

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

        this.p2pHandler.setRoomReadycallback( (suc: boolean, message: string) => {
            if(suc) {
                console.log("room sucessfully initialized")
            } else {
                console.log(message);
                this.setState({
                    error: message
                });
            }
        });

        this.p2pHandler.setOnTrackcallback((person_id: number, ev: RTCTrackEvent) => {
            const streams = this.state.streams;
            const trackType = ev.track.kind;

            console.log(`${trackType} track received from ${person_id}`)

            ev.track.addEventListener("mute", (ev: Event) => {
                if(trackType === 'audio') {
                    this.onMutePeerAudio(false, person_id);
                } else {
                    this.onMutePeerVideo(false, person_id)
                }
            })

            ev.track.addEventListener("unmute", (ev: Event) => {
                if(trackType === 'audio') {
                    this.onMutePeerAudio(true, person_id);
                } else {
                    this.onMutePeerVideo(true, person_id)
                }
            })
         
            const data: PeerData = streams.has(person_id) ? streams.get(person_id) : {};

            data.stream = ev.streams[0];

            console.log(`Amount of Tracks in Stream: ${data.stream.getTracks().length}`);

            if(trackType === 'audio') {
                data.audio = ev.track.enabled;
            } else if(trackType === 'video') {
                data.video = ev.track.enabled
            }
            streams.set(person_id, data);

            const video: HTMLVideoElement = document.getElementById(`video_stream_${person_id}`) as HTMLVideoElement;

            if(video) {
                video.srcObject = data.stream;
            }

            const areas = this.handleVideoPush(person_id);

            console.log(areas.mainVideoArea);

            this.setState({
                streams: streams,
                mainVideoArea: areas.mainVideoArea,
                offsetVideoArea: areas.offsetVideoArea
            })
        })

        this.p2pHandler.setConnectionStatecallback((person_id: number, state: string) => {
            console.log(`state ${state} with ${person_id}.`);      

            if(state === "closed") {

                const areas = this.handleVideoRemove(person_id);

                const streams = this.state.streams;

                streams.delete(person_id);

                this.setState({
                    streams: streams,
                    mainVideoArea: areas.mainVideoArea,
                    offsetVideoArea: areas.offsetVideoArea
                })
            }
        })

        this.p2pHandler.setOnNewConnectioncallback(async (con: RTCPeerConnection, person_id) =>  {

                const stream = this.state.screenShared ? this.state.screenMedia : this.state.deviceAndStream.stream;

                const senders = this.setSingleStream(con, stream);
                
                const areas = this.handleVideoPush(person_id)

                const senderMap = this.state.senders;

                senderMap.set(person_id, senders);

                this.setState({
                    mainVideoArea: areas.mainVideoArea,
                    offsetVideoArea: areas.offsetVideoArea,
                    senders: senderMap
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
            this.p2pHandler.init(Storage.getInstance().getPersonID());
        } else {
            this.startConnecting();
        }
    }

    handleVideoPush(person_id: number): {mainVideoArea: Array<number>, offsetVideoArea: Array<number>} {
        const out = {mainVideoArea: this.state.mainVideoArea, offsetVideoArea: this.state.offsetVideoArea};

        if(out.mainVideoArea.indexOf(person_id) > -1 || out.offsetVideoArea.indexOf(person_id) > -1) {
            return out;
        }
        if(out.mainVideoArea.length >= this.maxMainView) {
            out.offsetVideoArea.push(person_id)
        } else {
            out.mainVideoArea.push(person_id)
        }

        return out;
    }

    handleVideoRemove(person_id: number): {mainVideoArea: Array<number>, offsetVideoArea: Array<number>} {
        const out = {mainVideoArea: this.state.mainVideoArea, offsetVideoArea: this.state.offsetVideoArea};

        const idxMain = out.mainVideoArea.indexOf(person_id);
        const idxOff  = out.offsetVideoArea.indexOf(person_id);

        if(idxMain > -1) {
            out.mainVideoArea.splice(idxMain, 1);
            if(out.offsetVideoArea.length > 0) {
                out.mainVideoArea.push(out.offsetVideoArea.pop());
            }
        } else if(idxOff > -1) {
            out.offsetVideoArea.splice(idxOff, 1);
        } else {
            return out;
        }

        return out;
    }

    onMutePeerAudio(audio: boolean, person_id: number) {

    }

    onMutePeerVideo(video: boolean, person_id: number) {
        
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
            this.p2pHandler.initRoom(Storage.getInstance().getRoomID());          
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

        for(const person_id in this.state.mainVideoArea) {
            out.push(
                <VideoElement
                    colspan={colspan}
                    rowspan={rowspan}
                    row={j}
                    column={i}
                    id={`video_stream_${person_id}`}
                    autoPlay={true}
                     />
            );
            if( i >= gridmax.column) {
                i = 1;
                ++j;
            } else {
                ++i;
            }
        }
        return out;
    }

    setupOffsetArea() : Array<ReactElement> { 
        const out = [];

        out.push(
            <SmallVideo 
                id="video_stream_self"
                autoPlay={true}
            />
        );

        for(const person_id in this.state.offsetVideoArea) {
            out.push(
                <SmallVideo 
                    id={`video_stream_${person_id}`}
                    autoPlay={true}
                />
            );
        }
        return out;
    }

    removeTracks(connection: RTCPeerConnection, person_id: number) {
        if(!this.state.senders.has(person_id)) {
            return;
        }
        
        for(const sender of this.state.senders.get(person_id) ) {
            connection.removeTrack(sender);
        }
    }

    swapVideoStreams(stream: MediaStream) {
        const senderMap = this.state.senders;

        for(const senderList of senderMap) {

            for(const sender of senderList[1]) {
                if(sender.track.kind === 'video') {
                    sender.replaceTrack(stream.getVideoTracks()[0]);
                }
            }
        }
    }

    setSingleStream(connection: RTCPeerConnection, stream: MediaStream): Array<RTCRtpSender> {
        const out = [];

        for(const track of stream.getTracks()) {
            out.push(connection.addTrack(track, stream));
        }

        return out;
    }

    setSelfVideoTrack(stream: MediaStream) {
        const videoSelf     = document.getElementById('video_stream_self') as HTMLVideoElement;
        
        const videoStream = new MediaStream();

        videoStream.addTrack(stream.getVideoTracks()[0]);

        videoSelf.srcObject = videoStream;

    }

    async handleScreenShare(share: boolean) {

        if(share) {
            let captureStream;

            try {
                captureStream = await navigator.mediaDevices.getDisplayMedia({audio: true, video: true});

                this.setSelfVideoTrack(captureStream);

                this.swapVideoStreams(captureStream);

                this.setState( {
                    screenShared: true,
                    screenMedia: captureStream
                })

            } catch(err: any) {
                console.log(err);
                this.setState({
                    error: err.cause
                })
            }
        } else {
            this.setSelfVideoTrack(this.state.deviceAndStream.stream);

            this.swapVideoStreams(this.state.deviceAndStream.stream);

            this.setState( {
                screenShared: false,
            })
        }
    }
        

    render(){
        console.log(this.state.screenShared);
        return(
            <VideoMainGrid>
                <VideoHeader>
                    <img style={{maxWidth: '200px', marginLeft: '16px'}} src="/ecocare_health_logo.png" />
                </VideoHeader>
                
                <VideoArea>
                    
                </VideoArea>

                <OffsetVideoArea>
                    {this.setupOffsetArea()}   
                </OffsetVideoArea>

                <RightMenuArea>
                    
                </RightMenuArea>

                <BottomArea>
                    <MenuItemWrapper>
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
                                if(this.state.canShareScreen) {
                                    this.handleScreenShare(!this.state.screenShared)
                                }
                            }}>
                            {this.state.screenShared || !this.state.canShareScreen ? stopShareScreen() : shareScreen()}
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
                    </MenuItemWrapper>
                </BottomArea>
            </VideoMainGrid>

        )
    }
}
