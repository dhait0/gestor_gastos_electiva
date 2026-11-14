import { Decimal } from "decimal.js";
import { getBudgetStatus, type BudgetStatus } from "./budgets";
import { LIQUID_ACCOUNT_TYPES } from "./transactions";

export interface SimulationInput {
  amount: string | number | Decimal;
  /** Tipo de la cuenta con la que se pagaría (afecta cómo impacta el dinero). */
  accountType: string;
  liquidBalance: Decimal;
  availableToSpend: Decimal;
  /** Presupuesto del mes de la categoría elegida, si existe. */
  budget?: { limit: Decimal; spent: Decimal } | null;
  /** Saldo líquido proyectado a fin de mes (del forecast), si se conoce. */
  projectedEndLiquid?: Decimal | null;
  /** Suma de los compromisos mensuales de metas activas. */
  goalMonthlyCommitments: Decimal;
}

export interface SimulationResult {
  /** Siempre false: una simulación nunca guarda nada (UC-39). */
  persisted: false;
  amount: Decimal;
  /** true si la compra aumenta la deuda de una tarjeta en vez de bajar el saldo líquido. */
  usesCredit: boolean;
  liquidBefore: Decimal;
  liquidAfter: Decimal;
  availableBefore: Decimal;
  availableAfter: Decimal;
  budget: {
    percentBefore: number;
    percentAfter: number;
    statusBefore: BudgetStatus;
    statusAfter: BudgetStatus;
    remainingAfter: Decimal;
  } | null;
  projectedEndLiquidAfter: Decimal | null;
  /** ¿Tras la compra el disponible aún cubre los compromisos mensuales de metas? */
  coversGoalCommitments: boolean;
  /** Avisos en lenguaje claro para mostrar al usuario. */
  warnings: string[];
}

function percentOf(spent: Decimal, limit: Decimal): Decimal {
  return limit.isZero() ? new Decimal(0) : spent.div(limit).mul(100);
}

/**
 * Simula el impacto de una compra hipotética sin persistir nada (UC-39).
 *  - Cuenta líquida: baja el saldo líquido, el disponible y el forecast.
 *  - Tarjeta de crédito: no baja el saldo líquido ahora; aumenta la deuda.
 *  - Otras cuentas no líquidas: no afectan al saldo líquido.
 */
export function simulatePurchase(input: SimulationInput): SimulationResult {
  const amount = new Decimal(input.amount);
  if (amount.lte(0)) throw new Error("El monto de la simulación debe ser mayor a 0");

  const usesCredit = input.accountType === "CREDIT_CARD";
  const reducesLiquid = LIQUID_ACCOUNT_TYPES.includes(input.accountType);
  const delta = reducesLiquid ? amount : new Decimal(0);

  const liquidAfter = input.liquidBalance.minus(delta);
  const availableAfter = input.availableToSpend.minus(delta);

  const budget = input.budget
    ? (() => {
        const before = percentOf(input.budget!.spent, input.budget!.limit);
        const afterSpent = input.budget!.spent.plus(amount);
        const after = percentOf(afterSpent, input.budget!.limit);
        return {
          percentBefore: before.toDecimalPlaces(1).toNumber(),
          percentAfter: after.toDecimalPlaces(1).toNumber(),
          statusBefore: getBudgetStatus(before),
          statusAfter: getBudgetStatus(after),
          remainingAfter: input.budget!.limit.minus(afterSpent),
        };
      })()
    : null;

  const projectedEndLiquidAfter =
    input.projectedEndLiquid !== null && input.projectedEndLiquid !== undefined ? input.projectedEndLiquid.minus(delta) : null;

  const coversGoalCommitments = availableAfter.gte(input.goalMonthlyCommitments);

  const warnings: string[] = [];
  if (availableAfter.isNegative() && !input.availableToSpend.isNegative()) {
    warnings.push("Con esta compra tu dinero disponible quedaría en negativo.");
  }
  if (liquidAfter.isNegative()) warnings.push("Esta compra supera tu saldo líquido actual.");
  if (budget && budget.statusAfter === "EXCEEDED" && budget.statusBefore !== "EXCEEDED") {
    warnings.push("Con esta compra superarías el presupuesto de la categoría.");
  }
  if (projectedEndLiquidAfter?.isNegative() && !input.projectedEndLiquid?.isNegative()) {
    warnings.push("Según la estimación, terminarías el mes con saldo líquido negativo.");
  }
  if (!coversGoalCommitments && input.availableToSpend.gte(input.goalMonthlyCommitments)) {
    warnings.push("Después de esta compra no te alcanzaría para tus aportes mensuales a metas.");
  }
  if (usesCredit) warnings.push("Pagar con tarjeta no baja tu saldo hoy, pero aumenta tu deuda.");

  return {
    persisted: false,
    amount,
    usesCredit,
    liquidBefore: input.liquidBalance,
    liquidAfter,
    availableBefore: input.availableToSpend,
    availableAfter,
    budget,
    projectedEndLiquidAfter,
    coversGoalCommitments,
    warnings,
  };
}
