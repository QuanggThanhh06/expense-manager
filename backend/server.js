const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const walletRoutes = require("./routes/walletRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("ROOT OK");
});

app.get("/api/test", (req, res) => {
  res.send("API TEST OK");
});


app.use("/api/expenses", expenseRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/transactions", transactionRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("=== BACKEND SERVER FILE DANG CHAY ===");
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});