/**
 * Utilitários de Padronização - CEPT Itaipuaçu
 * R S - 2026
 */

// Transforma qualquer entrada para string lowercase e remove espaços extras para o banco
export const toLowerCase = (text) => {
  if (text === null || text === undefined) return "";
  return String(text).toLowerCase().trim();
};

// Normaliza nomes para o padrão de busca (ex: caio giromba)
export const normalizeName = (name) => {
  return toLowerCase(name);
};

// EXIBIÇÃO: Resolve o erro do Header e mantém a estética R S
export const toView = (text) => {
  if (!text) return "";
  const str = String(text).trim().toLowerCase();
  
  // Regra específica para o seu nome
  if (str === 'r s') return 'R S';

  // Capitaliza nomes (caio giromba -> Caio Giromba)
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Função principal R S: limpa objetos ou arrays inteiros para o Firebase
export const prepareForSave = (data) => {
  if (typeof data === 'string') return toLowerCase(data);
  
  if (typeof data === 'object' && data !== null) {
    const isArray = Array.isArray(data);
    const newData = isArray ? [] : {};

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        newData[key] = prepareForSave(data[key]);
      }
    }
    return newData;
  }
  
  return data;
};

// Formata datas para exibição mantendo o padrão lowercase
export const formatDateLow = (date) => {
  if (!date) return "";
  const options = { day: '2-digit', month: 'long', year: 'numeric' };
  try {
    return new Intl.DateTimeFormat('pt-br', options)
      .format(new Date(date))
      .toLowerCase();
  } catch (error) {
    return "";
  }
};