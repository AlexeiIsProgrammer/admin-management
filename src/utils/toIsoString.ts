const toIsoString = (argDate: string) => {
  const date = new Date(argDate);
  const tzo = -date.getTimezoneOffset();
  const dif = tzo >= 0 ? '+' : '-';
  const pad = (num: number) => {
    return (num < 10 ? '0' : '') + num;
  };

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}${dif}${pad(Math.floor(Math.abs(tzo) / 60))}:${pad(Math.abs(tzo) % 60)}UTC`;
};

export default toIsoString;
