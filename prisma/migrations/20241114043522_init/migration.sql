-- CreateEnum
CREATE TYPE "TipoAutomacao" AS ENUM ('PROCESSO', 'DIARIO', 'JURISPRUDENCIA', 'PECA_PROCESSUAL');

-- CreateEnum
CREATE TYPE "StatusAutomacao" AS ENUM ('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO', 'ERRO');

-- CreateTable
CREATE TABLE "Administrador" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Administrador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "loginJusbrasil" TEXT NOT NULL,
    "senhaJusbrasil" TEXT NOT NULL,
    "rgFrontUrl" TEXT NOT NULL,
    "rgBackUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Automacao" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoAutomacao" NOT NULL,
    "status" "StatusAutomacao" NOT NULL,
    "dataExecucao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mensagemErro" TEXT,
    "clienteId" INTEGER NOT NULL,

    CONSTRAINT "Automacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Administrador_email_key" ON "Administrador"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_cpf_key" ON "Cliente"("cpf");

-- AddForeignKey
ALTER TABLE "Automacao" ADD CONSTRAINT "Automacao_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
