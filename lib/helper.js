
 export const onlyDigits = (str) => {
  if (!str) return "";
  return String(str).replace(/\D/g, "");
};


export const toNumber = (value) => {
  if (value === undefined || value === null) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}


