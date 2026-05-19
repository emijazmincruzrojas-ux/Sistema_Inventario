import React, { useState } from "react";

export default function Carrito({ carrito, quitar, limpiarCarrito, user }) {
  const [procesando, setProcesando] = useState(false);

  // Cálculo del total acumulado del carrito
  const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

  const realizarCompra = async () => {
    if (carrito.length === 0) return;
    
    setProcesando(true);

    try {
      // Petición POST enviando el usuario logueado y el arreglo de productos
      const res = await fetch("http://localhost:3001/comprar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario: user?.usuario, // Captura el nombre del usuario (ej: 'emi')
          carrito: carrito
        }),
      });

      const data = await res.json();

      if (data.error) {
        alert("Error: " + data.mensaje);
      } else {
        alert("¡Compra realizada con éxito! Guardada en el historial.");
        limpiarCarrito(); // Vacía el contenedor visual en React
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Error crítico de conexión con el backend (Puerto 3001)");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div style={styles.carritoContainer}>
      <h3 style={styles.titulo}>Carrito</h3>
      
      {carrito.length === 0 ? (
        <p style={styles.textoVacio}>Carrito vacío</p>
      ) : (
        <div style={styles.listaProductos}>
          {carrito.map((p) => (
            <div key={p.id} style={styles.item}>
              <span style={styles.itemNombre}>{p.nombre}</span>
              <span style={styles.itemCantidad}>x{p.cantidad}</span>
              <span style={styles.itemPrecio}>${(p.precio * p.cantidad).toFixed(2)}</span>
              <button onClick={() => quitar(p.id)} style={styles.btnQuitar}>
                Quitar
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={styles.totalContainer}>
        <strong>Total: ${total.toFixed(2)}</strong>
      </div>

      <button 
        onClick={realizarCompra} 
        disabled={carrito.length === 0 || procesando} 
        style={{
          ...styles.btnComprar,
          backgroundColor: carrito.length === 0 || procesando ? "#2c3e50" : "#00ff66",
          cursor: carrito.length === 0 || procesando ? "not-allowed" : "pointer"
        }}
      >
        {procesando ? "Procesando..." : "Comprar"}
      </button>
    </div>
  );
}

// Estilos adaptados al modo oscuro de tu interfaz
const styles = {
  carritoContainer: {
    backgroundColor: "#111827",
    color: "#ffffff",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontFamily: "sans-serif",
  },
  titulo: {
    margin: "0 0 10px 0",
    fontSize: "1.2rem",
  },
  textoVacio: {
    color: "#9ca3af",
    fontStyle: "italic",
  },
  listaProductos: {
    marginBottom: "15px",
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #1f2937",
  },
  itemNombre: {
    flex: 2,
  },
  itemCantidad: {
    flex: 1,
    color: "#9ca3af",
  },
  itemPrecio: {
    flex: 1,
    textAlign: "right",
    marginRight: "10px",
  },
  btnQuitar: {
    backgroundColor: "#e11d48",
    color: "white",
    border: "none",
    padding: "4px 8px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  totalContainer: {
    fontSize: "1.1rem",
    margin: "15px 0",
  },
  btnComprar: {
    width: "100%",
    color: "#000000",
    border: "none",
    padding: "12px",
    borderRadius: "4px",
    fontWeight: "bold",
    fontSize: "1rem",
    transition: "background-color 0.2s",
  },
};