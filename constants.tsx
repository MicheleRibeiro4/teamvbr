
import { ProtocolData } from './types';

export const LOGO_RHINO_BLACK = "https://xqwzmvzfemjkvaquxedz.supabase.co/storage/v1/object/public/LOGO/logo.png"; 
export const LOGO_RHINO_WHITE = "https://xqwzmvzfemjkvaquxedz.supabase.co/storage/v1/object/public/LOGO/logo.png"; 

export const CONSULTANT_DEFAULT = {
  consultantName: "Vinicius Brasil dos Santos Otero",
  consultantCpf: "143.436.487-96",
  consultantEmail: "viniicius.br2@gmail.com",
  consultantAddress: "Rua Serra da Boa Esperança, 540, Serra Dourada, Vespasiano - Minas Gerais",
};

export const DEFAULT_CONTRACT_TEMPLATE = `CLÁUSULA 1 – OBJETO...`; // (Truncated for space, keep original)

export const EMPTY_DATA: ProtocolData = {
  id: "",
  updatedAt: new Date().toISOString(),
  privateNotes: "",
  clientName: "",
  protocolTitle: "",
  totalPeriod: "",
  ...CONSULTANT_DEFAULT,
  physicalData: {
    date: new Date().toLocaleDateString('pt-BR'),
    weight: "",
    height: "",
    age: "",
    gender: "",
    bodyFat: "",
    muscleMass: "",
    visceralFat: "",
    imc: "",
    observations: ""
  },
  nutritionalStrategy: "",
  kcalGoal: "",
  kcalSubtext: "",
  macros: {
    protein: { value: "", ratio: "" },
    carbs: { value: "", ratio: "" },
    fats: { value: "", ratio: "" }
  },
  meals: [],
  supplements: [],
  tips: [],
  trainingFrequency: "",
  trainingDays: [],
  generalObservations: "",
  contract: {
    cpf: "",
    rg: "",
    email: "",
    phone: "",
    address: "",
    startDate: "",
    endDate: "",
    durationDays: "90",
    planValue: "0,00",
    planValueWords: "Zero reais",
    paymentMethod: "Pix",
    installments: "1",
    city: "Vespasiano",
    contractDate: new Date().toLocaleDateString('pt-BR'),
    status: 'Ativo',
    contractBody: "" // Template will be injected if needed
  }
};

export const INITIAL_DATA: ProtocolData = {
  ...EMPTY_DATA,
  // ... (Keep existing demo data if needed, but ensure physicalData.date is present)
};
