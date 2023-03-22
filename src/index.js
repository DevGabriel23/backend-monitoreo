const express = require('express');
const morgan = require('morgan');
const path = require('path');

const app = express();
const port = 3000;


app.set("port", process.env.PORT || port);

app.use(morgan('dev'));



//Routes 
app.use("/api/user", require('./routes/index'));
app.use("/api/mediciones", require('./routes/mediciones'));

//Public
app.use(express.static(path.join(__dirname + 'public')));

//Starting the server
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});