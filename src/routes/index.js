const express = require('express');
const router = express.Router();
const connection = require("../database");
const bd = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");


router.use(bd.json());
router.use(bd.urlencoded({ extended: true }));

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
  
    const query = 'SELECT * FROM users WHERE email = ?';
    connection.query(query, [email], async (error, results) => {
      if (error) {
        console.error('Error querying database:', error);
        return res.status(500).json({ message: 'Internal server error.' });
      }
  
      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
  
      const user = results[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
  
      const token = jwt.sign({ id: user.id }, 'secretkey');
      return res.json({ token });
    });
  });

//Obtener por id
router.get('/user/:id', async (req, res) => {
  try {
      const {id} = req.params;
      const user = await connection.query('SELECT * FROM users WHERE id = ?', [id]);
      res.json(user[0]);
  } catch (error) {
      console.log(error);
      res.status(500).send('Ocurrió un error');
  }
});




// Ruta para registro de usuario
router.post('/register', async (req, res) => {
    try {
        // Extraer información del cuerpo de la solicitud
        var {name,lastname,email,dayBirth,nss,sex,age,height,weight,phone,ePhone,adress,nameMedic,hospital,password} = req.body;

        const users= await connection.query('SELECT * FROM users WHERE email = ?', [email]);
        console.log(users);
        console.log(req.body);
        
        if (users > 0){
          return res.status(400).send('El usuario ya existe');
        }

        // Si no existe, entonces encriptar la contraseña y guardar el usuario en la base de datos
        const salt = await bcrypt.genSalt(10);
        var password = await bcrypt.hash(password, 10);
        const newUser = {name,lastname,email,dayBirth,nss,sex,age,height,weight,phone,ePhone,adress,nameMedic,hospital,password}
        
        await connection.query('INSERT INTO users set ?', [newUser]);
        res.send(req.body);
       
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrió un error');
    }
});

//Enviar mensaje de texto al numero de emergencia cuando exista riesgo de epilepsia
router.post('/send', async (req, res) => {
  try {
      // Extraer información del cuerpo de la solicitud
      var {telefono_emergencia} = req.body;
      console.log(telefono_emergencia)
      telefono_emergencia = "+52" + telefono_emergencia;
      console.log(telefono_emergencia)
      const accountSid = "ACd4ddf2727db396a6c2475b5b4a919953";
      const authToken = "7c18d3888aa4155268db288849bdd3d9";
      const client = require("twilio")(accountSid, authToken);
      client.messages
        .create({ body: "Ataque epileptico", from: "+14753383647", to: telefono_emergencia })
        .then(message => console.log(message.sid));
      res.send(req.body);
  } catch (error) {

      console.log(error);
      res.status(500).send('Ocurrió un error');
  }
});

// //Registrar los ataques epilepticos
// router.post('/ataque', async (req, res) => {
//   try {

//       // Extraer información del cuerpo de la solicitud
//       const {userId,lungRate, heartRate, temperature, type} = req.body;
//       const date = new Date();
//       const time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
//       const newAtaque = {userId,lungRate, heartRate, temperature, type, date, time}
//       await connection.query('INSERT INTO historial set ?', [newAtaque]);
//       res.send(req.body);
//   } catch (error) {

//       console.log(error);
//       res.status(500).send('Ocurrió un error');
//   }
// });


//Obtener datos del usuario por email
router.get('/getemail/:email', async (req, res) => {
  try {
      const { email } = req.params;
      const user = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
      res.json(user);
  } catch (error) {
      console.log(error);
      res.status(500).send('Ocurrió un error');
  }
});


//Actualizar datos extras del usuario
router.put('/update/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const {name,lastname,email,dayBirth,nss,sex,age,height,weight,phone,ePhone,adress,nameMedic,hospital,password} = req.body;
      const newUserData = {id,name,lastname,email,dayBirth,nss,sex,age,height,weight,phone,ePhone,adress,nameMedic,hospital,password}
      await connection.query('UPDATE users set ? WHERE id = ?', [newUserData, user]);
      res.send(req.body);
  } catch (error) {
      console.log(error);
      res.status(500).send('Ocurrió un error');
  }
});

//Eliminar datos extras del usuario
router.delete('/delete/:id', async (req, res) => {
  try {
      const { user } = req.params;
      await connection.query('DELETE FROM datos WHERE id = ?', [user]);
      res.send(req.body);
  } catch (error) {
      console.log(error);
      res.status(500).send('Ocurrió un error');
  }
});

// Ruta para activar la cuenta del usuario después del registro
router.get('/activate/:token', async (req, res) => {
    try {
        // Verificar el token del usuario
        // Si es válido, entonces activar la cuenta y enviar una respuesta exitosa
        // Si no es válido, entonces enviar una respuesta con un mensaje de error

        const { email } = jwt.verify(req.params.token, 'tu_secreto');

        // Activar la cuenta del usuario en la base de datos

        res.send('Cuenta activada correctamente');
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrió un error');
    }
});



// Recovery password route
router.post('/recovery_password', async (req, res) => {
    try {
      const { email } = req.body;
  
      // Check if user exists
      const user = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Generate new random password
      const newPassword = Math.random().toString(36).substring(2, 10);
  
      // Hash new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  
      // Update password in database
      await connection.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
  
      // Send recovery email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: '203411@ids.upchiapas.edu.mx',
          pass: 'Solis.2002@#$'
        }
      });
  
      const mailOptions = {
        from: '203411@ids.upchiapas.edu.mx',
        to: email,
        subject: 'Password Recovery',
        text: `Your new password is: ${newPassword}`
      };
  
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.error(error);
          res.status(500).json({ message: 'Internal server error' });
        } else {
          console.log('Email sent: ' + info.response);
          res.json({ message: 'New password sent to your email',email:email });
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  



// Change password route
router.post('/change_password', async (req, res) => {
    try {
      const { id,password, newPassword } = req.body;
  
      // Check if user exists
      const [rows] = await connection.promise().query('SELECT * FROM users WHERE id = ?', [id]);
      const user = rows[0];
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if current password is correct
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
  
      // Hash new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  
      // Update password in database
      await connection.promise().query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
  
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


router.get('/get-all', async (req, res) => {
    try {
        const [rows] = await connection.promise().query('SELECT * FROM users');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
  
module.exports = router;
