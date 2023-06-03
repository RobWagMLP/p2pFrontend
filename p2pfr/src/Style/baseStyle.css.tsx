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
    height: calc(100vh - 600px);
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
    height: calc(100vh - 100px);
`;

export const HoverBox = styled.div`
    width: 32px;
    height: 32px;
    margin: 16px;
    :hover {
        cursor: pointer;
    }
`;

export const VideoPreviewBox = styled.div`
    margin: 16px;
    display: inline-block;
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
    margin: ${theme.margins.global_margin};
    display: grid;
    grid-template-columns: [first]   70% [line-2] 20% [line-3] 10% [end];
    grid-template-rows   : [first-r] 10% [row-2] 70% [row-3] 20% [end-row];
    background-color: ${theme.font.base_color};
`;

export const VideoHeader = styled.div`
    grid-column-start: 1;
    grid-column-end: 3;
`;

export const BottomArea = styled(VideoHeader)`
    grid-column-start: 1;
    grid-column-end: 3;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin: 32px;
    border-radius: 4px;
    border: 4px solid ${theme.font.heading_color};
`;

export const VideoArea = styled.div`
    display: grid;
    grid-template-rows: 50% 50%;
    grid-template-column: 50% 50%;
`;

export const OffsetVideoArea = styled.div`
    display: flex;
    justify-content: center;
    flex-direction: column;
    padding: 8px;
`;


export const RightMenuArea = styled.div`
`;

export const VideoElement = styled.video<{row: number, column: number, rowspan: number, colspan: number}>`
    grid-column-start: ${props => props.column};
    grid-column-end:   ${props => props.column + props.colspan};
    grid-row-start: ${props => props.row};
    grid-row-end:   ${props => props.row + props.rowspan};
    border: 2px solid white;
    border-radius: 4px;
    margin: 16px;
`;

export const SmallVideo = styled.video`
    margin: 16px;
    width: 95%;
 `;