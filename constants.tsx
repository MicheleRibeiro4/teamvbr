
import { ProtocolData } from './types';

export const LOGO_VBR_BLACK = "https://xqwzmvzfemjkvaquxedz.supabase.co/storage/v1/object/public/LOGO/logo.png"; 
export const ICON_MAN = "https://xqwzmvzfemjkvaquxedz.supabase.co/storage/v1/object/public/LOGO/icone%20homem.png";
export const ICON_WOMAN = "https://xqwzmvzfemjkvaquxedz.supabase.co/storage/v1/object/public/LOGO/icone%20mulher.jpg";

export const CONSULTANT_DEFAULT = {
  consultantName: "Vinicius Brasil dos Santos Otero",
  consultantCpf: "143.436.487-96",
  consultantEmail: "viniicius.br2@gmail.com",
  consultantAddress: "Rua Serra da Boa Esperança, 540, Serra Dourada, Vespasiano - Minas Gerais",
};

export const MEASUREMENT_LABELS: Record<string, string> = {
  thorax: 'Tórax',
  waist: 'Cintura',
  abdomen: 'Abdômen',
  glutes: 'Glúteo', // Alterado de Glúteos para Glúteo
  rightArmRelaxed: 'Braço Dir. Relaxado',
  leftArmRelaxed: 'Braço Esq. Relaxado',
  rightArmContracted: 'Braço Dir. Contraído',
  leftArmContracted: 'Braço Esq. Contraído',
  rightThigh: 'Coxa Direita',
  leftThigh: 'Coxa Esquerda',
  rightCalf: 'Panturrilha Direita',
  leftCalf: 'Panturrilha Esquerda',
};

export const PROTOCOL_TEMPLATES = {
  emagrecimento: {
    title: "Emagrecimento",
    tips: [
      "Mantenha o déficit calórico constante.",
      "Aumente o consumo de fibras para maior saciedade.",
      "Não pule o cardio, ele é essencial para o gasto energético.",
      "Beba pelo menos 35ml de água por kg de peso.",
      "Priorize alimentos de baixa densidade calórica."
    ],
    strategy: "Foco em restrição calórica controlada, alta ingestão de proteínas para preservar massa magra e volume de treino moderado/alto."
  },
  hipertrofia: {
    title: "Hipertrofia",
    tips: [
      "O superávit calórico é necessário para a construção muscular.",
      "Priorize o descanso; o músculo cresce fora da academia.",
      "Mantenha a progressão de carga em todos os treinos.",
      "Consuma proteína em todas as refeições.",
      "A creatina é sua melhor aliada; tome todos os dias."
    ],
    strategy: "Superávit calórico leve, foco em progressão de tensão mecânica e volume de treino otimizado para recuperação."
  },
  recomposicao: {
    title: "Recomposição Corporal",
    tips: [
      "Mantenha as calorias próximas da manutenção.",
      "Proteína alta é a chave para perder gordura e ganhar músculo ao mesmo tempo.",
      "Treine pesado; a intensidade sinaliza para o corpo manter o músculo.",
      "A consistência a longo prazo é mais importante que mudanças drásticas.",
      "Monitore as medidas, não apenas o peso na balança."
    ],
    strategy: "Calorias em manutenção ou leve déficit, alta densidade nutricional e treinamento de força intenso."
  }
};

const CONTRACT_TEMPLATE = `CLÁUSULA 1 – OBJETO

1.1. O contratado fornecerá conteúdos informativos sobre hábitos saudáveis, incluindo:
a) Sugestões de rotinas de exercícios físicos amplamente difundidas (ex.: treino ABC, full body, planilhas informativas);
b) Dicas de bem-estar e organização de rotina;
c) Suporte motivacional e acompanhamento de adesão.

1.2. FICA EXPRESSAMENTE DECLARADO QUE:
a) O contratado NÃO É profissional de Educação Física, Nutrição ou Medicina;
b) Não possui registro nos respectivos conselhos (CREF, CRN, CRM);
c) O material fornecido NÃO constitui prescrição individualizada, avaliação funcional ou diagnóstico.

1.3. NÃO constitui objeto deste contrato qualquer atividade privativa de profissionais legalmente habilitados.

CLÁUSULA 2 – DURAÇÃO

2.1. Vigência de [DURATION] dias, com início em [START_DATE] e término em [END_DATE].
2.2. Não há renovação automática.
2.3. O início depende da confirmação do pagamento.

CLÁUSULA 3 – VALOR

3.1. Valor total: R$ [VALUE] ([VALUE_WORDS]).
3.2. Pagamento via [PAYMENT_METHOD].

CLÁUSULA 4 – RESPONSABILIDADES DO CONTRATANTE

4.1. O contratante declara:
a) Estar ciente de que o contratado não é profissional habilitado nas áreas mencionadas;
b) Ser responsável pela execução das atividades sugeridas;
c) Estar apto fisicamente para a prática de exercícios;
d) Informar corretamente suas condições de saúde;
e) Assumir integralmente os riscos inerentes à prática esportiva.

4.2. O contratado fica isento de responsabilidade por danos decorrentes da execução das atividades sugeridas.

CLÁUSULA 5 – RESPONSABILIDADES DO CONTRATADO

5.1. Compromete-se a fornecer o material contratado e responder dúvidas em até 24h úteis.
5.2. Não responde por lesões ou prejuízos decorrentes da execução das atividades, por se tratar de conteúdo informativo.

CLÁUSULA 6 – RESULTADOS

6.1. O contratante declara ciência de que:
a) Resultados variam conforme fatores individuais;
b) Não há garantia de resultados específicos;
c) O serviço é obrigação de meio, não de fim.

CLÁUSULA 7 – DESISTÊNCIA E CANCELAMENTO

7.1. Direito de arrependimento em até 7 dias, conforme art. 49 do CDC.
7.2. Após esse prazo, cancelamento com restituição proporcional ao período não usufruído.
7.3. Não haverá restituição após entrega integral do material.

CLÁUSULA 8 – TRATAMENTO DE DADOS (LGPD)

8.1. Os dados serão utilizados exclusivamente para execução contratual e comunicação.
8.2. Não serão compartilhados com terceiros sem consentimento, salvo obrigação legal.
8.3. O tratamento observará a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).

CLÁUSULA 9 – AUTORIZAÇÃO DE USO DE IMAGEM

9.1. O CONTRATANTE autoriza o uso de sua imagem, nome, voz, fotos, vídeos, depoimentos e resultados físicos (inclusive “antes e depois”) para fins de divulgação e marketing dos serviços do CONTRATADO.

9.2. A autorização é gratuita e poderá ser utilizada em redes sociais, website e materiais publicitários.

9.3. O CONTRATANTE declara ciência de que os resultados são individuais e não garantem padrão a terceiros.

9.4. A autorização poderá ser revogada por escrito, não atingindo publicações já realizadas.

CLÁUSULA 10 – PROPRIEDADE INTELECTUAL

10.1. O material fornecido é protegido por direitos autorais, sendo permitido apenas uso pessoal.
10.2. É vedada reprodução ou compartilhamento sem autorização.

CLÁUSULA 11 – DISPOSIÇÕES GERAIS

11.1. Este contrato regula integralmente a relação entre as partes.
11.2. Não há prescrição médica, nutricional ou farmacológica.
11.3. Comunicação oficial preferencialmente por escrito.

CLÁUSULA 12 – FORO

12.1. Fica eleito o foro da comarca do domicílio do CONTRATADO para dirimir controvérsias.`;

export const EMPTY_DATA: ProtocolData = {
  id: "",
  createdAt: new Date().toISOString(), 
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
    waterPercentage: "",
    imc: "",
    measurements: {
      thorax: "",
      waist: "",
      abdomen: "",
      glutes: "",
      rightArmRelaxed: "",
      leftArmRelaxed: "",
      rightArmContracted: "",
      leftArmContracted: "",
      rightThigh: "",
      leftThigh: "",
      rightCalf: "",
      leftCalf: ""
    },
    observations: ""
  },
  anamnesis: {
    mainObjective: "",
    routine: "",
    trainingHistory: "",
    ergogenics: "",
    foodPreferences: "",
    injuries: "",
    medications: ""
  },
  nutritionalStrategy: "",
  kcalGoal: "",
  kcalSubtext: "",
  waterGoal: "",
  macros: {
    protein: { value: "", ratio: "" },
    carbs: { value: "", ratio: "" },
    fats: { value: "", ratio: "" }
  },
  meals: [],
  supplements: [],
  // DICAS PADRÃO INSERIDAS AQUI PARA TODOS OS NOVOS ALUNOS
  tips: [
    "Mantenha a hidratação constante.",
    "A consistência é o segredo do resultado.",
    "Priorize o sono reparador."
  ],
  trainingFrequency: "",
  trainingDays: [],
  generalObservations: "",
  contract: {
    cpf: "",
    rg: "",
    phone: "",
    email: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    planType: 'Trimestral',
    startDate: new Date().toLocaleDateString('pt-BR'),
    endDate: "",
    durationDays: "90",
    planValue: "",
    planValueWords: "",
    paymentMethod: 'Pix',
    installments: "1",
    contractDate: new Date().toLocaleDateString('pt-BR'),
    status: 'Aguardando',
    contractBody: CONTRACT_TEMPLATE
  }
};
