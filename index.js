const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config();
const authRoutes = require('./routes/route');


app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/", authRoutes);







app.listen(process.env.PORT || 9000, () => console.log('Server started.'));
