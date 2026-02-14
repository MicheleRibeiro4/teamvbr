
import { ProtocolData } from './types';

export const LOGO_RHINO_BLACK = "https://xqwzmvzfemjkvaquxedz.supabase.co/storage/v1/object/public/LOGO/logo.png"; 
export const LOGO_RHINO_WHITE = "https://xqwzmvzfemjkvaquxedz.supabase.co/storage/v1/object/public/LOGO/logo.png"; 

export const CONSULTANT_DEFAULT = {
  consultantName: "Vinicius Brasil dos Santos Otero",
  consultantCpf: "143.436.487-96",
  consultantEmail: "viniicius.br2@gmail.com",
  consultantAddress: "Rua Serra da Boa Esperança, 540, Serra Dourada, Vespasiano - Minas Gerais",
};

export const DEFAULT_CONTRACT_TEMPLATE = `CLÁUSULA 1 – OBJETO...`; // (Mantido igual)

export const EMPTY_DATA: ProtocolData = {
  id: "",
  updatedAt: new Date().toISOString(),
  privateNotes: "",
  clientName: "",
  protocolTitle: "",
  totalPeriod: "",
  ...CONSULTANT_DEFAULT,
  physicalData: {
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
    contractBody: DEFAULT_CONTRACT_TEMPLATE
  }
};

export const INITIAL_DATA: ProtocolData = {
  ...EMPTY_DATA,
  id: "initial-demo",
  clientName: "Eron Souza",
  protocolTitle: "HIPERTROFIA",
  totalPeriod: "11/02/2026 a 11/05/2026",
  physicalData: {
    weight: "73",
    height: "1,65",
    age: "40",
    gender: "Masculino",
    bodyFat: "24",
    muscleMass: "30",
    visceralFat: "7",
    imc: "26",
    observations: "Devido ao percentual de gordura em 24%, optamos por um superávit mais controlado, aumentando levemente a proteína para otimizar recomposição corporal e minimizar ganho de gordura."
  },
  nutritionalStrategy: "Devido ao percentual de gordura em 24%, optamos por um superávit mais controlado, aumentando levemente a proteína para otimizar recomposição corporal e minimizar ganho de gordura.",
  kcalGoal: "2.650",
  kcalSubtext: "(SUPERÁVIT CONTROLADO)",
  macros: {
    protein: { value: "160", ratio: "≈ 2,2g/kg" },
    carbs: { value: "330", ratio: "Energia" },
    fats: { value: "75", ratio: "Regulação" }
  },
  meals: [
    { id: '1', time: "08:40", name: "Café da Manhã", details: "90g Tapioca + 130g Frango + 1 fatia de Queijo + 1 Banana" },
    { id: '2', time: "13:30", name: "Almoço (Pós-Cardio)", details: "130g Arroz + 100g Feijão + 170g Carne ou Frango + Legumes à vontade + Fio de Azeite" },
    { id: '3', time: "15:30", name: "Lanche da Tarde", details: "40g Aveia + 35g Whey Protein + 1 Banana + 10g Pasta de Amendoim" },
    { id: '4', time: "18:00", name: "Jantar", details: "130g Arroz + 170g Frango ou Carne + Legumes à vontade" },
    { id: '5', time: "21:45", name: "Pré-Treino", details: "1 Banana + Café (sem mel/açúcar)" },
    { id: '6', time: "23:45", name: "Pós-Treino / Ceia", details: "180g Arroz (ou 90g Macarrão) + 170g Frango ou Carne" }
  ],
  supplements: [
    { id: 's1', name: "CREATINA", dosage: "5g todos os dias (sem falhar)", timing: "Junto à Ceia / Pós-Treino" },
    { id: 's2', name: "WHEY PROTEIN", dosage: "35g (Dose ajustada)", timing: "Lanche (15:30)" },
    { id: 's3', name: "CAFEÍNA (CAFÉ)", dosage: "Fonte natural de energia", timing: "Pré-Treino (21:45)" }
  ],
  tips: [
    "Organize suas marmitas no dia anterior para evitar furos na dieta.",
    "A Creatina não tem efeito imediato, seu efeito é crônico. Tome mesmo nos dias que não treinar.",
    "O cardio antes do almoço é fundamental para a sensibilidade à insulina."
  ],
  trainingFrequency: "4 a 5x por semana",
  trainingDays: [
    {
      id: 'a',
      title: "DIA A: PEITO + OMBRO",
      focus: "Superior",
      exercises: [
        { id: 'e1', name: "Supino Reto (Barra ou Halter)", sets: "4x 6-8" },
        { id: 'e2', name: "Supino Inclinado c/ Halter", sets: "3x 8-10" },
        { id: 'e3', name: "Crucifixo na Máquina", sets: "3x 10-12" },
        { id: 'e4', name: "Desenvolvimento c/ Halter", sets: "4x 8-10" },
        { id: 'e5', name: "Elevação Lateral", sets: "4x 12-15" }
      ]
    },
    {
      id: 'b',
      title: "DIA B: PERNAS",
      focus: "Glúteo",
      exercises: [
        { id: 'e6', name: "Agachamento Livre", sets: "4x 6-8" },
        { id: 'e7', name: "Leg Press 45º", sets: "3x 8-10" },
        { id: 'e8', name: "Stiff", sets: "3x 8-10" },
        { id: 'e9', name: "Elevação Pélvica", sets: "4x 8-10" },
        { id: 'e10', name: "Cadeira Abdutora", sets: "4x 12-15" }
      ]
    }
  ],
  generalObservations: "Ajustes de carga, dieta e cardio serão feitos conforme sua evolução e feedback.",
  contract: { ...EMPTY_DATA.contract }
};
