import {Button, StyleSheet, Text, View} from 'react-native';
import {useAudioPlayer} from "expo-audio";

import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import ParallaxScrollView from "@/components/ParallaxScrollView";
import {Image} from "expo-image";
import {CameraView, useCameraPermissions} from "expo-camera";
import {useEffect, useState} from "react";

import wellaAPI from "@/api/wella";
import {useBusy} from "@/hooks/useBusy";

const scannerSound = require('../../assets/sounds/scanner-beep.mp3')


export default function BarcodeScreen() {
    const {startTimedBusy, stopBusy} = useBusy()
    const [barcode, setBarcode] = useState<string>('')
    const [product, setProduct] = useState<string>('')
    const [permission, requestPermission] = useCameraPermissions()

    const scannerSoundPlayer = useAudioPlayer(scannerSound);

    const resetState = () => {
        setProduct('')
        setBarcode('')
        scannerSoundPlayer.seekTo(0)
    }

    useEffect(() => {
        if (!barcode) return

        const getUPCDetails = async () => {
            try {
                startTimedBusy()
                const response = await wellaAPI.get('searchByEan/', {
                    params: {
                        ean: barcode,
                        lang: 'en'
                    }
                })
                if (response?.data?.name) {
                    setProduct(response?.data?.name)
                }
            } catch (error) {
                console.log(error)
            } finally {
                stopBusy()
            }

        }
        getUPCDetails()
        // no need to trigger on startTimedBusy or stopBusy.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [barcode]);

    if (!permission) {
        // Camera permissions are still loading.
        return <View/>
    }

    if (!permission.granted) {
        // Camera permissions are not granted.
        return <ParallaxScrollView
            headerBackgroundColor={{light: '#D0D0D0', dark: '#353636'}}
            headerImage={
                <Image
                    source={require('@/assets/images/wella.png')}
                    style={styles.wellaLogo}
                />
            }>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Wella Product Scanner</ThemedText>
            </ThemedView>
            <ThemedView style={styles.stepContainer}>
                <ThemedText
                    type="subtitle">{"Please allow camera permissions to app in order to continue."}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.stepContainer}>
                <Button
                    title={'grant permission'}
                    onPress={requestPermission}
                />
            </ThemedView>
        </ParallaxScrollView>
    }

    return (
        <ParallaxScrollView
            headerBackgroundColor={{light: '#D0D0D0', dark: '#353636'}}
            headerImage={
                <Image
                    source={require('@/assets/images/wella.png')}
                    style={styles.wellaLogo}
                />
            }>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Wella Product Scanner</ThemedText>
            </ThemedView>
            <ThemedView style={styles.stepContainer}>
                <ThemedText type="subtitle">{"Use this to keep track of your Wella product reorder needs."}</ThemedText>
            </ThemedView>
            {
                barcode
                    ? (<>
                            <ThemedText type="subtitle">{barcode}</ThemedText>
                            <ThemedText type="subtitle">{product}</ThemedText>
                            <Button
                                title={'Next Product'}
                                onPress={resetState}
                            />
                        </>
                    )
                    : (
                        <>
                            <Button
                                title={"Simulate Barcode Scan"}
                                onPress={() => {
                                    setBarcode("4064666230160")
                                }}
                            />
                            <CameraView
                                style={styles.camera}
                                facing={'back'}
                                autofocus={'on'}
                                barcodeScannerSettings={{
                                    barcodeTypes: ["upc_a"]
                                }}
                                onBarcodeScanned={(scanningResult) => {
                                    scannerSoundPlayer.play()
                                    setBarcode(scanningResult.data)
                                }}
                            />
                        </>
                    )
            }
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    wellaLogo: {
        height: 178,
        width: "100%",
        bottom: 0,
        left: 0,
        position: 'absolute',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
    camera: {
        height: 400,
        flex: 1,
    },
});
