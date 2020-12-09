import logger from 'redux-logger';
import thunk from 'redux-thunk'
import { combineReducers, compose, createStore, applyMiddleware } from 'redux';
import { RouterState, connectRouter, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history'
import { ThunkDispatch } from 'redux-thunk';
import { IAuthStates } from './redux/authForm/state';
import { IProfileStates } from './redux/profile/state';
import { IBandState } from "./redux/Band/state";
import { IBandRoomStates } from './redux/bandRoom/state';
import { IAuthActions } from './redux/authForm/actions';
import { IProfileActions } from './redux/profile/actions';
import { BandActions } from './redux/Band/action';
import { IBandRoomActions } from './redux/bandRoom/actions';
import { authReducers } from './redux/authForm/reducers';
import { profileReducer } from './redux/profile/reducers';
import { BandReducer } from "./redux/Band/reducer";
import { bandRoomReducer } from './redux/bandRoom/reducers';
import { ISocketStates } from './redux/socket/state';
import { ISocketActions } from './redux/socket/actions';
import { socketReducer } from './redux/socket/reducers';


declare global {
    /* tslint:disable:interface-name */
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any,
        getEventListeners: (element: any) => Array<any>
    }
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const history = createBrowserHistory();

export interface IRootState {
    auth: IAuthStates,
    profile: IProfileStates,
    band: IBandState,
    bandRoom: IBandRoomStates,
    socket: ISocketStates,
    router: RouterState
}

type IRootAction = 
    IAuthActions | 
    IProfileActions | 
    IBandRoomActions | 
    BandActions | 
    ISocketActions;

const rootReducer = combineReducers<IRootState>({
    auth: authReducers,
    profile: profileReducer,
    band: BandReducer,
    bandRoom: bandRoomReducer,
    socket: socketReducer,
    router: connectRouter(history)
});

export type ThunkDispatch = ThunkDispatch<IRootState, null, IRootAction>;

export default createStore<IRootState, IRootAction, {}, {}>(
    rootReducer,
    composeEnhancers(
        applyMiddleware(logger),
        applyMiddleware(thunk),
        applyMiddleware(routerMiddleware(history))
    )
);