const express = require('express');
const dotenv=require('dotenv');
const cors = require('cors');
const mongoose=require('mongoose');
const authRoutes=require('./routes/authRoutes');
const eventRoutes=require('./routes/eventRoutes');

dotenv.config();

const app=express();

app.use(express.json())
app.use(cors({ origin: "http://localhost:3000" }));


const connectDB=async()=>{
    try{
        const conn=await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }catch(error){
        console.log(error);
        process.exit(1);
    }
}

connectDB()

app.use('/api/auth',authRoutes);
app.use('/api/events',eventRoutes);    

app.get('/', (req, res) => {
    res.send('API is running');
});

const PORT=process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 