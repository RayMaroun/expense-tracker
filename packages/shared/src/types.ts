// Shared shapes used by the api and the web page.

export type Expense = {
  id: string;
  description: string;
  amount: any;        // dollars as a float, e.g. 12.5
  category: any;
  date: any;          // ISO string or Date
  tags?: any;
};

export type Report = {
  from: any;
  to: any;
  total: any;
  byCategory: any;
};
