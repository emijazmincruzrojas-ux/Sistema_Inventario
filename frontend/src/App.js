import React, { useState, useEffect } from "react";
import Login from "./Login";
import ListaProductos from "./components/ListaProductos";
import HistorialVentas from "./components/HistorialVentas";
import Auditorias from "./components/Auditorias";
import Formulario from "./components/Formulario"; 
import FastechTienda from "./components/FastechTienda";
import DashboardGeneral from "./components/DashboardGeneral";

export default function App() {
  const [user, setUser] = useState(null);
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  
  const [seccionActiva, setSeccionActiva] = useState("dashboard");
  const [datosPremium, setDatosPremium] = useState(null);
  const [datosDashboard, setDatosDashboard] = useState(null);
  const [productoEnEdicion, setProductoEnEdicion] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const loginUser = (data) => {
    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));
    if (data.rol !== "admin") {
      setSeccionActiva("tienda");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setCarrito([]);
    setDatosPremium(null);
    setDatosDashboard(null);
  };

  const obtenerProductos = async () => {
    try {
      const res = await fetch("http://localhost:3001/productos");
      const data = await res.json();
      setProductos(data);
    } catch (err) {
      console.error("Error al traer productos:", err);
    }
  };

  const cargarHistorialPremium = async () => {
    try {
      const respuesta = await fetch("http://localhost:3001/api/historial-ventas-premium");
      const data = await respuesta.json();
      setDatosPremium(data);
    } catch (error) {
      console.error("Error al cargar el historial analítico:", error);
    }
  };

  const cargarDashboardGeneral = async () => {
    try {
      const respuesta = await fetch("http://localhost:3001/api/dashboard-general");
      const data = await respuesta.json();
      setDatosDashboard(data);
    } catch (error) {
      console.error("Error al cargar datos del dashboard general:", error);
    }
  };

  const manejarCambioSeccion = async (seccion) => {
    setSeccionActiva(seccion);
    if (seccion === "dashboard") {
      cargarDashboardGeneral();
    } else if (seccion === "ventas" || seccion === "mis-pedidos") {
      setDatosPremium([]); 
      await cargarHistorialPremium(); 
    }
  };

  useEffect(() => {
    if (user) {
      obtenerProductos();
      if (user.rol === "admin") {
        cargarDashboardGeneral();
      } else {
        setSeccionActiva("tienda");
      }
    }
  }, [user]);

  const eliminarProducto = async (id) => {
    if (window.confirm("⚠️ ¿Seguro que deseas eliminar permanentemente este producto del almacén?")) {
      try {
        await fetch(`http://localhost:3001/productos/${id}`, {
          method: "DELETE",
          headers: { "x-usuario": user?.usuario || "Admin" }
        });
        obtenerProductos();
        cargarDashboardGeneral();
      } catch (error) {
        console.error("Error al borrar producto:", error);
      }
    }
  };

  const iniciarEdicion = (prod) => {
    setProductoEnEdicion(prod);
  };

  const agregarAlCarrito = (producto, cantidad) => {
    setCarrito((prev) => {
      const existe = prev.find((p) => p.id === producto.id);
      if (existe) {
        const nuevaCantidad = existe.cantidad + cantidad;
        if (nuevaCantidad > producto.stock) {
          alert(`⚠️ No puedes llevar más de ${producto.stock} unidades de este producto.`);
          return prev;
        }
        return prev.map((p) =>
          p.id === producto.id ? { ...p, cantidad: nuevaCantidad } : p
        );
      }
      return [...prev, { ...producto, cantidad: cantidad }];
    });
  };

  if (!user) return <Login setUser={loginUser} />;

  const isAdmin = user?.rol === "admin";

  if (isAdmin) {
    return (
      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <div style={styles.brandContainer}>
            <span style={styles.brandText}>InventarioPro</span>
          </div>
          
          <div style={styles.userSection}>
            <div style={styles.avatar}>👩‍💻</div>
            <div>
              <div style={styles.userName}>{user.usuario}</div>
              <div style={styles.userRole}>Administrador</div>
            </div>
          </div>

          <nav style={styles.navMenu}>
            <button onClick={() => manejarCambioSeccion("dashboard")} style={{...styles.navBtn, backgroundColor: seccionActiva === "dashboard" ? "#a855f7" : "transparent"}}>📊 Dashboard</button>
            <button onClick={() => manejarCambioSeccion("inventario")} style={{...styles.navBtn, backgroundColor: seccionActiva === "inventario" ? "#a855f7" : "transparent"}}>📦 Inventario</button>
            <button onClick={() => manejarCambioSeccion("ventas")} style={{...styles.navBtn, backgroundColor: seccionActiva === "ventas" ? "#a855f7" : "transparent"}}>📜 Historial Ventas</button>
            <button onClick={() => manejarCambioSeccion("auditorias")} style={{...styles.navBtn, backgroundColor: seccionActiva === "auditorias" ? "#a855f7" : "transparent"}}>🔍 Auditorías</button>
          </nav>

          <button onClick={logout} style={styles.btnCerrarSesion}>🚪 Cerrar Sesión</button>
        </aside>

        <main style={styles.main}>
          {seccionActiva === "dashboard" && <DashboardGeneral datos={datosDashboard} cambiarSeccion={manejarCambioSeccion} />}
          {seccionActiva === "inventario" && (
            <div style={{ padding: "30px" }}>
              <h2 style={styles.pageTitleForm}>Gestión de Inventario</h2>
              <Formulario recargar={() => { obtenerProductos(); cargarDashboardGeneral(); }} user={user} productoEdicion={productoEnEdicion} limpiarEdicion={() => setProductoEnEdicion(null)} />
              <div style={{marginTop: "30px"}}>
                <ListaProductos productos={productos} user={user} onEliminar={eliminarProducto} onIniciarEdicion={iniciarEdicion} />
              </div>
            </div>
          )}
          {seccionActiva === "ventas" && <HistorialVentas datos={datosPremium} />}
          {seccionActiva === "auditorias" && (
            <div style={{ padding: "30px" }}>
              <h2 style={styles.pageTitleForm}>Auditoría de Acciones y Seguridad</h2>
              <Auditorias />
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <FastechTienda 
      productos={productos}
      agregarAlCarrito={agregarAlCarrito}
      carrito={carrito}
      quitar={(id) => setCarrito(p => p.filter(prod => prod.id !== id))}
      limpiarCarrito={() => setCarrito([])}
      obtenerProductos={obtenerProductos}
      cargarHistorialPremium={cargarHistorialPremium}
      logout={logout}
      user={user}
      seccionActiva={seccionActiva}        
      cambiarSeccion={manejarCambioSeccion}  
      datosPedidos={datosPremium}            
    />
  );
}

const styles = {
  layout: { display: "flex", minHeight: "100vh", backgroundColor: "#090d16", color: "#f8fafc", fontFamily: "sans-serif" },
  sidebar: { width: "240px", backgroundColor: "#111827", padding: "20px", display: "flex", flexDirection: "column", borderRight: "1px solid #1f2937", flexShrink: 0 },
  brandContainer: { paddingBottom: "20px", borderBottom: "1px solid #1f2937", marginBottom: "20px" },
  brandText: { fontSize: "1.4rem", fontWeight: "bold", color: "#d946ef", letterSpacing: "1px" },
  userSection: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "30px", backgroundColor: "#1f2937", padding: "10px", borderRadius: "8px", border: "1px solid #1f2937" },
  avatar: { fontSize: "1.3rem", backgroundColor: "#374151", padding: "6px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" },
  userName: { fontWeight: "bold", fontSize: "0.95rem", color: "white" },
  userRole: { fontSize: "0.75rem", color: "#94a3b8", marginTop: "2px" },
  navMenu: { display: "flex", flexDirection: "column", gap: "8px", flexGrow: 1 },
  navBtn: { width: "100%", textAlign: "left", color: "white", border: "none", padding: "12px 15px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "0.9rem", transition: "0.2s", outline: "none" },
  btnCerrarSesion: { width: "100%", backgroundColor: "#1f2937", color: "#f8fafc", border: "1px solid #374151", padding: "11px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", marginTop: "auto", transition: "0.2s" },
  main: { flexGrow: 1, padding: "0px", overflowY: "auto", boxSizing: "border-box" }, 
  pageTitleForm: { margin: "0 0 25px 0", fontSize: "1.5rem", fontWeight: "bold", color: "white" }
};