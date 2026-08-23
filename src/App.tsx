import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import CadastroUsuario from "./pages/TelaCadastroUsuario"
import CadastroProjeto from './pages/TelaCadastroProjeto'
import ListaProjetos from './pages/TelaListaProjetos'
import ApontamentoHoras from './pages/TelaApontamentoHoras'
import DescricaoProjeto from './pages/TelaDescricaoProjeto'
import CadastroItem from './pages/TelaCadastroItem'
import TelaLogProfissional from './pages/TelaLogProfissional'
import Historico from './pages/TelaHistorico'
import ListaApontamentosGestor from './pages/TelaListaApontamentosGestor'
import TelaCadastroCliente from './pages/TelaCadastroCliente'

import PrivateRoute from './routes/PrivateRoutes'
import TelaListagemCliente from './pages/TelaListagemCliente'
import ListagemUsuarios from './pages/TelaVisualizarUsuarios'
import RoleRoute from './routes/RoleRoute'
import { AcessoNegado } from './pages/AcessoNegado'

const router = createBrowserRouter(
 createRoutesFromElements(
   <>
    <Route path='/acesso-negado' element={<AcessoNegado />} />
    <Route element={<PrivateRoute/>}>

      {/* Livre para todos autenticados */}
      <Route path="/" element={<ListaProjetos />} />
      <Route path='/apontamento-horas' element={<ApontamentoHoras/>}/>
      <Route path='/log-profissional/:id' element={<TelaLogProfissional/>}/>
      <Route path='/lista-projetos' element={<ListaProjetos/>}/>

      {/* GESTOR e FINANCEIRO */}
      <Route element={<RoleRoute roles={['GESTOR', 'FINANCEIRO']} />}>
        
        <Route path='/cadastro-projeto' element={<CadastroProjeto/>}/>
        <Route path="/descricao-projeto/:id" element={<DescricaoProjeto />} />
        <Route path='/cadastro-item' element={<CadastroItem />} />  
        <Route path='/cadastro-cliente' element={<TelaCadastroCliente />}/>
        <Route path='/tela-historico' element={<Historico/>}/>
        <Route path='/listagem-clientes' element={<TelaListagemCliente />}/>
        <Route path='/visualizar-usuarios' element={<ListagemUsuarios />} />
      </Route>

      {/* Só GESTOR */}
      <Route element={<RoleRoute roles={['GESTOR']} />}>
        <Route path='/apontamentos-gestor' element={<ListaApontamentosGestor/>}/>
        <Route path='/cadastro-usuario' element={<CadastroUsuario/>}/>
      </Route>

      {/* Só FINANCEIRO */}
      <Route element={<RoleRoute roles={['FINANCEIRO']} />}>
        
      </Route>

    </Route>
  </>
 )
)

function App() {
  return <RouterProvider router={router} />
}

export default App