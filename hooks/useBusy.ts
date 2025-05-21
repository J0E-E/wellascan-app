import {useContext} from "react";
import {BusyContext} from "@/context/BusyContext";

export const useBusy = () => {
    const context = useContext(BusyContext)

    if (!context) {
        throw new Error('useBusy must be used within a BusyProvider')
    }

    return {
        ...context
    }
}