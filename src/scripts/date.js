Date.prototype.toFormatedString = function (date, format) {
  if (!(date instanceof Date)) {
      format = date;
      date = this;
  }
  const abbWeekDayName = ['niedz', 'pon', 'wt', 'śr', 'czw', 'pt', 'sob'];
  const abbMonthName = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
  format = format.replace(/%[y]/g, date.getFullYear());
  format = format.replace(/%[a]/g, abbWeekDayName[date.getDay()]);
  format = format.replace(/%[b]/g, abbMonthName[date.getMonth()]);
  format = format.replace(/%[e]/g, date.getDate())
  format = format.replace(/%[H]/g, leadingZero(date.getHours()));
  format = format.replace(/%[M]/g, leadingZero(date.getMinutes()));
  return format;

  function leadingZero(value) {
      if (value <= 9) {
          return '0' + value.toString();
      }
      return value.toString()
  }
}