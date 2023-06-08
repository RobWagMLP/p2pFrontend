import styled from "styled-components";
import {theme} from './theme';

export const MainBox = styled.div`
    margin: ${theme.margins.global_margin};
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: ${theme.font.base_color}
`;

export const MiddleHeading = styled.div`
    color: white;
    font-weight:${theme.font.heading_font_weight};
    font-size: ${theme.font.heading_font_size};
    line-height: 44px;
    text-align: center;
    margin: ${theme.margins.space_margin};
    display: flex;
    align-items: center;
    font-family: Helvetica Neue,sans-serif;
`;

export const SmallHeading = styled.div`
    color: ${theme.font.heading_color};
    font-weight: 400;
    font-size: ${theme.font.heading_small_size};
    line-height: 32px;
    text-align: center;
    margin: ${theme.margins.space_margin};
    display: flex;
    align-items: center;
    font-family: ${theme.font.font_family};
`;

export const StyledInput = styled.input`
    border: 0;
    border-bottom: 2px solid ${theme.font.base_color};
    width: 50%;
    font-size: 18px;
    line-height: 20px;
    height: 20px;
    text-align: center;
    padding: 10px;
    background: transparent;
    color: ${theme.font.heading_color};
    :focus {
         outline: 0;
         color: ${theme.font.base_color};
    }
`;

export const StyledTextField = styled.textarea`
    border: 0;
    border-bottom: 2px solid ${theme.font.base_color};
    width: 100%;
    font-size: 18px;
    line-height: 20px;
    height: 20px;
    text-align: center;
    padding: 10px;
    background: transparent;
    height: 20%;
    color: ${theme.font.heading_color};
    :focus {
         outline: 0;
         color: ${theme.font.base_color};
    }
`;

export const ChatWrapper = styled.div`
    display: flex;
    flex-direction: column;
    margin: 8px;
`;

export const FileBox = styled.div`
    margin: 4px;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    height: 20%;
`;

export const MessageBox = styled.div`
    height: 60%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    border: 2px solid ${theme.font.heading_color};
    border-radius: 4px;
    box-shadow: inset 0.3em 0.3em 0.9em ${theme.font.base_color};
`;

export const Message = styled.div`
    display: flex;
    flex-direction: column;
`;

export const Name = styled.div`
    width: 30%;
    overflow: visible;
    overflow-wrap: normal;
`;

export const Text = styled.div`
    width: 70%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
`;


export const KeyValueWrapper = styled.div`
    display: flex;
    margin: ${theme.margins.base_margin};
    width: 100%;
`;

export const KeyText = styled.div`
    font-weight: 300;
    font-size: 18px;
    color: ${theme.font.base_color};
    line-height: 20px;
    width: 50%;
    padding: 10px;
`;

export const HeaderBox = styled.div`
    height: 100px;
    width: 100%;
    display: flex;
    margin-bottom: 32px;
`;

export const ContentBox = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: calc(100vh - 400px);
    flex-wrap: nowrap;
    overflow-y: hidden;
    overflow-x: hidden;
    min-height: 700px;
`;

export const SettingsBox = styled.div`
    height: 80px;
    width: 450px;
    border: 1px solid ${theme.font.heading_color};
    border-radius: 4px;
    display: flex;
    justify-Content: center;
    align-items: center;
`;

export const ErrBox = styled.div`
    font-size: 30px;
    font-color: ${theme.font.error_color}
    font-weight: 400;
`;

export const Footer = styled.div`
    height: 100px;
    background-color: ${theme.font.base_color};
`;

export const Window = styled.div`
    width: 100%;

`;

export const HoverBox = styled.div`
    width: 32px;
    height: 32px;
    margin: 16px;
    :hover {
        cursor: pointer;
        svg {
            fill: ${theme.font.heading_color};
        }
    }
`;


export const VideoPreviewBox = styled.div`
    margin: 16px;
    display: inline-block;
    width: 100%;
`;

export const StyledLine = styled.div`
    width: 100%;
    height: 2px;
    background-color: white;
    margin-top: 8px;
    margin-bottom: 8px;
`;

export const StyledButton = styled.div<{disabled? : boolean}>`
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    width: 220px;
    height: 40px;
    background-color: ${props => props.disabled ? '#d3d3d3' : theme.font.heading_color};
    color: white;
    text-align: center;
    vertical-align: center;
    margin: 16px;
    border: 2px solid ${theme.font.base_color};
    font-weight: 500;
    border-radius: 4px;
    font-family: ${theme.font.font_family};
    :hover {
        background-color: ${props => props.disabled ? '#d3d3d3' : theme.font.base_color};
    }
`;

export const VideoMainGrid = styled.div`
    display: grid;
    grid-template-columns: [first]   80% [line-2] 10% [line-3] 10% [end];
    grid-template-rows   : [first-r] 5% [row-2] 85% [row-3] 10% [end-row];
    background-color: ${theme.font.base_color};
    height: 100vh;
    width: 100vw;
`;

export const VideoHeader = styled.div`
    grid-column-start: 1;
    grid-column-end: 4;
    border: 4px solid ${theme.font.heading_color};
    display: flex;
    justify-content: flex-start;
    align-items: center;
    background-color: white;
    border-radius: 4px;
`;

export const BottomArea = styled(VideoHeader)`
    grid-column-start: 1;
    grid-column-end: 4;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    border: 2px solid ${theme.font.heading_color};
    background-color: ${theme.font.base_color};
`;

export const VideoArea = styled.div`
    display: grid;
    grid-template-rows: 50% 50%;
    grid-template-column: 50% 50%;
    border-left: 2px solid ${theme.font.heading_color};
`;

export const OffsetVideoArea = styled.div`
    display: flex;
    aling-items: center;
    flex-direction: column;
    padding: 8px;
    border-left: 2px solid ${theme.font.heading_color};
    overflow-y: auto;
`;


export const RightMenuArea = styled.div`
    border-left: 2px solid ${theme.font.heading_color};
    border-right: 2px solid ${theme.font.heading_color};
`;

export const VideoElement = styled.video<{row: number, column: number, rowspan: number, colspan: number}>`
    grid-column-start: ${props => props.column};
    grid-column-end:   ${props => props.column + props.colspan};
    grid-row-start: ${props => props.row};
    grid-row-end:   ${props => props.row + props.rowspan};
    border: 1px solid white;
    border-radius: 4px;
    margin: 16px;
`;

export const SmallVideo = styled.video`
    border: 1px solid white;
    border-radius: 4px;
    margin: 16px;
 `;

 export const MenuItemWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px;
    border-radius: 8px;
    background-color: white;
    border: 4px solid ${theme.font.heading_color};
    width: 50%;
    height: 32px;
 `;