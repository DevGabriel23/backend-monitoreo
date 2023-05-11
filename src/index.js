const express = require('express');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();

app.set("port", process.env.PORT || 3000);

app.use(morgan('dev'));
// const cors = require("cors");

// app.use(cors({ origin: "*"}));

// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
//     res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
//     res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
//     next();
// });

//Routes 
app.use("/api/user", require('./routes/index'));
app.use("/api/mediciones", require('./routes/mediciones'));

//Public
app.use(express.static(path.join(__dirname + 'public')));

//Starting the server
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});