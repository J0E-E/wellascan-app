import {Dispatch} from "react";
import contextFactory from "@/context/contextFactory";
import {Timestamp} from "react-native-reanimated/lib/typescript/commonTypes";

type BusyState = {
    isActive: boolean,
    isTimed: boolean,
    minTime: number,
    startTime?: Timestamp,
    messages: Record<string, string>
}

type BusyAction =
    | { type: 'start_busy', payload: { messages: Record<string, string> } }
    | { type: 'start_timed_busy', payload: { minTime?: number; messages: Record<string, string> } }
    | { type: 'stop_busy' }
    | { type: 'upsert_busy_message', payload: { messageId: string; message: string } }
    | { type: 'delete_busy_message', payload: { messageId: string } }


const defaultBusyState: BusyState = {
    isActive: false,
    isTimed: false,
    minTime: 300,
    messages: {}
}

const busyReducer = (state: BusyState, action: BusyAction): BusyState => {
    switch (action.type) {
        case 'start_busy':
            return {...state, isActive: true, messages: action.payload.messages}
        case 'start_timed_busy':
            return {
                ...state,
                isActive: true,
                isTimed: true,
                ...(action.payload.minTime && {minTime: action.payload.minTime}),
                messages: action.payload.messages,
                startTime: Date.now()
            }
        case 'stop_busy':
            return {...defaultBusyState}
        case 'upsert_busy_message':
            return {...state, messages: {...state.messages, [action.payload.messageId]: action.payload.message}}
        case 'delete_busy_message':
            const {[action.payload.messageId]: _, ...remainingMessages} = state.messages
            return {...state, messages: {...remainingMessages}}
        default:
            return state
    }
}

const busyActions = {
    startBusy: (dispatch: Dispatch<BusyAction>) => (messages: Record<string, string>) => {
        dispatch({type: "start_busy", payload: {messages}})
    },
    startTimedBusy: (dispatch: Dispatch<BusyAction>) => (messages: Record<string, string>, minTime?: number) => {
        dispatch({type: 'start_timed_busy', payload: {messages, minTime}})
    },
    stopBusy: (dispatch: Dispatch<BusyAction>) => (state: BusyState) => {
        if (state.isTimed && state.startTime) {
            const elapsedTime = Date.now() - state.startTime
            const remainingTime = state.minTime - elapsedTime

            if (remainingTime > 0) {
                setTimeout(() => {
                    dispatch({type: "stop_busy"})
                }, remainingTime)
                return
            }
        }
        dispatch({type: 'stop_busy'})
    },
    upsertBusyMessage: (dispatch: Dispatch<BusyAction>) => (messageId: string, message: string) => {
        dispatch({type: "upsert_busy_message", payload: {messageId, message}})
    },
    deleteBusyMessage: (dispatch: Dispatch<BusyAction>) => (messageId: string) => {
        dispatch({type: "delete_busy_message", payload: {messageId}})
    }
}

export const {Context: BusyContext, Provider: BusyProvider} = contextFactory(busyReducer, busyActions, defaultBusyState)