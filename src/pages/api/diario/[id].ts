import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import prisma from '@/lib/prisma';
import axios from 'axios';

puppeteer.use(StealthPlugin());

const API_KEY_2CAPTCHA = '1beb2d19c7c32a77e78861ab4644fce2';

interface Cliente {
  loginJusbrasil: string;
  senhaJusbrasil: string;
  nome: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'POST') {
    try {
      const cliente = await prisma.cliente.findUnique({
        where: { id: Number(id) },
      });

      if (!cliente) {
        return res.status(404).json({ message: 'Cliente não encontrado' });
      }

      await iniciarDiario(cliente);
      res.status(200).json({ message: 'Automação de Diário iniciada com sucesso!' });
    } catch (error) {
      console.error('Erro ao iniciar automação de Diário:', error);
      res.status(500).json({ message: 'Erro ao iniciar automação de Diário' });
    }
  } else {
    res.status(405).json({ message: 'Método não permitido' });
  }
}

const iniciarDiario = async (cliente: Cliente) => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: chromePath,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--window-size=1920,1080',
      `--load-extension=${process.cwd()}/public/extension`,
    ],
    ignoreDefaultArgs: ['--enable-automation'],
  });
  const page = await browser.newPage();

  try {
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      Referer: 'https://www.jusbrasil.com.br',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    });

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });

    // Acessar a página de configuração da extensão 2Captcha
    console.log('Acessando a página de configuração da extensão 2Captcha...');
    await page.goto('chrome-extension://gkjaoeeikaojlnpfmbcfhebglpnpmmff/options/options.html', {
      waitUntil: 'domcontentloaded',
      timeout: 0,
    });

    // Inserir a API key no campo apropriado e clicar no botão "Login"
    const apiKeySelector = 'body > div > div.content > table > tbody > tr:nth-child(1) > td:nth-child(2) > input[type=text]';
    const loginButtonSelector = '#connect';

    await page.waitForSelector(apiKeySelector, { visible: true });
    await page.type(apiKeySelector, API_KEY_2CAPTCHA);
    console.log('API key inserida no campo.');

    await page.click(loginButtonSelector);
    console.log('Botão de login clicado.');

    // Pressionar a tecla "Enter" três vezes com intervalo de 1.5 segundos
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Enter');
      console.log(`Tecla "Enter" pressionada (${i + 1}/3).`);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    // Aguardar por 3 segundos
    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log('Aguardado 3 segundos após o login na extensão.');

    await page.goto('https://www.jusbrasil.com.br/login?next_url=https%3A%2F%2Fwww.jusbrasil.com.br%2F', {
      waitUntil: 'domcontentloaded',
      timeout: 0,
    });

    await page.waitForSelector('#FormFieldset-email', { visible: true });
    await page.type('#FormFieldset-email', cliente.loginJusbrasil);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 0 });
    await page.waitForSelector('#FormFieldset-password', { visible: true });
    await page.type('#FormFieldset-password', cliente.senhaJusbrasil);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 0 });

    const nomeCliente = cliente.nome.replace(/ /g, '+');
    let pageNum = 1;
    let hasMoreResults = true;

    while (hasMoreResults) {
      const urlBusca = `https://www.jusbrasil.com.br/diarios/busca?q=%22${nomeCliente}%22&p=${pageNum}`;
      await page.goto(urlBusca, { waitUntil: 'domcontentloaded', timeout: 0 });

      const listSelector = '#__next > main > div:nth-child(3) > div > div > section > ul';
      await page.waitForSelector(listSelector, { visible: true });

      const items = await page.$$(listSelector + ' > li');

      for (let i = 0; i < items.length; i++) {
        try {
          const itemSelector = `${listSelector} > li:nth-child(${i + 1}) a`;
          const item = await page.$(itemSelector);

          if (item) {
            await item.click();
            await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 0 });

            const reportButtonSelector =
              '#app-root > div > div > div.WithMetricsDispatcher > div > div.container.container--root > div > div > div.RemoveInformationTrigger > form > div > input';
            await page.waitForSelector(reportButtonSelector, { visible: true });
            await page.click(reportButtonSelector);

            const captchaResponse = await resolveCaptcha(page.url());

            await page.evaluate((token) => {
              const captchaElement = document.querySelector('[name="g-recaptcha-response"]') as HTMLTextAreaElement | null;
              if (captchaElement) {
                captchaElement.value = token;
              }
            }, captchaResponse);

            await page.click('#challenge-form > div.captcha-solver.captcha-solver_inner');

            await new Promise((resolve) => setTimeout(resolve, 40000));
          }
        } catch (error) {
          console.error(`Erro ao interagir com o item ${i + 1}:`, error);
        }
      }

      if (items.length === 0) {
        hasMoreResults = false;
      } else {
        pageNum++;
      }
    }
  } catch (error) {
    console.error('Erro ao automatizar o login e pesquisa no Diário Oficial:', error);
  } finally {
    await browser.close();
  }
};

const resolveCaptcha = async (pageUrl: string) => {
  console.log('Resolvendo captcha usando 2Captcha...');
  try {
    const response = await axios.post(
      `http://2captcha.com/in.php?key=${API_KEY_2CAPTCHA}&method=userrecaptcha&googlekey=SITE_KEY&pageurl=${pageUrl}&json=1`
    );

    const requestId = response.data.request;
    let captchaSolved = false;
    let token: string = '';

    while (!captchaSolved) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const result = await axios.get(
        `http://2captcha.com/res.php?key=${API_KEY_2CAPTCHA}&action=get&id=${requestId}&json=1`
      );

      if (result.data.status === 1) {
        captchaSolved = true;
        token = result.data.request;
      }
    }

    console.log('Captcha resolvido.');
    return token;
  } catch (error) {
    console.error('Erro ao resolver captcha:', error);
    throw new Error('Erro ao resolver captcha');
  }
};