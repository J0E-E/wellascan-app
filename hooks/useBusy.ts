import {useContext} from "react";
import {BusyContext} from "@/context/BusyContext";

export const useBusy = () => {
    const context = useContext(BusyContext)

    if (!context) {
        throw new Error('useBusy must be used within a BusyProvider')
    }

    // pulling out state & stopBusy for returns.
    const {state, stopBusy, ...rest} = context

    return {
        ...rest,
        state,
        stopBusy: () => stopBusy(state) // passing state for timed busy applications.
    }
}