import {Dispatch} from "react";
import contextFactory from "@/context/contextFactory";

type BusyState = {
    isActive: boolean
    messages: Record<string, string>
}

type BusyAction =
    | { type: 'start_busy', payload: { messages: Record<string, string> } }
    | { type: 'stop_busy' }
    | { type: 'upsert_busy_message', payload: { messageId: string; message: string } }
    | { type: 'delete_busy_message', payload: { messageId: string } }

const busyReducer = (state: BusyState, action: BusyAction): BusyState => {
    switch (action.type) {
        case 'start_busy':
            return {isActive: true, messages: action.payload.messages}
        case 'stop_busy':
            return {isActive: false, messages: {}}
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
    stopBusy: (dispatch: Dispatch<BusyAction>) => () => {
        dispatch({type: 'stop_busy'})
    },
    upsertBusyMessage: (dispatch: Dispatch<BusyAction>) => (messageId: string, message: string) => {
        dispatch({type: "upsert_busy_message", payload: {messageId, message}})
    },
    deleteBusyMessage: (dispatch: Dispatch<BusyAction>) => (messageId: string) => {
        dispatch({type: "delete_busy_message", payload: {messageId}})
    }
}

const defaultBusyState: BusyState = {
    isActive: false,
    messages: {}
}

export const {Context: BusyContext, Provider: BusyProvider} = contextFactory(busyReducer, busyActions, defaultBusyState)