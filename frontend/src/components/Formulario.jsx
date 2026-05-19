import React, { useState, useEffect } from "react";

export default function Formulario({ recargar, user, productoEdicion, limpiarEdicion }) {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [sku, setSku] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagen, setImagen] = useState("");
  
  // Estado para manejar mensajes de validación internos sin usar alert()
  const [notificacion, setNotificacion] = useState({ error: false, mensaje: "" });

  // 🔄 Efecto para cargar los datos del producto cuando se presiona "Editar"
  useEffect(() => {
    if (productoEdicion) {
      setNombre(productoEdicion.nombre || "");
      setPrecio(productoEdicion.precio || "");
      setStock(productoEdicion.stock || "");
      setSku(productoEdicion.sku || "");
      setCategoria(productoEdicion.categoria || "");
      setImagen(productoEdicion.imagen || "");
    } else {
      limpiarCampos();
    }
  }, [productoEdicion]);

  const limpiarCampos = () => {
    setNombre("");
    setPrecio("");
    setStock("");
    setSku("");
    setCategoria("");
    setImagen("");
  };

  const guardar = async (e) => {
    e.preventDefault(); 

    if (!nombre || !precio || !stock || !sku || !categoria) {
      setNotificacion({ error: true, mensaje: "⚠️ Por favor completa todos los campos obligatorios." });
      return;
    }

    const usuarioActivo = user?.usuario || "Admin";
    
    // 🔀 Si hay un producto en edición, apuntamos a su ID con método PUT, si no, POST general
    const esEdicion = !!productoEdicion;
    const url = esEdicion 
      ? `http://localhost:3001/productos/${productoEdicion.id}`
      : "http://localhost:3001/productos";
    const metodo = esEdicion ? "PUT" : "POST";

    try {
      const respuesta = await fetch(url, {
        method: metodo,
        headers: { 
          "Content-Type": "application/json",
          "x-usuario": usuarioActivo 
        },
        body: JSON.stringify({ 
          sku, 
          nombre, 
          categoria, 
          precio: Number(precio), 
          stock: Number(stock), 
          imagen: imagen || "default.jpg" 
        }),
      });

      const resultado = await respuesta.json();

      if (resultado.error) {
        setNotificacion({ error: true, mensaje: `❌ ${resultado.mensaje}` });
      } else {
        setNotificacion({ 
          error: false, 
          mensaje: esEdicion ? "🎉 ¡Producto actualizado correctamente!" : "🎉 ¡Producto registrado correctamente!" 
        });
        
        limpiarCampos();
        if (esEdicion && limpiarEdicion) limpiarEdicion(); // Avisamos a App.jsx que terminamos de editar
        recargar();

        setTimeout(() => setNotificacion({ error: false, mensaje: "" }), 3000);
      }
    } catch (error) {
      console.error("Error al procesar producto:", error);
      setNotificacion({ error: true, mensaje: "❌ No se pudo conectar con el servidor." });
    }
  };

  return (
    <div style={styles.contenedorForm}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h2 style={styles.titulo}>
          {productoEdicion ? "🔧 Editando Producto Stock" : "➕ Registrar Nuevo Producto"}
        </h2>
        {productoEdicion && (
          <button 
            type="button" 
            onClick={() => { limpiarCampos(); limpiarEdicion(); }} 
            style={styles.btnCancelar}
          >
            ❌ Cancelar Edición
          </button>
        )}
      </div>
      
      {notificacion.mensaje && (
        <div style={{
          ...styles.alerta,
          backgroundColor: notificacion.error ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)",
          borderColor: notificacion.error ? "#ef4444" : "#10b981",
          color: notificacion.error ? "#fca5a5" : "#a7f3d0"
        }}>
          {notificacion.mensaje}
        </div>
      )}

      <form onSubmit={guardar} style={styles.form}>
        <div style={styles.filaInput}>
          <div style={styles.campo}>
            <label style={styles.label}>Código SKU *</label>
            <input
              placeholder="Ej: LNV-IDEAPAD"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.campo}>
            <label style={styles.label}>Nombre del Producto *</label>
            <input
              placeholder="Ej: Lenovo Ideapad"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.filaInput}>
          <div style={styles.campo}>
            <label style={styles.label}>Categoría *</label>
            <select 
              value={categoria} 
              onChange={(e) => setCategoria(e.target.value)} 
              style={styles.select}
            >
              <option value="">-- Selecciona una --</option>
              <option value="Laptops">Laptops</option>
              <option value="Celulares">Celulares</option>
              <option value="Audio">Audio</option>
              <option value="Accesorios">Accesorios</option>
              <option value="Televisores">Televisores</option>
            </select>
          </div>

          <div style={styles.campo}>
            <label style={styles.label}>Nombre de Imagen (Opcional)</label>
            <input
              placeholder="Ej: lenovo.jpg"
              value={imagen}
              onChange={(e) => setImagen(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.filaInput}>
          <div style={styles.campo}>
            <label style={styles.label}>Precio de Venta ($) *</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.campo}>
            <label style={styles.label}>Stock *</label>
            <input
              type="number"
              placeholder="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        <button type="submit" style={{...styles.btnGuardar, backgroundColor: productoEdicion ? "#d97706" : "#a21caf"}}>
          {productoEdicion ? "💾 Actualizar Cambios en Almacén" : "📦 Guardar Producto en Almacén"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  contenedorForm: { backgroundColor: "#111827", border: "1px solid #1f2937", borderRadius: "10px", padding: "20px", marginBottom: "25px", width: "100%", boxSizing: "border-box" },
  titulo: { color: "#38bdf8", margin: 0, fontSize: "1.2rem", fontWeight: "bold" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  filaInput: { display: "flex", gap: "15px", flexWrap: "wrap" },
  campo: { flex: 1, minWidth: "200px", display: "flex", flexDirection: "column", gap: "5px" },
  label: { color: "#94a3b8", fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase" },
  input: { backgroundColor: "#1f2937", border: "1px solid #374151", color: "white", padding: "10px 12px", borderRadius: "6px", fontSize: "0.9rem", outline: "none" },
  select: { backgroundColor: "#1f2937", border: "1px solid #374151", color: "white", padding: "10px 12px", borderRadius: "6px", fontSize: "0.9rem", outline: "none", cursor: "pointer" },
  alerta: { padding: "12px", borderRadius: "6px", border: "1px solid", fontSize: "0.9rem", fontWeight: "500", marginBottom: "10px" },
  btnGuardar: { color: "white", border: "none", padding: "12px", borderRadius: "6px", fontSize: "0.95rem", fontWeight: "bold", cursor: "pointer", marginTop: "5px", transition: "background 0.2s" },
  btnCancelar: { backgroundColor: "#374151", color: "#94a3b8", border: "1px solid #4b5563", padding: "6px 12px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "bold", cursor: "pointer" }
};