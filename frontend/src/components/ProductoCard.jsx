import React from "react";

export default function ProductoCard({ p, cantidad, cambiar, agregar, isAdmin }) {
  return (
    <div style={styles.card}>
      {/* Contenedor de la imagen */}
      <div style={styles.imageContainer}>
        <img 
          src={p.imagen} 
          alt={p.nombre} 
          style={styles.imagen} 
          onError={(e) => {
            // Si la imagen falla por alguna razón, muestra un cuadro gris ordenado
            e.target.src = "https://via.placeholder.com/240x200?text=Sin+Imagen";
          }}
        />
      </div>

      {/* Información del Producto */}
      <div style={styles.info}>
        <h4 style={styles.nombre}>{p.nombre}</h4>
        <p style={styles.precio}>${Number(p.precio).toFixed(2)}</p>
        <p style={styles.stock}>Stock: {p.stock}</p>
      </div>

      {/* Controles de cantidad y botón */}
      <div style={styles.acciones}>
        <input
          type="number"
          value={cantidad}
          min="1"
          max={p.stock}
          onChange={(e) => cambiar(p.id, e.target.value)}
          style={styles.inputCantidad}
        />
        <button 
          onClick={() => agregar(p)} 
          disabled={p.stock <= 0}
          style={{
            ...styles.btnAgregar,
            backgroundColor: p.stock <= 0 ? "#4b5563" : "#00ff66",
            cursor: p.stock <= 0 ? "not-allowed" : "pointer"
          }}
        >
          {p.stock <= 0 ? "Agotado" : "Agregar al carrito"}
        </button>
      </div>

      {isAdmin && (
        <div style={styles.adminBadge}>
          Modo Admin
        </div>
      )}
    </div>
  );
}

// Estilos adaptados al modo oscuro de tu aplicación
const styles = {
  card: {
    backgroundColor: "#1f2937",
    borderRadius: "8px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative",
    border: "1px solid #374151",
  },
  imageContainer: {
    width: "100%",
    height: "180px",
    backgroundColor: "#ffffff",
    borderRadius: "6px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: "12px",
  },
  imagen: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  info: {
    textAlign: "center",
    marginBottom: "12px",
  },
  nombre: {
    color: "#ffffff",
    margin: "0 0 8px 0",
    fontSize: "1.1rem",
  },
  precio: {
    color: "#38bdf8",
    fontWeight: "bold",
    fontSize: "1.2rem",
    margin: "0 0 4px 0",
  },
  stock: {
    color: "#9ca3af",
    fontSize: "0.85rem",
    margin: 0,
  },
  acciones: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  inputCantidad: {
    width: "100%",
    padding: "6px",
    borderRadius: "4px",
    border: "1px solid #4b5563",
    backgroundColor: "#374151",
    color: "#ffffff",
    textAlign: "center",
  },
  btnAgregar: {
    width: "100%",
    color: "#000000",
    border: "none",
    padding: "10px",
    borderRadius: "4px",
    fontWeight: "bold",
    fontSize: "0.9rem",
    transition: "background-color 0.2s",
  },
  adminBadge: {
    position: "absolute",
    top: "8px",
    right: "8px",
    backgroundColor: "#ef4444",
    color: "#ffffff",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "0.7rem",
    fontWeight: "bold",
  }
};