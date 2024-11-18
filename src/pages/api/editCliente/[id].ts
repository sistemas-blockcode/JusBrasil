import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const cliente = await prisma.cliente.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          automacoes: true,
        },
      });

      if (!cliente) {
        return res.status(404).json({ message: 'Cliente não encontrado' });
      }

      res.status(200).json(cliente);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao carregar cliente' });
    }
  } else {
    res.status(405).json({ message: 'Método não permitido' });
  }
}
