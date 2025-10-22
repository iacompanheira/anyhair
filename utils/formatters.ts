export const formatCurrency = (value: number): string => {
    if (typeof value !== 'number') {
        return '';
    }
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const formatCPF = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .substring(0, 14);
};

export const formatPhone = (value: string): string => {
  if (!value) return value;
  let v = value.replace(/\D/g, '').substring(0, 11);

  if (v.length > 10) {
    // Cellphone with 9 digits: (XX) XXXXX-XXXX
    v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
  } else if (v.length > 6) {
    // Landline or cellphone with 8 digits: (XX) XXXX-XXXX
    v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
  } else if (v.length > 2) {
    // Just DDD and start of number: (XX) XXXX
    v = v.replace(/^(\d{2})(\d*)/, '($1) $2');
  } else if (v.length > 0) {
    // Just DDD: (XX
    v = v.replace(/^(\d*)/, '($1');
  }
  
  return v;
};

export const validateCPF = (cpfValue: string): boolean => {
    const cpf = cpfValue.replace(/[^\d]+/g, '');
    
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }
    
    let sum = 0;
    let remainder;
    
    for (let i = 1; i <= 9; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) {
        remainder = 0;
    }
    
    if (remainder !== parseInt(cpf.substring(9, 10))) {
        return false;
    }
    
    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) {
        remainder = 0;
    }
    
    if (remainder !== parseInt(cpf.substring(10, 11))) {
        return false;
    }
    
    return true;
};
