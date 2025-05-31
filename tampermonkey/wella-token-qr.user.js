// ==UserScript==
// @name         Wella Token QR Display
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Display Wella auth token as a QR code with working close button
// @match        *://us.wella.professionalstore.com/*
// @grant        none
// ==/UserScript==

(function () {
	'use strict';

	const CHECK_INTERVAL = 1000;
	const MAX_ATTEMPTS = 30;
	let attempts = 0;

	const interval = setInterval(() => {
		attempts++;
		const raw = localStorage.getItem('auth-storage');
		if (raw) {
			try {
				const parsed = JSON.parse(raw);
				const token = parsed?.state?.accessToken;
				if (token) {
					clearInterval(interval);
					showTokenQR(token);
				}
			} catch (_) {}
		}
		if (attempts >= MAX_ATTEMPTS) {
			clearInterval(interval);
		}
	}, CHECK_INTERVAL);

	function showTokenQR(token) {
		const qrCodeScript = document.createElement('script');
		qrCodeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';
		qrCodeScript.onload = () => {
			// Outer fixed container
			const container = document.createElement('div');
			container.style.position = 'fixed';
			container.style.bottom = '10px';
			container.style.right = '10px';
			container.style.background = 'white';
			container.style.border = '2px solid #333';
			container.style.borderRadius = '8px';
			container.style.padding = '8px';
			container.style.zIndex = 99999;
			container.style.boxShadow = '0 2px 8px rgba(0,0,0,0.25)';
			container.style.maxWidth = 'fit-content';

			// Inner wrapper for relative positioning
			const inner = document.createElement('div');
			inner.style.position = 'relative';

			// ✕ button
			const closeBtn = document.createElement('div');
			closeBtn.textContent = '✕';
			closeBtn.style.position = 'absolute';
			closeBtn.style.top = '4px';
			closeBtn.style.right = '8px';
			closeBtn.style.cursor = 'pointer';
			closeBtn.style.fontSize = '16px';
			closeBtn.style.fontWeight = 'bold';
			closeBtn.style.lineHeight = '1';
			closeBtn.style.color = '#444';
			closeBtn.onclick = () => container.remove();

			const title = document.createElement('div');
			title.textContent = 'Wella Token QR';
			title.style.fontSize = '14px';
			title.style.marginBottom = '5px';
			title.style.fontWeight = 'bold';
			title.style.textAlign = 'center';

			const qrContainer = document.createElement('div');
			const qr = qrcode(0, 'L');
			qr.addData(token);
			qr.make();

			qrContainer.innerHTML = qr.createImgTag(3); // Medium size

			// Build hierarchy
			inner.appendChild(closeBtn);
			inner.appendChild(title);
			inner.appendChild(qrContainer);
			container.appendChild(inner);
			document.body.appendChild(container);
		};
		document.head.appendChild(qrCodeScript);
	}
})();
