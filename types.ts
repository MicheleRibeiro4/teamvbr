
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
  substitutions?: string; // Opções de substituição
}

export interface Supplement {
  id: string;
  name: string;
  dosage: string;
  timing: string;
}

export interface Ergogenic {
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
  planType: 'Trimestral' | 'Semestral' | 'Avulso' | 'Anual'; 
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

export interface Anamnesis {
  mainObjective: string;
  routine: string; // Trabalho, horários, rotina diária
  trainingHistory: string; // Histórico de treino/dieta
  ergogenics: string; // Uso atual ou prévio
  foodPreferences: string; // Preferências, aversões, alergias
  injuries: string; // Lesões ou limitações
  medications: string; // Medicamentos de uso contínuo
}

export interface Feedback {
  id?: string;
  studentId: string;
  date: string;
  weight: string;
  dietAdherence: 'Boa' | 'Média' | 'Baixa';
  trainingAdherence: 'Boa' | 'Média' | 'Baixa';
  sleepQuality: string;
  energyLevel: string;
  notes: string;
  difficulties?: string;
  strategies?: string;
  author?: string; // Quem registrou
  createdAt?: string;
}

export interface BodyMeasurementEntry {
  id?: string;
  studentId: string;
  date: string;
  weight: string;
  chest: string;
  waist: string;
  abdomen: string;
  hip: string;
  armRight: string;
  armLeft: string;
  thighRight: string;
  thighLeft: string;
  calf: string;
  bodyFat: string;
  photoUrl?: string;
  createdAt?: string;
}

export interface Student {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

export interface ProtocolData {
  id: string;
  studentId?: string; // Link com a tabela students
  version?: number; // Versão do protocolo
  isOriginal?: boolean; // Se é o protocolo inicial
  createdAt: string; // Data de inclusão no sistema (imutável)
  updatedAt: string; // Data da última modificação
  privateNotes: string;
  clientName: string;
  protocolTitle: string; // Objetivo do Protocolo
  totalPeriod: string;
  consultantName: string;
  consultantCpf: string;
  consultantEmail: string;
  consultantAddress: string;
  physicalData: PhysicalData;
  anamnesis: Anamnesis; // Novo campo de Anamnese
  nutritionalStrategy: string;
  kcalGoal: string;
  kcalSubtext: string;
  waterGoal: string; // Novo campo para meta de água
  macros: Macronutrients;
  meals: Meal[];
  supplements: Supplement[];
  ergogenics?: Ergogenic[]; // Novo campo para ergogênicos
  tips: string[];
  trainingFrequency: string;
  trainingReasoning: string; // Novo campo
  trainingDays: TrainingDay[];
  generalObservations: string;
  contract: ContractInfo;
  lastSentDate?: string; // Data do último envio confirmado
  isActiveProtocol?: boolean; // Se é o protocolo ativo atual do aluno
}
