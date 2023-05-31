import React from "react";
import { MainBox, HeaderBox, MiddleHeading } from "src/Style/baseStyle.css";

interface IProps {
    room_id: number;
}

interface IState {

}

export class EntryComponent extends React.Component<IProps, IState> {


        render() {
            return(
                <MainBox>
                    <HeaderBox>
                        <img src="/ecocare_health_logo.png" />
                    </HeaderBox>
                    <HeaderBox style={{justifyContent: 'center'}}>
                        <MiddleHeading>
                            Ecocare Video Consultation
                        </MiddleHeading>
                    </HeaderBox>
                </MainBox>
            )
        }
}