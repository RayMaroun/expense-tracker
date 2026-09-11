import moment from "moment";

// Date helpers.

export function formatDate(d: any) {
  return moment(d).format("YYYY-MM-DD");
}

export function formatDateLong(d: any) {
  return moment(d).format("MMMM D, YYYY");
}

export function daysBetween(a: any, b: any) {
  return moment(b).diff(moment(a), "days");
}

export function startOfMonth(d: any) {
  return moment(d).startOf("month").toDate();
}

export function endOfMonth(d: any) {
  return moment(d).endOf("month").toDate();
}

export function isSameMonth(a: any, b: any) {
  return moment(a).isSame(moment(b), "month");
}

export function today() {
  return moment();
}
