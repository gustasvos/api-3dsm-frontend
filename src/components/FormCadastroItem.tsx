import { useState, useEffect, useContext } from "react";
import Input from "../shared/components/Input";
import Dropdown from "../shared/components/Dropdown";
import Botao from "../shared/components/Botao";
import { GoProject } from "react-icons/go";
import { FiFileText, FiClock, FiUser, FiX } from "react-icons/fi";
import { useParams } from "react-router-dom";
import instance from "../api/instance";
import { listarProjetosPorGestor } from "../services/projectService";
import { KeycloakContext } from "../contexts/KeycloakProvider";

type Profissional = { id: string; nomeUsuario: string };
type Projeto = { id: number; nomeProjeto: string };

type ItemPayload = {
	descricao: string;
	titulo: string;
	dataAtribuicao: string;
	previsaoHoras: number | null;
	nivelAtividade: string | null;
	usuarioIds: string[];
	projetoId: number;
};

export default function FormCadastroItem() {
	const [titulo, setTitulo] = useState("");
	const [descricao, setDescricao] = useState("");
	const [usuariosSelecionados, setUsuariosSelecionados] = useState<Profissional[]>([]);
	const [valorSelect, setValorSelect] = useState("");
	const [nivelAtividade, setNivelAtividade] = useState("");
	const [previsaoHoras, setPrevisaoHoras] = useState("");
	const [projetoIdEstado, setProjetoId] = useState("");
	const [profissionais, setProfissionais] = useState<Profissional[]>([]);
	const [projetos, setProjetos] = useState<Projeto[]>([]);
	const [erro, setErro] = useState("");
	const [mostrarPopup, setMostrarPopup] = useState(false);
	const [loading, setLoading] = useState(false);
	const { getUsuario } = useContext(KeycloakContext);

	const { projetoId: idDaUrl } = useParams<{ projetoId: string }>();

	useEffect(() => { if (idDaUrl) setProjetoId(idDaUrl); }, [idDaUrl]);

	// useEffect de carregarProjetos atualizado
	useEffect(() => {
		async function carregarProjetos() {
			try {
				const usuario = getUsuario();
				const projetos = await listarProjetosPorGestor(usuario?.id);
				setProjetos(projetos);
			} catch {
				setErro("Não foi possível carregar os projetos.");
			}
		}
		carregarProjetos();
	}, []);

	useEffect(() => {
		async function carregarProfissionaisDoProjeto() {
			if (!projetoIdEstado) { setProfissionais([]); return; }
			try {
				setLoading(true);
				const res = await instance.get(`/gestao/alocacoes/projeto/${projetoIdEstado}`);
				setProfissionais(res.data);
				setUsuariosSelecionados([]);
			} catch {
				setErro("Erro ao carregar profissionais deste projeto.");
			} finally {
				setLoading(false);
			}
		}
		carregarProfissionaisDoProjeto();
	}, [projetoIdEstado]);

	const handleSelectUsuario = (id: string) => {
		if (!id) return;
		if (!usuariosSelecionados.find(u => u.id === id)) {
			const profissional = profissionais.find(p => p.id === id);
			if (profissional) {
				setUsuariosSelecionados([...usuariosSelecionados, profissional]);
			}
		}
		setValorSelect("");
	};

	const removerUsuario = (id: string) => {
		setUsuariosSelecionados(usuariosSelecionados.filter(u => u.id !== id));
	};

	const validar = (): string => {
		if (!projetoIdEstado) return "Selecione um projeto.";
		if (!titulo.trim()) return "O título é obrigatório.";
		if (!descricao.trim()) return "A descrição é obrigatória.";
		return "";
	};

	const limpar = () => {
		setTitulo(""); setDescricao(""); setUsuariosSelecionados([]);
		setNivelAtividade(""); setPrevisaoHoras(""); setProjetoId(""); setErro("");
		setValorSelect("");
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErro("");

		const erroValidacao = validar();
		if (erroValidacao) { setErro(erroValidacao); return; }

		const payload: ItemPayload = {
			titulo: titulo.trim(),
			descricao: descricao.trim(),
			dataAtribuicao: new Date().toISOString().split("T")[0],
			previsaoHoras: previsaoHoras !== "" ? Number(previsaoHoras) : null,
			nivelAtividade: nivelAtividade || null,
			usuarioIds: usuariosSelecionados.map(u => u.id),
			projetoId: Number(projetoIdEstado),
		};

		try {
			setLoading(true);
			await instance.post("/gestao/itens/cadastrar", payload);
			limpar();
			setMostrarPopup(true);
			setTimeout(() => setMostrarPopup(false), 3000);
		} catch (error: any) {
			setErro(error.response?.data?.Mensagem || "Erro ao cadastrar item.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-10 w-full max-w-175 flex flex-col gap-10">
				<h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 text-center">Cadastro de Atividade</h1>

				<div className="grid grid-cols-1 md:grid-cols-2  gap-4 items-start">
					<div className="flex flex-col gap-1">
						<label className="ms-1 font-medium text-gray-700 dark:text-gray-300">Projeto *</label>
						<Dropdown
							value={projetoIdEstado}
							onChange={(e) => setProjetoId(e.target.value)}
							options={projetos.map((p) => ({ label: p.nomeProjeto, value: String(p.id) }))}
							icon={<GoProject size={18} />}
							required
						/>
					</div>
					<div className="flex flex-col gap-1">
						<label className="ms-1 font-medium text-gray-700 dark:text-gray-300">Título da Atividade *</label>
						<Input placeholder="Ex: Ajuste de Layout" value={titulo} onChange={(e) => setTitulo(e.target.value)} icon={<FiFileText size={18} />} maxLength={300} />
					</div>
					<div className="flex flex-col gap-1">
						<label className="ms-1 font-medium text-gray-700 dark:text-gray-300">Descrição da Atividade *</label>
						<Input placeholder="Detalhes da task..." value={descricao} onChange={(e) => setDescricao(e.target.value)} icon={<FiFileText size={18} />} maxLength={300} />
					</div>

					<div className="flex flex-col">
						<div className="flex flex-col gap-1">
							<label className="ms-1 font-medium text-gray-700 dark:text-gray-300">Atribuir Profissionais *</label>
							<Dropdown
								value={valorSelect}
								onChange={(e) => handleSelectUsuario(e.target.value)}
								options={[
									{ label: "Selecione os profissionais...", value: "" },
									...profissionais.map((p) => ({ label: p.nomeUsuario, value: p.id }))
								]}
								icon={<FiUser size={18} />}
								required={false}
							/>
						</div>

						<div className="flex flex-wrap gap-[2px] mt-[2px] min-h-[20px]">
							{usuariosSelecionados.map((u) => (
								<span key={u.id} className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100 px-3 py-1 rounded-full text-xs font-medium border border-blue-200">
									{u.nomeUsuario}
									<button type="button" onClick={() => removerUsuario(u.id)} className="ml-1 hover:text-red-500 transition-colors">
										<FiX size={14} />
									</button>
								</span>
							))}
						</div>
					</div>
					<div className="flex flex-col gap-1">
						<label className="ms-1 font-medium text-gray-700 dark:text-gray-300">Papel/Atividade</label>
						<Dropdown
							value={nivelAtividade}
							onChange={(e) => setNivelAtividade(e.target.value)}
							options={[
								{ label: "Análise", value: "Analise" },
								{ label: "Desenvolvimento", value: "Desenvolvimento" },
								{ label: "Teste", value: "Teste" },
							]}
							icon={<FiUser size={18} />}
						/>
					</div>
					<div className="flex flex-col gap-1">
						<label className="ms-1 font-medium text-gray-700 dark:text-gray-300">Previsão de horas</label>
						<Input type="number" value={previsaoHoras} onChange={(e) => setPrevisaoHoras(e.target.value)} icon={<FiClock size={18} />} />
					</div>
				</div>

				<div className="flex flex-col items-center gap-6">
					{erro && <div className="text-red-500 text-sm font-bold bg-red-50 p-2 rounded w-full text-center border border-red-200">{erro}</div>}
					<Botao type="submit" disabled={loading}>{loading ? "Cadastrando..." : "Cadastrar"}</Botao>
				</div>
			</form>

			{mostrarPopup && <div className="fixed top-5 right-5 bg-green-500 text-white p-4 rounded-lg shadow-lg z-[9999]">Item cadastrado com sucesso!</div>}
		</>
	);
}