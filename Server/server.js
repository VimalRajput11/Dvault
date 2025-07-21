
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
const app = express();
app.use(express.json());
require('dotenv').config();

const PORT=process.env.PORT||4000

const connectDB =require('./config/db')


// app.use(cors({
//   origin: "https://dvaults.vercel.app", 
//   credentials: true
// }));


app.use(cors({
  origin: process.env.CLIENT_URL, 
  credentials: true
}));

connectDB();
app.use('/api/auth', authRoutes);

app.get('/',(req,res)=>{
  res.send("API is working");
})
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
