/** Menu prices are plain numbers, as on the printed menu: 4.5, 13.75, 10. */
export const formatPrice = (price: number) => String(price);

/** Totals in the table planner. */
export const formatMoney = (amount: number) => `£${amount.toFixed(2)}`;

export const roundPence = (amount: number) => Math.round(amount * 100) / 100;

export const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;
