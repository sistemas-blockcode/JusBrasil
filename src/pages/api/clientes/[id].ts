import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {

      const clienteId = parseInt(id as string);

      const deletedCliente = await prisma.cliente.delete({
        where: { id: clienteId },
      });

      res.status(200).json({ message: 'Cliente excluído com sucesso.', cliente: deletedCliente });
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      res.status(500).json({ message: 'Erro ao excluir cliente.' });
    }
  } else {
    res.status(405).json({ message: 'Método não permitido.' });
  }
}
