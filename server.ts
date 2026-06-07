import 'dotenv/config'
import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

interface SecretItem {
	code: string;
	secret: string;
	timeoutId: NodeJS.Timeout;
}

// Map associating domain (string) -> Array of active secrets
const secrets: Map<string, SecretItem[]> = new Map();

// Allowed characters (40 total)
const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789?!@*";

/**
 * Generates a unique short code for a given domain and stores the secret.
 */
function createKey(domain: string, secret: string, duration: number, digits: number): string | null {
	const list = secrets.get(domain) || [];
	const existingCodes = new Set(list.map(item => item.code));

	let code = "";
	let attempts = 0;
	const maxAttempts = 200;

	// Generate unique code loop
	do {
		code = "";
		for (let i = 0; i < digits; i++) {
			code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
		}
		attempts++;
		if (attempts > maxAttempts) {
			return null; // Unique code cannot be generated within limits
		}
	} while (existingCodes.has(code));

	// Handle timeout destruction
	const timeoutId = setTimeout(() => {
		const currentList = secrets.get(domain) || [];
		const filteredList = currentList.filter(item => item.code !== code);
		
		if (filteredList.length === 0) {
			secrets.delete(domain);
		} else {
			secrets.set(domain, filteredList);
		}
		console.log(`[Expired] Code "${code}" removed for domain "${domain}"`);
	}, duration * 1000);

	// Save to server state
	if (!secrets.has(domain)) {
		secrets.set(domain, []);
	}
	secrets.get(domain)!.push({ code, secret, timeoutId });

	return code;
}

// POST endpoint to save/publish a secret
app.post('/postSecret', (req: Request, res: Response) => {
	const { domain, secret, digits, duration } = req.body;
	
	if (!domain || !secret) {
		return res.status(400).json({ error: "Missing domain or secret data." });
	}

	const codeDigits = parseInt(digits, 10) || 3;
	const codeDuration = parseInt(duration, 10) || 30;

	const code = createKey(domain, secret, codeDuration, codeDigits);
	return res.json({ code, duration: codeDuration });
});

// GET endpoint to consume/retrieve a secret
app.get('/getSecret', (req: Request, res: Response) => {
	const domain = req.query.domain as string;
	const code = req.query.code as string;

	if (!domain || !code) {
		return res.json({ error: "Missing domain or code parameters." });
	}

	const list = secrets.get(domain);
	if (!list) {
		return res.json({ error: "No active secrets found for this domain." });
	}

	const index = list.findIndex(item => item.code === code);
	if (index === -1) {
		return res.json({ error: "Invalid code or secret has expired." });
	}

	const matchItem = list[index];

	// Clear timeout manually on consumption
	clearTimeout(matchItem.timeoutId);

	// Remove item from state
	list.splice(index, 1);
	if (list.length === 0) {
		secrets.delete(domain);
	} else {
		secrets.set(domain, list);
	}

	return res.json({ secret: matchItem.secret });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(`[FastSecret Backend] Server running at http://localhost:${PORT}`);
});