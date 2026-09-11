import express from "express";
import { expensesRouter } from "./routes/expenses.js";
import { reportsRouter } from "./routes/reports.js";

const app = express();
app.use(express.json());

// Allow the web page (different port) to call us.
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use("/expenses", expensesRouter);
app.use("/reports", reportsRouter);

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`api listening on http://localhost:${port}`));
