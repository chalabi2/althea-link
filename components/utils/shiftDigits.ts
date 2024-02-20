import BigNumber from "bignumber.js";

export const shiftDigits = (
  num: string | number,
  places: number,
  decimalPlaces?: number
) => {
  return new BigNumber(num)
    .shiftedBy(places)
    .decimalPlaces(decimalPlaces || 6)
    .toString();
};
