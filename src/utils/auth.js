const TOKEN_STORAGE_KEY = 'token';

/**
 * Lê o token JWT salvo no localStorage.
 * @returns {string|null}
 */
export function getToken() {
	return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Decodifica o payload de um JWT (sem validar assinatura).
 * @param {string} token
 * @returns {object|null}
 */
export function decodeToken(token) {
	if (!token) return null;

	const parts = token.split('.');
	if (parts.length !== 3) return null;

	try {
		const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
		const json = decodeURIComponent(
			atob(payload)
				.split('')
				.map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
				.join('')
		);
		return JSON.parse(json);
	} catch {
		return null;
	}
}

/**
 * Lê o token do localStorage e retorna seu payload decodificado.
 * @returns {object|null}
 */
export function getAuthUser() {
	return decodeToken(getToken());
}

/**
 * Monta os headers de autenticação para requisições à API.
 * @returns {object}
 */
export function authHeaders() {
	const token = getToken();
	return {
		Accept: 'application/json',
		...(token ? { Authorization: `Bearer ${token}` } : {}),
	};
}
