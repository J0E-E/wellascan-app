import React from "react";

import {ActivityIndicator, Dimensions, StyleSheet, View} from "react-native";
import {useBusy} from "@/hooks/useBusy";

export default function BusyOverlay() {
    const {state: busyState} = useBusy()

    if (!busyState.isActive) return null

    return <>
        <View style={styles.overlayBackdrop}>
            <ActivityIndicator size={'large'} color={'#ffffff'} />
        </View>

    </>
}

const styles = StyleSheet.create({
    overlayBackdrop: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        zIndex: 999,
        justifyContent: "center",
        alignItems: "center",
        elevation: 10
    }
})