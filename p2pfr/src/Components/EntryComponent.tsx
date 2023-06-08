import React, { SyntheticEvent } from "react";
import { MainBox, HeaderBox, MiddleHeading, ContentBox, ErrBox, SmallHeading, SettingsBox, HoverBox, VideoPreviewBox } from "../Style/baseStyle.css";
import { theme } from "../Style/theme";
import { Input } from "../Elements/input";
import { Storage } from "../Helper/storage";
import { audioOff, audioOn, cameraOff, cameraOn, settings } from "../Helper/icons";
import { DeviceOverlay } from "../Overlays/deviceOverlay";
import { P2PHandler } from "../Signaling/p2pHandler";
import { Button } from "../Elements/button";
import { Navigate } from "react-router";
import withRouter from "../hocs/withRouter";
import { VideoChatComponent } from "./VideoChatComponents";

interface IProps {
    room_id: number;
    person_id: number;
}

interface IState {
    cam: boolean;
    audio: boolean;
    name?: string;
    settings: {};
    stream?: MediaStream,
    devices?: Array<MediaDeviceInfo>
    mediaAvailable?: boolean;
    socketAvailable?: boolean;
    showDeviceMenu?: boolean;
    devicePos?: {x: string; y: string; height: string};
    error?: string;
    canStart: boolean;
}

class EntryComponent extends React.Component<IProps, IState> {

        private devicEntryHeight = 22;
        private deviceOverlayOffset= 100;

        p2pHandler: P2PHandler;
   
        constructor(props: IProps) {
            super(props);
            console.log(props);

            this.p2pHandler = new P2PHandler();

            Storage.getInstance().setPersonID(props.person_id);
            Storage.getInstance().setRoomID(props.room_id);
            Storage.getInstance().setP2pHandler(this.p2pHandler);

            this.state={
                cam  : true,
                audio: true,
                mediaAvailable: true,
                name: "",
                settings: {},
                devices: [],
                socketAvailable: false,
                canStart: false
            }


            this.p2pHandler.setWebsocketConnectionIssueCallback((ev: Event) =>{
                console.log(ev);
                this.setState({
                    error: "Error connecting to Websocket",
                    socketAvailable: false
                })
            })

            this.p2pHandler.setonOpenCallback(() => {
                this.setState({
                    error: undefined,
                    socketAvailable: true
                })
            })
            
            this.p2pHandler.init(this.props.person_id);

            this.onStart = this.onStart.bind(this);
        }

        onStart() {
            Storage.getInstance().setUsername(this.state.name);
            Storage.getInstance().setCamAndAudio({audio: this.state. audio, cam: this.state.cam});

            this.p2pHandler.setWebsocketConnectionIssueCallback(() => null )

            this.p2pHandler.setonOpenCallback(() => null );

            this.setState({
                canStart: true
            })
            
        }

        componentDidMount(): void {
            this.handleMedia();
        }


        async handleMedia(constraints = {audio: true, video: true}) {
            
            if(!('mediaDevices' in navigator) || !navigator.mediaDevices.getUserMedia) {
                this.setState( {
                    mediaAvailable: false,
                    error: "Your browser doesnt Support Media types"
                })
                return;
            }
            try{
                const stream: MediaStream = await navigator.mediaDevices.getUserMedia(constraints);
                const devices: MediaDeviceInfo[] = await navigator.mediaDevices.enumerateDevices();
                
                Storage.getInstance().setMediaDeviceAndStream({devices: devices, stream: stream});

                this.setState({
                    stream: stream,
                    devices: devices,
                    mediaAvailable: true
                }, () => {
                    const video = document.querySelector('video');
                    video.srcObject = this.state.stream;
                })
            } catch(err: any) {
                console.log(err);
                this.setState({
                    mediaAvailable: false,
                    error: "No Media Permission received"
                })
            }
        }

        render() {
            if(this.state.canStart) {
                return <VideoChatComponent />
            }
            return(
                <MainBox onClick={() => {
                    this.setState({showDeviceMenu: false})
                }}>
                    {this.state.showDeviceMenu? <DeviceOverlay deviceList={this.state.devices} pos={this.state.devicePos}/> : null}
                    <HeaderBox>
                        <img style={{maxWidth: '400px'}} src="/ecocare_health_logo.png" />
                    </HeaderBox>
                    <HeaderBox style={{justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bodys.footer_background}}>
                        <MiddleHeading>
                            Ecocare Video Consultation
                        </MiddleHeading>
                    </HeaderBox>
                    
                        {this.props.room_id < 0 ? 
                            <ErrBox>
                                Room ID missing
                            </ErrBox>
                        :<ContentBox>
                            <VideoPreviewBox>
                                <video style={{border: `2px solid ${theme.font.heading_color}`, borderRadius: '4px', maxWidth: '40%'}}
                                    autoPlay={true}
                                />
                            </VideoPreviewBox>
                            <SmallHeading>
                                Select Consultation Settings
                            </SmallHeading>
                            <div style={{width: '350px'}}>
                                <Input 
                                    id="video_conference_name_input"
                                    callback={(value: {id:string, text: string}) => {
                                            this.setState({
                                                name: value.text
                                            })
                                        }}
                                    label="Enter your name"
                                    placeholder="Name" />
                            </div>
                            <SettingsBox>
                                <HoverBox onClick={() => {

                                    const stream = this.state.stream;
                                    if(stream != null) {
                                        stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled
                                    }
                                    this.setState({
                                        audio: !this.state.audio && this.state.mediaAvailable,
                                        stream: stream
                                    })
                                }}>
                                      {this.state.audio ? audioOn() : audioOff()}
                                </HoverBox>
                                <HoverBox onClick={() => {
                                    const stream = this.state.stream;
                                    if(stream != null) {
                                        
                                        stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled
                                    }
                                    this.setState({
                                        cam: !this.state.cam && this.state.mediaAvailable,
                                        stream: stream
                                    })
                                }}>
                                    {this.state.cam ? cameraOn() : cameraOff()}
                                </HoverBox>
                                <HoverBox id="settingsbox"
                                    onClick={(event: SyntheticEvent) => {
                                    event.stopPropagation();
                                    const el = document.getElementById("settingsbox");
                                    const box = el.getBoundingClientRect();

                                    this.setState({
                                        showDeviceMenu: true,
                                        devicePos: {x     : `${box.x}px`, 
                                                    y     : `${box.y - ( this.state.devices.length * this.devicEntryHeight  ) - this.deviceOverlayOffset}px`, 
                                                    height: `${(         this.state.devices.length * this.devicEntryHeight  ) + this.deviceOverlayOffset}px`}
                                    })
                                }}>
                                    {settings()}
                                </HoverBox>
                            </SettingsBox>
                            <Button disabled={!this.state.mediaAvailable || !this.state.socketAvailable} text={"Start"} onClick={this.onStart}/>
                            <ErrBox>
                                {this.state.error}
                            </ErrBox>
                        </ContentBox>
                         }
                </MainBox>
            )
        }
}

export default withRouter(EntryComponent);