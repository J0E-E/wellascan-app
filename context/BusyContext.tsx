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

type StartBusyOptions = {
    messages?: Record<string, string>
}

type StartTimedBusyOptions = {
    messages?: Record<string, string>
    minTime?: number
}

type StopBusyOptions = {
    state: BusyState
}

type UpsertBusyOptions = {
    messageId: string
    message: string
}

type DeleteBusyOptions = {
    messageId: string
}

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
                minTime: action.payload.minTime ?? state.minTime,
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
    startBusy: (dispatch: Dispatch<BusyAction>) => (options: StartBusyOptions = {}) => {
        const {messages = {}} = options
        dispatch({type: "start_busy", payload: {messages}})
    },
    startTimedBusy: (dispatch: Dispatch<BusyAction>) => (options: StartTimedBusyOptions = {}) => {
        const {messages = {}, minTime} = options
        dispatch({type: 'start_timed_busy', payload: {messages, minTime}})
    },
    stopBusy: (dispatch: Dispatch<BusyAction>) => (options: StopBusyOptions) => {
        const {state} = options
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
    upsertBusyMessage: (dispatch: Dispatch<BusyAction>) => (options: UpsertBusyOptions) => {
        const {messageId, message} = options
        dispatch({type: "upsert_busy_message", payload: {messageId, message}})
    },
    deleteBusyMessage: (dispatch: Dispatch<BusyAction>) => (options: DeleteBusyOptions) => {
        const {messageId} = options
        dispatch({type: "delete_busy_message", payload: {messageId}})
    }
}

export const {Context: BusyContext, Provider: BusyProvider} = contextFactory(busyReducer, busyActions, defaultBusyState)