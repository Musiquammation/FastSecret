document.addEventListener('DOMContentLoaded', () => {
	const domainInput = document.getElementById('domain');
	const codeInput = document.getElementById('code');
	const fetchBtn = document.getElementById('btn-fetch');
	const resultPanel = document.getElementById('result-panel');
	const resultText = document.getElementById('result-text');
	const copyBtn = document.getElementById('btn-copy');

	fetchBtn.addEventListener('click', async () => {
		const domain = domainInput.value.trim();
		const code = codeInput.value.trim();

		if (!domain || !code) {
			alert('Please enter both domain and code.');
			return;
		}

		try {
			const res = await fetchGet('/getSecret', { domain, code });

			if (res.error) {
				alert(`Error: ${res.error}`);
				resultPanel.style.display = 'none';
				return;
			}

			// Success: Fill textarea & Auto-copy
			resultText.value = res.secret;
			resultPanel.style.display = 'block';

			try {
				await navigator.clipboard.writeText(res.secret);
				alert('Secret retrieved and copied to clipboard automatically!');
			} catch (clipErr) {
				alert('Secret retrieved, but clipboard access was denied. Please copy manually.');
			}

		} catch (err) {
			console.error(err);
			alert('Failed to connect to the server or secret expired.');
		}
	});

	copyBtn.addEventListener('click', async () => {
		try {
			await navigator.clipboard.writeText(resultText.value);
			alert('Copied to clipboard!');
		} catch (err) {
			alert('Failed to copy.');
		}
	});
});
