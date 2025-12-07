const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { query, testConnection } = require("./database/db");
const { version } = require("react");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

//Confugurar CORS para produccion
const corsOptions = {
  origin: function (origin, callback) {
    //en desarrollo permitir localhost
    if (process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }
    // En producción, permitir solo el dominio específico
    const allowedOrigin = [
      "https://actualizacion-2026-dnfe.onrender.com", // frontend
      "http://localhost:3000", //local
    ];

    if (!origin || allowedOrigin.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error("No permitido por CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static("../frontend"));

// Ruta de prueba
app.get("/api/health", async (req, res) => {
  try {
    const dbConnected = await testConnection();

    res.json({
      status: "ok",
      message: "Servidor funcionando",
      version: "1.0.0",
      enviroment: process.env.NODE_ENV || "development",
      database: dbConnected ? "Conectada" : "No conectada",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error en el servidor",
    });
  }
});

//ruta principal
app.get("/", (req, res) => {
  res.json({
    message: "Bienvenido a la API de Actualización DNFE 2026",
    version: "1.0.0",
    enviroment: process.env.NODE_ENV || "development",
    endpoins: {
      health: "GET /api/health",
      createRecord: "POST /api/personal",
      getAllRecords: "GET /api/personal",
      getRecordById: "GET /api/personal/:id",
    },
  });
});

// Crear un nuevo registro
app.post("/api/personal", async (req, res) => {
  try {
    const {
      grado,
      nombre,
      identidad,
      rtn,
      telefono,
      cargo,
      fecha_ingreso,
      promocion,
      chapa,
      direccion,
      unidad,
      correo,
      funcion,
      fecha_nacimiento,
      sexo,
      nivel_academico,
      profesion,
      sangre,
      etnia,
      estado_civil,
      lugar_nacimiento,
      depto_residencia,
      municipio_residencia,
      direccion_residencia,
      talla_camisa,
      talla_pantalon,
      talla_bota,
      enfermedad_base,
      sepultura,
      contacto_emergencia,
      numero_emergencia,
      direccion_emergencia,
      conyuge,
      dni_conyuge,
      residencia_conyuge,
      padre,
      madre,
      hijos,
      tiene_cuenta_tribunal,
      declaro_tsc,
      fusil,
      pistola,
      aros,
      vacaciones,
      grupo_salida,
      antiguedad,
      cursos_internacionales,
      cursos_nacionales,
      seminarios,
      carta_encomio,
    } = req.body;

    // Validar campos requeridos
    const requiredFields = [
      "grado",
      "nombre",
      "identidad",
      "telefono",
      "cargo",
      "fecha_ingreso",
      "direccion",
      "unidad",
      "correo",
      "funcion",
      "fecha_nacimiento",
      "sexo",
    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Faltan campos requeridos: ${missingFields.join(", ")}`,
      });
    }

    const result = await query(
      `INSERT INTO personal (
        grado, nombre_completo, identidad, rtn, telefono, cargo,
        fecha_ingreso, promocion, chapa, direccion, unidad, correo,
        funcion, fecha_nacimiento, sexo, nivel_academico, profesion,
        tipo_sangre, etnia, estado_civil, lugar_nacimiento,
        depto_residencia, municipio_residencia, direccion_completa,
        talla_camisa, talla_pantalon, talla_bota, enfermedad_base,
        lugar_sepultura, contacto_emergencia, telefono_emergencia,
        direccion_emergencia, conyuge_nombre, conyuge_dni,
        conyuge_residencia, padre_nombre, madre_nombre, hijos,
        cuenta_tribunal, declaro_tsc, fusil_asignado, pistola_asignada,
        aros_presion, vacaciones_pendientes, grupo_salida, antiguedad,
        cursos_internacionales, cursos_nacionales, seminarios_talleres,
        reconocimientos
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24,
        $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36,
        $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48,
        $49, $50) RETURNING id`,
      [
        grado,
        nombre,
        identidad,
        rtn,
        telefono,
        cargo,
        fecha_ingreso,
        promocion,
        chapa,
        direccion,
        unidad,
        correo,
        funcion,
        fecha_nacimiento,
        sexo,
        nivel_academico,
        profesion,
        sangre,
        etnia,
        estado_civil,
        lugar_nacimiento,
        depto_residencia,
        municipio_residencia,
        direccion_residencia,
        talla_camisa,
        talla_pantalon,
        talla_bota,
        enfermedad_base,
        sepultura,
        contacto_emergencia,
        numero_emergencia,
        direccion_emergencia,
        conyuge,
        dni_conyuge,
        residencia_conyuge,
        padre,
        madre,
        hijos,
        tiene_cuenta_tribunal,
        declaro_tsc,
        fusil,
        pistola,
        aros,
        vacaciones,
        grupo_salida,
        antiguedad,
        cursos_internacionales,
        cursos_nacionales,
        seminarios,
        carta_encomio,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Registro creado exitosamente",
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("Error al crear registro:", error);

    // Verificar si es error de duplicado
    if (error.code === "23505") {
      // Código de violación de unicidad en PostgreSQL
      res.status(400).json({
        success: false,
        message: "Ya existe un registro con esta identidad",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error al crear el registro",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
});

// Ruta para obtener todos los registros
app.get("/api/personal", async (req, res) => {
  try {
    const result = await query(
      "SELECT id, nombre_completo, grado, cargo, unidad, created_at FROM personal ORDER BY created_at DESC LIMIT 10"
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error al obtener registros:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener registros",
    });
  }
});

// Ruta para obtener un registro por ID
app.get("/api/personal/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query("SELECT * FROM personal WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Registro no encontrado",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al obtener registro:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener registro",
    });
  }
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`Servidor iniciado en puerto ${PORT}`);
  console.log(` Entorno: ${process.env.NODE_ENV || "development"}`);

  // Probar conexión a BD al iniciar
  await testConnection();
});
