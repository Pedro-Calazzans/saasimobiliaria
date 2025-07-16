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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Imovel, PropertyStatus } from '@/types/imovel';
import { useSupabase } from '@/components/providers/supabase-provider';

interface AddImovelModalProps {
  onImovelAdded: (novoImovel: Imovel) => void;
}

const initialState: Partial<Imovel> = {
  title: '',
  description: '',
  property_type: '',
  price: 0,
  status: 'Disponível',
  address: {
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
  },
  features: {
    quartos: 0,
    suites: 0,
    banheiros: 0,
    salas: 0,
    vagas: 0,
  },
  differentials: [],
  observations: '',
};

export function AddImovelModal({ onImovelAdded }: AddImovelModalProps) {
  const supabase = useSupabase();
  const [open, setOpen] = useState(false);
  const [imovel, setImovel] = useState<Partial<Imovel>>(initialState);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    validateForm();
  }, [imovel]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!imovel.title) newErrors.title = 'O título é obrigatório.';
    if (!imovel.price || imovel.price <= 0) newErrors.price = 'O preço deve ser maior que zero.';
    if (!imovel.property_type) newErrors.property_type = 'O tipo de imóvel é obrigatório.';
    
    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setImovel(prev => ({ ...prev, [id]: value }));
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setImovel(prev => ({ ...prev, [id]: value === '' ? 0 : parseFloat(value) }));
  };

  const handleNestedChange = (e: React.ChangeEvent<HTMLInputElement>, category: 'address' | 'features') => {
    const { id, value } = e.target;
    const isNumeric = category === 'features';
    setImovel(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [id]: isNumeric ? (value === '' ? 0 : parseInt(value, 10)) : value,
      },
    }));
  };

  const handleSelectChange = (value: string, id: 'property_type' | 'status') => {
    setImovel(prev => ({ ...prev, [id]: value }));
  };

  const handleDifferentialsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    const differentialsArray = value.split(',').map(item => item.trim());
    setImovel(prev => ({ ...prev, differentials: differentialsArray }));
  };

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length !== 8) {
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (data.erro) {
        toast.error('CEP não encontrado.');
        return;
      }
      setImovel(prev => {
        const newAddress = {
          ...prev?.address,
          cep: data.cep || '',
          rua: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || '',
          numero: prev?.address?.numero || '',
        };
        return {
          ...prev,
          address: newAddress,
        } as Partial<Imovel>;
      });
    } catch (error) {
      toast.error('Erro ao buscar o CEP.');
    }
  };

  async function handleSave() {
    validateForm();
    if (!isFormValid) {
      toast.error('Por favor, corrija os erros no formulário.');
      return;
    }

    // Obter o ID do usuário da sessão
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Você precisa estar logado para adicionar um imóvel.');
      return;
    }

    // Preparar os dados para inserção, removendo campos que não existem no BD
    const { id, created_at, ...insertData } = { ...initialState, ...imovel };

    const { data, error } = await supabase
      .from('properties')
      .insert([{ ...insertData, user_id: user.id }])
      .select()
      .single(); // .single() para retornar um objeto em vez de um array

    if (error) {
      console.error('Erro ao salvar o imóvel:', error);
      toast.error('Erro ao salvar o imóvel. Verifique o console.');
      return;
    }

    toast.success('Imóvel salvo com sucesso!');
    onImovelAdded(data as Imovel);
    setImovel(initialState); // Resetar o estado
    setOpen(false);
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
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" value={imovel.title} onChange={handleChange} placeholder="Ex: Cobertura com vista para o mar" />
                  {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property_type">Tipo de Imóvel</Label>
                  <Select onValueChange={(value) => handleSelectChange(value, 'property_type')} value={imovel.property_type}>
                    <SelectTrigger className={errors.property_type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Apartamento">Apartamento</SelectItem>
                      <SelectItem value="Casa">Casa</SelectItem>
                      <SelectItem value="Terreno">Terreno</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.property_type && <p className="text-sm text-red-500">{errors.property_type}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" value={imovel.description} onChange={handleChange} placeholder="Descreva os detalhes do imóvel..." />
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
                  <Input id="rua" value={imovel.address?.rua} onChange={(e) => handleNestedChange(e, 'address')} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input id="numero" value={imovel.address?.numero} onChange={(e) => handleNestedChange(e, 'address')} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input id="bairro" value={imovel.address?.bairro} onChange={(e) => handleNestedChange(e, 'address')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input id="cidade" value={imovel.address?.cidade} onChange={(e) => handleNestedChange(e, 'address')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input id="estado" value={imovel.address?.estado} onChange={(e) => handleNestedChange(e, 'address')} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input id="cep" value={imovel.address?.cep} onChange={(e) => handleNestedChange(e, 'address')} onBlur={handleCepBlur} />
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
                <Input id="quartos" type="number" value={imovel.features?.quartos} onChange={(e) => handleNestedChange(e, 'features')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="suites">Suítes</Label>
                <Input id="suites" type="number" value={imovel.features?.suites} onChange={(e) => handleNestedChange(e, 'features')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="banheiros">Banheiros</Label>
                <Input id="banheiros" type="number" value={imovel.features?.banheiros} onChange={(e) => handleNestedChange(e, 'features')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salas">Salas</Label>
                <Input id="salas" type="number" value={imovel.features?.salas} onChange={(e) => handleNestedChange(e, 'features')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vagas">Vagas</Label>
                <Input id="vagas" type="number" value={imovel.features?.vagas} onChange={(e) => handleNestedChange(e, 'features')} />
              </div>
            </div>
          )}

          {renderSection(
            'Detalhes Comerciais',
            'Informações sobre preço e status de venda.',
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$)</Label>
                <Input id="price" type="number" value={imovel.price} onChange={handleNumericChange} placeholder="550000.00" />
                {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select onValueChange={(value) => handleSelectChange(value as PropertyStatus, 'status')} value={imovel.status}>
                  <SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Disponível">Disponível</SelectItem>
                    <SelectItem value="Em Negociação">Em Negociação</SelectItem>
                    <SelectItem value="Vendido">Vendido</SelectItem>
                    <SelectItem value="Alugado">Alugado</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          {renderSection(
            'Diferenciais e Observações',
            'Adicione características especiais e notas importantes.',
            <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="differentials">Diferenciais (separados por vírgula)</Label>
                  <Textarea id="differentials" value={imovel.differentials?.join(', ')} onChange={handleDifferentialsChange} placeholder="Piscina, churrasqueira, academia..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observations">Observações</Label>
                  <Textarea id="observations" value={imovel.observations} onChange={handleChange} placeholder="Informações adicionais..." />
                </div>
            </div>
          )}

        </div>
        <DialogFooter className="px-6 pb-6">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!isFormValid}>Salvar Imóvel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
