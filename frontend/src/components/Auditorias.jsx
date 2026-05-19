import React, { useState, useEffect } from "react";

export default function Auditorias() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Estados para simular los filtros visuales de tu diseño
  const [busqueda, setBusqueda] = useState("");
  const [moduloFiltro, setModuloFiltro] = useState("Todos");

  const cargarAuditorias = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/auditorias-premium");
      const data = await res.json();
      setDatos(data);
      setCargando(false);
    } catch (err) {
      console.error("Error al traer auditorías:", err);
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAuditorias();
  }, []);

  if (cargando) {
    return <div style={{ padding: "30px", color: "#94a3b8" }}>Cargando bitácora de seguridad...</div>;
  }

  // Valores por defecto si la BD está limpia
  const kpis = datos?.kpis || { totalEventos: 0, creaciones: 0, actualizaciones: 0, eliminaciones: 0, operadoresActivos: 0 };
  const eventosCompletos = datos?.eventos || [];

  // Filtrado en Frontend
  const eventosFiltrados = eventosCompletos.filter(ev => {
    const coincideBusqueda = 
      ev.usuario.toLowerCase().includes(busqueda.toLowerCase()) || 
      ev.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    const coincideModulo = moduloFiltro === "Todos" || ev.modulo === moduloFiltro;
    return coincideBusqueda && coincideModulo;
  });

  // Helper para asignar colores según la acción de auditoría
  const obtenerEstiloAccion = (accion) => {
    switch (accion) {
      case "CREAR":
        return { bg: "rgba(16, 185, 129, 0.15)", texto: "#10b981", dot: "#10b981" };
      case "EDITAR":
        return { bg: "rgba(245, 158, 11, 0.15)", texto: "#f59e0b", dot: "#f59e0b" };
      case "ELIMINAR":
        return { bg: "rgba(239, 68, 68, 0.15)", texto: "#ef4444", dot: "#ef4444" };
      default:
        return { bg: "rgba(99, 102, 241, 0.15)", texto: "#6366f1", dot: "#6366f1" };
    }
  };

  return (
    <div style={styles.contenedor}>
      {/* Encabezado Principal */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.titulo}>Auditoría de Acciones y Seguridad</h2>
          <p style={styles.subtitulo}>Monitorea todas las acciones importantes realizadas en el sistema</p>
        </div>
        <div style={styles.badgeEnVivo}>
          <span style={styles.pulsoVerde}></span> En vivo
        </div>
      </div>

      {/* Grid de 5 KPIs Superiores con barra lateral de acento */}
      <div style={styles.kpiGrid}>
        <div style={{ ...styles.kpiCard, borderLeft: "4px solid #a855f7" }}>
          <p style={styles.kpiLabel}>🛡️ Total de Eventos</p>
          <h3 style={styles.kpiValue}>{kpis.totalEventos}</h3>
          <span style={{ color: "#a855f7", fontSize: "0.75rem" }}>↑ 13% vs ayer</span>
        </div>
        <div style={{ ...styles.kpiCard, borderLeft: "4px solid #10b981" }}>
          <p style={styles.kpiLabel}>📥 Creaciones</p>
          <h3 style={styles.kpiValue}>{kpis.creaciones}</h3>
          <span style={{ color: "#10b981", fontSize: "0.75rem" }}>🟢 En almacén</span>
        </div>
        <div style={{ ...styles.kpiCard, borderLeft: "4px solid #f59e0b" }}>
          <p style={styles.kpiLabel}>✏️ Actualizaciones</p>
          <h3 style={styles.kpiValue}>{kpis.actualizaciones}</h3>
          <span style={{ color: "#f59e0b", fontSize: "0.75rem" }}>🔄 Cambios de stock</span>
        </div>
        <div style={{ ...styles.kpiCard, borderLeft: "4px solid #ef4444" }}>
          <p style={styles.kpiLabel}>❌ Eliminaciones</p>
          <h3 style={styles.kpiValue}>{kpis.eliminaciones}</h3>
          <span style={{ color: "#ef4444", fontSize: "0.75rem" }}>⚠️ Bajas del sistema</span>
        </div>
        <div style={{ ...styles.kpiCard, borderLeft: "4px solid #38bdf8" }}>
          <p style={styles.kpiLabel}>👥 Operadores Activos</p>
          <h3 style={styles.kpiValue}>{kpis.operadoresActivos}</h3>
          <span style={{ color: "#38bdf8", fontSize: "0.75rem" }}>Usuarios únicos</span>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div style={styles.filtrosBarra}>
        <input
          type="text"
          placeholder="Buscar por operador, acción o producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={styles.inputBuscar}
        />
        
        <select 
          value={moduloFiltro} 
          onChange={(e) => setModuloFiltro(e.target.value)} 
          style={styles.selectFiltro}
        >
          <option value="Todos">📦 Todos los módulos</option>
          <option value="INVENTARIO">Inventario</option>
          <option value="VENTAS">Ventas</option>
        </select>

        <button onClick={() => { setBusqueda(""); setModuloFiltro("Todos"); }} style={styles.btnLimpiar}>
          🧹 Limpiar
        </button>
      </div>

      {/* Contenedor Principal de la Tabla Cronológica */}
      <div style={styles.tablaCard}>
        <div style={styles.tablaHeader}>
          <h4 style={styles.tablaTitulo}>📜 Historial de Eventos</h4>
          <div style={styles.vistaBtns}>
            <button style={styles.btnVistaActivo}>📋 Tabla</button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={styles.tabla}>
            <thead>
              <tr>
                <th style={{ ...styles.th, paddingLeft: "35px" }}>FECHA Y HORA</th>
                <th style={styles.th}>OPERADOR</th>
                <th style={styles.th}>ACCIÓN REALIZADA</th>
                <th style={styles.th}>MÓDULO</th>
                <th style={styles.th}>IP / DISPOSITIVO</th>
                <th style={styles.th}>ACCIONES</th>
              </tr>
            </thead>
            <tbody style={styles.tbodyRelativo}>
              {eventosFiltrados.map((ev, index) => {
                const estilo = obtenerEstiloAccion(ev.accion);
                const fechaFormateada = ev.fecha_hora 
                  ? new Date(ev.fecha_hora).toLocaleString("es-SV", { hour12: false })
                  : "Fecha indefinida";

                return (
                  <tr key={ev.id} style={styles.trHover}>
                    {/* Celda de Fecha con el Punto de la Línea de Tiempo */}
                    <td style={{ ...styles.td, position: "relative", paddingLeft: "35px" }}>
                      {/* Línea conectora vertical interna */}
                      {index !== eventosFiltrados.length - 1 && <div style={styles.lineaTiempoEje}></div>}
                      
                      {/* Punto Neón */}
                      <span style={{ ...styles.puntoLineaTiempo, backgroundColor: estilo.dot }}></span>
                      <span style={styles.fechaTexto}>{fechaFormateada}</span>
                    </td>
                    
                    {/* Operador */}
                    <td style={styles.td}>
                      <div style={styles.operadorContenedor}>
                        <div style={styles.userIcon}>👤</div>
                        <div>
                          <div style={{ fontWeight: "bold", color: "#fff" }}>{ev.usuario}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                            {ev.usuario.toLowerCase() === "admin" ? "Admin" : "Operario"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Badge de Acción + Descripción */}
                    <td style={{ ...styles.td, maxWidth: "340px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={{ ...styles.badgeAccion, backgroundColor: estilo.bg, color: estilo.texto }}>
                          {ev.accion === "EDITAR" ? "🔸 EDITAR" : ev.accion === "CREAR" ? "✨ CREAR" : "🔻 ELIMINAR"}
                        </span>
                        <p style={styles.descripcionTexto}>{ev.descripcion}</p>
                      </div>
                    </td>

                    {/* Módulo */}
                    <td style={styles.td}>
                      <span style={{
                        ...styles.moduloBadge,
                        color: ev.modulo === "VENTAS" ? "#d946ef" : "#3b82f6",
                        backgroundColor: ev.modulo === "VENTAS" ? "rgba(217, 70, 239, 0.1)" : "rgba(59, 130, 246, 0.1)"
                      }}>
                        {ev.modulo === "VENTAS" ? "🛒 Ventas" : "📦 Inventario"}
                      </span>
                    </td>

                    {/* IP / Dispositivo */}
                    <td style={{ ...styles.td, color: "#94a3b8", fontSize: "0.8rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        💻 <span>{ev.ip_dispositivo}</span>
                      </div>
                    </td>

                    {/* Ojo de Inspección */}
                    <td style={styles.td}>
                      <button style={styles.btnInspeccionar} title="Inspeccionar JSON de auditoría">👁️</button>
                    </td>
                  </tr>
                );
              })}
              {eventosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ ...styles.td, textAlign: "center", color: "#64748b", padding: "40px" }}>
                    No se encontraron registros de auditoría con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 🎨 HOJA DE ESTILOS CSS-IN-JS (Idéntico a tu maqueta oscura de Cyber-Seguridad)
const styles = {
  contenedor: { padding: "30px", backgroundColor: "#090d16", minHeight: "100vh", boxSizing: "border-box" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  titulo: { margin: 0, fontSize: "1.6rem", color: "#fff", fontWeight: "bold" },
  subtitulo: { margin: "5px 0 0 0", color: "#94a3b8", fontSize: "0.9rem" },
  badgeEnVivo: { display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#111827", padding: "8px 14px", borderRadius: "50px", fontSize: "0.8rem", color: "#10b981", border: "1px solid #1f2937", fontWeight: "bold" },
  pulsoVerde: { width: "8px", height: "8px", backgroundColor: "#10b981", borderRadius: "50%", display: "inline-block" },
  
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px", marginBottom: "35px" },
  kpiCard: { backgroundColor: "#111827", padding: "20px", borderRadius: "8px", border: "1px solid #1f2937" },
  kpiLabel: { margin: 0, fontSize: "0.8rem", color: "#94a3b8", fontWeight: "500" },
  kpiValue: { margin: "8px 0 4px 0", fontSize: "1.6rem", color: "#fff", fontWeight: "bold" },
  
  filtrosBarra: { display: "flex", gap: "12px", marginBottom: "25px", alignItems: "center", flexWrap: "wrap" },
  inputBuscar: { flexGrow: 1, backgroundColor: "#111827", border: "1px solid #1f2937", borderRadius: "6px", padding: "10px 15px", color: "#fff", fontSize: "0.85rem", outline: "none" },
  selectFiltro: { backgroundColor: "#111827", border: "1px solid #1f2937", borderRadius: "6px", padding: "10px 15px", color: "#fff", fontSize: "0.85rem", cursor: "pointer", outline: "none" },
  btnLimpiar: { backgroundColor: "#1f2937", color: "#94a3b8", border: "1px solid #374151", padding: "10px 18px", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "bold" },
  
  tablaCard: { backgroundColor: "#111827", borderRadius: "8px", border: "1px solid #1f2937", padding: "20px" },
  tablaHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  tablaTitulo: { margin: 0, color: "#fff", fontSize: "1rem", fontWeight: "bold" },
  vistaBtns: { display: "flex", gap: "5px" },
  btnVistaActivo: { backgroundColor: "#a855f7", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "bold" },
  
  tabla: { width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" },
  th: { textAlign: "left", padding: "12px 10px", color: "#64748b", borderBottom: "2px solid #1f2937", fontSize: "0.75rem", letterSpacing: "0.5px" },
  td: { padding: "14px 10px", color: "#f8fafc", borderBottom: "1px solid #1f2937", verticalAlign: "middle" },
  trHover: { transition: "background 0.2s" },
  
  /* LÓGICA DE LA LÍNEA DE TIEMPO (TIMELINE) */
  puntoLineaTiempo: { position: "absolute", left: "15px", top: "20px", width: "10px", height: "10px", borderRadius: "50%", zIndex: 2, boxShadow: "0 0 8px currentColor" },
  lineaTiempoEje: { position: "absolute", left: "19px", top: "30px", bottom: "-20px", width: "2px", backgroundColor: "#1f2937", zIndex: 1 },
  fechaTexto: { color: "#94a3b8", fontSize: "0.8rem", fontWeight: "500" },
  
  operadorContenedor: { display: "flex", alignItems: "center", gap: "10px" },
  userIcon: { backgroundColor: "#1f2937", padding: "6px", borderRadius: "50%", fontSize: "0.9rem" },
  
  badgeAccion: { padding: "4px 10px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "bold", display: "inline-block", width: "fit-content" },
  descripcionTexto: { margin: 0, fontSize: "0.8rem", color: "#cbd5e1", lineHeight: "1.4" },
  moduloBadge: { padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold" },
  btnInspeccionar: { background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1rem", transition: "color 0.2s" }
};