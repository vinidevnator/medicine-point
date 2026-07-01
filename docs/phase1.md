# PROMPT

Crie uma aplicação web moderna, responsiva e com interface profissional para um marketplace de medicamentos, onde farmácias podem se cadastrar para se tornar pontos de coleta e utilizar seu próprio estoque para atender pedidos locais.

O objetivo é permitir que clientes encontrem medicamentos disponíveis em farmácias próximas através do CEP informado, oferecendo opções de retirada na loja, motoentrega ou entrega via centro de distribuição convencional.

A identidade visual deve transmitir confiança, saúde e tecnologia, utilizando tons de azul, branco e verde, com uma interface inspirada em grandes e-commerces como Amazon, Mercado Livre, iFood e Drogasil.

Todo o projeto deve ser desenvolvido seguindo boas práticas de arquitetura, componentização, acessibilidade e performance.

======================================================================
ARQUITETURA
======================================================================

O sistema deve possuir duas áreas:

• Área Pública (Cliente)
• Dashboard da Farmácia

O sistema deve ser Multi-Tenant, permitindo diversas farmácias utilizando a mesma plataforma.

======================================================================
MOBILE FIRST
======================================================================

Todo o projeto deve ser desenvolvido utilizando Mobile First.

Prioridades:

- Interface otimizada inicialmente para smartphones
- Totalmente responsivo
- Excelente usabilidade em tablets e desktop
- Drawer Menu no mobile
- Cards ao invés de tabelas quando necessário
- Skeleton Loading
- Lazy Loading
- Dark Mode
- Light Mode
- Framer Motion para animações
- Excelente pontuação no Lighthouse
- SEO otimizado
- Componentes reutilizáveis

======================================================================
CADASTRO DA FARMÁCIA
======================================================================

Criar tela de cadastro contendo:

- CNPJ (máscara + validação)
- Razão Social
- Nome Fantasia
- Email
- Senha
- CEP
- Endereço (automático via CEP)
- Número
- Complemento
- Cidade
- Estado
- Faturamento médio mensal

Faixas:

- até R$ 50 mil
- R$ 50 mil até R$ 200 mil
- R$ 200 mil até R$ 500 mil
- acima de R$ 500 mil

Após o cadastro realizar login automaticamente.

======================================================================
LOGIN
======================================================================

Login utilizando:

- Email
- Senha

Hash da senha utilizando bcrypt.

======================================================================
DASHBOARD DA FARMÁCIA
======================================================================

Menu lateral contendo:

- Dashboard
- Produtos
- Pedidos
- Relatórios
- Configurações
- Minha Conta

Dashboard contendo:

Cards:

- Produtos cadastrados
- Produtos vendidos hoje
- Produtos vendidos no mês
- Pedidos aguardando retirada
- Pedidos enviados por moto
- Receita estimada

Adicionar gráficos:

- Barras
- Pizza
- Linha

======================================================================
CADASTRO DE PRODUTOS
======================================================================

Cada produto deve possuir:

- EAN
- Nome
- Descrição
- Preço
- Quantidade disponível
- Imagem

Criar automaticamente os seguintes medicamentos fictícios.

Produto 1

EAN:
7890000000001

Nome:
Medicamento Respiratório

Descrição:
Medicamento utilizado para alívio dos sintomas respiratórios.

Preço:
39,90

Quantidade:
100

Imagem fictícia.

-------------------------------------

Produto 2

EAN:
7890000000002

Nome:
Medicamento de Hipertensão

Descrição:
Medicamento utilizado para controle da pressão arterial.

Preço:
89,90

Quantidade:
80

Imagem fictícia.

-------------------------------------

Produto 3

EAN:
7890000000003

Nome:
Medicamento de Febre

Descrição:
Medicamento para redução da febre e dores leves.

Preço:
19,90

Quantidade:
250

Imagem fictícia.

======================================================================
CONFIGURAÇÕES DA FARMÁCIA
======================================================================

Permitir configurar:

CEP Base

Raio de atendimento

Slider:

1 km até 50 km

Checkbox:

- Aceita retirada
- Aceita moto entrega

Essas configurações serão utilizadas para localizar farmácias próximas.

======================================================================
RELATÓRIOS
======================================================================

Filtros:

- Hoje
- Ontem
- Últimos 7 dias
- Últimos 30 dias
- Período personalizado

Exibir:

- Produtos vendidos
- Receita
- Pedidos por retirada
- Pedidos por moto
- Produtos mais vendidos

Adicionar gráficos.

======================================================================
SITE PÚBLICO
======================================================================

Criar Home moderna contendo:

- Banner principal
- Busca de medicamentos
- Produtos em destaque
- Categorias
- Farmácias próximas

Layout semelhante aos principais e-commerces.

======================================================================
PÁGINA DO PRODUTO (PDP)
======================================================================

A rota deve ser dinâmica utilizando o EAN.

Exemplo:

/produto/7890000000001

ou

/medicamento/7890000000001

Cada EAN deve carregar automaticamente seu medicamento.

Layout:

Lado esquerdo:

Imagem fictícia

Lado direito:

Nome

EAN

Preço

Descrição

Campo CEP

Botão:

Buscar disponibilidade

======================================================================
BUSCA DE FARMÁCIAS
======================================================================

Ao informar um CEP:

O sistema deverá localizar farmácias cujo:

- CEP Base
- Raio configurado

consigam atender aquele CEP.

Exibir:

- Nome da farmácia
- Distância
- Quantidade disponível
- Preço
- Tempo estimado

Somente farmácias com estoque maior que zero podem aparecer.

======================================================================
ENTREGAS
======================================================================

Cada farmácia poderá oferecer:

RETIRADA

Tempo:

30 minutos

-------------------------------------

MOTO ENTREGA

Tempo:

30 minutos até 2 horas

Mostrar:

- Frete
- Tempo estimado

-------------------------------------

CENTRO DE DISTRIBUIÇÃO

Sempre disponível.

Tempo:

Maior que 6 horas.

Exemplos:

- 6 horas
- 8 horas
- 12 horas
- 24 horas

Visualmente esta opção deve aparecer como mais lenta.

======================================================================
COMPRA
======================================================================

Adicionar botão:

COMPRAR AGORA

Ao clicar:

Criar pedido fictício.

======================================================================
STATUS DO PEDIDO
======================================================================

Criar Stepper contendo:

1 - Pedido Liberado

2 - Pedido Montado

3 - Pedido Pronto para Coleta

Cada etapa deve possuir:

- Ícone
- Horário
- Descrição

======================================================================
REGRAS DE NEGÓCIO
======================================================================

- Apenas farmácias dentro do raio podem aparecer.
- Apenas farmácias com estoque disponível.
- Estoque deve ser decrementado após compra.
- Relatórios devem atualizar automaticamente.
- Retirada e moto entrega respeitam configurações da farmácia.
- Centro de distribuição sempre disponível.
- Entrega convencional sempre superior a 6 horas.
- O EAN deve ser único.

======================================================================
STACK TECNOLÓGICA
======================================================================

Utilizar obrigatoriamente:

Frontend

- React 19
- Next.js App Router
- TypeScript
- Tailwind CSS 4
- Zod

Backend

- Next.js Route Handlers
- Server Actions
- Drizzle ORM
- SQLite
- Auth proprio
- bcrypt

======================================================================
BANCO DE DADOS
======================================================================

Utilizar SQLite.

Todo acesso ao banco deve ocorrer exclusivamente através do Drizzle ORM.

Criar as tabelas:

- users
- pharmacies
- pharmacy_settings
- products
- orders
- order_items

Todas devem possuir:

- id
- created_at
- updated_at

Criar migrations.

Criar seeds.

Criar dados de exemplo.

======================================================================
ESTRUTURA DO PROJETO
======================================================================

app/

components/

features/

hooks/

actions/

repositories/

services/

lib/

db/
    schema/
    migrations/
    index.ts

types/

utils/

======================================================================
QUALIDADE
======================================================================

Seguir:

- Clean Architecture
- SOLID
- Repository Pattern
- Services
- Componentização máxima
- Código reutilizável
- Tipagem completa
- Nunca utilizar any
- ESLint
- Prettier
- Código preparado para crescimento

======================================================================
OBJETIVO
======================================================================

A aplicação deve funcionar localmente executando apenas:

npm install

npm run dev

Sem necessidade de configurar qualquer serviço externo.

Todo armazenamento deve ocorrer em SQLite utilizando Drizzle ORM.

A arquitetura deve permitir futura migração para PostgreSQL ou MySQL alterando apenas a configuração do banco, mantendo toda a camada de domínio e regras de negócio intactas.

O resultado final deve possuir aparência de um produto SaaS profissional, pronto para evolução em ambiente de produção.