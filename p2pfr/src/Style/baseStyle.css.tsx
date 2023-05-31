import styled from "styled-components";
import {theme} from './theme';

export const MainBox = styled.div`
    margin: ${theme.margins.global_margin};
    display: flex;
    justify-content: center;
    color: ${theme.font.base_color}
`;

export const MiddleHeading = styled.div`
    color: ${theme.font.heading_color};
    font-weight:${theme.font.heading_font_weight};
    font-size: ${theme.font.heading_font_size};
    line-height: 51px;
    text-align: center;
    margin: ${theme.margins.space_margin}
`;

export const StyledInput = styled.input`
    border: 0;
    border-bottom: 2px solid ${theme.font.base_color};
    width: 100%;
    font-size: 30px;
    line-height: 35px;
    height: 70px;
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
    font-size: 16px;
    color: ${theme.font.base_color}
`;

export const HeaderBox = styled.div`
    height: 100px;
    width: 100%;
    display: flex;
`;