import React, { useState, useEffect, useCallback } from "react";

export default function FastechTienda({ 
  productos, 
  agregarAlCarrito, 
  carrito, 
  quitar, 
  limpiarCarrito, 
  obtenerProductos, 
  cargarHistorialPremium, 
  logout,
  user,            
  seccionActiva,   
  cambiarSeccion,  
  datosPedidos     
}) {
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [rangoPrecio, setRangoPrecio] = useState(20000);
  const [cantidadesTarjeta, setCantidadesTarjeta] = useState({});

  const [mostrarModal, setMostrarModal] = useState(false);
  const [detallesPedido, setDetallesPedido] = useState({ numero: "", fecha: "", totalPedido: 0 });

  // ✅ CORREGIDO: Envolvemos en useCallback para que useEffect no pida dependencias locas
  const resetearContadoresTarjetas = useCallback(() => {
    if (productos.length > 0) {
      const iniciales = {};
      productos.forEach((p) => { iniciales[p.id] = 1; });
      setCantidadesTarjeta(iniciales);
    }
  }, [productos]);

  useEffect(() => {
    resetearContadoresTarjetas();
  }, [resetearContadoresTarjetas]);

  const ajustarCantidadTarjeta = (id, stockMax, operacion) => {
    const actual = cantidadesTarjeta[id] || 1;
    if (operacion === "mas") {
      if (actual >= stockMax) return;
      setCantidadesTarjeta({ ...cantidadesTarjeta, [id]: actual + 1 });
    } else if (operacion === "menos" && actual > 1) {
      setCantidadesTarjeta({ ...cantidadesTarjeta, [id]: actual - 1 });
    }
  };

  const productosFiltrados = productos.filter((p) => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaActiva === "Todos" || p.categoria?.toLowerCase() === categoriaActiva.toLowerCase();
    const coincidePrecio = Number(p.precio) <= rangoPrecio;
    return coincideBusqueda && coincideCategoria && coincidePrecio;
  });

  const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const finalizarCompra = async () => {
    if (carrito.length === 0) return;

    const carritoFormateado = carrito.map(item => ({
      producto_id: Number(item.id),
      cantidad: Number(item.cantidad || 1),
      precio_unitario: Number(item.precio)
    }));

    try {
      const res = await fetch("http://localhost:3001/comprar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          usuario: user?.usuario || "Edgar", 
          carrito: carritoFormateado 
        })
      });
      const data = await res.json();
      
      if (!data.error) {
        const numeroAleatorio = `FS-2026-${Math.floor(100000 + Math.random() * 900000)}`;
        const opcionesFecha = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        const fechaActual = new Date().toLocaleDateString('es-ES', opcionesFecha);

        setDetallesPedido({ numero: numeroAleatorio, fecha: fechaActual, totalPedido: subtotal });
        
        limpiarCarrito();
        obtenerProductos(); 
        if (cargarHistorialPremium) await cargarHistorialPremium(); 
        setMostrarModal(true); 
      } else {
        alert(`❌ Error: ${data.mensaje}`);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Ocurrió un error con el servidor.");
    }
  };

  return (
    <div style={styles.dashboardLayout}>
      {/* 🔝 ENCABEZADO SUPERIOR */}
      <header style={styles.topHeader}>
        <h1 onClick={() => cambiarSeccion("tienda")} style={{...styles.brandLogo, cursor: "pointer"}}>Fastech Shop</h1>
        
        <div style={styles.searchContainer}>
          {seccionActiva !== "mis-pedidos" && (
            <input 
              type="text" 
              placeholder="Buscar productos..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={styles.searchInput}
            />
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={styles.topCartIndicator}>
            🛒 Carrito <b>${subtotal.toLocaleString()}.00</b>
          </div>
        </div>
      </header>

      {/* 🧱 CUERPO PRINCIPAL CON DISTRIBUCIÓN EN COLUMNAS */}
      <div style={styles.workspace}>
        
        {/* 🧭 COLUMNA 1: BARRA LATERAL DEL CLIENTE */}
        <aside style={styles.clientSidebar}>
          <div style={styles.userSection}>
            <div style={styles.avatar}>👤</div>
            <div style={{ textAlign: "left" }}>
              <div style={styles.userName}>{user?.usuario || "Edgar"} 🟢</div>
              <div style={styles.userRole}>Cliente</div>
            </div>
          </div>

          <nav style={styles.navMenu}>
            <button 
              onClick={() => cambiarSeccion("tienda")} 
              style={{...styles.navBtn, backgroundColor: seccionActiva !== "mis-pedidos" ? "#a855f7" : "transparent"}}
            >
              🛍️ Tienda
            </button>
            <button 
              onClick={() => cambiarSeccion("mis-pedidos")} 
              style={{...styles.navBtn, backgroundColor: seccionActiva === "mis-pedidos" ? "#a855f7" : "transparent"}}
            >
              📋 Mis pedidos
            </button>
          </nav>

          <button onClick={logout} style={styles.btnCerrarSesion}>🚪 Cerrar Sesión</button>
        </aside>

        {/* 📜 CONTENIDO DINÁMICO SEGÚN LA SECCIÓN SELECCIONADA */}
        {seccionActiva === "mis-pedidos" ? (
          /* Vista de Mis Pedidos */
          <section style={styles.mainContentArea}>
            <div style={{ marginBottom: "25px" }}>
              <h2 style={{ color: "white", margin: 0, fontSize: "1.6rem" }}>Mis Pedidos Realizados</h2>
              <p style={{ color: "#94a3b8", margin: "4px 0 0 0", fontSize: "0.85rem" }}>Historial completo de tus adquisiciones en el sistema</p>
            </div>

            <div style={styles.tableWrapper}>
              <table style={styles.historyTable}>
                <thead>
                  <tr style={styles.tableThRow}>
                    <th style={styles.tableTh}>ID Compra</th>
                    <th style={styles.tableTh}>Fecha</th>
                    <th style={styles.tableTh}>Productos</th>
                    <th style={styles.tableTh}>Total Pagado</th>
                    <th style={styles.tableTh}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {datosPedidos && datosPedidos.length > 0 ? (
                    datosPedidos.map((pedido, idx) => (
                      <tr key={idx} style={styles.tableTdRow}>
                        <td style={{...styles.tableTd, fontFamily: "monospace", color: "#c084fc"}}>
                          #FS-{pedido.id || (1000 + idx)}
                        </td>
                        <td style={styles.tableTd}>
                          {pedido.fecha || "Reciente"}
                        </td>
                        <td style={styles.tableTd}>
                          {pedido.detalles || pedido.productos || "Artículos Adquiridos"}
                        </td>
                        <td style={{...styles.tableTd, fontWeight: "bold", color: "#10b981"}}>
                          ${Number(pedido.total || pedido.monto || 0).toLocaleString()}.00
                        </td>
                        <td style={styles.tableTd}>
                          <span style={styles.statusBadgeOk}>Procesado ✓</span>
                        </td>
                      </tr>
                    ))
                  ) : detallesPedido.numero ? (
                    <tr style={styles.tableTdRow}>
                      <td style={{...styles.tableTd, fontFamily: "monospace", color: "#c084fc"}}>{detallesPedido.numero}</td>
                      <td style={styles.tableTd}>{detallesPedido.fecha || "Hoy"}</td>
                      <td style={styles.tableTd}>Última Compra Procesada</td>
                      <td style={{...styles.tableTd, fontWeight: "bold", color: "#10b981"}}>${detallesPedido.totalPedido.toLocaleString()}.00</td>
                      <td style={styles.tableTd}><span style={styles.statusBadgeOk}>Procesado ✓</span></td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan="5" style={{...styles.tableTd, textAlign: "center", color: "#64748b", padding: "40px"}}>
                        Aún no registras compras asociadas a tu cuenta de cliente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          /* Vista por Defecto: Tienda + Filtros + Carrito */
          <>
            <aside style={styles.leftFiltersSidebar}>
              <h3 style={styles.sectionTitle}>Categorías</h3>
              <div style={styles.catGroup}>
                {["Todos", "Laptops", "Celulares", "Audio", "Accesorios", "Televisores"].map((cat) => (
                  <button key={cat} onClick={() => setCategoriaActiva(cat)} style={{ ...styles.catButton, backgroundColor: categoriaActiva === cat ? "#a21caf" : "transparent", color: "white" }}>
                    {cat}
                  </button>
                ))}
              </div>
              <hr style={styles.spacer} />
              <h3 style={styles.sectionTitle}>Filtros</h3>
              <label style={styles.filterLabel}>Rango de precio</label>
              <input type="range" min="0" max="20000" value={rangoPrecio} onChange={(e) => setRangoPrecio(Number(e.target.value))} style={styles.rangeSlider} />
              <div style={styles.rangeValues}><span>$0</span><span>${rangoPrecio.toLocaleString()}+</span></div>
            </aside>

            <section style={styles.galleryContainer}>
              <div style={styles.galleryMeta}>
                <h2 style={styles.galleryTitle}>¡Bienvenido, {user?.usuario || "Edgar"}! 👋</h2>
                <span style={styles.itemCount}>{productosFiltrados.length} productos</span>
              </div>
              <p style={styles.gallerySubtitle}>Descubre los mejores productos al mejor precio</p>

              <div style={styles.productGrid}>
                {productosFiltrados.map((p) => {
                  const sinExistencias = p.stock <= 0;
                  const cantidadElegida = cantidadesTarjeta[p.id] || 1;

                  return (
                    <div key={p.id} style={styles.productCard}>
                      <div style={styles.imgWrapper}>
                        {sinExistencias && <span style={styles.soldOutBadge}>AGOTADO</span>}
                        <img src={p.imagen} alt={p.nombre} style={styles.cardImg} />
                      </div>
                      <div style={styles.cardContent}>
                        <h4 style={styles.cardName}>{p.nombre}</h4>
                        <span style={styles.cardTag}>{p.categoria || "General"}</span>
                        <h3 style={styles.cardPrice}>${Number(p.precio).toLocaleString()}.00</h3>
                        <p style={{ ...styles.cardStock, color: sinExistencias ? "#ef4444" : "#10b981" }}>
                          {sinExistencias ? "Sin stock" : `En stock: ${p.stock} unidades`}
                        </p>
                        <div style={styles.cardActionsRow}>
                          <div style={styles.cardCounter}>
                            <button disabled={sinExistencias} onClick={() => ajustarCantidadTarjeta(p.id, p.stock, "menos")} style={styles.stepBtn}>-</button>
                            <span style={styles.stepVal}>{sinExistencias ? 0 : cantidadElegida}</span>
                            <button disabled={sinExistencias} onClick={() => ajustarCantidadTarjeta(p.id, p.stock, "mas")} style={styles.stepBtn}>+</button>
                          </div>
                          <button disabled={sinExistencias} onClick={() => agregarAlCarrito(p, cantidadElegida)} style={{ ...styles.cardAddBtn, backgroundColor: sinExistencias ? "#1f2937" : "#10b981", cursor: sinExistencias ? "not-allowed" : "pointer" }}>
                            {sinExistencias ? "Sin existencias" : "Agregar al carrito"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <aside style={styles.rightCartPanel}>
              <h3 style={styles.cartPanelTitle}>Tu carrito ({carrito.length})</h3>
              <div style={styles.cartScrollList}>
                {carrito.map((item) => (
                  <div key={item.id} style={styles.cartListItem}>
                    <div style={styles.cartListImgBox}><img src={item.imagen} alt={item.nombre} style={styles.cartListImg} /></div>
                    <div style={{ flex: 1, marginLeft: "10px" }}>
                      <h5 style={styles.cartListItemName}>{item.nombre}</h5>
                      <span style={styles.cartListItemDetail}>${Number(item.precio).toLocaleString()} x {item.cantidad}</span>
                    </div>
                    <button onClick={() => quitar(item.id)} style={styles.cartListRemove}>✕</button>
                  </div>
                ))}
              </div>
              <div style={styles.cartFooterSummary}>
                <div style={styles.summaryLine}><span>Subtotal</span><span>${subtotal.toLocaleString()}.00</span></div>
                <div style={styles.summaryLine}><span>Envío</span><span style={{ color: "#10b981" }}>Gratis</span></div>
                <hr style={{ border: "none", borderTop: "1px solid #1f2937", margin: "12px 0" }} />
                <div style={styles.totalLine}><span>Total</span><span style={{ color: "#10b981" }}>${subtotal.toLocaleString()}.00</span></div>
                <button onClick={finalizarCompra} disabled={carrito.length === 0} style={styles.checkoutSubmitBtn}>🔒 Proceder al pago</button>
              </div>
            </aside>
          </>
        )}
      </div>

      {/* MODAL DE COMPRA EXITOSA */}
      {mostrarModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <button onClick={() => setMostrarModal(false)} style={styles.modalCloseCorner}>✕</button>
            <div style={styles.successIconBadge}>✓</div>
            <h2 style={styles.modalTitle}>¡Compra procesada con éxito!</h2>
            <p style={styles.modalSubtitle}>Tu pedido ha sido recibido y registrado en el sistema ERP.</p>
            
            <div style={styles.ticketDetailsContainer}>
              <div style={styles.ticketLine}><span style={styles.ticketLabel}>📋 Número de pedido</span><span style={styles.ticketValue}>{detallesPedido.numero}</span></div>
              <div style={styles.ticketLine}><span style={styles.ticketLabel}>📅 Fecha</span><span style={styles.ticketValue}>{detallesPedido.fecha}</span></div>
            </div>

            <button onClick={() => { setMostrarModal(false); cambiarSeccion("mis-pedidos"); }} style={styles.modalPrimaryBtn}>Ver mis pedidos</button>
            <button onClick={() => { setMostrarModal(false); resetearContadoresTarjetas(); }} style={styles.modalSecondaryBtn}>Seguir comprando</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  dashboardLayout: { backgroundColor: "#090d16", minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "sans-serif", color: "#f8fafc" },
  topHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px", backgroundColor: "#0f172a", borderBottom: "1px solid #1f2937" },
  brandLogo: { fontSize: "1.3rem", fontWeight: "bold", color: "#d946ef", margin: 0 },
  searchContainer: { flex: 0.35 },
  searchInput: { width: "100%", padding: "8px 14px", borderRadius: "6px", border: "1px solid #1f2937", backgroundColor: "#1e293b", color: "white" },
  topCartIndicator: { backgroundColor: "#1e293b", padding: "8px 14px", borderRadius: "6px", fontSize: "0.85rem", color: "white" },
  workspace: { display: "flex", padding: "20px", gap: "20px", flex: 1 },
  clientSidebar: { width: "230px", backgroundColor: "#111827", padding: "20px", display: "flex", flexDirection: "column", borderRight: "1px solid #1f2937", flexShrink: 0, borderRadius: "8px" },
  userSection: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "30px", backgroundColor: "#1f2937", padding: "10px", borderRadius: "8px", border: "1px solid #1f2937" },
  avatar: { fontSize: "1.2rem", backgroundColor: "#374151", padding: "6px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" },
  userName: { fontWeight: "bold", fontSize: "0.9rem", color: "white" },
  userRole: { fontSize: "0.75rem", color: "#94a3b8", marginTop: "2px" },
  navMenu: { display: "flex", flexDirection: "column", gap: "8px", flexGrow: 1 },
  navBtn: { width: "100%", textAlign: "left", color: "white", border: "none", padding: "12px 15px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "0.85rem", outline: "none", transition: "0.2s" },
  btnCerrarSesion: { width: "100%", backgroundColor: "#1f2937", color: "#f8fafc", border: "1px solid #374151", padding: "11px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", marginTop: "auto" },
  mainContentArea: { flex: 1, padding: "10px 20px" },
  leftFiltersSidebar: { width: "180px", flexShrink: 0 },
  sectionTitle: { fontSize: "0.95rem", color: "white", marginBottom: "12px" },
  catGroup: { display: "flex", flexDirection: "column", gap: "5px" },
  catButton: { textAlign: "left", padding: "10px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "0.85rem" },
  spacer: { border: "none", borderTop: "1px solid #1f2937", margin: "20px 0" },
  filterLabel: { color: "#94a3b8", fontSize: "0.8rem" },
  rangeSlider: { width: "100%", accentColor: "#a21caf", marginTop: "8px" },
  rangeValues: { display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: "0.8rem", marginTop: "4px" },
  galleryContainer: { flex: 1 },
  galleryMeta: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },
  galleryTitle: { color: "white", fontSize: "1.4rem", margin: 0 },
  gallerySubtitle: { color: "#64748b", fontSize: "0.85rem", margin: "4px 0 20px 0" },
  itemCount: { color: "#64748b", fontSize: "0.85rem" },
  productGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" },
  productCard: { backgroundColor: "#0f172a", border: "1px solid #1f2937", borderRadius: "8px", overflow: "hidden", display: "flex", flexDirection: "column", height: "350px" },
  imgWrapper: { position: "relative", backgroundColor: "white", height: "130px", display: "flex", justifyContent: "center", alignItems: "center", padding: "8px" },
  cardImg: { maxHeight: "100%", maxWidth: "100%", objectFit: "contain" },
  soldOutBadge: { position: "absolute", top: "8px", left: "8px", backgroundColor: "#ef4444", color: "white", fontSize: "0.65rem", fontWeight: "bold", padding: "2px 6px", borderRadius: "4px", zIndex: 5 },
  cardContent: { padding: "12px", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" },
  cardName: { margin: 0, color: "white", fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  cardTag: { backgroundColor: "#1e293b", color: "#c084fc", fontSize: "0.7rem", padding: "2px 6px", borderRadius: "4px", alignSelf: "flex-start", marginTop: "4px" },
  cardPrice: { margin: "8px 0 2px 0", color: "white", fontSize: "1.15rem" },
  cardStock: { fontSize: "0.75rem", margin: "0 0 8px 0" },
  cardActionsRow: { display: "flex", flexDirection: "column", gap: "8px" },
  cardCounter: { display: "flex", alignItems: "center", backgroundColor: "#1e293b", borderRadius: "6px", overflow: "hidden", justifyContent: "space-between" },
  stepBtn: { backgroundColor: "transparent", border: "none", color: "white", width: "30px", height: "30px", cursor: "pointer", fontSize: "1rem" },
  stepVal: { color: "white", fontSize: "0.85rem", fontWeight: "bold" },
  cardAddBtn: { border: "none", padding: "8px", borderRadius: "6px", fontWeight: "bold", fontSize: "0.8rem", color: "white" },
  rightCartPanel: { width: "260px", backgroundColor: "#0f172a", border: "1px solid #1f2937", borderRadius: "8px", padding: "12px", display: "flex", flexDirection: "column", height: "fit-content", flexShrink: 0 },
  cartPanelTitle: { color: "white", margin: "0 0 12px 0", fontSize: "1rem" },
  cartScrollList: { display: "flex", flexDirection: "column", gap: "10px", maxHeight: "200px", overflowY: "auto" },
  cartListItem: { display: "flex", alignItems: "center", backgroundColor: "#1e293b", padding: "6px", borderRadius: "6px" },
  cartListImgBox: { width: "35px", height: "35px", backgroundColor: "white", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", padding: "2px" },
  cartListImg: { maxHeight: "100%", maxWidth: "100%", objectFit: "contain" },
  cartListItemName: { margin: 0, color: "white", fontSize: "0.8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  cartListItemDetail: { fontSize: "0.7rem", color: "#94a3b8" },
  cartListRemove: { background: "none", border: "none", color: "#64748b", cursor: "pointer" },
  cartFooterSummary: { marginTop: "15px" },
  summaryLine: { display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: "0.8rem", marginBottom: "4px" },
  totalLine: { display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "0.95rem" },
  checkoutSubmitBtn: { width: "100%", padding: "10px", borderRadius: "6px", border: "none", backgroundColor: "#a21caf", color: "white", fontWeight: "bold", cursor: "pointer", fontSize: "0.85rem", marginTop: "12px" },
  tableWrapper: { backgroundColor: "#0f172a", border: "1px solid #1f2937", borderRadius: "8px", overflow: "hidden" },
  historyTable: { width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" },
  tableThRow: { backgroundColor: "#111827", borderBottom: "1px solid #1f2937" },
  tableTh: { padding: "14px 18px", color: "#94a3b8", fontWeight: "600" },
  tableTdRow: { borderBottom: "1px solid #1f2937", backgroundColor: "transparent" },
  tableTd: { padding: "14px 18px", color: "#e2e8f0" },
  statusBadgeOk: { backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold" },
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(5, 7, 12, 0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 3000 },
  modalBox: { backgroundColor: "#111827", border: "1px solid #1f2937", borderRadius: "14px", width: "420px", padding: "28px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative" },
  modalCloseCorner: { position: "absolute", top: "14px", right: "14px", background: "none", border: "none", color: "#94a3b8", fontSize: "1.1rem", cursor: "pointer" },
  successIconBadge: { width: "55px", height: "55px", backgroundColor: "#10b981", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", fontWeight: "bold", marginBottom: "16px" },
  modalTitle: { color: "white", fontSize: "1.3rem", margin: "0 0 10px 0", fontWeight: "bold" },
  modalSubtitle: { color: "#94a3b8", fontSize: "0.85rem", margin: "0 0 20px 0", lineHeight: "1.4" },
  ticketDetailsContainer: { backgroundColor: "#1e293b", width: "100%", borderRadius: "8px", padding: "12px 16px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px", border: "1px solid #1f2937" },
  ticketLine: { display: "flex", justifyContent: "space-between", fontSize: "0.8rem", alignItems: "center" },
  ticketLabel: { color: "#94a3b8" },
  ticketValue: { color: "white", fontWeight: "600", fontFamily: "monospace" },
  modalPrimaryBtn: { width: "100%", padding: "11px", borderRadius: "6px", border: "none", backgroundColor: "#bc15e6", color: "white", fontWeight: "bold", cursor: "pointer", fontSize: "0.85rem", marginBottom: "8px" },
  modalSecondaryBtn: { width: "100%", padding: "10px", borderRadius: "6px", border: "none", backgroundColor: "transparent", color: "#38bdf8", fontWeight: "600", cursor: "pointer", fontSize: "0.85rem" }
};