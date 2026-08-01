import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Send, Check, CheckCheck, Clock, UserRound, CalendarCheck, RotateCcw } from "lucide-react";
import logo from "./assets/logo.png";

/* ------------------------------------------------------------------ *
 * Roteiro da conversa
 *
 * O agente nunca informa preço: em odontologia isso esbarra em regra de
 * publicidade do conselho, e valor solto fora de contexto vira comparação
 * de tabela em vez de avaliação marcada. Ele conduz pra consulta.
 * ------------------------------------------------------------------ */

type Campo = "nome" | "procedimento" | "historico" | "preferencia" | "agendamento";

interface Turno {
  de: "lead" | "agente";
  texto: string;
  /** Segundos que o agente levou pra responder. Só nos turnos do agente. */
  resposta?: number;
  /** Campo da ficha que esta mensagem preenche. */
  preenche?: { campo: Campo; valor: string };
}

const ROTEIRO: Turno[] = [
  { de: "lead", texto: "Oi, vi o anúncio de vocês. Quanto custa um implante?" },
  {
    de: "agente",
    resposta: 0.9,
    texto:
      "Olá! Aqui é a Bia, da Vibe Sorriso 😊\n\nSobre o implante: o valor muda conforme o caso, então prefiro te dar uma informação certa em vez de um número solto. Posso fazer três perguntas rápidas?",
  },
  { de: "lead", texto: "pode" },
  { de: "agente", resposta: 1.1, texto: "É a reposição de um dente só ou de mais de um?" },
  {
    de: "lead",
    texto: "um só, perdi um dente de trás",
    preenche: { campo: "procedimento", valor: "Implante unitário" },
  },
  {
    de: "agente",
    resposta: 0.8,
    texto: "Entendi. E você já fez radiografia ou avaliação em alguma outra clínica?",
  },
  {
    de: "lead",
    texto: "não, nunca fui",
    preenche: { campo: "historico", valor: "Primeira avaliação" },
  },
  {
    de: "agente",
    resposta: 1.0,
    texto:
      "Sem problema, é o caso mais comum. Na avaliação a gente faz a radiografia e monta o plano de tratamento já com o valor fechado, sem compromisso.\n\nVocê prefere manhã ou tarde?",
  },
  { de: "lead", texto: "tarde", preenche: { campo: "preferencia", valor: "Tarde" } },
  { de: "agente", resposta: 0.7, texto: "Tenho terça às 15h ou quinta às 16h30. Qual funciona melhor?" },
  {
    de: "lead",
    texto: "terça 15h",
    preenche: { campo: "agendamento", valor: "Terça, 15h · Dra. Marina" },
  },
  { de: "agente", resposta: 0.9, texto: "Perfeito. Só preciso do seu nome completo pra confirmar." },
  { de: "lead", texto: "Ricardo Alves", preenche: { campo: "nome", valor: "Ricardo Alves" } },
  {
    de: "agente",
    resposta: 1.2,
    texto:
      "Agendado, Ricardo! Terça, 15h, com a Dra. Marina.\n\nAv. Dom Luís, 500 · Aldeota. Qualquer coisa é só chamar por aqui. Até terça 😊",
  },
];

/** A mesma abertura, sem ninguém do outro lado. */
const ROTEIRO_SEM: Turno[] = [
  { de: "lead", texto: "Oi, vi o anúncio de vocês. Quanto custa um implante?" },
  { de: "lead", texto: "alô?" },
  { de: "lead", texto: "deixa pra lá, já achei outra clínica" },
];

const CAMPOS: { chave: Campo; rotulo: string }[] = [
  { chave: "nome", rotulo: "Nome" },
  { chave: "procedimento", rotulo: "Procedimento" },
  { chave: "historico", rotulo: "Histórico" },
  { chave: "preferencia", rotulo: "Preferência" },
  { chave: "agendamento", rotulo: "Avaliação" },
];

const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

/** Relógio da conversa: começa 22h47, um horário em que a clínica está fechada. */
function horaDoTurno(indice: number, modo: "com" | "sem"): string {
  if (modo === "sem") {
    return ["22:47", "22:53", "09:12"][indice] ?? "22:47";
  }
  const inicio = 22 * 60 + 47;
  const minutos = inicio + Math.floor(indice / 2);
  const h = Math.floor(minutos / 60) % 24;
  const m = minutos % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function Balao({ turno, hora }: { turno: Turno; hora: string }) {
  const doAgente = turno.de === "agente";
  return (
    <div className={`flex ${doAgente ? "justify-end" : "justify-start"}`}>
      <div
        className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-line"
        style={{
          background: doAgente ? "rgba(0,210,255,0.14)" : "rgba(255,255,255,0.06)",
          border: `1px solid ${doAgente ? "rgba(0,210,255,0.28)" : "rgba(255,255,255,0.08)"}`,
          borderBottomRightRadius: doAgente ? 6 : undefined,
          borderBottomLeftRadius: doAgente ? undefined : 6,
        }}
      >
        {turno.texto}
        <div
          className="flex items-center gap-1 justify-end mt-1 text-[10.5px]"
          style={{ color: "var(--vs-text-muted)", fontFamily: MONO }}
        >
          {hora}
          {doAgente ? (
            <CheckCheck className="size-3" style={{ color: "var(--vs-cyan)" }} />
          ) : (
            <Check className="size-3" />
          )}
        </div>
      </div>
    </div>
  );
}

function Digitando() {
  return (
    <div className="flex justify-end">
      <div
        className="rounded-2xl px-4 py-3 flex gap-1"
        style={{ background: "rgba(0,210,255,0.14)", border: "1px solid rgba(0,210,255,0.28)" }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 rounded-full demo-ponto"
            style={{ background: "var(--vs-cyan)", animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function DemoAIA() {
  const [modo, setModo] = useState<"com" | "sem">("com");
  const [passo, setPasso] = useState(1); // primeira mensagem do lead já visível
  const [digitando, setDigitando] = useState(false);
  const [rascunho, setRascunho] = useState("");
  const listaRef = useRef<HTMLDivElement>(null);

  const roteiro = modo === "com" ? ROTEIRO : ROTEIRO_SEM;
  const visiveis = roteiro.slice(0, passo);
  const acabou = passo >= roteiro.length;
  const proximo = roteiro[passo];
  const aguardandoLead = !acabou && proximo?.de === "lead" && !digitando;

  const ficha = {} as Partial<Record<Campo, string>>;
  if (modo === "com") {
    for (const t of visiveis) {
      if (t.preenche) ficha[t.preenche.campo] = t.preenche.valor;
    }
  }

  const avancar = useCallback(() => {
    setPasso((p) => Math.min(p + 1, roteiro.length));
    setRascunho("");
  }, [roteiro.length]);

  // Depois de uma mensagem do lead, o agente responde sozinho.
  useEffect(() => {
    if (modo !== "com" || acabou) return;
    if (proximo?.de !== "agente") return;

    const reduzido = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const espera = reduzido ? 120 : 380 + (proximo.resposta ?? 1) * 520;

    setDigitando(true);
    const t = setTimeout(() => {
      setDigitando(false);
      setPasso((p) => p + 1);
    }, espera);
    return () => clearTimeout(t);
  }, [passo, modo, acabou, proximo]);

  // scrollIntoView rolaria todos os containers acima, incluindo a janela: no
  // celular isso joga a página inteira pra cima a cada mensagem. Mexer no
  // scrollTop do próprio container mantém o movimento contido na conversa.
  useEffect(() => {
    const lista = listaRef.current;
    if (!lista) return;
    const reduzido = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    lista.scrollTo({ top: lista.scrollHeight, behavior: reduzido ? "auto" : "smooth" });
  }, [passo, digitando, modo]);

  function trocarModo(novo: "com" | "sem") {
    setModo(novo);
    // Sem agente não há nada a conduzir: a sequência inteira aparece de uma vez,
    // porque o que importa ali é o silêncio, não a interação.
    setPasso(novo === "sem" ? ROTEIRO_SEM.length : 1);
    setDigitando(false);
    setRascunho("");
  }

  const tempoMedio =
    ROTEIRO.filter((t) => t.resposta).reduce((s, t) => s + (t.resposta ?? 0), 0) /
    ROTEIRO.filter((t) => t.resposta).length;

  return (
    <div className="min-h-svh flex flex-col">
      <style>{`
        @keyframes demo-pulso { 0%,60%,100% { opacity:.25; transform:translateY(0) } 30% { opacity:1; transform:translateY(-2px) } }
        .demo-ponto { animation: demo-pulso 1.05s infinite; }
        @keyframes demo-entra { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:none } }
        .demo-entra { animation: demo-entra .26s ease-out both; }
        @keyframes demo-acende { from { background: rgba(0,210,255,.16) } to { background: transparent } }
        .demo-acende { animation: demo-acende 1.1s ease-out; }
        @media (prefers-reduced-motion: reduce) {
          .demo-ponto, .demo-entra, .demo-acende { animation: none !important; }
        }
      `}</style>

      <header className="max-w-5xl mx-auto w-full px-6 py-5 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 text-sm" style={{ color: "var(--vs-text-muted)" }}>
          <ArrowLeft className="size-4" />
          VeschIA
        </a>
        <img src={logo} alt="VeschIA" className="h-8" />
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 pb-16">
        <section className="py-10 md:py-14 max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--vs-cyan)" }}>
            AIA · SDR Digital
          </p>
          <h1 className="text-3xl md:text-[2.6rem] font-semibold leading-[1.15] mt-3">
            O lead chega às 22h47.
            <br />
            Quem responde?
          </h1>
          <p className="mt-4 text-sm md:text-[15px] leading-relaxed" style={{ color: "var(--vs-text-muted)" }}>
            A conversa abaixo é a que acontece todo dia no WhatsApp de uma clínica. Do lado direito,
            o que o SDR Digital monta enquanto conversa. Clique para avançar ou escreva você mesmo.
          </p>
        </section>

        <div className="flex gap-1.5 mb-4" role="tablist" aria-label="Modo da demonstração">
          {(["com", "sem"] as const).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={modo === m}
              onClick={() => trocarModo(m)}
              className="text-[12.5px] px-3.5 py-2 rounded-lg transition-colors"
              style={{
                background: modo === m ? "rgba(0,210,255,0.12)" : "transparent",
                border: `1px solid ${modo === m ? "rgba(0,210,255,0.3)" : "rgba(255,255,255,0.09)"}`,
                color: modo === m ? "var(--vs-cyan)" : "var(--vs-text-muted)",
              }}
            >
              {m === "com" ? "Com o SDR Digital" : "Sem o SDR Digital"}
            </button>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_300px] items-start">
          {/* Conversa */}
          <div
            className="rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: "var(--vs-bg-deep)",
              border: "1px solid rgba(255,255,255,0.09)",
              height: "min(520px, 70svh)",
            }}
          >
            <div
              className="px-4 py-3 flex items-center gap-3 shrink-0"
              style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div
                className="size-9 rounded-full grid place-items-center text-[13px] font-semibold shrink-0"
                style={{ background: "rgba(0,210,255,0.16)", color: "var(--vs-cyan)" }}
              >
                VS
              </div>
              <div className="min-w-0">
                <p className="text-[13.5px] font-medium leading-tight">Vibe Sorriso</p>
                <p className="text-[11px] leading-tight" style={{ color: "var(--vs-text-muted)" }}>
                  {modo === "com" ? "online" : "visto por último às 18h30"}
                </p>
              </div>
            </div>

            <div ref={listaRef} className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2.5">
              {visiveis.map((t, i) => (
                <div key={i} className="demo-entra">
                  <Balao turno={t} hora={horaDoTurno(i, modo)} />
                  {modo === "com" && t.de === "agente" && (
                    <p
                      className="text-[10.5px] mt-1 text-right pr-1"
                      style={{ color: "var(--vs-cyan)", fontFamily: MONO, opacity: 0.75 }}
                    >
                      respondeu em {t.resposta?.toFixed(1)}s
                    </p>
                  )}
                  {modo === "sem" && i === 1 && (
                    <p
                      className="text-[10.5px] my-3 text-center"
                      style={{ color: "var(--vs-text-muted)", fontFamily: MONO }}
                    >
                      ··· 10 horas depois ···
                    </p>
                  )}
                </div>
              ))}
              {digitando && (
                <div className="demo-entra">
                  <Digitando />
                </div>
              )}
            </div>

            <div className="p-3 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              {modo === "sem" ? (
                <div className="text-center py-1.5">
                  <p className="text-[12.5px]" style={{ color: "#ff8f8f" }}>
                    Lead perdido. A clínica só viu a mensagem na manhã seguinte.
                  </p>
                </div>
              ) : acabou ? (
                <button
                  onClick={() => trocarModo("com")}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)", color: "var(--vs-text-muted)" }}
                >
                  <RotateCcw className="size-3.5" />
                  Ver de novo
                </button>
              ) : (
                <>
                  {aguardandoLead && (
                    <button
                      onClick={avancar}
                      className="mb-2 text-[12px] px-3 py-1.5 rounded-full transition-colors text-left"
                      style={{
                        background: "rgba(0,210,255,0.09)",
                        border: "1px solid rgba(0,210,255,0.22)",
                        color: "var(--vs-cyan)",
                      }}
                    >
                      {proximo.texto}
                    </button>
                  )}
                  <div
                    className="flex items-center gap-2 rounded-xl px-3 py-2"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    <input
                      value={rascunho}
                      onChange={(e) => setRascunho(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && aguardandoLead) avancar();
                      }}
                      disabled={!aguardandoLead}
                      placeholder={aguardandoLead ? "Escreva como se fosse o paciente…" : "Bia está respondendo…"}
                      className="flex-1 bg-transparent outline-none text-[13px] placeholder:opacity-45"
                      style={{ color: "var(--vs-text)" }}
                    />
                    <button
                      onClick={() => aguardandoLead && avancar()}
                      disabled={!aguardandoLead}
                      aria-label="Enviar mensagem"
                      className="shrink-0 disabled:opacity-30"
                    >
                      <Send className="size-4" style={{ color: "var(--vs-cyan)" }} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Ficha do lead */}
          <aside className="space-y-3">
            <div
              className="rounded-2xl p-4"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.09)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Clock className="size-3.5" style={{ color: "var(--vs-cyan)" }} />
                <p className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: "var(--vs-text-muted)" }}>
                  Tempo de resposta
                </p>
              </div>
              <p className="text-3xl font-semibold" style={{ fontFamily: MONO, color: modo === "com" ? "var(--vs-cyan)" : "#ff8f8f" }}>
                {modo === "com" ? `${tempoMedio.toFixed(1)}s` : "10h25"}
              </p>
              <p className="text-[11.5px] mt-1.5 leading-relaxed" style={{ color: "var(--vs-text-muted)" }}>
                {modo === "com"
                  ? "Média das respostas desta conversa, em qualquer horário."
                  : "Da pergunta até alguém abrir o WhatsApp na manhã seguinte."}
              </p>
            </div>

            <div
              className="rounded-2xl p-4"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.09)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <UserRound className="size-3.5" style={{ color: "var(--vs-cyan)" }} />
                <p className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: "var(--vs-text-muted)" }}>
                  Ficha do lead
                </p>
              </div>
              <dl className="space-y-2.5">
                {CAMPOS.map(({ chave, rotulo }) => {
                  const valor = ficha[chave];
                  return (
                    <div key={chave} className={`rounded px-1 -mx-1 ${valor ? "demo-acende" : ""}`}>
                      <dt className="text-[10.5px]" style={{ color: "var(--vs-text-muted)" }}>
                        {rotulo}
                      </dt>
                      <dd className="text-[12.5px] mt-0.5" style={{ opacity: valor ? 1 : 0.28 }}>
                        {valor ?? "a preencher"}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>

            {modo === "com" && ficha.agendamento && (
              <div
                className="rounded-2xl p-4 demo-entra flex items-start gap-2.5"
                style={{ background: "rgba(0,210,255,0.08)", border: "1px solid rgba(0,210,255,0.28)" }}
              >
                <CalendarCheck className="size-4 mt-0.5 shrink-0" style={{ color: "var(--vs-cyan)" }} />
                <div>
                  <p className="text-[12.5px] font-medium">Avaliação marcada</p>
                  <p className="text-[11.5px] mt-0.5 leading-relaxed" style={{ color: "var(--vs-text-muted)" }}>
                    A clínica recebe a ficha pronta. Ninguém precisou parar o que estava fazendo.
                  </p>
                </div>
              </div>
            )}
          </aside>
        </div>

        <section className="mt-12 grid gap-6 sm:grid-cols-3 max-w-3xl">
          {[
            {
              titulo: "Responde na hora",
              texto:
                "Noite, fim de semana, feriado. O lead recebe resposta enquanto ainda está interessado, não no dia seguinte.",
            },
            {
              titulo: "Pergunta antes de agendar",
              texto:
                "Quantos dentes, se já fez avaliação, qual turno prefere. Quem chega na cadeira já chega qualificado.",
            },
            {
              titulo: "Não fala preço por WhatsApp",
              texto:
                "Valor fora de contexto vira comparação de tabela. O agente conduz para a avaliação, que é onde a clínica fecha.",
            },
          ].map((c) => (
            <div key={c.titulo}>
              <p className="text-[13.5px] font-medium">{c.titulo}</p>
              <p className="text-[12.5px] mt-1.5 leading-relaxed" style={{ color: "var(--vs-text-muted)" }}>
                {c.texto}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-14 rounded-2xl p-6 md:p-8" style={{ background: "rgba(0,114,255,0.08)", border: "1px solid rgba(0,210,255,0.2)" }}>
          <h2 className="text-xl font-semibold">Quantos contatos assim sua clínica recebe por mês?</h2>
          <p className="mt-2.5 text-[13.5px] leading-relaxed max-w-xl" style={{ color: "var(--vs-text-muted)" }}>
            Essa é a conta que importa. A VeschIA monta o SDR Digital com o seu fluxo, o seu horário
            e a sua agenda, e mede quanto tempo cada lead esperou antes e depois.
          </p>
          <a
            href="mailto:veschipaulo@gmail.com?subject=SDR%20Digital%20VeschIA"
            className="inline-block mt-5 px-5 py-2.5 rounded-xl text-[13.5px] font-medium"
            style={{ background: "var(--vs-cyan)", color: "#04101f" }}
          >
            Falar com a VeschIA
          </a>
        </section>

        <p className="mt-8 text-[11px] leading-relaxed" style={{ color: "var(--vs-text-muted)", opacity: 0.75 }}>
          Vibe Sorriso é uma clínica fictícia, criada para esta demonstração. A conversa é um roteiro
          representativo de um atendimento real de captação.
        </p>
      </main>
    </div>
  );
}
