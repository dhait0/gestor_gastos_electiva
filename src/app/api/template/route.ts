import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

/**
 * GET /api/template
 * Genera y sirve la plantilla Excel de configuración inicial de Lukiva.
 * Incluye 7 hojas con datos de ejemplo, instrucciones y validaciones en columnas.
 */
export async function GET() {
  const wb = XLSX.utils.book_new();

  // ── Hoja 0: Instrucciones ──────────────────────────────────────────────────
  const instrucciones = [
    ["PLANTILLA DE CONFIGURACIÓN INICIAL — LUKIVA"],
    [""],
    ["ORDEN RECOMENDADO DE CONFIGURACIÓN:"],
    ["1. Cuentas      → Las cuentas donde tenés tu dinero (banco, efectivo, tarjeta)"],
    ["2. Deudas       → Préstamos, tarjetas de crédito y créditos que debés pagar"],
    ["3. Obligaciones → Pagos fijos próximos (arriendo, servicios, cuotas)"],
    ["4. Recurrentes  → Gastos/ingresos que se repiten automáticamente cada mes"],
    ["5. Suscripciones→ Netflix, Spotify y cualquier suscripción con renovación"],
    ["6. Presupuestos → Límites mensuales por categoría de gasto"],
    ["7. Transacciones→ Movimientos pasados que quieras importar"],
    [""],
    ["IMPORTANTE:"],
    ["• No modifiques los nombres de las columnas (primera fila de cada hoja)"],
    ["• Las celdas en ROJO son obligatorias"],
    ["• Los valores de las columnas tipo, frecuencia, etc. deben escribirse EXACTAMENTE como en las instrucciones"],
    ["• Las fechas van en formato YYYY-MM-DD (ej: 2026-11-23)"],
    ["• Los montos van sin puntos ni comas, solo el número (ej: 1500000)"],
    [""],
    ["TIPOS DE CUENTA (campo 'tipo' en hoja Cuentas):"],
    ["  CASH           → Efectivo"],
    ["  CHECKING       → Cuenta corriente"],
    ["  SAVINGS        → Cuenta de ahorros"],
    ["  CREDIT_CARD    → Tarjeta de crédito"],
    ["  DIGITAL_WALLET → Billetera digital (Nequi, Daviplata, etc.)"],
    ["  OTHER          → Otro"],
    [""],
    ["TIPOS DE DEUDA (campo 'tipo' en hoja Deudas):"],
    ["  CREDIT_CARD    → Tarjeta de crédito"],
    ["  PERSONAL_LOAN  → Préstamo personal"],
    ["  STUDENT_LOAN   → Crédito educativo"],
    ["  MORTGAGE       → Hipoteca / leasing habitacional"],
    ["  OTHER          → Otro"],
    [""],
    ["FRECUENCIA (campo 'frecuencia' en hoja Recurrentes):"],
    ["  WEEKLY         → Semanal"],
    ["  MONTHLY        → Mensual"],
    ["  QUARTERLY      → Trimestral"],
    ["  YEARLY         → Anual"],
    [""],
    ["TIPO DE TRANSACCIÓN (campo 'tipo' en hoja Transacciones):"],
    ["  INCOME         → Ingreso"],
    ["  EXPENSE        → Gasto"],
    ["  TRANSFER       → Transferencia entre cuentas propias"],
  ];
  const wsInstrucciones = XLSX.utils.aoa_to_sheet(instrucciones);
  wsInstrucciones["A1"].s = { font: { bold: true, sz: 14 } };
  XLSX.utils.book_append_sheet(wb, wsInstrucciones, "Instrucciones");

  // ── Hoja 1: Cuentas ────────────────────────────────────────────────────────
  const cuentas = [
    ["nombre *", "tipo *", "saldo_inicial", "limite_credito", "moneda", "notas"],
    ["Bancolombia Ahorros", "SAVINGS", 2500000, "", "COP", "Cuenta principal"],
    ["Nequi", "DIGITAL_WALLET", 150000, "", "COP", ""],
    ["Tarjeta Visa", "CREDIT_CARD", 0, 5000000, "COP", "Cupo total 5M"],
    ["Efectivo", "CASH", 80000, "", "COP", ""],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(cuentas), "Cuentas");

  // ── Hoja 2: Deudas ─────────────────────────────────────────────────────────
  const deudas = [
    ["nombre *", "tipo *", "monto_total *", "saldo_actual", "tasa_mensual_pct", "pago_minimo", "dia_pago", "notas"],
    ["Crédito libre inversión", "PERSONAL_LOAN", 18000000, 15200000, 1.8, 580000, 5, "Banco Bogotá"],
    ["Tarjeta Visa", "CREDIT_CARD", 5000000, 1200000, 3.1, 150000, 15, ""],
    ["Crédito iPhone", "OTHER", 2400000, 1800000, 0, 200000, 20, "Addi - 12 cuotas sin interés"],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(deudas), "Deudas");

  // ── Hoja 3: Obligaciones ───────────────────────────────────────────────────
  const obligaciones = [
    ["nombre *", "monto *", "fecha_vencimiento *", "moneda", "notas"],
    ["Arriendo", 1200000, "2026-12-05", "COP", ""],
    ["Cuota crédito Bancolombia", 580000, "2026-12-05", "COP", ""],
    ["Agua y gas", 85000, "2026-12-15", "COP", ""],
    ["Internet", 70000, "2026-12-20", "COP", ""],
    ["Pago tarjeta Visa", 150000, "2026-12-15", "COP", "Pago mínimo"],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(obligaciones), "Obligaciones");

  // ── Hoja 4: Recurrentes ────────────────────────────────────────────────────
  const recurrentes = [
    ["nombre *", "monto *", "tipo *", "frecuencia *", "fecha_inicio *", "cuenta *", "categoria", "es_automatico"],
    ["Salario", 3200000, "INCOME", "MONTHLY", "2026-12-01", "Bancolombia Ahorros", "Salario", "si"],
    ["Gimnasio", 80000, "EXPENSE", "MONTHLY", "2026-12-01", "Nequi", "Deporte", "no"],
    ["Mercado semanal", 150000, "EXPENSE", "WEEKLY", "2026-12-02", "Bancolombia Ahorros", "Mercado", "no"],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(recurrentes), "Recurrentes");

  // ── Hoja 5: Suscripciones ──────────────────────────────────────────────────
  const suscripciones = [
    ["nombre *", "monto *", "dia_facturacion *", "moneda", "categoria", "notas"],
    ["Netflix", 23900, 10, "COP", "Entretenimiento", "Plan estándar"],
    ["Spotify", 14900, 15, "COP", "Entretenimiento", ""],
    ["iCloud 50GB", 3900, 20, "COP", "Tecnología", ""],
    ["ChatGPT Plus", 20, 1, "USD", "Tecnología", "Se cobra en USD"],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(suscripciones), "Suscripciones");

  // ── Hoja 6: Presupuestos ───────────────────────────────────────────────────
  const presupuestos = [
    ["categoria *", "limite_mensual *", "notas"],
    ["Mercado", 600000, ""],
    ["Transporte", 200000, "SITP + Uber"],
    ["Restaurantes", 300000, ""],
    ["Entretenimiento", 150000, "Cine, salidas"],
    ["Ropa", 200000, ""],
    ["Salud", 150000, "Médico, farmacia"],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(presupuestos), "Presupuestos");

  // ── Hoja 7: Transacciones ──────────────────────────────────────────────────
  const transacciones = [
    ["fecha *", "tipo *", "monto *", "cuenta *", "descripcion *", "categoria", "notas"],
    ["2026-11-01", "INCOME", 3200000, "Bancolombia Ahorros", "Salario noviembre", "Salario", ""],
    ["2026-11-03", "EXPENSE", 85000, "Bancolombia Ahorros", "Mercado Éxito", "Mercado", ""],
    ["2026-11-05", "EXPENSE", 580000, "Bancolombia Ahorros", "Cuota crédito", "Deudas", ""],
    ["2026-11-10", "EXPENSE", 23900, "Nequi", "Netflix", "Entretenimiento", ""],
    ["2026-11-12", "EXPENSE", 32000, "Nequi", "Almuerzo trabajo", "Restaurantes", ""],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(transacciones), "Transacciones");

  // Anchos de columna automáticos para mejor legibilidad
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    if (!ws["!ref"]) continue;
    ws["!cols"] = Array(10).fill({ wch: 24 });
  }

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="plantilla-lukiva.xlsx"',
      "Cache-Control": "public, max-age=86400",
    },
  });
}
