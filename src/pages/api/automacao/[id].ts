import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import path from 'path';
import axios from 'axios';
import { Page } from 'puppeteer';

puppeteer.use(StealthPlugin());

const TWO_CAPTCHA_API_KEY = 'YOUR_2CAPTCHA_API_KEY'; // Insira sua chave de API do 2Captcha
const siteKey = 'CAPTCHA_SITE_KEY'; // Insira o siteKey do reCAPTCHA da página do JusBrasil

interface Cliente {
  loginJusbrasil: string;
  senhaJusbrasil: string;
  nome: string;
  cpf: string;
  rgFrontUrl: string;
  rgBackUrl: string;
  linkProcessos: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const { tipo } = req.body;

  if (req.method === 'POST') {
    try {
      const tiposValidos = ['PROCESSO', 'DIARIO', 'JURISPRUDENCIA', 'PECA_PROCESSUAL'];
      if (!tiposValidos.includes(tipo)) {
        return res.status(400).json({ message: 'Tipo de automação inválido' });
      }

      const cliente = await prisma.cliente.findUnique({
        where: { id: Number(id) },
      });

      if (!cliente) {
        return res.status(404).json({ message: 'Cliente não encontrado' });
      }

      if (tipo === 'PROCESSO') {
        await iniciarProcessos(cliente);
      }

      const automacao = await prisma.automacao.create({
        data: {
          tipo,
          status: 'PENDENTE',
          clienteId: Number(id),
        },
      });

      res.status(201).json(automacao);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao iniciar automação' });
    }
  } else {
    res.status(405).json({ message: 'Método não permitido' });
  }
}

const iniciarProcessos = async (cliente: Cliente) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Definir User-Agent para simular um navegador real
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36');
    console.log('User-Agent configurado.');

    // Acessar a página de login
    console.log('Acessando a página de login...');
    await page.goto('https://www.jusbrasil.com.br/login?next_url=https%3A%2F%2Fwww.jusbrasil.com.br%2F', { waitUntil: 'domcontentloaded', timeout: 0 });
    console.log('Página de login acessada.');

    // Realizar login
    console.log('Tentando acessar o campo de email...');
    await page.waitForSelector('#FormFieldset-email', { visible: true });
    console.log('Campo de email encontrado, preenchendo...');
    await page.type('#FormFieldset-email', cliente.loginJusbrasil);
    await page.click('button[type="submit"]');
    console.log('Email preenchido e botão "Próximo" clicado.');
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 0 });
    console.log('Navegação após preencher email concluída.');

    console.log('Tentando acessar o campo de senha...');
    await page.waitForSelector('#FormFieldset-password', { visible: true });
    console.log('Campo de senha encontrado, preenchendo...');
    await page.type('#FormFieldset-password', cliente.senhaJusbrasil);
    await page.click('button[type="submit"]');
    console.log('Senha preenchida e botão "Entrar" clicado.');
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 0 });
    console.log('Login bem-sucedido!');

    // Repetir o processo para cada link de processo
    for (const linkProcesso of cliente.linkProcessos) {
      console.log(`Iniciando processo para o link: ${linkProcesso}`);
      await iniciarProcessoPorLink(page, cliente, linkProcesso);
    }
  } catch (error) {
    console.error('Erro ao automatizar o login e acessar o link do processo:', error);
  } finally {
    await browser.close();
    console.log('Navegador fechado.');
  }
};

const iniciarProcessoPorLink = async (page: Page, cliente: Cliente, linkProcesso: string) => {
  try {
    // Gerar o link de anonimização com base no link do processo
    const linkAnonimizacao = `https://www.jusbrasil.com.br/anonimizar/processo?url=${encodeURIComponent(linkProcesso)}`;
    console.log(`Acessando o link de anonimização: ${linkAnonimizacao}`);
    
    // Acessar o link de anonimização
    await page.goto(linkAnonimizacao, { waitUntil: 'domcontentloaded', timeout: 0 });
    console.log('Link de anonimização acessado com sucesso!');

    // Adicionar um pequeno atraso para garantir que tudo esteja carregado
    await new Promise(resolve => setTimeout(resolve, 10000)); // Aguarda 10 segundos

    // Selecionar a opção "Outro"
    const optionOutroSelector = 'input#selection-option-OUTRO';
    console.log('Selecionando a opção "Outro"...');
    await page.waitForSelector(optionOutroSelector, { visible: true, timeout: 60000 });
    await page.click(optionOutroSelector);
    console.log('Opção "Outro" selecionada com sucesso!');

    // Preencher o motivo com "LGPD"
    const textareaMotivoSelector = 'textarea#selection-option-OUTRO-textarea';
    console.log('Preenchendo o motivo com "LGPD"...');
    await page.waitForSelector(textareaMotivoSelector, { visible: true, timeout: 60000 });
    await page.type(textareaMotivoSelector, 'LGPD');
    console.log('Motivo preenchido com sucesso!');

    // Clicar no primeiro botão "Avançar"
    const avancarButtonSelector = 'button.btn.btn--blue';
    console.log('Clicando no primeiro botão "Avançar"...');
    await page.waitForSelector(avancarButtonSelector, { visible: true, timeout: 60000 });
    await page.click(avancarButtonSelector);
    console.log('Primeiro botão "Avançar" clicado com sucesso!');

    // Adicionar atraso para garantir que a próxima página seja carregada
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Clicar no botão "Entendi"
    const entendiButtonSelector = '#__next > div > main > div > div > div > div > div > div > form > div > button.btn.btn--blue';
    console.log('Clicando no botão "Entendi"...');
    await page.waitForSelector(entendiButtonSelector, { visible: true, timeout: 60000 });
    await page.click(entendiButtonSelector);
    console.log('Botão "Entendi" clicado com sucesso!');

    // Adicionar atraso para garantir que a próxima página seja carregada
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Fazer upload do RG (frente)
    const rgFrontButtonSelector = '#__next > div > main > div > div > div > div > div > div > form > div:nth-child(4) > div:nth-child(1) > div > div > div > div > button';
    const rgFrontPath = path.resolve('public', 'uploads', cliente.rgFrontUrl);
    console.log('Clicando no botão de upload do RG (frente)...');
    await page.waitForSelector(rgFrontButtonSelector, { visible: true, timeout: 60000 });
    const [fileChooserFront] = await Promise.all([
      page.waitForFileChooser(),
      page.click(rgFrontButtonSelector),
    ]);
    await fileChooserFront.accept([rgFrontPath]);
    console.log('RG (frente) carregado com sucesso!');

    // Fazer upload do RG (verso)
    const rgBackButtonSelector = '#__next > div > main > div > div > div > div > div > div > form > div:nth-child(4) > div:nth-child(2) > div > div > div > div > button';
    const rgBackPath = path.resolve('public', 'uploads', cliente.rgBackUrl);
    console.log('Clicando no botão de upload do RG (verso)...');
    await page.waitForSelector(rgBackButtonSelector, { visible: true, timeout: 60000 });
    const [fileChooserBack] = await Promise.all([
      page.waitForFileChooser(),
      page.click(rgBackButtonSelector),
    ]);
    await fileChooserBack.accept([rgBackPath]);
    console.log('RG (verso) carregado com sucesso!');

    // Clicar no segundo botão "Avançar"
    const avancarFinalButtonSelector = '#__next > div > main > div > div > div > div > div > div > form > div.style_actions__pkdZN > button.btn.btn--blue';
    console.log('Clicando no segundo botão "Avançar"...');
    await page.waitForSelector(avancarFinalButtonSelector, { visible: true, timeout: 60000 });
    await page.click(avancarFinalButtonSelector);
    console.log('Segundo botão "Avançar" clicado com sucesso!');

    const modalSelector = 'div.modal-dialog.modal-dialog-full';
    console.log('Aguardando pelo modal...');
    await page.waitForSelector(modalSelector, { visible: true, timeout: 60000 });

    const concluirButtonSelector = 'div.modal-footer > button.btn.btn--blue';
    console.log('Clicando no botão "Concluir"...');
    await page.waitForSelector(concluirButtonSelector, { visible: true, timeout: 60000 });
    await page.click(concluirButtonSelector);
    console.log('Botão "Concluir" clicado com sucesso!');

    // Adicionar um atraso para garantir que o processo seja concluído antes de prosseguir
    await new Promise(resolve => setTimeout(resolve, 5000));
  } catch (error) {
    console.error('Erro ao processar o link do processo:', error);
  }
};

async function solveCaptchaWith2Captcha(pageUrl: string): Promise<string | null> {
  try {
    const response = await axios.get(`http://2captcha.com/in.php`, {
      params: {
        key: TWO_CAPTCHA_API_KEY,
        method: 'userrecaptcha',
        googlekey: siteKey,
        pageurl: pageUrl,
        json: 1,
      },
    });

    if (response.data.status !== 1) {
      console.error('Erro ao enviar CAPTCHA para o 2Captcha:', response.data);
      return null;
    }

    const requestId = response.data.request;
    console.log('CAPTCHA enviado, aguardando solução...');

    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const result = await axios.get(`http://2captcha.com/res.php`, {
        params: {
          key: TWO_CAPTCHA_API_KEY,
          action: 'get',
          id: requestId,
          json: 1,
        },
      });

      if (result.data.status === 1) {
        console.log('Solução do CAPTCHA obtida com sucesso!');
        return result.data.request;
      } else if (result.data.request !== 'CAPCHA_NOT_READY') {
        console.error('Erro ao resolver o CAPTCHA:', result.data);
        return null;
      }

      console.log('Solução ainda não pronta, aguardando...');
    }
  } catch (error) {
    console.error('Erro ao resolver o CAPTCHA com 2Captcha:', error);
    return null;
  }
}
