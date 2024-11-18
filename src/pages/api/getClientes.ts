import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const clientes = await prisma.cliente.findMany({
        select: {
          id: true,
          nome: true,
          cpf: true,
          loginJusbrasil: true,
          rgFrontUrl: true,
          rgBackUrl: true,
          dataNascimento: true,
          linkProcessos: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.status(200).json(clientes);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      res.status(500).json({ message: 'Erro ao buscar clientes' });
    }
  } else {
    res.status(405).json({ message: `Método ${req.method} não permitido` });
  }
}

