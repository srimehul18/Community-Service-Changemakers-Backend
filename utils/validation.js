export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s])\S{8,}$/;

export const phoneRegex = /^[6-9]\d{9}$/;

export const isStrongPassword = (password) =>
  typeof password === "string" && passwordRegex.test(password);

export const isValidIndianMobile = (phone) =>
  typeof phone === "string" && phoneRegex.test(phone);