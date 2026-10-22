export type PlanId = "weekly" | "monthly" | "semester" | "founder";

export type AccountPlan = {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  detail: string;
  featured?: boolean;
};

export const ACCOUNT_PLANS: AccountPlan[] = [
  {
    id: "weekly",
    name: "Semanal",
    price: "R$ 9,99",
    period: "7 dias",
    detail: "Pra quem quer só a semana da prova.",
  },
  {
    id: "monthly",
    name: "Mensal",
    price: "R$ 24,90",
    period: "por mês",
    detail: "No Ritmo, o mês sai R$ 39,90.",
  },
  {
    id: "semester",
    name: "Semestral",
    price: "R$ 89,90",
    period: "6 meses",
    detail: "Dá uns R$ 15 por mês.",
    featured: true,
  },
];

export const FOUNDER_PLAN: AccountPlan = {
  id: "founder",
  name: "Fundador",
  price: "R$ 59,90",
  period: "6 meses",
  detail: "Os primeiros mil, fechado com o pessoal do Run and Bass.",
};

export const FREE_ACCOUNT = [
  "Perfil com as próximas provas e o ritmo",
  "Ver quem vai correr as mesmas provas",
  "Curtidas limitadas por dia, com match e chat",
  "Agenda de provas, run clubs e grupos de treino",
  "Comprar inscrição dentro do app",
];

export const PAID_ACCOUNT = [
  "Ver quem te curtiu",
  "Curtidas ilimitadas e desfazer a última",
  "Filtros por prova, ritmo, distância, bairro e intenção",
  "Destaque na semana da prova",
  "Mandar mensagem antes do match",
  "Modo viagem, pra provas em outras cidades",
];
