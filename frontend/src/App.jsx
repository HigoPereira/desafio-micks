import { useState } from "react";

function App() {
  const [form, setForm] = useState({
    celulares: 0,
    computadores: 0,
    smart_tvs: 0,
    tv_box: 0,
    outros: 0,
    gamer: false,
  });

  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);
    setResultado(null);

    try {
      const res = await fetch("http://localhost:3000/calcular-plano", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Erro na requisição");

      const data = await res.json();
      setResultado(data.resultado);
    } catch (err) {
      console.error(err);
      setErro("Não foi possível calcular o plano. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Calculadora de Plano 🚀</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Celulares: </label>
          <input
            type="number"
            name="celulares"
            value={form.celulares}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Computadores: </label>
          <input
            type="number"
            name="computadores"
            value={form.computadores}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Smart TVs: </label>
          <input
            type="number"
            name="smart_tvs"
            value={form.smart_tvs}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>TV Box: </label>
          <input
            type="number"
            name="tv_box"
            value={form.tv_box}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Outros dispositivos: </label>
          <input
            type="number"
            name="outros"
            value={form.outros}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              name="gamer"
              checked={form.gamer}
              onChange={handleChange}
            />
            Usuário Gamer
          </label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Calculando..." : "Calcular Plano"}
        </button>
      </form>

      {erro && <p style={{ color: "red" }}>{erro}</p>}

      {resultado && (
        <div style={{ marginTop: "20px" }}>
          <h2>Resultado:</h2>
          <p><b>Plano:</b> {resultado.plano}</p>
          <p><b>Velocidade:</b> {resultado.velocidade_mb} MB</p>
          <p><b>Peso Base:</b> {resultado.peso_base}</p>
          <p><b>Peso Total:</b> {resultado.peso_total}</p>
          <p><b>Gamer:</b> {resultado.gamer ? "Sim" : "Não"}</p>
        </div>
      )}
    </div>
  );
}

export default App;

