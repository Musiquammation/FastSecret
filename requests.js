var SERV_URL = "http://localhost:5000";

async function fetchGet(route, data) {
	const params = new URLSearchParams(data).toString();
	const res = await fetch(`${SERV_URL}${route}?${params}`);
	return await res.json();
}

async function fetchPost(route, data) {
	const res = await fetch(`${SERV_URL}${route}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	return await res.json();
}