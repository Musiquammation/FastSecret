var SERV_URL = "https://5.51.5.55.sslip.io:7843";

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