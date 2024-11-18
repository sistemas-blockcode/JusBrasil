'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react'; 
import { useToast } from '@/hooks/use-toast';

export default function ClienteCadastro() {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [loginJusbrasil, setLoginJusbrasil] = useState('');
  const [senhaJusbrasil, setSenhaJusbrasil] = useState('');
  const [rgFront, setRgFront] = useState<File | null>(null);
  const [rgBack, setRgBack] = useState<File | null>(null);
  const [rgFrontName, setRgFrontName] = useState<string | null>(null);
  const [rgBackName, setRgBackName] = useState<string | null>(null);
  const [dataNascimento, setDataNascimento] = useState('');
  const [linksProcessos, setLinksProcessos] = useState<string[]>(['']);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void, setFileName: (name: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setFile(file);
      setFileName(file.name); 
      setError('');
    } else {
      setError('Formato de imagem inválido. Por favor, envie um arquivo JPEG ou PNG.');
    }
  };

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...linksProcessos];
    newLinks[index] = value;
    setLinksProcessos(newLinks);
  };

  const addLinkField = () => {
    setLinksProcessos([...linksProcessos, '']);
  };

  const handleRemoveLink = (index: number) => {
    const newLinks = linksProcessos.filter((_, i) => i !== index);
    setLinksProcessos(newLinks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !cpf || !loginJusbrasil || !senhaJusbrasil || !rgFront || !rgBack || !dataNascimento || linksProcessos.some(link => !link)) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('cpf', cpf);
    formData.append('loginJusbrasil', loginJusbrasil);
    formData.append('senhaJusbrasil', senhaJusbrasil);
    formData.append('dataNascimento', dataNascimento);
    linksProcessos.forEach((link, index) => formData.append(`linkProcessos[${index}]`, link));
    formData.append('rgFront', rgFront);
    formData.append('rgBack', rgBack);

    try {
      const response = await fetch('/api/clientes', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao cadastrar cliente');
      }

      toast({
        title: "Sucesso!",
        description: "Cliente cadastrado com sucesso.",
        variant: "success",
      });

      router.push('/lista-clientes');
    } catch (err) {
      toast({
        title: "Erro ao cadastrar cliente",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen px-8 py-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Cadastro de Cliente</h1>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <div className="bg-white p-6 shadow-lg rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome<span className='text-red-600'>*</span></label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">CPF<span className='text-red-600'>*</span></label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Login Jusbrasil<span className='text-red-600'>*</span></label>
              <input
                type="text"
                value={loginJusbrasil}
                onChange={(e) => setLoginJusbrasil(e.target.value)}
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Senha Jusbrasil<span className='text-red-600'>*</span></label>
              <input
                type="password"
                value={senhaJusbrasil}
                onChange={(e) => setSenhaJusbrasil(e.target.value)}
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Data de Nascimento<span className='text-red-600'>*</span></label>
              <input
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Links dos Processos<span className='text-red-600'>*</span></label>
              {linksProcessos.map((link, index) => (
                <div key={index} className="flex items-center mt-1">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => handleLinkChange(index, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:outline-none"
                    required
                  />
                  {linksProcessos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(index)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      Remover
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addLinkField}
                className="mt-2 px-4 py-2 text-sm bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
              >
                Adicionar Link
              </button>
            </div>

            <div>
              <label className="block text-sm mb-2 font-medium text-gray-700">RG (Frente)<span className='text-red-600'>*</span></label>
              <div className="flex items-center">
                <input
                  type="file"
                  accept="image/jpeg, image/png"
                  onChange={(e) => handleFileChange(e, setRgFront, setRgFrontName)}
                  className="hidden"
                  id="rgFront"
                  required
                />
                <label htmlFor="rgFront" className="flex items-center px-3 py-2 text-xs bg-blue-500 text-white font-semibold rounded-md cursor-pointer hover:bg-blue-600">
                  <Plus className="mr-2" size={18} />
                  Escolher Arquivo
                </label>
                {rgFrontName && <span className="ml-2 text-sm text-gray-700">{rgFrontName}</span>}
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 font-medium text-gray-700">RG (Verso)<span className='text-red-600'>*</span></label>
              <div className="flex items-center">
                <input
                  type="file"
                  accept="image/jpeg, image/png"
                  onChange={(e) => handleFileChange(e, setRgBack, setRgBackName)}
                  className="hidden"
                  id="rgBack"
                  required
                />
                <label htmlFor="rgBack" className="flex items-center px-3 py-2 text-xs bg-blue-500 text-white font-semibold rounded-md cursor-pointer hover:bg-blue-600">
                  <Plus className="mr-2" size={18} />
                  Escolher Arquivo
                </label>
                {rgBackName && <span className="ml-2 text-sm text-gray-700">{rgBackName}</span>}
              </div>
            </div>
          </div>

          <div className="flex space-x-4 mt-10">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
