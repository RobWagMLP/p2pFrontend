import styled from "styled-components";
import {theme} from './theme';

export const PlaceableOverlay = styled.div<{x: string, y: string, height?: string}>`
    position: absolute;
    z-index: 10000;
    width:  400px;
    height: ${props => props.height != null ? props.height : "300px"};;
    background-color: ${theme.font.base_color};;
    left: ${props => props.x};
    top: ${props => props.y};
    border: 2px solid ${theme.font.heading_color};
    border-radius: 4px;
    color: white;
`;

export const InnerOverlay = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 32px;
`;

export const DeviceEntry = styled.div` 
    width: 95%;
    font-weight: 400;
    color: white;
    margin-bottom: 8px;
    margin-left: 32px;
    display: flex;
    text-align: left;
    justify-content: flex-start;
    :hover {
        font-weight: 500;
        cursor: pointer;
        background-color: white;
        color: ${theme.font.heading_color};
        border-radius: 4px;
    }
`;