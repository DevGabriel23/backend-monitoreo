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



// Ruta para registro de usuario
router.post('/register', async (req, res) => {
    try {
        // Extraer información del cuerpo de la solicitud
        const { name, email, password } = req.body;

        const users= await connection.query('SELECT * FROM users WHERE email = ?', [email]);
        console.log(users);
        console.log(req.body);
        if (users > 0){
          return res.status(400).send('El usuario ya existe');
        }

        // Si no existe, entonces encriptar la contraseña y guardar el usuario en la base de datos
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {name,email, password:hashedPassword}
        
        await connection.query('INSERT INTO users set ?', [newUser]);
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


router.get('/users', async (req, res) => {
    try {
        const [rows] = await connection.promise().query('SELECT * FROM users');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
  
module.exports = router;
