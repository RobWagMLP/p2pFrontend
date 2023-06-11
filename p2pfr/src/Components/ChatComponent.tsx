import React, { PureComponent, ReactElement, SyntheticEvent } from "react";
import {  StyledTextField,  ChatWrapper, FileBox, MessageBox, Message, Name, Text, StyledLink } from "../Style/baseStyle.css";
import { ChatMessage } from "../Signaling/interfaces";


interface IProps {
    messages: Array<ChatMessage>;
    files   : Map<string, Blob>;
    onNewMessage: (message: string) => void;
}

const Colors = [
    '#5A5A5A',
    '#00008b',
    '#8b0000',
    '#9400d3',
    '#006400',
    '#d2691e'
]

export class ChatComponent extends PureComponent<IProps> {

    constructor(props: IProps) {
        super(props);
    }

    componentDidMount(): void {
        const el = document.getElementById('chatbox_input_area') as HTMLTextAreaElement;
        el.addEventListener('keyup', (ev: KeyboardEvent) => {
            if(ev.key === 'Enter' && !ev.shiftKey) {
                this.props.onNewMessage(el.value);
                el.value = "";
            }
        })
    }

    getMessageBoxContent() : Array<ReactElement> {
        const out = [];
        out.push(
            <Message>
                    <Name
                        color={'black'}>
                        {"status: "}:
                    </Name>
                    <Text>
                        {"Chat initialized"}
                    </Text>
                </Message>
        )
        for(const o of this.props.messages) {
            out.push(
                <Message>
                    <Name
                        color={Colors[o.name.length%6]}>
                        {o.name}:
                    </Name>
                    <Text>
                        {o.message}
                    </Text>
                </Message>
            )
        }
        return out;
    }

    setUpFiles() : Array<ReactElement> {
        const out = [];
        for(const o of this.props.files) {
            out.push(
                <StyledLink download={o[0]} href={URL.createObjectURL(o[1])}>
                    {o[0]}
                </StyledLink>
            )
        }
        return out;
    }

    render()  {
        return(
            <ChatWrapper>
                <FileBox>
                    {this.setUpFiles()}
                </FileBox>
                <MessageBox>
                    {this.getMessageBoxContent()}
                </MessageBox>
                <StyledTextField
                    placeholder="Type something"
                    id="chatbox_input_area"
                />
            </ChatWrapper>
        )
    }
}