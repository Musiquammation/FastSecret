document.addEventListener('DOMContentLoaded', () => {
	const domainInput = document.getElementById('domain');
	const secretInput = document.getElementById('secret');
	const codePanel = document.getElementById('code-panel');
	const codeOutput = document.getElementById('code-output');
	const countdownTimer = document.getElementById('countdown-timer');

	let localSecrets = JSON.parse(localStorage.getItem('fs_secrets') || '[]');
	let currentIndex = null;

	// Parse domainIndex from URL (handles ?domainIndex=X or /domainIndex=X)
	const match = window.location.href.match(/[?&/]domainIndex=(\d+)/);
	if (match && match[1]) {
		currentIndex = parseInt(match[1], 10);
		if (localSecrets[currentIndex]) {
			domainInput.value = localSecrets[currentIndex].domain;
			secretInput.value = localSecrets[currentIndex].secret;
		}
	}

	// Paste Action
	document.getElementById('btn-paste').addEventListener('click', async () => {
		try {
			const text = await navigator.clipboard.readText();
			secretInput.value = text;
		} catch (err) {
			alert('Failed to read clipboard. Please paste manually.');
		}
	});

	// Save Action
	document.getElementById('btn-save').addEventListener('click', () => {
		const domain = domainInput.value.trim();
		const secret = secretInput.value;

		if (!domain) {
			alert('Please enter a domain.');
			return;
		}

		// Check if domain already exists to overwrite
		const existingIndex = localSecrets.findIndex(item => item.domain === domain);
		if (existingIndex !== -1) {
			localSecrets[existingIndex] = { domain, secret };
		} else {
			localSecrets.push({ domain, secret });
		}

		localStorage.setItem('fs_secrets', JSON.stringify(localSecrets));
		alert('Secret saved to local list!');
	});

	// Send Action
	let countdownInterval = null;
	document.getElementById('btn-send').addEventListener('click', async () => {
		const domain = domainInput.value.trim();
		const secret = secretInput.value;
		
		if (!domain || !secret) {
			alert('Please fill out both domain and secret fields.');
			return;
		}

		const digits = localStorage.getItem('fs_digits') || '3';
		const duration = localStorage.getItem('fs_duration') || '30';

		try {
			const res = await fetchPost('/postSecret', {
				domain,
				secret,
				digits: parseInt(digits, 10),
				duration: parseInt(duration, 10)
			});

			if (res.code === null) {
				alert('Could not generate a unique code. Try increasing digit length in settings.');
				return;
			}

			// Show Panel & Setup Countdown
			codeOutput.textContent = res.code;
			codePanel.style.display = 'flex';
			
			let timeLeft = parseInt(res.duration, 10);
			countdownTimer.textContent = timeLeft;

			if (countdownInterval) clearInterval(countdownInterval);
			
			countdownInterval = setInterval(() => {
				timeLeft--;
				countdownTimer.textContent = timeLeft;
				if (timeLeft <= 0) {
					clearInterval(countdownInterval);
					codePanel.style.display = 'none';
					alert('Code has expired.');
				}
			}, 1000);

		} catch (err) {
			console.error(err);
			alert('Error connecting to the server.');
		}
	});
});
