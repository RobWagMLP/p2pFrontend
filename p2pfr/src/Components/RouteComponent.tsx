import React, { FunctionComponent } from 'react';
import ReactDOM from 'react-dom';
import { Navigate, Route, BrowserRouter as Router, useParams } from 'react-router-dom';
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
            <Route path="/session/:room_id"> <EntryComponent     room_id={room_id !== 'xx' ? parseInt(room_id) : -1}/> </Route>
            <Route path="/video/:room_id"  > <VideoChatComponent room_id={room_id !== 'xx' ? parseInt(room_id) : -1}/> </Route>
            <Route path="/"> <Navigate replace to="/session/xx"/>   </Route>
        </Router>
    )

}