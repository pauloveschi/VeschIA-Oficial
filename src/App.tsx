import { FileText, ArrowUpRight, Sparkles } from "lucide-react";
import heroBg from "./assets/hero-bg.png";

const MODULOS = [
  {
    slug: "aip",
    nome: "AIP",
    titulo: "Automação Inteligente de Processos",
    descricao:
      "Fluxo de aprovação configurável por empresa, com IA analisando documento em cada etapa. Contratos hoje; RH, Financeiro, Compras, Jurídico e Comercial em breve.",
    href: "https://veschia-aip.vercel.app",
  },
];

function App() {
  return (
    <div className="min-h-svh flex flex-col">
      <main className="flex-1">
        <section className="w-full">
          <img src={heroBg} alt="VeschIA" className="w-full h-auto block" />
        </section>

        <section className="px-6 py-14 text-center" style={{ background: "var(--vs-bg)" }}>
          <h1 className="text-3xl md:text-5xl font-semibold leading-tight max-w-2xl mx-auto">
            Inovação que trabalha por você.
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

          <div className="grid gap-4 sm:grid-cols-2 max-w-3xl mx-auto">
            {MODULOS.map((m) => (
              <a
                key={m.slug}
                href={m.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl p-6 text-left transition-all hover:-translate-y-0.5"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(0,210,255,0.25)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(0,210,255,0.12)" }}
                  >
                    <FileText className="size-5" style={{ color: "var(--vs-cyan)" }} />
                  </div>
                  <ArrowUpRight
                    className="size-4 opacity-50 group-hover:opacity-100 transition-opacity shrink-0 mt-1"
                    style={{ color: "var(--vs-cyan)" }}
                  />
                </div>
                <p className="font-semibold text-base mt-4">{m.nome}</p>
                <p className="text-sm mt-0.5" style={{ color: "var(--vs-cyan)" }}>
                  {m.titulo}
                </p>
                <p className="text-[13px] mt-2 leading-relaxed" style={{ color: "var(--vs-text-muted)" }}>
                  {m.descricao}
                </p>
              </a>
            ))}

            {/* Espaço reservado pro módulo de Pedidos, quando ele entrar aqui também */}
            <div
              className="rounded-2xl p-6 flex items-center justify-center text-center"
              style={{ background: "rgba(255,255,255,0.015)", border: "1px dashed rgba(255,255,255,0.12)" }}
            >
              <p className="text-xs" style={{ color: "var(--vs-text-muted)" }}>
                Mais soluções em breve
              </p>
            </div>
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
