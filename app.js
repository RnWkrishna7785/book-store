require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const bookRoutes = require("./routes/bookRoutes");

const app = express();
connectDB();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

app.use("/", bookRoutes);

app.use((req, res) => {
  res.status(404).send("<h1>404 - Page Not Found</h1><a href='/'>Go Home</a>");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`),
);
