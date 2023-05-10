const express = require('express');
const router = express.Router();
const connection = require("../database");
const bd = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");


router.use(bd.json());
router.use(bd.urlencoded({ extended: true }));




router.post('/add', async (req, res) => {
    try {
        const {userId,lungRate, heartRate, temperature, type} = req.body;
        const date = new Date();
        const time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        const newMedicionData = {userId,lungRate, heartRate, temperature, type, date, time}
        await connection.query('INSERT INTO mediciones set ?', [newMedicionData]);
        res.send(req.body);
    }catch (error) {
        console.log(error);
        res.status(500).send('Ocurrió un error');
    }
});
  
router.get('/get', async (req, res) => {
    try {
        const mediciones = await connection.query('SELECT * FROM mediciones');
        res.json(mediciones);
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrió un error');
    }
});

router.get('/get/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const mediciones = await connection.query('SELECT * FROM mediciones WHERE userId = ?', [id]);
        res.json(mediciones);
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrió un error');
    }
});

router.get('/get/:id/:fecha', async (req, res) => {
    try {
        const { id, fecha } = req.params;
        const mediciones = await connection.query('SELECT * FROM mediciones WHERE userId = ? AND date = ?', [id, fecha]);
        res.json(mediciones);
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrió un error');
    }
});

router.get('/get/:fecha/:hora', async (req, res) => {
    try {
        const { fecha, hora } = req.params;
        const mediciones = await connection.query('SELECT * FROM mediciones WHERE date = ? AND time = ?', [fecha, hora]);
        res.json(mediciones);
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrió un error');
    }
});

router.post('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {userId,lungRate, heartRate, temperature, type} = req.body;
        date = new Date();
        time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        const newMedicionData = {userId, lungRate, heartRate, temperature, type, date, time}
        await connection.query('UPDATE mediciones set ? WHERE id = ?', [newMedicionData, id]);
        res.send(req.body);
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrió un error');
    }
});

router.post('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await connection.query('DELETE FROM mediciones WHERE id = ?', [id]);
        res.send(req.body);
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrió un error');
    }
});



module.exports = router;
