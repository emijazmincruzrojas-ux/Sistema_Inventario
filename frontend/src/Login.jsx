import React, { useState } from "react";

export default function Login({ setUser }) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  const manejarLogin = async (e) => {
    // Evita que la página se recargue al enviar el formulario
    e.preventDefault(); 
    
    // Validación básica antes de ir al servidor
    if (!usuario.trim() || !password.trim()) {
      setMensajeError("Por favor, completa todos los campos.");
      return;
    }

    setCargando(true);
    setMensajeError("");

    try {
      const res = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuario, password }),
      });

      const data = await res.json();

      if (data.error) {
        setMensajeError("Usuario o contraseña incorrectos.");
      } else {
        setUser(data); // Guarda el objeto { usuario, rol } en tu App.jsx
      }
    } catch (error) {
      console.error("Error en el login:", error);
      setMensajeError("Error de conexión con el servidor (Puerto 3001).");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.pantallaCompleta}>
      <div style={styles.contenedorLogin}>
        <h2 style={styles.titulo}>🔐 Iniciar Sesión</h2>
        
        <form onSubmit={manejarLogin} style={styles.formulario}>
          <div style={styles.grupoInput}>
            <label style={styles.label}>Usuario</label>
            <input 
              type="text"
              placeholder="Introduce tu usuario (ej: emi)" 
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)} 
              style={styles.input}
              disabled={cargando}
            />
          </div>

          <div style={styles.grupoInput}>
            <label style={styles.label}>Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              style={styles.input}
              disabled={cargando}
            />
          </div>

          {/* Mensajes de error visuales en lugar del molesto alert() */}
          {mensajeError && <p style={styles.error}>{mensajeError}</p>}

          <button 
            type="submit" 
            disabled={cargando}
            style={{
              ...styles.btnEntrar,
              backgroundColor: cargando ? "#2c3e50" : "#38bdf8",
              cursor: cargando ? "not-allowed" : "pointer"
            }}
          >
            {cargando ? "Verificando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

// 🎨 Estilos que hacen juego con el modo oscuro de tu Ecommerce
const styles = {
  pantallaCompleta: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "80vh", // Centra el cuadro verticalmente en la pantalla
    backgroundColor: "#0f172a",
    fontFamily: "sans-serif",
  },
  contenedorLogin: {
    backgroundColor: "#1f2937",
    padding: "30px",
    borderRadius: "8px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.5)",
    border: "1px solid #374151",
  },
  titulo: {
    margin: "0 0 20px 0",
    textAlign: "center",
    color: "#ffffff",
    fontSize: "1.5rem",
  },
  formulario: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  grupoInput: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  label: {
    color: "#9ca3af",
    fontSize: "0.9rem",
    fontWeight: "bold",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #4b5563",
    backgroundColor: "#374151",
    color: "#ffffff",
    fontSize: "1rem",
    outline: "none",
  },
  error: {
    color: "#ef4444",
    fontSize: "0.85rem",
    margin: "0",
    textAlign: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid rgba(239, 68, 68, 0.2)",
  },
  btnEntrar: {
    color: "#ffffff",
    border: "none",
    padding: "12px",
    borderRadius: "6px",
    fontWeight: "bold",
    fontSize: "1rem",
    marginTop: "10px",
    transition: "background-color 0.2s",
  },
};