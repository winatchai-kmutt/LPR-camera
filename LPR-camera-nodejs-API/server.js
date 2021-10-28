const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
app.set('view engine', 'ejs');
var cors = require('cors') // แก้ปัญหา CORS
app.use(cors())

// Routes
const postRoutes = require('./routes/api/posts'); // จะเข้าไฟล์ไหนต้องมี ./


// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// import dotenv
dotenv.config({path:'config.env'});

// use morgan
app.use(morgan('tiny'))

app.use('/uploads/', express.static('uploads'))

// เพิ่มส่วนประกอบ ตามที่แจ้งเตือนใน console
mongoose.connect(process.env.URL, { 
    useNewUrlParser: true,
    useUnifiedTopology: true 
}) 
    .then((()=> console.log('MongoDB connected')))
    .catch(err => console.log(err));




// User routes
app.use('/api/posts', postRoutes);
app.get('/', function(req, res) {
    res.render('index');
});




const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{console.log(`Server is running on http://localhost:${PORT} `)})