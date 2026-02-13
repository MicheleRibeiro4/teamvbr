
export interface PhysicalData {
  weight: string;
  height: string;
  age: string;
  gender: string;
  bodyFat: string;
  muscleMass: string;
  visceralFat: string;
  waterPercentage?: string;
  imc: string;
  observations?: string;
}

export interface Macronutrients {
  protein: { value: string; ratio: string };
  carbs: { value: string; ratio: string };
  fats: { value: string; ratio: string };
}

export interface Meal {
  id: string;
  time: string;
  name: string;
  details: string;
}

export interface Supplement {
  id: string;
  name: string;
  dosage: string;
  timing: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: string;
}

export interface TrainingDay {
  id: string;
  title: string;
  focus: string;
  exercises: Exercise[];
}

export interface ContractInfo {
  cpf: string;
  rg: string;
  email: string;
  phone: string;
  address: string;
  startDate: string;
  endDate: string;
  durationDays: string;
  planValue: string;
  planValueWords: string;
  paymentMethod: string;
  installments: string;
  city: string;
  contractDate: string;
  status: 'Aguardando' | 'Ativo' | 'Vencido' | 'Cancelado';
  contractBody?: string; // Campo para o texto editável do contrato
}

export interface ProtocolData {
  id: string;
  updatedAt: string;
  privateNotes: string;
  clientName: string;
  protocolTitle: string;
  totalPeriod: string;
  consultantName: string;
  consultantCpf: string;
  consultantEmail: string;
  consultantAddress: string;
  physicalData: PhysicalData;
  nutritionalStrategy: string;
  kcalGoal: string;
  kcalSubtext: string;
  macros: Macronutrients;
  meals: Meal[];
  supplements: Supplement[];
  tips: string[];
  trainingFrequency: string;
  trainingDays: TrainingDay[];
  generalObservations: string;
  contract: ContractInfo;
}
