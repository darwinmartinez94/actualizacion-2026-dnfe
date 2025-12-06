const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { query } = require("./database/db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static("../frontend"));

// Ruta de prueba
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Servidor funcionando", version: "1.0.0" });
});

// Crear un nuevo registro (sin protección)
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

// Ruta para obtener todos los registros (opcional, si la necesitas)
app.get("/api/personal", async (req, res) => {
  try {
    const result = await query(
      "SELECT id, nombre_completo, grado, cargo, unidad, fecha_ingreso FROM personal ORDER BY fecha_ingreso DESC"
    );
    res.json({
      success: true,
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

// Ruta para obtener un registro por ID (opcional)
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
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
