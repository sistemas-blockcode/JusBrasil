-- DropForeignKey
ALTER TABLE "Automacao" DROP CONSTRAINT "Automacao_clienteId_fkey";

-- AddForeignKey
ALTER TABLE "Automacao" ADD CONSTRAINT "Automacao_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
