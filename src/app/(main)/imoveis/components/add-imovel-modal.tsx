'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X, Upload } from 'lucide-react';
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';

interface AddImovelModalProps {
  onImovelAdded: (novoImovel: any) => void;
}

export function AddImovelModal({ onImovelAdded }: AddImovelModalProps) {
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState('');
  const [preco, setPreco] = useState('');
  const [status, setStatus] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState('');
  const [quartos, setQuartos] = useState('');
  const [suites, setSuites] = useState('');
  const [banheiros, setBanheiros] = useState('');
  const [salas, setSalas] = useState('');
  const [vagas, setVagas] = useState('');
  const [diferenciais, setDiferenciais] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [fotos, setFotos] = useState<File[]>([]);
  const [fotosPreview, setFotosPreview] = useState<string[]>([]);
  const inputFileRef = useRef<HTMLInputElement>(null);

  function handleFotosChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      const newFotos = [...fotos, ...filesArray];
      setFotos(newFotos);

      const previewArray = newFotos.map((file) => URL.createObjectURL(file));
      setFotosPreview(previewArray);
    }
  }

  function handleRemoveFoto(indexToRemove: number) {
    const newFotos = fotos.filter((_, index) => index !== indexToRemove);
    setFotos(newFotos);

    const newPreviews = newFotos.map((file) => URL.createObjectURL(file));
    setFotosPreview(newPreviews);
  }

  async function handleSave() {
    const imovelData = {
      titulo,
      descricao,
      tipo,
      preco,
      status,
      endereco: { rua, numero, bairro, cidade, estado, cep },
      features: { quartos, suites, banheiros, salas, vagas },
      diferenciais,
      observacoes,
    };

    try {
      const response = await fetch('/api/imoveis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(imovelData),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar o imóvel');
      }

      const result = await response.json();
      console.log('Imóvel salvo com sucesso:', result);
      toast.success('Imóvel salvo com sucesso!');

      onImovelAdded(imovelData);

      setOpen(false);
    } catch (error) {
      console.error('Erro ao salvar o imóvel:', error);
      toast.error('Erro ao salvar o imóvel. Verifique o console.');
    }
  }

  const renderSection = (title: string, description: string, children: React.ReactNode) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b pb-8">
      <div className="md:col-span-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="md:col-span-2 space-y-4">{children}</div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Adicionar Imóvel</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Imóvel</DialogTitle>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto p-6 space-y-8">

          {renderSection(
            'Informações Básicas',
            'Detalhes principais para identificação do imóvel.',
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Cobertura com vista para o mar" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Imóvel</Label>
                  <Select onValueChange={setTipo} value={tipo}>
                    <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartamento">Apartamento</SelectItem>
                      <SelectItem value="casa">Casa</SelectItem>
                      <SelectItem value="terreno">Terreno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descreva os detalhes do imóvel..." />
              </div>
            </>
          )}

          {renderSection(
            'Endereço',
            'Localização completa do imóvel.',
            <>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-3 space-y-2">
                  <Label htmlFor="rua">Rua</Label>
                  <Input id="rua" value={rua} onChange={(e) => setRua(e.target.value)} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input id="numero" value={numero} onChange={(e) => setNumero(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input id="bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input id="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input id="estado" value={estado} onChange={(e) => setEstado(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input id="cep" value={cep} onChange={(e) => setCep(e.target.value)} />
                 </div>
              </div>
            </>
          )}

          {renderSection(
            'Características',
            'Detalhes sobre a estrutura do imóvel.',
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quartos">Quartos</Label>
                <Input id="quartos" type="number" value={quartos} onChange={(e) => setQuartos(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="suites">Suítes</Label>
                <Input id="suites" type="number" value={suites} onChange={(e) => setSuites(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="banheiros">Banheiros</Label>
                <Input id="banheiros" type="number" value={banheiros} onChange={(e) => setBanheiros(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salas">Salas</Label>
                <Input id="salas" type="number" value={salas} onChange={(e) => setSalas(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vagas">Vagas</Label>
                <Input id="vagas" type="number" value={vagas} onChange={(e) => setVagas(e.target.value)} />
              </div>
            </div>
          )}

          {renderSection(
            'Detalhes Comerciais',
            'Informações sobre preço e status de venda.',
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preco">Preço (R$)</Label>
                <Input id="preco" value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="Ex: 550000.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select onValueChange={setStatus} value={status}>
                  <SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="vendido">Vendido</SelectItem>
                    <SelectItem value="alugado">Alugado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          {renderSection(
            'Fotos do Imóvel',
            'Faça o upload de uma ou mais imagens do imóvel.',
             <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => e.preventDefault()}>
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={() => inputFileRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" /> Adicionar Fotos
                  </Button>
                  <input
                    type="file"
                    multiple
                    ref={inputFileRef}
                    className="hidden"
                    onChange={handleFotosChange}
                    accept="image/*"
                  />
                </div>
                {fotosPreview.length > 0 && (
                  <div className="mt-4">
                    <Carousel className="w-full">
                      <CarouselContent>
                        {fotosPreview.map((src, index) => (
                          <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 relative group">
                            <div className="p-1">
                              <img src={src} alt={`Preview ${index}`} className="w-full h-40 object-cover rounded-md" />
                               <button onClick={() => handleRemoveFoto(index)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <X className="h-4 w-4" />
                               </button>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  </div>
                )}
            </div>
          )}

          {renderSection(
            'Diferenciais e Observações',
            'Adicione características especiais e notas importantes.',
            <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="diferenciais">Diferenciais</Label>
                  <Textarea id="diferenciais" value={diferenciais} onChange={(e) => setDiferenciais(e.target.value)} placeholder="Ex: Piscina, churrasqueira, academia..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea id="observacoes" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Informações adicionais..." />
                </div>
            </div>
          )}

        </div>
        <DialogFooter className="px-6 pb-6">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar Imóvel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}