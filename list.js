document.addEventListener('DOMContentLoaded', () => {
	const container = document.getElementById('secrets-container');
	const localSecrets = JSON.parse(localStorage.getItem('fs_secrets') || '[]');

	if (localSecrets.length === 0) {
		container.innerHTML = '<li style="color: var(--text-secondary); text-align: center; padding: 2rem;">No saved secrets found.</li>';
		return;
	}

	localSecrets.forEach((item, index) => {
		const li = document.createElement('li');
		li.className = 'secret-item';
		
		const infoDiv = document.createElement('div');
		infoDiv.className = 'secret-info';
		infoDiv.addEventListener('click', () => {
			// Redirect using standard parameter convention
			window.location.href = `send.html?domainIndex=${index}`;
		});

		const domainSpan = document.createElement('span');
		domainSpan.className = 'secret-domain';
		domainSpan.textContent = item.domain;

		const previewSpan = document.createElement('div');
		previewSpan.className = 'secret-preview';
		previewSpan.textContent = item.secret;

		infoDiv.appendChild(domainSpan);
		infoDiv.appendChild(previewSpan);

		const deleteBtn = document.createElement('button');
		deleteBtn.className = 'btn-danger';
		deleteBtn.style.padding = '0.5rem 1rem';
		deleteBtn.style.fontSize = '0.85rem';
		deleteBtn.textContent = 'Delete';
		deleteBtn.addEventListener('click', (e) => {
			e.stopPropagation(); // Prevent redirect
			if (confirm(`Delete secret for ${item.domain}?`)) {
				localSecrets.splice(index, 1);
				localStorage.setItem('fs_secrets', JSON.stringify(localSecrets));
				location.reload();
			}
		});

		li.appendChild(infoDiv);
		li.appendChild(deleteBtn);
		container.appendChild(li);
	});
});
