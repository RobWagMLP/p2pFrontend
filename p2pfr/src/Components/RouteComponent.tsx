import React, { FunctionComponent } from 'react';
import ReactDOM from 'react-dom';
import { Navigate, Route, BrowserRouter as Router, Routes, useParams } from 'react-router-dom';
import { EntryComponent } from './EntryComponent';
import { VideoChatComponent } from './VideoChatComponents';
import { Storage } from '../Helper/storage.ts';

interface IProps {

}

export const RouteComponent: FunctionComponent< IProps> = (props: IProps) => {

    const { room_id } = useParams();

    Storage.getInstance().setRoomID(room_id !== 'xx' ? parseInt(room_id) : -1);

    return( 
        <Router>
            <Routes>
                <Route path="/session/:room_id" element={<EntryComponent     room_id={room_id !== 'xx' ? parseInt(room_id) : -1}/>} />
                <Route path="/video/:room_id"   element={<VideoChatComponent room_id={room_id !== 'xx' ? parseInt(room_id) : -1}/>} />
                <Route path="/" element={<Navigate replace to="/session/xx"/> } /> 
            </Routes>
        </Router>
    )

}