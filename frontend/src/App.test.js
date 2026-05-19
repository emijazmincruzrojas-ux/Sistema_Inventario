import React, { useState, useEffect } from "react";
import Login from "./Login";
import ListaProductos from "./components/ListaProductos";
import Carrito from "./components/Carrito";
import HistorialVentas from "./components/HistorialVentas";

export default function App() {
  const [user, setUser] = useState(null);
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);

  // 🔐 cargar usuario guardado
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  // login
  const loginUser = (data) => {
    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));
  };

  // logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setCarrito([]);
  };

  // 📦 obtener productos
  const obtenerProductos = async () => {
    try {
      const res = await fetch("http://localhost:3001/productos");
      const data = await res.json();
      setProductos(data);
    } catch (err) {
      console.log("Error productos:", err);
    }
  };

  useEffect(() => {
    if (user) {
      obtenerProductos();
    }
  }, [user]);

  // 🛒 agregar al carrito
  const agregarAlCarrito = (producto, cantidad) => {
    setCarrito((prev) => {
      const existe = prev.find((p) => p.id === producto.id);

      if (existe) {
        return prev.map((p) =>
          p.id === producto.id
            ? { ...p, cantidad: p.cantidad + cantidad }
            : p
        );
      }

      return [...prev, { ...producto, cantidad }];
    });
  };

  // ❌ quitar del carrito
  const quitarDelCarrito = (id) => {
    setCarrito((prev) => prev.filter((p) => p.id !== id));
  };

  // 🧹 limpiar carrito
  const limpiarCarrito = () => {
    setCarrito([]);
  };

  // 🔒 si no hay usuario
  if (!user) return <Login setUser={loginUser} />;

  // ✅ PROTECCIÓN (para que no truene si rol no existe)
  const isAdmin = user?.rol === "admin";

  return (
    <div style={styles.layout}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h3>{user?.usuario}</h3>
        <p style={{ fontSize: 12 }}>
          Rol: {user?.rol || "sin rol"}
        </p>
        <button onClick={logout}>Salir</button>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        
        {/* 🛒 CARRITO */}
        <Carrito
          carrito={carrito}
          quitar={quitarDelCarrito}
          user={user}
          limpiarCarrito={limpiarCarrito}
        />

        {/* 📦 PRODUCTOS */}
        <ListaProductos
          productos={productos}
          agregarAlCarrito={agregarAlCarrito}
          user={user}
        />

        {/* 📊 HISTORIAL */}
        {isAdmin && <HistorialVentas />}
      </div>
    </div>
  );
}

const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    background: "#0f172a",
    color: "white",
  },
  sidebar: {
    width: 200,
    padding: 20,
    background: "#1e293b",
  },
  main: {
    flex: 1,
    padding: 20,
  },
};