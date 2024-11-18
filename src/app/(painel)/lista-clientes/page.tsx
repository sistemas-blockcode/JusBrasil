'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: string;
}

export default function ListaClientePage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await fetch('/api/getClientes');
        if (!response.ok) throw new Error('Erro ao carregar clientes');
        const data = await response.json();
        setClientes(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchClientes();
  }, []);

  const handleView = (id: string) => {
    router.push(`/clientes/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/detalhes-cliente/${id}/editar`);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao excluir cliente');
      setClientes(clientes.filter((cliente) => cliente.id !== id));
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

  return (
    <div className="min-h-screen px-8 py-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Lista de Clientes</h1>
      <div className="bg-white p-6 shadow-lg rounded-lg">
        <table className="min-w-full border-collapse border border-gray-300 rounded-lg">
          <thead>
            <tr>
              <th className="border p-2 text-left rounded-lg">Nome</th>
              <th className="border p-2 text-left">CPF</th>
              <th className="border p-2 text-left">Data Nascimento</th>
              <th className="border p-2 rounded-lg">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="border-t">
                <td className="border p-2">{cliente.nome}</td>
                <td className="border p-2">{formatCPF(cliente.cpf)}</td>
                <td className="border p-2">{formatDate(cliente.dataNascimento)}</td>
                <td className="border p-2 flex justify-center space-x-2">
                  <button
                    onClick={() => handleEdit(cliente.id)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Visualizar
                  </button>
                  <button
                    onClick={() => handleDelete(cliente.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
