document.addEventListener('DOMContentLoaded', () => {
	const digitsInput = document.getElementById('digits');
	const durationInput = document.getElementById('duration');
	const saveBtn = document.getElementById('save-settings');

	// Load current or defaults
	const digits = localStorage.getItem('fs_digits') || '3';
	const duration = localStorage.getItem('fs_duration') || '30';

	digitsInput.value = digits;
	durationInput.value = duration;

	saveBtn.addEventListener('click', () => {
		localStorage.setItem('fs_digits', digitsInput.value);
		localStorage.setItem('fs_duration', durationInput.value);
		alert('Settings saved!');
	});
});
