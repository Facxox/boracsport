// Datos bancarios de Borac Sport (BROU único).
// Editar SOLO si la cuenta cambia. No agregues otros bancos acá.

export type Bank = {
  id: "brou"
  name: string
  accountType: string
  accountNumber: string
  legacyAccountNumber?: string
  notes?: string
}

export const BANK_ACCOUNTS: Bank[] = [
  {
    id: "brou",
    name: "Banco República (BROU)",
    accountType: "Caja de Ahorro en Pesos (UYU)",
    accountNumber: "CA 110403928-00001",
    legacyAccountNumber: "CA 600-5780688",
    notes: "Titular: SPORT GREAT S.A.S",
  },
]

export const TAX_HOLDER = {
  legalName: "SPORT GREAT S.A.S",
  rut: "—",
  address: "—",
}

export const TRANSFER_INSTRUCTIONS: string[] = [
  "Hacé la transferencia desde tu home banking o app del BROU a la Caja de Ahorro en Pesos indicada.",
  "También podés depositar en cualquier terminal automática de Abitab o Redpagos usando el número de cuenta principal.",
  "Una vez hecho el pago, mandanos el comprobante por WhatsApp o subilo en esta página.",
]

export const TRANSFER_SENIA_MESSAGE =
  "Para procesar la seña, por favor avísanos y envía el comprobante de transferencia para poder adjuntarlo a tu orden."