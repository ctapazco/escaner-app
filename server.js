const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bodyParser = require('body-parser');
//permite habilitar o restringir solicitudes de diferentes dominions al servidor.
const cors = require('cors');

const app = express();

/*conexion a la base de datos
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'ctapasco',
  password: 'Soy290692..',
  database: 'escaner_db'
});*/

require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT, 
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

//prueba de conexion
connection.connect(err => {
  if (err) throw err;
  console.log('🟢 Conectado a MySQL');
});


app.use(cors());
//convierte todo automaticamente en json
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); 

// Rutas API
app.post('/api/productos', (req, res) => {
    const { codigo, nombre, ubicacion } = req.body;
  
    // Verificar si ya existe
    connection.query('SELECT * FROM productos WHERE codigo = ?', [codigo], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length > 0) {
        return res.status(409).json({ error: 'Este producto ya está registrado.' });
      }
  
      // Si no existe, insertar
      const query = `INSERT INTO productos (codigo, nombre, ubicacion) VALUES (?, ?, ?)`;
      connection.query(query, [codigo, nombre, ubicacion], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      });
    });
  });

app.get('/api/productos/:codigo', (req, res) => {
  const codigo = req.params.codigo;
  connection.query(
    'SELECT * FROM productos WHERE codigo = ?',
    [codigo],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json(results[0]);
    }
  );
});

app.patch('/api/productos/:codigo', (req, res) => {
    //solicitud a una ruta
    const codigo = req.params.codigo;
    const { ubicacion } = req.body;
  
    const query = `UPDATE productos SET ubicacion = ? WHERE codigo = ?`;
    connection.query(query, [ubicacion, codigo], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Producto no encontrado, registralo' });
      }
      res.json({ success: true });
    });
  });
  
// Iniciar servidor
app.listen(3000, () => {
  console.log('🚀 Servidor iniciado en http://localhost:3000');
});


