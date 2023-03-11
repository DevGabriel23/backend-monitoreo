const express = require('express');
const router = express.Router();
const connection = require("../database");
const bd = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");


router.use(bd.json());
router.use(bd.urlencoded({ extended: true }));

//Agregar datos extras al usuario Nombre, apellidos, edad, sexo, estatura, peso, etc.
router.post('/add-data', async (req, res) => {
    try {
      const {user,nombre,edad,sexo,estatura,peso,fecha_nacimiento,domicilio,telefono_personal,telefono_emergencia,institucion,seguro_social,medico_tratante} = req.body;
    const newUserData = {user,nombre,edad,sexo,estatura,peso,fecha_nacimiento,domicilio,telefono_personal,telefono_emergencia,institucion,seguro_social,medico_tratante}
      await connection.query('INSERT INTO datos set ?', [newUserData]);
      res.send(req.body);
    } catch (error) {
      console.log(error);
      res.status(500).send('Ocurrió un error');
    }
});

router.get('/get', async (req, res) => {
    try {
        const datos = await connection.query('SELECT * FROM datos');
        res.json(datos);
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrió un error');
    }
});


//Obtener datos extras del usuario
router.get('/get/:user', async (req, res) => {
    try {
        const { user } = req.params;
        const datos = await connection.query('SELECT * FROM datos WHERE user = ?', [user]);
        res.json(datos);
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrió un error');
    }
});

//Actualizar datos extras del usuario
router.put('/update/:user', async (req, res) => {
    try {
        const { user } = req.params;
        const {nombre,edad,sexo,estatura,peso,fecha_nacimiento,domicilio,telefono_personal,telefono_emergencia,institucion,seguro_social,medico_tratante} = req.body;
        const newUserData = {nombre,edad,sexo,estatura,peso,fecha_nacimiento,domicilio,telefono_personal,telefono_emergencia,institucion,seguro_social,medico_tratante}
        await connection.query('UPDATE datos set ? WHERE user = ?', [newUserData, user]);
        res.send(req.body);
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrió un error');
    }
});

//Eliminar datos extras del usuario
router.delete('/delete/:user', async (req, res) => {
    try {
        const { user } = req.params;
        await connection.query('DELETE FROM datos WHERE user = ?', [user]);
        res.send(req.body);
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrió un error');
    }
});


  
module.exports = router;
  