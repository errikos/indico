/* This file is part of Indico.
 * Copyright (C) 2002 - 2018 European Organization for Nuclear Research (CERN).
 *
 * Indico is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 *
 * Indico is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Indico; if not, see <http://www.gnu.org/licenses/>.
 */

import {combineReducers} from 'redux';

import {requestReducer} from 'indico/utils/redux';
import * as roomsActions from './actions';


export default combineReducers({
    request: requestReducer(
        roomsActions.FETCH_DETAILS_REQUEST,
        roomsActions.FETCH_DETAILS_SUCCESS,
        roomsActions.FETCH_DETAILS_ERROR
    ),
    rooms: (state = {}, action) => {
        switch (action.type) {
            case roomsActions.DETAILS_RECEIVED: {
                const room = action.data;
                return {...state, [room.id]: room};
            }
            default:
                return state;
        }
    }
});