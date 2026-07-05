/**
 * Aplica a máscara 000.000.000-00 conforme o usuário digita.
 * @param {string} value
 * @returns {string}
 */
export function maskCpf(value) {
	const digits = value.replace(/\D/g, '').slice(0, 11);
	return digits
		.replace(/(\d{3})(\d)/, '$1.$2')
		.replace(/(\d{3})(\d)/, '$1.$2')
		.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/**
 * Remove a máscara, retornando apenas os dígitos.
 * @param {string} value
 * @returns {string}
 */
export function unmaskCpf(value) {
	return value.replace(/\D/g, '');
}

/**
 * Valida um CPF (dígitos verificadores) conforme o algoritmo da Receita Federal.
 * @param {string} value
 * @returns {boolean}
 */
export function isValidCpf(value) {
	const cpf = unmaskCpf(value);
	if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

	const calcCheckDigit = (base) => {
		let sum = 0;
		for (let i = 0; i < base.length; i++) {
			sum += parseInt(base[i], 10) * (base.length + 1 - i);
		}
		const rest = (sum * 10) % 11;
		return rest === 10 ? 0 : rest;
	};

	const digit1 = calcCheckDigit(cpf.slice(0, 9));
	const digit2 = calcCheckDigit(cpf.slice(0, 10));

	return digit1 === parseInt(cpf[9], 10) && digit2 === parseInt(cpf[10], 10);
}
