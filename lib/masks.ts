export const maskCEP = (v: string): string =>
  v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");

export const maskCNPJ = (v: string): string =>
  v
    .replace(/\D/g, "")
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");

export const maskEAN = (v: string): string => v.replace(/\D/g, "").slice(0, 13);

export const maskNumber = (v: string): string => v.replace(/[^\d]/g, "").slice(0, 10);

export function onlyDigits(v: string): string {
  return v.replace(/\D/g, "");
}