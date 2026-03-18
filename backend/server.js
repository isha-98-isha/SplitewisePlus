const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Fix for DNS resolution issues with MongoDB Atlas
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = require('./config/db');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());


const userRoutes = require("./routes/userRoutes")
const expenseRoutes = require("./routes/expenseRoutes")
const groupRoutes = require("./routes/groupRoutes")
const adminRoutes = require("./routes/adminRoutes")
const notificationRoutes = require("./routes/notificationRoutes")

app.use("/api/users", userRoutes)
app.use("/api/expenses", expenseRoutes)
app.use("/api/groups", groupRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/notifications", notificationRoutes)

app.get('/', (req, res) => {
  res.send('API Running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
