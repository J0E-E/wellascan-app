declare module 'react-native-qrcode-local-image' {
	const QRCodeLocalImage: {
		decode: (uri: string) => Promise<string>
	};

	export default QRCodeLocalImage;
}