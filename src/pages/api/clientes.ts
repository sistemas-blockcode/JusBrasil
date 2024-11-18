import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const upload = multer({
  storage: multer.diskStorage({
    destination: './public/uploads',
    filename: (req, file, cb) => {
      cb(null, `${uuidv4()}-${file.originalname}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Formato de arquivo inválido. Apenas JPEG e PNG são permitidos.'));
    }
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: Function) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req: NextApiRequest & { files?: any }, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      await runMiddleware(req, res, upload.fields([{ name: 'rgFront', maxCount: 1 }, { name: 'rgBack', maxCount: 1 }]));

      const { nome, cpf, loginJusbrasil, senhaJusbrasil, dataNascimento } = req.body;
      const linkProcessos = req.body.linkProcessos ? (Array.isArray(req.body.linkProcessos) ? req.body.linkProcessos : [req.body.linkProcessos]) : [];

      if (!nome || !cpf || !loginJusbrasil || !senhaJusbrasil || !dataNascimento || linkProcessos.length === 0) {
        return res.status(400).json({ message: 'Por favor, preencha todos os campos obrigatórios.' });
      }

      const rgFrontFile = req.files?.rgFront ? req.files.rgFront[0] : null;
      const rgBackFile = req.files?.rgBack ? req.files.rgBack[0] : null;

      if (!rgFrontFile || !rgBackFile) {
        return res.status(400).json({ message: 'Ambos os arquivos de RG (frente e verso) são obrigatórios.' });
      }

      const rgFrontUrl = `/uploads/${rgFrontFile.filename}`;
      const rgBackUrl = `/uploads/${rgBackFile.filename}`;

      const cliente = await prisma.cliente.create({
        data: {
          nome,
          cpf,
          loginJusbrasil,
          senhaJusbrasil,
          rgFrontUrl,
          rgBackUrl,
          dataNascimento: new Date(dataNascimento),
          linkProcessos,
        },
      });

      res.status(201).json({ message: 'Cliente cadastrado com sucesso!', cliente });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao cadastrar cliente.' });
    }
  } else {
    res.status(405).json({ message: `Método ${req.method} não permitido` });
  }
}
