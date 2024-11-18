'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  loginJusbrasil: string;
  senhaJusbrasil: string;
  rgFrontUrl: string;
  rgBackUrl: string;
  dataNascimento: string;
  linkProcessos: string[];
}

export default function DetalhesClientePage() {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [mostrarTodosLinks, setMostrarTodosLinks] = useState(false);
  const params = useParams();
  const id = params?.id as string; // Especificando que o id é uma string
  const router = useRouter();

  useEffect(() => {
    const fetchCliente = async () => {
      if (!id) return;
      try {
        const response = await fetch(`/api/editCliente/${id}`);
        if (!response.ok) throw new Error('Erro ao carregar detalhes do cliente');
        const data = await response.json();
        setCliente(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCliente();
  }, [id]);

  const handleEdit = () => {
    router.push(`/detalhes-cliente/${id}/editar`);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/editCliente/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao excluir cliente');
      router.push('/clientes');
    } catch (error) {
      console.error(error);
    }
  };

  const handleAutomacao = async (tipo: string) => {
    try {
      let response;
      if (tipo === 'DIARIO') {
        // Fazer requisição para a API de diário
        response = await fetch(`/api/diario/${id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } else {
        // Requisição para outras automações
        response = await fetch(`/api/automacao/${id}`, {
          method: 'POST',
          body: JSON.stringify({ tipo }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      
      if (!response.ok) throw new Error(`Erro ao iniciar automação de ${tipo}`);
      console.log(`Automação ${tipo} iniciada com sucesso!`);
    } catch (error) {
      console.error(error);
    }
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  };

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);
    return parsedDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (!cliente) return <div>Carregando...</div>;

  const linkProcessosArray = cliente.linkProcessos;
  const primeiroLink = linkProcessosArray[0];
  const demaisLinks = linkProcessosArray.slice(1);

  return (
    <div className="min-h-screen px-8 py-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Detalhes do Cliente</h1>
      <div className="bg-white p-6 shadow-lg rounded-lg space-y-4">
        <p><strong>Nome:</strong> {cliente.nome}</p>
        <p><strong>CPF:</strong> {formatCPF(cliente.cpf)}</p>
        <p><strong>Login Jusbrasil:</strong> {cliente.loginJusbrasil}</p>
        <p><strong>Senha Jusbrasil:</strong> {cliente.senhaJusbrasil}</p>
        <p><strong>RG (Frente):</strong> <img src={cliente.rgFrontUrl} alt="RG Frente" className="w-32 h-32" /></p>
        <p><strong>RG (Verso):</strong> <img src={cliente.rgBackUrl} alt="RG Verso" className="w-32 h-32" /></p>
        <p><strong>Data de Nascimento:</strong> {formatDate(cliente.dataNascimento)}</p>
        
        <div>
          <strong>Links do Processo:</strong>
          <ol className="list-decimal list-inside">
            <li>
              <a href={primeiroLink} target="_blank" rel="noopener noreferrer">
                {primeiroLink}
              </a>
            </li>
            {mostrarTodosLinks && demaisLinks.map((link, index) => (
              <li key={index + 1}>
                <a href={link} target="_blank" rel="noopener noreferrer">
                  {link}
                </a>
              </li>
            ))}
          </ol>
          {!mostrarTodosLinks && demaisLinks.length > 0 && (
            <button
              onClick={() => setMostrarTodosLinks(true)}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Ver mais
            </button>
          )}
        </div>

        <div className="mt-6">
          <h2 className="font-bold text-lg">Ações de Automação</h2>
          <div className="space-x-4 mt-2">
            <button onClick={() => handleAutomacao('PROCESSO')} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Iniciar Processo</button>
            <button onClick={() => handleAutomacao('DIARIO')} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Iniciar Diário</button>
            <button onClick={() => handleAutomacao('JURISPRUDENCIA')} className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">Iniciar Jurisprudência</button>
          </div>
        </div>
      </div>
    </div>
  );
}
