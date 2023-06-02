import React, { FunctionComponent, ReactElement } from "react";
import { DeviceEntry, InnerOverlay, PlaceableOverlay } from "../Style/overlayStyles.css";
import { StyledLine } from "../Style/baseStyle.css";


interface IProps {
    deviceList: Array<MediaDeviceInfo>
    pos: {x: string, y:string, height: string}
}

export const DeviceOverlay: FunctionComponent< IProps> = (props: IProps) => { 

        function generateList(type: string ): Array<ReactElement> {
            const out = [];
            for(const o of props.deviceList) {
                if(o.kind === type) {
                    
                    out.push(<DeviceEntry> {`${o.label}`}</DeviceEntry>)
                }
            }
            return out;
        }
        console.log(props.deviceList);
        return(
            <PlaceableOverlay 
                onClick={(ev: React.SyntheticEvent) => {
                    ev.stopPropagation();
                    ev.preventDefault();
                }}
                x={props.pos.x} y={props.pos.y} height={props.pos.height}>
                <InnerOverlay> 
                    <StyledLine />
                    <div style={{marginBottom: '4px', fontWeight: 550}}> Audio In:</div> 
                        {
                            generateList("audioinput")
                        }
                    <StyledLine />
                    <div style={{marginBottom: '4px', fontWeight: 550}}> Audio Out:</div> 
                        {
                            generateList("audiooutput")
                        }
                    <StyledLine />
                    <div style={{marginBottom: '4px', fontWeight: 550}}> Video in:</div> 
                        {
                            generateList("videoinput")
                        }
                    <StyledLine />
                </InnerOverlay>

            </PlaceableOverlay>
        );
    
}