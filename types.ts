
export interface BodyMeasurements {
  thorax: string;
  waist: string;
  abdomen: string;
  glutes: string;
  rightArmRelaxed: string;
  leftArmRelaxed: string;
  rightArmContracted: string;
  leftArmContracted: string;
  rightThigh: string;
  leftThigh: string;
  rightCalf: string;
  leftCalf: string;
}

export interface PhysicalData {
  date: string;
  weight: string;
  height: string;
  age: string;
  gender: 'Masculino' | 'Feminino' | '';
  bodyFat: string;
  muscleMass: string;
  visceralFat: string;
  waterPercentage: string;
  imc: string;
  measurements: BodyMeasurements; // Novos campos de medidas
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
  phone: string;
  email: string;
  // Campos de endereço detalhados
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string; // UF separado
  // Vigência
  planType: 'Trimestral' | 'Semestral' | 'Avulso'; 
  startDate: string;
  endDate: string;
  durationDays: string;
  // Financeiro
  planValue: string;
  planValueWords: string;
  paymentMethod: 'Pix' | 'Cartão de Crédito';
  installments: string;
  contractDate: string;
  status: 'Aguardando' | 'Ativo' | 'Vencido' | 'Cancelado';
  contractBody?: string;
  address?: string; // Mantendo compatibilidade legada se necessário
}

export interface ProtocolData {
  id: string;
  updatedAt: string;
  privateNotes: string;
  clientName: string;
  protocolTitle: string; // Objetivo do Protocolo
  totalPeriod: string;
  consultantName: string;
  consultantCpf: string;
  consultantEmail: string;
  consultantAddress: string;
  physicalData: PhysicalData;
  nutritionalStrategy: string;
  kcalGoal: string;
  kcalSubtext: string;
  waterGoal: string; // Novo campo para meta de água
  macros: Macronutrients;
  meals: Meal[];
  supplements: Supplement[];
  tips: string[];
  trainingFrequency: string;
  trainingDays: TrainingDay[];
  generalObservations: string;
  contract: ContractInfo;
}
