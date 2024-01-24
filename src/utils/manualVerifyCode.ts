const verifyCode = (): number => {
  const code = Math.random().toString().slice(-6);
  return parseInt(code);
};

export default verifyCode;