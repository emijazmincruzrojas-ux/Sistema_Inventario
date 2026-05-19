import React, { useState, useEffect } from "react";

export default function Dashboard() {
  const [metricas, setMetricas] = useState({
    totalProductos: 0,
    stockBajo: 0,
    totalFacturado: 0,
    ventasHoy: 0
  });
  const [ultimasVentas, setUltimasVentas] = useState([]);
  const [ultimasAuditorias, setUltimasAuditorias] = useState([]);

  useEffect(() => {
    // Cargar Métricas principales
    fetch("http://localhost:3001/dashboard/metricas")
      .then((res) => res.json())
      .then((data) => setMetricas(data))
      .catch((err) => console.error("Error en métricas:", err));

    // Cargar últimas 5 ventas
    fetch("http://localhost:3001/dashboard/ultimas-ventas")
      .then((res) => res.json())
      .then((data) => setUltimasVentas(data))
      .catch((err) => console.error("Error en últimas ventas:", err));

    // Cargar últimas 5 auditorías
    fetch("http://localhost:3001/dashboard/ultimas-auditorias")
      .then((res) => res.json())
      .then((data) => setUltimasAuditorias(data))
      .catch((err) => console.error("Error en últimas auditorías:", err));
  }, []);

  // Formateador de moneda de forma limpia
  const formatearDinero = (cantidad) => {
    return new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" }).format(cantidad);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Panel General (Dashboard)</h2>
      <p style={styles.welcomeText}>👋 Bienvenido de nuevo al control de tu sistema. Esto es lo que está pasando hoy:</p>

      {/* 📊 SECCIÓN DE TARJETAS SUPERIORES (KPIS) */}
      <div style={styles.kpiGrid}>
        <div style={{ ...styles.kpiCard, borderLeft: "4px solid #a855f7" }}>
          <div>
            <p style={styles.kpiLabel}>Total Productos</p>
            <p style={styles.kpiValue}>{metricas.totalProductos}</p>
          </div>
          <span style={{ ...styles.kpiIcon, backgroundColor: "rgba(168, 85, 247, 0.1)", color: "#a855f7" }}>📦</span>
        </div>

        <div style={{ ...styles.kpiCard, borderLeft: "4px solid #10b981" }}>
          <div>
            <p style={styles.kpiLabel}>Total Facturado</p>
            <p style={{ ...styles.kpiValue, color: "#10b981" }}>{formatearDinero(metricas.totalFacturado)}</p>
          </div>
          <span style={{ ...styles.kpiIcon, backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>💰</span>
        </div>

        <div style={{ ...styles.kpiCard, borderLeft: "4px solid #f59e0b" }}>
          <div>
            <p style={styles.kpiLabel}>Órdenes de Hoy</p>
            <p style={styles.kpiValue}>{metricas.ventasHoy}</p>
          </div>
          <span style={{ ...styles.kpiIcon, backgroundColor: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>🛒</span>
        </div>

        <div style={{ ...styles.kpiCard, borderLeft: `4px solid ${metricas.stockBajo > 0 ? "#ef4444" : "#64748b"}` }}>
          <div>
            <p style={styles.kpiLabel}>Stock Bajo / Agotado</p>
            <p style={{ ...styles.kpiValue, color: metricas.stockBajo > 0 ? "#ef4444" : "#f8fafc" }}>
              {metricas.stockBajo}
            </p>
          </div>
          <span style={{ 
            ...styles.kpiIcon, 
            backgroundColor: metricas.stockBajo > 0 ? "rgba(239, 68, 68, 0.1)" : "rgba(100, 116, 139, 0.1)", 
            color: metricas.stockBajo > 0 ? "#ef4444" : "#64748b" 
          }}>⚠️</span>
        </div>
      </div>

      {/* 🧱 FILA DE DOS COLUMNAS DE REGISTROS RÁPIDOS */}
      <div style={styles.bottomGrid}>
        
        {/* COLUMNA IZQUIERDA: ÚLTIMAS VENTAS */}
        <div style={styles.tableCard}>
          <h3 style={styles.cardTitle}>🛍️ Ventas Recientes</h3>
          <div style={styles.listContainer}>
            {ultimasVentas.length === 0 ? (
              <p style={styles.noDataText}>No hay ventas registradas en el sistema todavía.</p>
            ) : (
              ultimasVentas.map((venta) => (
                <div key={venta.id} style={styles.listItem}>
                  <div>
                    <span style={styles.itemMainText}>Orden #{venta.id}</span>
                    <span style={styles.itemSubText}>👤 Cliente: {venta.cliente}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={styles.itemPrice}>{formatearDinero(venta.total)}</span>
                    <span style={styles.itemSubText}>{new Date(venta.fecha_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: ÚLTIMAS AUDITORÍAS */}
        <div style={styles.tableCard}>
          <h3 style={styles.cardTitle}>🕵️‍♂️ Auditorías Recientes</h3>
          <div style={styles.listContainer}>
            {ultimasAuditorias.length === 0 ? (
              <p style={styles.noDataText}>No hay registros de acciones de seguridad en el sistema.</p>
            ) : (
              ultimasAuditorias.map((aud, index) => {
                let badgeColor = "#38bdf8";
                if (aud.accion === "CREAR") badgeColor = "#10b981";
                if (aud.accion === "EDITAR") badgeColor = "#f59e0b";
                if (aud.accion === "ELIMINAR") badgeColor = "#ef4444";

                return (
                  <div key={index} style={styles.listItem}>
                    <div style={{ flex: 1, marginRight: "10px" }}>
                      <span style={styles.itemMainText}>{aud.descripcion}</span>
                      <span style={styles.itemSubText}>👤 Hecho por: <b>{aud.usuario}</b></span>
                    </div>
                    <div style={{ textAlign: "right", minWidth: "80px" }}>
                      <span style={{ ...styles.actionBadge, color: badgeColor, border: `1px solid ${badgeColor}` }}>
                        {aud.accion}
                      </span>
                      <span style={styles.itemSubText}>{new Date(aud.fecha_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: { width: "100%", color: "#f8fafc" },
  title: { fontSize: "1.6rem", fontWeight: "bold", margin: "0 0 5px 0", color: "#38bdf8" },
  welcomeText: { color: "#94a3b8", margin: "0 0 25px 0", fontSize: "0.95rem" },
  
  // Grid de Métricas Superiores
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px", marginBottom: "30px" },
  kpiCard: { backgroundColor: "#111827", border: "1px solid #1f2937", padding: "20px", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" },
  kpiLabel: { margin: 0, fontSize: "0.8rem", color: "#94a3b8", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px" },
  kpiValue: { margin: "5px 0 0 0", fontSize: "1.6rem", fontWeight: "bold", color: "#f8fafc" },
  kpiIcon: { fontSize: "1.4rem", padding: "10px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" },
  
  // Grid Inferior en 2 columnas
  bottomGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "25px" },
  tableCard: { backgroundColor: "#111827", border: "1px solid #1f2937", borderRadius: "12px", padding: "20px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" },
  cardTitle: { fontSize: "1.1rem", color: "#f8fafc", margin: "0 0 15px 0", borderBottom: "1px solid #1f2937", paddingBottom: "10px", fontWeight: "bold" },
  
  // Listas dentro de las tablas rápidas
  listContainer: { display: "flex", flexDirection: "column", gap: "12px" },
  listItem: { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#1f2937", padding: "12px 16px", borderRadius: "8px", border: "1px solid #374151" },
  itemMainText: { display: "block", fontWeight: "bold", color: "#f1f5f9", fontSize: "0.9rem" },
  itemSubText: { display: "block", color: "#64748b", fontSize: "0.75rem", marginTop: "3px" },
  itemPrice: { fontWeight: "bold", color: "#10b981", fontSize: "0.95rem" },
  actionBadge: { display: "inline-block", fontSize: "0.65rem", fontWeight: "bold", padding: "2px 6px", borderRadius: "4px", backgroundColor: "rgba(255,255,255,0.02)" },
  noDataText: { color: "#64748b", textAlign: "center", padding: "20px 0", fontSize: "0.9rem" }
};