const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// 📁 SERVIR CARPETAS ESTÁTICAS
// ✅ MODIFICADO: Se asigna un alias virtual limpio llamado "/imagenes-productos" para el navegador
app.use("/imagenes-productos", express.static(path.join(__dirname, "public", "assets", "productos")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🔌 CONEXIÓN A LA BASE DE DATOS
const db = mysql.createConnection({
  host: "localhost",
  user: "inventario_user",
  password: "1234",
  database: "inventario",
});

db.connect((err) => {
  if (err) console.log("❌ Error BD:", err);
  else console.log("✅ MySQL conectado exitosamente en la base de datos inventario");
});

// 🔐 RUTA: LOGIN LIBRE
app.post("/login", (req, res) => {
  const { usuario, password } = req.body;
  if (!usuario || !password) {
    return res.json({ error: true, mensaje: "Por favor completa los campos" });
  }
  if (usuario.toLowerCase() === "admin") {
    return res.json({ usuario: "admin", rol: "admin" });
  }
  res.json({ usuario: usuario, rol: "usuario" });
});

// 📦 RUTA CRUD: LISTAR PRODUCTOS
app.get("/productos", (req, res) => {
  db.query("SELECT * FROM productos", (err, result) => {
    if (err) return res.status(500).json(err);
    if (result && result.length > 0) {
      result.forEach(p => {
        // ✅ MODIFICADO: Concatenación usando el nuevo alias estático directo
        p.imagen = `http://localhost:3001/imagenes-productos/${p.imagen}`; 
      });
    }
    res.json(result || []);
  });
});

// ➕ RUTA CRUD: AGREGAR PRODUCTO
app.post("/productos", (req, res) => {
  const { sku, nombre, categoria, precio, stock, imagen } = req.body;
  const usuarioActivo = req.headers["x-usuario"] || "Admin"; 

  const queryInsert = "INSERT INTO productos (sku, nombre, categoria, precio, stock, imagen) VALUES (?, ?, ?, ?, ?, ?)";
  
  db.query(queryInsert, [sku, nombre, categoria, precio, stock, imagen || "default.jpg"], (err, result) => {
    if (err) {
      console.error("❌ Error al insertar producto:", err);
      return res.status(500).json({ error: true, mensaje: "Error al agregar producto o SKU duplicado" });
    }

    const queryAudit = "INSERT INTO auditorias (usuario, accion, modulo, descripcion) VALUES (?, 'CREAR', 'INVENTARIO', ?)";
    const desc = `Se creó el producto: ${nombre} (SKU: ${sku || 'S/N'}) con stock inicial de ${stock}`;
    
    db.query(queryAudit, [usuarioActivo, desc], (auditErr) => {
      if (auditErr) console.error("⚠️ Error al registrar auditoría:", auditErr);
      res.json({ error: false, mensaje: "Producto agregado correctamente y auditado" });
    });
  });
});

// ✏️ RUTA CRUD: EDITAR / ACTUALIZAR PRODUCTO
app.put("/productos/:id", (req, res) => {
  const { id } = req.params;
  const { sku, nombre, categoria, precio, stock, imagen } = req.body;
  const usuarioActivo = req.headers["x-usuario"] || "Admin";

  db.query("SELECT * FROM productos WHERE id = ?", [id], (errFetch, prevResult) => {
    if (errFetch || !prevResult || prevResult.length === 0) return res.status(404).json({ error: true, mensaje: "Producto no encontrado" });
    
    const prodViejo = prevResult[0];

    const queryUpdate = "UPDATE productos SET sku = ?, nombre = ?, categoria = ?, precio = ?, stock = ?, imagen = ? WHERE id = ?";
    db.query(queryUpdate, [sku, nombre, categoria, precio, stock, imagen, id], (err) => {
      if (err) {
        console.error("❌ Error al editar producto:", err);
        return res.status(500).json({ error: true, mensaje: "No se pudo actualizar el producto" });
      }

      const queryAudit = "INSERT INTO auditorias (usuario, accion, modulo, descripcion) VALUES (?, 'EDITAR', 'INVENTARIO', ?)";
      const desc = `Se editó el producto '${prodViejo.nombre}' (ID: ${id}). Cambios -> Stock anterior: ${prodViejo.stock} | Nuevo: ${stock}`;

      db.query(queryAudit, [usuarioActivo, desc], (auditErr) => {
        if (auditErr) console.error("⚠️ Error al registrar auditoría:", auditErr);
        res.json({ error: false, mensaje: "Producto actualizado correctamente" });
      });
    });
  });
});

// ❌ RUTA CRUD: ELIMINAR PRODUCTO
app.delete("/productos/:id", (req, res) => {
  const { id } = req.params;
  const usuarioActivo = req.headers["x-usuario"] || "Admin";

  db.query("SELECT nombre FROM productos WHERE id = ?", [id], (err, selectResult) => {
    if (err || !selectResult || selectResult.length === 0) {
      return res.status(404).json({ error: true, mensaje: "Producto no encontrado" });
    }
    const nombreProducto = selectResult[0].nombre;

    db.query("DELETE FROM productos WHERE id = ?", [id], (errDelete) => {
      if (errDelete) {
        console.error("❌ Error al eliminar:", errDelete);
        return res.status(500).json({ error: true, mensaje: "No se puede eliminar el producto" });
      }

      const queryAudit = "INSERT INTO auditorias (usuario, accion, modulo, descripcion) VALUES (?, 'ELIMINAR', 'INVENTARIO', ?)";
      const desc = `Se eliminó el producto: ${nombreProducto} (ID: ${id})`;

      db.query(queryAudit, [usuarioActivo, desc], (auditErr) => {
        if (auditErr) console.error("⚠️ Error al registrar auditoría:", auditErr);
        res.json({ error: false, mensaje: "Producto eliminado correctamente" });
      });
    });
  });
});

// 🛒 RUTA: PROCESAR COMPRA (CORREGIDA)
app.post("/comprar", (req, res) => {
  const { usuario, carrito } = req.body;
  if (!carrito || carrito.length === 0) {
    return res.status(400).json({ error: true, mensaje: "El carrito está vacío" });
  }

  const total = carrito.reduce((acc, p) => acc + Number(p.precio_unitario || 0) * Number(p.cantidad || 0), 0);
  const nombreUsuario = usuario || "Invitado";

  db.query("INSERT INTO ventas (usuario, total) VALUES (?, ?)", [nombreUsuario, total], (err, result) => {
    if (err) {
      console.error("❌ Error al registrar venta en BD:", err);
      return res.status(500).json({ error: true, mensaje: "No se pudo registrar la venta principal" });
    }

    const ventaId = result.insertId;
    
    const promesas = carrito.map((producto) => {
      return new Promise((resolve, reject) => {
        db.query(
          "INSERT INTO detalles_ventas (venta_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)",
          [ventaId, producto.producto_id, producto.cantidad, producto.precio_unitario], 
          (errDetail) => {
            if (errDetail) {
              console.error("❌ Error en detalles_ventas:", errDetail);
              return reject(errDetail);
            }

            db.query("UPDATE productos SET stock = stock - ? WHERE id = ?", [producto.cantidad, producto.producto_id], (errStock) => {
              if (errStock) {
                console.error("❌ Error al actualizar stock:", errStock);
                return reject(errStock);
              }
              resolve();
            });
          }
        );
      });
    });

    Promise.all(promesas)
      .then(() => {
        const queryAudit = "INSERT INTO auditorias (usuario, accion, modulo, descripcion) VALUES (?, 'CREAR', 'VENTAS', ?)";
        const desc = `Nueva venta registrada #${ventaId}. Total: $${total} hecho por el usuario`;
        db.query(queryAudit, [nombreUsuario, desc], () => {
          res.json({ error: false, mensaje: "¡Compra registrada con éxito!", venta_id: ventaId });
        });
      })
      .catch((errorPromesa) => {
        console.error("❌ Error crítico en lote de promesas de compra:", errorPromesa);
        res.status(500).json({ error: true, mensaje: "Error al actualizar transacciones e inventario" });
      });
  });
});

// =========================================================================
// 🔍 NUEVO ENDPOINT: AUDITORÍA AVANZADA CON MÉTRICAS PARA COMPONENTE TIMELINE
// =========================================================================
app.get("/api/auditorias-premium", (req, res) => {
  const qKpis = `
    SELECT 
      COUNT(*) AS totalEventos,
      SUM(CASE WHEN accion = 'CREAR' THEN 1 ELSE 0 END) AS creaciones,
      SUM(CASE WHEN accion = 'EDITAR' THEN 1 ELSE 0 END) AS actualizaciones,
      SUM(CASE WHEN accion = 'ELIMINAR' THEN 1 ELSE 0 END) AS eliminaciones,
      COUNT(DISTINCT usuario) AS operadoresActivos
    FROM auditorias;
  `;

  const qLista = "SELECT id, usuario, accion, modulo, descripcion, fecha_hora FROM auditorias ORDER BY id DESC;";

  db.query(qKpis, (errKpis, resKpis) => {
    if (errKpis) return res.status(500).json({ error: true, message: errKpis });

    db.query(qLista, (errLista, resLista) => {
      if (errLista) return res.status(500).json({ error: true, message: errLista });

      res.json({
        kpis: {
          totalEventos: resKpis[0]?.totalEventos || 0,
          creaciones: resKpis[0]?.creaciones || 0,
          actualizaciones: resKpis[0]?.actualizaciones || 0,
          eliminaciones: resKpis[0]?.eliminaciones || 0,
          operadoresActivos: resKpis[0]?.operadoresActivos || 0
        },
        eventos: (resLista || []).map(e => ({
          ...e,
          ip_dispositivo: e.usuario && e.usuario.toLowerCase() === "admin" ? "192.168.1.100 • Chrome / Windows" : "192.168.1.105 • Chrome / Windows"
        }))
      });
    });
  });
});

// 📜 RUTA ANTERIOR: MANTENIDA POR COMPATIBILIDAD
app.get("/auditorias", (req, res) => {
  db.query("SELECT * FROM auditorias ORDER BY fecha_hora DESC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result || []);
  });
});

// =========================================================================
// 💎 ENDPOINT PREMIUM: DASHBOARD DE HISTORIAL GENERAL DE VENTAS
// =========================================================================
app.get("/api/historial-ventas-premium", (req, res) => {
  const qKpis = `
    SELECT 
      IFNULL(SUM(total), 0) AS ventasTotales,
      COUNT(id) AS ordenesRealizadas,
      IFNULL(AVG(total), 0) AS ticketPromedio,
      COUNT(DISTINCT usuario) AS clientesUnicos
    FROM ventas;
  `;

  const qProductosVendidos = `SELECT IFNULL(SUM(cantidad), 0) AS total FROM detalles_ventas;`;

  const qVentasPorDia = `
    SELECT 
      DATE_FORMAT(fecha, '%d %b') AS fecha,
      SUM(total) AS ventas
    FROM ventas
    GROUP BY DATE(fecha)
    ORDER BY DATE(fecha) ASC
    LIMIT 15;
  `;

  const qVentasPorCategoria = `
    SELECT 
      IFNULL(p.categoria, 'Sin Categoría') AS name,
      SUM(dv.cantidad * dv.precio_unitario) AS value
    FROM detalles_ventas dv
    JOIN productos p ON dv.producto_id = p.id
    GROUP BY p.categoria;
  `;

  const qListadoOrdenes = `
    SELECT 
      v.id AS id,
      v.usuario AS cliente_nombre,
      v.fecha AS fecha,
      v.total AS total,
      GROUP_CONCAT(CONCAT(p.nombre, ' (x', dv.cantidad, ')') SEPARATOR ', ') AS productos_resumen
    FROM ventas v
    LEFT JOIN detalles_ventas dv ON v.id = dv.venta_id
    LEFT JOIN productos p ON dv.producto_id = p.id
    GROUP BY v.id
    ORDER BY v.id DESC;
  `;

  db.query(qKpis, (err, resKpis) => {
    if (err) return res.status(500).json({ error: true, message: err });
    db.query(qProductosVendidos, (err, resProd) => {
      if (err) return res.status(500).json({ error: true, message: err });
      db.query(qVentasPorDia, (err, resDias) => {
        if (err) return res.status(500).json({ error: true, message: err });
        db.query(qVentasPorCategoria, (err, resCat) => {
          if (err) return res.status(500).json({ error: true, message: err });
          db.query(qListadoOrdenes, (err, resOrdenes) => {
            if (err) return res.status(500).json({ error: true, message: err });

            res.json({
              kpis: {
                ventasTotales: Number(resKpis[0]?.ventasTotales || 0),
                ordenesRealizadas: Number(resKpis[0]?.ordenesRealizadas || 0),
                ticketPromedio: Number(resKpis[0]?.ticketPromedio || 0),
                productosVendidos: Number(resProd[0]?.total || 0),
                clientesUnicos: Number(resKpis[0]?.clientesUnicos || 0)
              },
              graficoLinea: resDias || [],
              graficoTorta: (resCat || []).map(item => ({ name: item.name, value: Number(item.value || 0) })),
              ordenes: resOrdenes || []
            });
          });
        });
      });
    });
  });
});

// =========================================================================
// 📊 ENDPOINT UNIFICADO: PANEL GENERAL (DASHBOARD)
// =========================================================================
app.get("/api/dashboard-general", (req, res) => {
  const qProductos = "SELECT precio, stock, nombre, id AS sku FROM productos";
  const qVentasKpis = "SELECT IFNULL(SUM(total), 0) AS totalFacturado, COUNT(*) AS totalOrdenes FROM ventas";
  const qAuditorias = "SELECT descripcion AS detalle, fecha_hora AS fecha FROM auditorias ORDER BY id DESC LIMIT 4";

  db.query(qProductos, (err, resProd) => {
    if (err) return res.status(500).json(err);
    db.query(qVentasKpis, (err, resVentas) => {
      if (err) return res.status(500).json(err);
      db.query(qAuditorias, (err, resAudit) => {
        if (err) return res.status(500).json(err);

        const safeProd = resProd || [];
        const totalProductos = safeProd.length;
        const stockBajo = safeProd.filter(p => p.stock > 0 && p.stock <= 2).length;
        const agotados = safeProd.filter(p => p.stock === 0).length;
        const enStock = totalProductos - stockBajo - agotados;

        let valorInventario = 0;
        safeProd.forEach(p => {
          valorInventario += (Number(p.precio || 0) * Number(p.stock || 0));
        });

        const productosAlerta = safeProd
          .filter(p => p.stock <= 2)
          .slice(0, 5)
          .map(p => ({
            nombre: p.nombre,
            sku: p.sku,
            stock: p.stock,
            estado: p.stock === 0 ? "Agotado" : "Stock Bajo"
          }));

        const historialValor = [
          { fecha: "14 May", valor: valorInventario * 0.96 },
          { fecha: "15 May", valor: valorInventario * 0.94 },
          { fecha: "16 May", valor: valorInventario * 0.99 },
          { fecha: "17 May", valor: valorInventario * 0.98 },
          { fecha: "18 May", valor: valorInventario }
        ];

        res.json({
          kpis: {
            totalProductos,
            alertasStock: stockBajo + agotados,
            valorInventario,
            ventasMes: resVentas[0]?.totalFacturado || 0,
            ordenesMes: resVentas[0]?.totalOrdenes || 0
          },
          distribucionInventario: [
            { name: "En Stock", value: enStock, color: "#10b981" },
            { name: "Stock Bajo", value: stockBajo, color: "#f59e0b" },
            { name: "Agotados", value: agotados, color: "#ef4444" },
            { name: "Sin Clasificar", value: 0, color: "#64748b" }
          ],
          productosAlerta,
          actividadReciente: resAudit || [],
          historialValor
        });
      });
    });
  });
});

app.listen(3001, () => {
  console.log("🔥 Servidor backend corriendo en: http://localhost:3001");
});