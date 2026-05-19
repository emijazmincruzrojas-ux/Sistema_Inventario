import React from "react";

export default function ListaProductos({ productos, agregarAlCarrito, user, onEliminar, onIniciarEdicion }) {
  const isAdmin = user?.rol === "admin";

  return (
    <div style={styles.grid}>
      {productos.map((prod) => {
        const estaAgotado = prod.stock <= 0;

        return (
          <div 
            key={prod.id} 
            style={{
              ...styles.card, 
              opacity: estaAgotado && !isAdmin ? 0.6 : 1
            }}
          >
            <div>
              <div style={styles.imageContainer}>
                {estaAgotado && <div style={styles.badgeAgotado}>AGOTADO</div>}
                <img src={prod.imagen} alt={prod.nombre} style={styles.img} />
              </div>

              <h4 style={styles.nombre}>{prod.nombre}</h4>
              
              <div style={styles.metaData}>
                {prod.sku && <span style={styles.skuBadge}>SKU: {prod.sku}</span>}
                {prod.categoria && <span style={styles.catBadge}>{prod.categoria}</span>}
              </div>

              <p style={styles.precio}>${Number(prod.precio).toLocaleString()}</p>
            </div>
            
            <div>
              <p style={{...styles.stock, color: estaAgotado ? "#ef4444" : "#94a3b8"}}>
                Stock disponible: {prod.stock}
              </p>

              {isAdmin ? (
                <div style={styles.adminActions}>
                  <button 
                    onClick={() => onIniciarEdicion(prod)} 
                    style={styles.btnEditar}
                  >
                    🔧 Editar
                  </button>
                  <button 
                    onClick={() => onEliminar(prod.id)} 
                    style={styles.btnEliminar}
                  >
                    🗑️ Borrar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => agregarAlCarrito(prod, 1)}
                  disabled={estaAgotado}
                  style={{
                    ...styles.btnAgregar,
                    backgroundColor: estaAgotado ? "#334155" : "#10b981",
                    cursor: estaAgotado ? "not-allowed" : "pointer"
                  }}
                >
                  {estaAgotado ? "Sin Existencias" : "Agregar al Carrito"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "20px" },
  card: { backgroundColor: "#111827", padding: "16px", borderRadius: "10px", border: "1px solid #1f2937", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "340px", boxSizing: "border-box" },
  imageContainer: { position: "relative", width: "100%", height: "140px", backgroundColor: "white", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", padding: "10px", boxSizing: "border-box" },
  img: { maxWidth: "100%", maxHeight: "100%", objectFit: "contain" },
  badgeAgotado: { position: "absolute", top: "10px", left: "10px", backgroundColor: "#ef4444", color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "bold", zIndex: 2 },
  nombre: { margin: "12px 0 6px 0", fontSize: "0.95rem", color: "#f8fafc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  metaData: { display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" },
  skuBadge: { backgroundColor: "#1f2937", color: "#94a3b8", fontSize: "0.7rem", padding: "2px 6px", borderRadius: "4px", border: "1px solid #374151" },
  catBadge: { backgroundColor: "#1e1b4b", color: "#c084fc", fontSize: "0.7rem", padding: "2px 6px", borderRadius: "4px", border: "1px solid #312e81" },
  precio: { color: "#38bdf8", fontWeight: "bold", margin: "4px 0", fontSize: "1.2rem" },
  stock: { fontSize: "0.85rem", margin: "10px 0 12px 0", fontWeight: "500" },
  btnAgregar: { color: "white", border: "none", padding: "10px", borderRadius: "6px", fontWeight: "bold", width: "100%", fontSize: "0.88rem" },
  adminActions: { display: "flex", gap: "8px", width: "100%" },
  btnEditar: { flex: 1, backgroundColor: "#d97706", color: "white", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "0.85rem" },
  btnEliminar: { flex: 1, backgroundColor: "#dc2626", color: "white", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "0.85rem" }
};