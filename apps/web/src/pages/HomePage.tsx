import { Link } from "react-router-dom";
import { ArrowRight, Truck, Shield, Clock, Calculator, Star, Leaf } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Leaf className="w-4 h-4" /> Madeiras sustentáveis certificadas
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              Madeiras de<br /><span className="text-primary-200">qualidade</span><br />à sua porta
            </h1>
            <p className="text-xl text-primary-100 mb-10 max-w-xl leading-relaxed">
              Fornecemos madeiras e produtos florestais de excelência com entrega rápida e serviço personalizado.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/loja" className="inline-flex items-center gap-2 bg-white text-primary-600 font-bold px-8 py-4 rounded-2xl hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Ver produtos <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/simulador" className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/30 transition-all border border-white/30">
                <Calculator className="w-5 h-5" /> Simular orçamento
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Clientes satisfeitos" },
              { value: "50+", label: "Tipos de madeira" },
              { value: "24h", label: "Entrega rápida" },
              { value: "100%", label: "Certificado FSC" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-primary-500 mb-1">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Porquê escolher a AgroWood?</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Qualidade, rapidez e confiança em cada encomenda</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Truck, title: "Entrega ao domicílio", desc: "Entregamos em todo o país com cuidado e rapidez. Acompanhe a sua encomenda em tempo real.", color: "bg-blue-50 text-blue-500" },
            { icon: Shield, title: "Qualidade garantida", desc: "Todos os nossos produtos são certificados e rigorosamente selecionados para garantir a melhor qualidade.", color: "bg-green-50 text-green-500" },
            { icon: Clock, title: "Encomenda fácil", desc: "Processo simples e rápido. Escolha o produto, o horário de entrega e pague como preferir.", color: "bg-purple-50 text-purple-500" },
          ].map((f) => (
            <div key={f.title} className="card p-8 hover:shadow-md transition-shadow">
              <div className={`w-14 h-14 ${f.color} rounded-2xl flex items-center justify-center mb-6`}>
                <f.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
              <p className="text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Simulator */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Simule o seu orçamento</h2>
              <p className="text-primary-100 text-lg">Calcule o custo total com ou sem transporte, sem compromisso.</p>
            </div>
            <Link to="/simulador" className="inline-flex items-center gap-2 bg-white text-primary-600 font-bold px-8 py-4 rounded-2xl hover:bg-primary-50 transition-all shadow-lg whitespace-nowrap">
              <Calculator className="w-5 h-5" /> Calcular agora
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">O que dizem os nossos clientes</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "João Ferreira", text: "Excelente qualidade de madeira e entrega super rápida. Recomendo vivamente!", stars: 5 },
            { name: "Maria Santos", text: "O simulador de orçamento é fantástico, poupei muito tempo no planeamento da obra.", stars: 5 },
            { name: "Carlos Oliveira", text: "Serviço impecável, pessoal simpático e produto de primeira qualidade.", stars: 5 },
          ].map((t) => (
            <div key={t.name} className="card p-8">
              <div className="flex mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-bold">{t.name[0]}</span>
                </div>
                <span className="font-semibold text-gray-900">{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
