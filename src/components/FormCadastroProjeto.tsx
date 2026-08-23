import { useEffect, useState } from "react";
import Input from "../shared/components/Input";
import Dropdown from "../shared/components/Dropdown";
import Botao from "../shared/components/Botao";
import { PiHandCoins } from "react-icons/pi";
import { GoProject } from "react-icons/go";
import { criarProjeto, listarUsuariosAtivos } from "../services/projectService";
import { listarClientesAtivos } from "../services/clienteService";

export default function FormCadastroProjeto() {
  const [alerta, setAlerta] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [nomeProjeto, setNomeProjeto] = useState("");
  const [tipoProjeto, setTipoProjeto] = useState("");
  const [cliente, setCliente] = useState("");
  const [valorOrcamento, setValorOrcamento] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [statusProjeto, setStatusProjeto] = useState("");
  const [profissionalAlocado, setProfissionalAlocado] = useState<string[]>([]);
  const [gestorResponsavel, setGestorResponsavel] = useState("");
  // const [profissionais, setProfissionais] = useState<{ id: string; nomeUsuario: string; cargos: string }[]>([]);
  // const [clientes, setClientes] = useState<{ label: string; value: string }[]>([]);
  // const [gestores, setGestores] = useState<{ label: string; value: string }[]>([]);


  const [profissionais, setProfissionais] = useState<{ id: string; nomeUsuario: string; cargos: string[] }[]>([]);
  const [clientes, setClientes] = useState<{ label: string; value: string }[]>([]);
  const [gestores, setGestores] = useState<{ label: string; value: string }[]>([]);

  const regex = /^[A-Z]{3}\d{4}$/;

  useEffect(() => {
    const loadData = async () => {
      try {
        const listaUsuarios = await listarUsuariosAtivos();

        const filtradosProfissionais = listaUsuarios.filter((p: any) =>
          p.cargos && p.cargos.some((cargo: string) => ["PROFISSIONAL", "FINANCEIRO"].includes(cargo))
        );
        setProfissionais(filtradosProfissionais);

        const filtradosGestores = listaUsuarios
          .filter((p: any) => p.cargos && p.cargos.some((cargo: string) => cargo === "GESTOR"))
          .map((p: any) => ({ label: p.nomeUsuario, value: String(p.id) }));
        setGestores(filtradosGestores);

        const listaClientes = await listarClientesAtivos()
        // const listaClientes = await listarClientes();
        setClientes(
          listaClientes.map((c: any) => ({
            label: c.nomeEmpresa,
            value: c.id
          }))
        );
      } catch (error) {
        console.error("Erro ao carregar dados", error);
      }
    };
    loadData();
  }, []);

  const toggleProfissional = (id: string) => {
    setProfissionalAlocado(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlerta("");
    setSucesso(false);

    if (!nomeProjeto || !tipoProjeto || !valorOrcamento || !dataInicio || !dataFim || !statusProjeto || !gestorResponsavel) {
      setAlerta("Preencha todos os campos obrigatórios.");
      return;
    }
    if (!regex.test(nomeProjeto)) {
      setAlerta("O nome do projeto deve seguir o formato AAA9999 (3 letras maiúsculas seguidas de 4 números).");
      return;
    }
    if (dataFim < dataInicio) {
      setAlerta("A data de fim não pode ser anterior à data de início.");
      return;
    }
    if (isNaN(Number(valorOrcamento)) || Number(valorOrcamento) < 0) {
      setAlerta("O valor do orçamento deve ser um número válido.");
      return;
    }

    try {
      const payload = {
        nomeProjeto,
        tipoProjeto,
        valorOrcamento: Number(valorOrcamento),
        dataInicio,
        dataFim,
        status: statusProjeto,
        profissionalAlocadoIds: profissionalAlocado,
        gestorId: gestorResponsavel,
        clienteId: cliente,
      };
      console.log(payload);
      await criarProjeto(payload);
      setSucesso(true);
      setAlerta("Projeto cadastrado com sucesso!");
      setNomeProjeto(""); setTipoProjeto(""); setCliente("");
      setValorOrcamento(""); setDataInicio(""); setDataFim("");
      setStatusProjeto(""); setProfissionalAlocado([]); setGestorResponsavel("");
    } catch {
      setSucesso(false);
      setAlerta("Erro ao cadastrar projeto.");
    }
  };

  return (
    <>
      <form
        onSubmit={handleCadastro}
        className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-10 w-full max-w-[700px] flex flex-col gap-10"
      >
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 text-center">
          Cadastro de Projeto
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">

          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-1">
              <label className="ms-1 font-medium text-gray-700 dark:text-gray-300">Nome do Projeto</label>
              <Input
                type="text"
                placeholder="Ex: ABC1234"
                value={nomeProjeto}
                onChange={(e) => setNomeProjeto(e.target.value.toUpperCase())}
                icon={<GoProject size={20} />}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="ms-1 font-medium text-gray-700 dark:text-gray-300">Tipo de Projeto</label>
              <Dropdown
                value={tipoProjeto}
                onChange={(e) => setTipoProjeto(e.target.value)}
                options={[
                  { label: "Alocação", value: "Alocacao" },
                  { label: "Hora Fechada", value: "Hora_Fechada" }
                ]}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="ms-1 font-medium text-gray-700 dark:text-gray-300">Cliente</label>
              <Dropdown
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                options={clientes.map((cliente) => ({ label: `${cliente.label}`.slice(0, 25) + (cliente.label.length > 25 ? "..." : ""), value: cliente.value }))}
                required={false}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="ms-1 font-medium text-gray-700 dark:text-gray-300">Valor do Orçamento</label>
              <Input
                type="double"
                placeholder="R$00,00"
                value={valorOrcamento}
                onChange={(e) => setValorOrcamento(e.target.value)}
                icon={<PiHandCoins size={20} />}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-1">
              <label className="ms-1 font-medium text-gray-700 dark:text-gray-300">Data de Início</label>
              <Input
                type="date"
                placeholder="dd/mm/aaaa"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="ms-1 font-medium text-gray-700 dark:text-gray-300">Data de Fim</label>
              <Input
                type="date"
                placeholder="dd/mm/aaaa"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="ms-1 font-medium text-gray-700 dark:text-gray-300">Status do Projeto</label>
              <Dropdown
                value={statusProjeto}
                onChange={(e) => setStatusProjeto(e.target.value)}
                options={[
                  { label: "Planejamento", value: "Planejamento" },
                  { label: "Andamento", value: "Andamento" },
                  { label: "Concluído", value: "Concluida" }
                ]}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="ms-1 font-medium text-gray-700 dark:text-gray-300">Profissionais</label>
              <div className="flex items-center border-2 border-gray-300 dark:border-gray-600 rounded-xl px-3 bg-white dark:bg-gray-700 focus-within:border-blue-500 transition duration-200">
                <a
                  href="#modal-profissional"
                  className="flex-1 outline-none bg-transparent text-gray-700 dark:text-gray-200 cursor-pointer py-2.5"
                >
                  {profissionalAlocado.length > 0 ? `${profissionalAlocado.length} selecionado(s)` : "Selecione"}
                </a>
              </div>
            </div>
          </div>

        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="w-full max-w-xs flex flex-col gap-1">
            <label className="ms-1 font-medium text-gray-700 dark:text-gray-300">Gestor Responsável</label>
            <Dropdown
              value={gestorResponsavel}
              onChange={(e) => setGestorResponsavel(e.target.value)}
              options={gestores}
              required
            />
          </div>

          {alerta && (
            <div role="alert" className={`alert alert-soft w-full ${sucesso ? "alert-success" : "alert-error"}`}>
              <span>{alerta}</span>
            </div>
          )}

          <Botao type="submit">Cadastrar</Botao>
        </div>
      </form>

      <div className="modal" role="dialog" id="modal-profissional">
        <div className="modal-box dark:bg-gray-800">
          <h3 className="text-xl font-bold pb-3 dark:text-gray-100">
            Selecione os profissionais para o projeto:
          </h3>
          <ul className="list bg-base-100 rounded-box shadow-md">
            {profissionais.length === 0 ? (
              <li className="alert alert-soft alert-info text-lg p-2">Sem profissionais para alocação.</li>
            ) : (
              profissionais.map((profissional) => (
                <li key={profissional.id} className="list-row flex items-center gap-3 p-2">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={profissionalAlocado.includes(String(profissional.id))}
                    onChange={() => toggleProfissional(String(profissional.id))}
                  />
                  <div className="flex-1">
                    <h2 className="font-bold dark:text-gray-100">{profissional.nomeUsuario}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{profissional.cargos ? profissional.cargos.join(", ") : ""}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
          <div className="modal-action">
            <a
              href="#"
              className="border-2 border-black dark:border-gray-400 rounded-xl bg-white dark:bg-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer p-3 m-2"
            >
              Confirmar
            </a>
          </div>
        </div>
      </div>
    </>
  );
}