import React, { PureComponent, ReactElement, SyntheticEvent } from "react";
import {  StyledTextField,  ChatWrapper, FileBox, MessageBox, Message, Name, Text } from "../Style/baseStyle.css";


interface IProps {
    messages: Map<string, string>;
    files   : Map<string, Blob>;
    onNewMessage: (message: string) => void;
}

export class ChatComponent extends PureComponent<IProps> {

    constructor(props: IProps) {
        super(props);
    }

    componentDidMount(): void {
        const el = document.getElementById('chatbox_input_area') as HTMLTextAreaElement;
        el.addEventListener('keyup', (ev: KeyboardEvent) => {
            if(ev.key === 'Enter' && !ev.shiftKey) {
                this.props.onNewMessage(el.value);
            }
        })
    }

    getMessageBoxContent() : Array<ReactElement> {
        const out = [];

        for(const o of this.props.messages) {
            out.push(
                <Message>
                    <Name>
                        {o[0]}
                    </Name>
                    <Text>
                        {o[1]}
                    </Text>
                </Message>
            )
        }
        return out;
    }

    render()  {
        return(
            <ChatWrapper>
                <FileBox>

                </FileBox>
                <MessageBox>
                    {this.getMessageBoxContent()}
                </MessageBox>
                <StyledTextField
                    id="chatbox_input_area"
                />
            </ChatWrapper>
        )
    }
}