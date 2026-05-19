import React from "react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid 
} from "recharts";

export default function DashboardGeneral({ datos, cambiarSeccion }) {
  
  // Datos por defecto basados en tu maqueta si el backend está cargando
  const kpis = datos?.kpis || { totalProductos: 9, alertasStock: 2, valorInventario: 278800, ventasMes: 92400, ordenesMes: 14 };
  const distribucion = datos?.distribucionInventario || [
    { name: "En Stock", value: 7, color: "#10b981" },
    { name: "Stock Bajo", value: 1, color: "#f59e0b" },
    { name: "Agotados", value: 1, color: "#ef4444" },
    { name: "Sin Clasificar", value: 0, color: "#64748b" }
  ];
  const productosAlerta = datos?.productosAlerta || [
    { nombre: "ASUS TUF Gaming", sku: "HP-DESK-04", stock: 0, estado: "Agotado" },
    { nombre: "JBL Audífonos", sku: "SAM-TV-09", stock: 1, estado: "Stock Bajo" }
  ];
  const actividad = datos?.actividadReciente || [
    { detalle: "Nueva venta realizada - Orden #00014 por $26,000.00", fecha: "10:45 AM" },
    { detalle: "Producto actualizado - HP Pavilion", fecha: "09:30 AM" },
    { detalle: "Stock bajo - JBL Audífonos tiene solo 1 unidad", fecha: "08:15 AM" }
  ];
  const historialValor = datos?.historialValor || [
    { fecha: "12 May", valor: 200000 },
    { fecha: "13 May", valor: 250000 },
    { fecha: "14 May", valor: 220000 },
    { fecha: "15 May", valor: 260000 },
    { fecha: "16 May", valor: 240000 },
    { fecha: "17 May", valor: 270000 },
    { fecha: "18 May", valor: 278800 }
  ];

  const formatearMoneda = (val) => new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" }).format(val);

  return (
    <div style={styles.contenedor}>
      {/* Encabezado */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.titulo}>Panel General (Dashboard)</h2>
          <p style={styles.subtitulo}>Bienvenido de vuelta 👋</p>
        </div>
        <div style={styles.fechaBadge}>📅 18 de Mayo, 2026</div>
      </div>

      {/* Grid de 5 KPIs Superiores */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <p style={styles.kpiLabel}>📦 Total Productos</p>
          <h3 style={styles.kpiValue}>{kpis.totalProductos}</h3>
          <span style={{color: "#3b82f6", fontSize: "0.75rem"}}>📈 +2 nuevos esta semana</span>
        </div>
        <div style={styles.kpiCard}>
          <p style={styles.kpiLabel}>⚠️ Stock Bajo / Agotado</p>
          <h3 style={{...styles.kpiValue, color: "#ef4444"}}>{kpis.alertasStock}</h3>
          <span style={{color: "#ef4444", fontSize: "0.75rem"}}>🛑 Requieren atención</span>
        </div>
        <div style={styles.kpiCard}>
          <p style={styles.kpiLabel}>💲 Valor del Inventario</p>
          <h3 style={{...styles.kpiValue, color: "#10b981"}}>{formatearMoneda(kpis.valorInventario)}</h3>
          <span style={{color: "#94a3b8", fontSize: "0.75rem"}}>Valor total en almacén</span>
        </div>
        <div style={styles.kpiCard}>
          <p style={styles.kpiLabel}>📉 Ventas (Este mes)</p>
          <h3 style={{...styles.kpiValue, color: "#a855f7"}}>{formatearMoneda(kpis.ventasMes)}</h3>
          <span style={{color: "#10b981", fontSize: "0.75rem"}}>🍏 +15.2% vs mes anterior</span>
        </div>
        <div style={styles.kpiCard}>
          <p style={styles.kpiLabel}>📜 Órdenes (Este mes)</p>
          <h3 style={styles.kpiValue}>{kpis.ordenesMes}</h3>
          <span style={{color: "#10b981", fontSize: "0.75rem"}}>🍏 +4 vs mes anterior</span>
        </div>
      </div>

      {/* Fila Inferior Compleja en Grid de 2 Columnas */}
      <div style={styles.dashboardGrid}>
        
        {/* Columna Izquierda, Bloque 1: Resumen de Inventario */}
        <div style={styles.mainCard}>
          <h4 style={styles.cardTitle}>Resumen de Inventario</h4>
          <div style={{display: "flex", alignItems: "center", height: 180}}>
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie data={distribucion} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                  {distribucion.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={styles.leyendaGrid}>
              {distribucion.map((item, i) => (
                <div key={i} style={styles.leyendaRow}>
                  <span style={{...styles.punto, backgroundColor: item.color}} />
                  <span style={styles.leyendaTxt}>{item.name}: <strong>{item.value}</strong></span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => cambiarSeccion("inventario")} style={styles.cardBtn}>Ver gestión de inventario ➔</button>
        </div>

        {/* Columna Derecha, Bloque 1: Alertas de Stock */}
        <div style={styles.mainCard}>
          {/* ✅ CORREGIDO: Se removió el duplicado de 'justifyContent' en la propiedad inline style */}
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <h4 style={styles.cardTitle}>Productos con Stock Bajo / Agotado</h4>
            <span onClick={() => cambiarSeccion("inventario")} style={styles.linkVerTodos}>Ver todos</span>
          </div>
          <table style={styles.tabla}>
            <thead>
              <tr>
                <th style={styles.th}>Producto</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {productosAlerta.map((p, i) => (
                <tr key={i}>
                  <td style={styles.td}>🛍️ {p.nombre}</td>
                  <td style={styles.td}>{p.stock} u</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge, 
                      backgroundColor: p.stock === 0 ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)",
                      color: p.stock === 0 ? "#ef4444" : "#f59e0b"
                    }}>{p.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Columna Izquierda, Bloque 2: Actividad Reciente */}
        <div style={styles.mainCard}>
          <h4 style={styles.cardTitle}>Actividad Reciente</h4>
          <div style={styles.listaActividad}>
            {actividad.map((act, i) => (
              <div key={i} style={styles.actividadRow}>
                <div style={styles.actividadCuerpo}>
                  <span style={styles.dotActividad}>⚡</span>
                  <p style={styles.actividadTxt}>{act.detalle || act.accion}</p>
                </div>
                <span style={styles.actividadHora}>
                  {act.fecha ? new Date(act.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Ahora"}
                </span>
              </div>
            ))}
          </div>
          <button onClick={() => cambiarSeccion("auditorias")} style={styles.cardBtn}>Ver toda la actividad ➔</button>
        </div>

        {/* Columna Derecha, Bloque 2: Gráfico de Tendencia del Valor */}
        <div style={styles.mainCard}>
          <h4 style={styles.cardTitle}>Valor del Inventario (Últimos 7 días)</h4>
          <div style={{width: "100%", height: 180}}>
            <ResponsiveContainer>
              <AreaChart data={historialValor} margin={{top: 10, right: 10, left: -15, bottom: 0}}>
                <defs>
                  <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="fecha" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{backgroundColor: "#111827", borderColor: "#374151", color: "#fff"}} />
                <Area type="monotone" dataKey="valor" stroke="#d946ef" strokeWidth={2} fillOpacity={1} fill="url(#colorValor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{marginTop: "10px", fontSize: "0.85rem", color: "#10b981", fontWeight: "bold"}}>
            Valor Actual: {formatearMoneda(kpis.valorInventario)} <span style={{color: "#10b981"}}>↑ +8.5%</span>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  contenedor: { padding: "30px", backgroundColor: "#090d16", minHeight: "100%", boxSizing: "border-box" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  titulo: { margin: 0, fontSize: "1.6rem", color: "#fff" },
  subtitulo: { margin: "5px 0 0 0", color: "#94a3b8", fontSize: "0.9rem" },
  fechaBadge: { backgroundColor: "#111827", padding: "8px 14px", borderRadius: "6px", fontSize: "0.85rem", color: "#94a3b8", border: "1px solid #1f2937" },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px", marginBottom: "30px" },
  kpiCard: { backgroundColor: "#111827", padding: "18px", borderRadius: "8px", border: "1px solid #1f2937" },
  kpiLabel: { margin: 0, fontSize: "0.8rem", color: "#94a3b8" },
  kpiValue: { margin: "8px 0 4px 0", fontSize: "1.5rem", color: "#fff", fontWeight: "bold" },
  dashboardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "25px" },
  mainCard: { backgroundColor: "#111827", padding: "20px", borderRadius: "8px", border: "1px solid #1f2937", display: "flex", flexDirection: "column", justifyContent: "space-between" },
  cardTitle: { margin: "0 0 15px 0", fontSize: "0.95rem", color: "#fff", fontWeight: "bold" },
  cardBtn: { background: "none", border: "none", color: "#a855f7", fontSize: "0.85rem", cursor: "pointer", textAlign: "left", padding: "10px 0 0 0", fontWeight: "bold", width: "fit-content" },
  linkVerTodos: { color: "#a855f7", fontSize: "0.8rem", cursor: "pointer", fontWeight: "bold" },
  leyendaGrid: { display: "flex", flexDirection: "column", gap: "8px", marginLeft: "15px" },
  leyendaRow: { display: "flex", alignItems: "center", gap: "8px" },
  punto: { width: "8px", height: "8px", borderRadius: "50%" },
  leyendaTxt: { fontSize: "0.8rem", color: "#94a3b8" },
  tabla: { width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" },
  th: { textAlign: "left", padding: "8px", color: "#64748b", borderBottom: "1px solid #1f2937" },
  td: { padding: "10px 8px", color: "#f8fafc", borderBottom: "1px solid #1f2937" },
  badge: { padding: "3px 8px", borderRadius: "50px", fontSize: "0.75rem", fontWeight: "bold" },
  listaActividad: { display: "flex", flexDirection: "column", gap: "12px" },
  actividadRow: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", borderBottom: "1px solid #1f2937", paddingBottom: "8px" },
  actividadCuerpo: { display: "flex", alignItems: "center", gap: "8px" },
  dotActividad: { fontSize: "0.9rem" },
  actividadTxt: { margin: 0, color: "#f8fafc" },
  actividadHora: { color: "#64748b", fontSize: "0.75rem" }
};