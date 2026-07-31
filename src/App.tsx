import { FileText, Bot, ChartColumn, ShieldCheck, Workflow, ArrowUpRight, Sparkles } from "lucide-react";
import type { ComponentType } from "react";
import logo from "./assets/logo.png";

interface Modulo {
  slug: string;
  nome: string;
  titulo: string;
  descricao: string;
  icone: ComponentType<{ className?: string; style?: React.CSSProperties }>;
  /** Quando null, o módulo ainda não está no ar e o card não vira link. */
  href: string | null;
}

const MODULOS: Modulo[] = [
  {
    slug: "aip",
    nome: "AIP",
    titulo: "Automação Inteligente de Processos",
    descricao:
      "Fluxo de aprovação configurável por empresa, com IA analisando documento em cada etapa. Contratos hoje; RH, Financeiro, Compras, Jurídico e Comercial em breve.",
    icone: FileText,
    href: "https://veschia-aip.vercel.app",
  },
  {
    slug: "aia",
    nome: "AIA",
    titulo: "Agentes Inteligentes Autônomos",
    descricao:
      "Colaboradores digitais que atendem, qualificam e agendam sozinhos, 24 horas por dia. Pré-venda, suporte, recepção, agendamento e captação de leads.",
    icone: Bot,
    href: null,
  },
  {
    slug: "aid",
    nome: "AID",
    titulo: "Automação Inteligente de Dados",
    descricao:
      "Dashboards, indicadores e BI com IA analítica. O dado deixa de ser relatório parado e vira decisão no momento certo.",
    icone: ChartColumn,
    href: null,
  },
  {
    slug: "aic",
    nome: "AIC",
    titulo: "Automação Inteligente de Compliance",
    descricao:
      "Auditoria, LGPD, gestão de risco e governança contratual, com trilha e evidência de cada etapa registradas automaticamente.",
    icone: ShieldCheck,
    href: null,
  },
  {
    slug: "ais",
    nome: "AIS",
    titulo: "Automação Inteligente de Sistemas",
    descricao:
      "Integração entre ERPs, CRMs, APIs e plataformas. Seus sistemas passam a conversar entre si, sem planilha no meio do caminho.",
    icone: Workflow,
    href: null,
  },
];

/**
 * Centraliza a última fileira. Com 5 cards numa grade de 3 colunas, os 2 últimos
 * ficariam encostados à esquerda. A saída é dobrar as colunas (6) e dar span 2 a
 * cada card: aí dá pra empurrar o 4º pra coluna 2, e a fileira de baixo ocupa as
 * colunas 2 a 5, centralizada. Mesma ideia no breakpoint menor, com 4 colunas.
 */
const POSICAO_NA_GRADE = [
  "",
  "",
  "",
  "lg:col-start-2",
  "sm:col-start-2 lg:col-start-auto",
];

function CardConteudo({ modulo }: { modulo: Modulo }) {
  const Icone = modulo.icone;
  const disponivel = modulo.href !== null;

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(0,210,255,0.12)" }}
        >
          <Icone className="size-5" style={{ color: "var(--vs-cyan)" }} />
        </div>
        {disponivel ? (
          <ArrowUpRight
            className="size-4 opacity-50 group-hover:opacity-100 transition-opacity shrink-0 mt-1"
            style={{ color: "var(--vs-cyan)" }}
          />
        ) : (
          <span
            className="text-[10px] uppercase tracking-[0.14em] px-2 py-1 rounded-full shrink-0"
            style={{ background: "rgba(255,255,255,0.06)", color: "var(--vs-text-muted)" }}
          >
            Em breve
          </span>
        )}
      </div>
      <p className="font-semibold text-base mt-4">{modulo.nome}</p>
      <p className="text-sm mt-0.5" style={{ color: "var(--vs-cyan)" }}>
        {modulo.titulo}
      </p>
      <p className="text-[13px] mt-2 leading-relaxed" style={{ color: "var(--vs-text-muted)" }}>
        {modulo.descricao}
      </p>
    </>
  );
}

function App() {
  return (
    <div className="min-h-svh flex flex-col">
      <header className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full">
        <img src={logo} alt="VeschIA" className="h-9" />
        <span className="text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--vs-text-muted)" }}>
          Inovação e Tecnologia
        </span>
      </header>

      <main className="flex-1">
        <section
          className="relative overflow-hidden px-6 py-20 text-center"
          style={{ background: "radial-gradient(ellipse at top, rgba(0,114,255,0.16), transparent 65%)" }}
        >
          <img
            src={logo}
            alt="VeschIA"
            className="h-40 md:h-52 mx-auto mb-8"
            style={{ filter: "drop-shadow(0 0 40px rgba(0,210,255,0.35))" }}
          />
          <h1 className="text-3xl md:text-5xl font-semibold leading-tight max-w-2xl mx-auto">
            Soluções Inteligentes que trabalham por você.
          </h1>
          <p
            className="mt-5 text-sm md:text-base max-w-xl mx-auto leading-relaxed"
            style={{ color: "var(--vs-text-muted)" }}
          >
            Sistemas e automações inteligentes que simplificam decisão, processo e crescimento.
            Uma marca, várias soluções, uma única inteligência por trás do seu negócio.
          </p>
        </section>

        <section className="px-6 py-16 max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <Sparkles className="size-4" style={{ color: "var(--vs-cyan)" }} />
            <h2 className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--vs-cyan)" }}>
              Nossas soluções
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {MODULOS.map((m, i) => {
              const posicao = `sm:col-span-2 ${POSICAO_NA_GRADE[i] ?? ""}`;
              return m.href ? (
                <a
                  key={m.slug}
                  href={m.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group rounded-2xl p-6 text-left transition-all hover:-translate-y-0.5 ${posicao}`}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(0,210,255,0.25)",
                  }}
                >
                  <CardConteudo modulo={m} />
                </a>
              ) : (
                <div
                  key={m.slug}
                  className={`rounded-2xl p-6 text-left ${posicao}`}
                  style={{
                    background: "rgba(255,255,255,0.015)",
                    border: "1px dashed rgba(255,255,255,0.12)",
                  }}
                >
                  <CardConteudo modulo={m} />
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="px-6 py-8 text-center">
        <p className="text-[11px]" style={{ color: "var(--vs-text-muted)" }}>
          © {new Date().getFullYear()} VeschIA · Soluções Inteligentes
        </p>
      </footer>
    </div>
  );
}

export default App;
