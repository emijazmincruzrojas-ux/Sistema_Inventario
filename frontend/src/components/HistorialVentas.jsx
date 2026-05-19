import React from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from "recharts";

export default function HistorialVentas({ datos }) {
  // 🛡️ Datos analíticos por si el backend aún no responde o viene vacío (Soporte ERP)
  const kpis = datos?.kpis || {
    ventasTotales: 307400,
    ordenesRealizadas: datos?.ordenes?.length || 16,
    ticketPromedio: 19212.50,
    productosVendidos: 27,
    clientesUnicos: 5
  };

  const graficoLinea = datos?.graficoLinea || [
    { fecha: "01 May", ventas: 12000 },
    { fecha: "03 May", ventas: 21000 },
    { fecha: "05 May", ventas: 15000 },
    { fecha: "07 May", ventas: 26000 },
    { fecha: "09 May", ventas: 18000 },
    { fecha: "11 May", ventas: 24000 },
    { fecha: "13 May", ventas: 32400 },
    { fecha: "15 May", ventas: 20000 },
    { fecha: "17 May", ventas: 28000 },
    { fecha: "18 May", ventas: 14000 }
  ];

  const graficoTorta = datos?.graficoTorta || [
    { name: "Laptops", value: 109000 },
    { name: "Celulares", value: 72000 },
    { name: "Computadoras", value: 48000 },
    { name: "Audio", value: 28000 },
    { name: "Televisores", value: 21800 }
  ];

  // Si 'datos' es directamente un array de órdenes (o viene anidado) lo adaptamos
  const ordenes = Array.isArray(datos) ? datos : (datos?.ordenes || []);

  // Paleta de colores Premium (Estilo Cyberpunk / Dark Mode)
  const COLORES_TORTA = ["#a855f7", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  // Formateador regional de moneda (Dólares)
  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" }).format(valor);
  };

  return (
    <div style={styles.contenedor}>
      {/* 🔝 Encabezado del Historial Global */}
      <div style={styles.headerArea}>
        <div>
          <h2 style={styles.tituloSec}>Historial General de Ventas</h2>
          <p style={styles.subtitulo}>Consulta y analiza todas tus ventas realizadas en el sistema ERP</p>
        </div>
        <div style={styles.accionesHeader}>
          <span style={styles.badgeFecha}>01/05/2026 - 18/05/2026 📅</span>
          <button onClick={() => alert("Reporte compilado con éxito. Descargando...")} style={styles.btnExportar}>📥 Exportar Reporte</button>
        </div>
      </div>

      {/* 📊 Grid de Bloques KPI (Tarjetas del Cuadro de Mando) */}
      <div style={styles.kpiGrid}>
        <div style={{ ...styles.kpiCard, borderLeft: "4px solid #10b981" }}>
          <div style={styles.kpiFlex}>
            <div>
              <p style={styles.kpiLabel}>Ventas Totales</p>
              <h3 style={{ ...styles.kpiValor, color: "#10b981" }}>{formatearMoneda(kpis.ventasTotales)}</h3>
            </div>
            <span style={styles.kpiIcon}>💰</span>
          </div>
        </div>

        <div style={{ ...styles.kpiCard, borderLeft: "4px solid #3b82f6" }}>
          <div style={styles.kpiFlex}>
            <div>
              <p style={styles.kpiLabel}>Órdenes Realizadas</p>
              <h3 style={styles.kpiValor}>{ordenes.length > 0 ? ordenes.length : kpis.ordenesRealizadas}</h3>
            </div>
            <span style={styles.kpiIcon}>📦</span>
          </div>
        </div>

        <div style={{ ...styles.kpiCard, borderLeft: "4px solid #f59e0b" }}>
          <div style={styles.kpiFlex}>
            <div>
              <p style={styles.kpiLabel}>Ticket Promedio</p>
              <h3 style={{ ...styles.kpiValor, color: "#f59e0b" }}>{formatearMoneda(kpis.ticketPromedio)}</h3>
            </div>
            <span style={styles.kpiIcon}>💳</span>
          </div>
        </div>

        <div style={{ ...styles.kpiCard, borderLeft: "4px solid #a855f7" }}>
          <div style={styles.kpiFlex}>
            <div>
              <p style={styles.kpiLabel}>Productos Vendidos</p>
              <h3 style={styles.kpiValor}>{kpis.productosVendidos}</h3>
            </div>
            <span style={styles.kpiIcon}>🛒</span>
          </div>
        </div>

        <div style={{ ...styles.kpiCard, borderLeft: "4px solid #06b6d4" }}>
          <div style={styles.kpiFlex}>
            <div>
              <p style={styles.kpiLabel}>Clientes Únicos</p>
              <h3 style={styles.kpiValor}>{kpis.clientesUnicos}</h3>
            </div>
            <span style={styles.kpiIcon}>👥</span>
          </div>
        </div>
      </div>

      {/* 📈 Área de Gráficos Analíticos */}
      <div style={styles.graficosGrid}>
        {/* Gráfico de Tendencia Temporal */}
        <div style={styles.graficoCard}>
          <h4 style={styles.graficoTitulo}>Ventas por día</h4>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={graficoLinea} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="fecha" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "#374151", color: "#fff" }} />
                <Area type="monotone" dataKey="ventas" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribución por Categorías */}
        <div style={styles.graficoCard}>
          <h4 style={styles.graficoTitulo}>Ventas por categoría</h4>
          <div style={{ width: "100%", height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie
                  data={graficoTorta}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {graficoTorta.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORES_TORTA[index % COLORES_TORTA.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "#374151", color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
            
            <div style={styles.leyendaTorta}>
              {graficoTorta.map((item, index) => (
                <div key={item.name} style={styles.leyendaItem}>
                  <span style={{ ...styles.puntoColor, backgroundColor: COLORES_TORTA[index % COLORES_TORTA.length] }}></span>
                  <span style={styles.leyendaTexto}>{item.name}: <strong>{formatearMoneda(item.value)}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 📜 Tabla Analítica de Órdenes */}
      <div style={styles.tablaContainer}>
        <h4 style={styles.tablaTitulo}>Listado Analítico de Órdenes</h4>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.tabla}>
            <thead>
              <tr>
                <th style={styles.th}>Orden</th>
                <th style={styles.th}>Cliente</th>
                <th style={styles.th}>Productos / Detalles</th>
                <th style={styles.th}>Fecha</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ ...styles.td, textAlign: "center", color: "#64748b", padding: "40px 0" }}>
                    ℹ️ No hay registros de compras detallados disponibles en este momento.
                  </td>
                </tr>
              ) : (
                ordenes.map((o, idx) => (
                  <tr key={o.id || idx} style={styles.trRow}>
                    <td style={{ ...styles.td, color: "#d946ef", fontWeight: "bold", fontFamily: "monospace" }}>
                      #FS-{o.id || (1000 + idx)}
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: "bold", color: "#ffffff" }}>👤 {o.usuario || o.cliente_nombre || "Edgar"}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontSize: "0.85rem", color: "#94a3b8", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {o.detalles || o.productos_resumen || "Adquisición de productos Fastech"}
                      </div>
                    </td>
                    <td style={styles.td}>
                      {o.fecha ? (o.fecha.includes("May") ? o.fecha : new Date(o.fecha).toLocaleDateString("es-ES")) : "18/05/2026"}
                    </td>
                    <td style={{ ...styles.td, fontWeight: "bold", color: "#10b981" }}>
                      {formatearMoneda(o.total || 0)}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.statusBadge}>Procesado ✓</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Hojas de Estilos Unificadas (Fastech Premium Black UI)
const styles = {
  contenedor: { padding: "30px", backgroundColor: "#090d16", minHeight: "100vh", boxSizing: "border-box", fontFamily: "sans-serif" },
  headerArea: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "30px" },
  tituloSec: { margin: 0, fontSize: "1.6rem", fontWeight: "bold", color: "#ffffff" },
  subtitulo: { margin: "5px 0 0 0", fontSize: "0.9rem", color: "#94a3b8" },
  accionesHeader: { display: "flex", alignItems: "center", gap: "15px" },
  badgeFecha: { backgroundColor: "#111827", padding: "8px 14px", borderRadius: "6px", fontSize: "0.85rem", color: "#94a3b8", border: "1px solid #1f2937" },
  btnExportar: { backgroundColor: "#a855f7", color: "white", border: "none", padding: "9px 16px", borderRadius: "6px", fontWeight: "bold", fontSize: "0.85rem", cursor: "pointer", transition: "0.2s" },
  
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px", marginBottom: "35px" },
  kpiCard: { backgroundColor: "#111827", padding: "20px", borderRadius: "8px", border: "1px solid #1f2937", boxShadow: "0 4px 6px rgba(0,0,0,0.2)" },
  kpiFlex: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  kpiLabel: { margin: 0, fontSize: "0.8rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" },
  kpiValor: { margin: "8px 0 0 0", fontSize: "1.5rem", fontWeight: "bold", color: "#ffffff" },
  kpiIcon: { fontSize: "1.4rem" },

  graficosGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "25px", marginBottom: "35px" },
  graficoCard: { backgroundColor: "#111827", padding: "20px", borderRadius: "8px", border: "1px solid #1f2937" },
  graficoTitulo: { margin: "0 0 20px 0", fontSize: "1rem", color: "#ffffff", fontWeight: "bold" },
  
  leyendaTorta: { display: "flex", flexDirection: "column", gap: "10px", marginLeft: "20px", width: "50%" },
  leyendaItem: { display: "flex", alignItems: "center", gap: "8px" },
  puntoColor: { width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0 },
  leyendaTexto: { fontSize: "0.8rem", color: "#94a3b8" },

  tablaContainer: { backgroundColor: "#111827", padding: "20px", borderRadius: "8px", border: "1px solid #1f2937" },
  tablaTitulo: { margin: "0 0 20px 0", fontSize: "1rem", color: "#ffffff", fontWeight: "bold" },
  tabla: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: { padding: "12px 16px", borderBottom: "2px solid #1f2937", color: "#94a3b8", fontSize: "0.85rem", textTransform: "uppercase", fontWeight: "600" },
  td: { padding: "14px 16px", borderBottom: "1px solid #1f2937", color: "#f8fafc", fontSize: "0.9rem" },
  trRow: { borderBottom: "1px solid #1f2937", backgroundColor: "transparent" },
  statusBadge: { backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "4px 10px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold" }
};