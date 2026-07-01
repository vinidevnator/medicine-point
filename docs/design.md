# design-system.md
 
# Design System — Cuidados Pela Vida (Farmácia)
 
> **Versão:** 1.0 (Inferida)
>
> **Fonte da análise:** Interface pública do Cuidados Pela Vida (Farmácia), screenshots fornecidos e inspeção visual do site.
>
> **Observação importante**
>
> Como o Design System oficial da empresa não é público, parte das informações abaixo foi obtida por inspeção visual e outra parte foi inferida com base em padrões modernos de Design Systems (Material, Polaris, Carbon, Atlassian, GOV Design System etc.). Todos os itens marcados com **(Estimativa)** representam inferências.
 
---
 
# Sumário
 
- Paleta de cores
- Tipografia
- Grid e Layout
- Espaçamento
- Bordas
- Sombras
- Componentes
- Ícones
- Responsividade
- Motion
- Tokens
- CSS Variables
- Design Tokens (JSON)
 
---
 
# Paleta de cores
 
## Cores Primárias
 
A identidade visual utiliza predominantemente o rosa institucional combinado com tons de roxo e azul presentes na marca.
 
| Token | HEX | RGB | HSL | Uso |
|--------|------|------|------|-----|
| Primary 500 | #F51C79 | rgb(245,28,121) | hsl(334,92%,54%) | CTA, links, estados ativos |
| Primary 600 | #E0156D *(Estimativa)* | rgb(224,21,109) | hsl(334,83%,48%) | Hover |
| Primary 700 *(Estimativa)* | #C81060 | rgb(200,16,96) | hsl(334,85%,42%) | Pressed |
 
---
 
## Cores Secundárias
 
| Token | HEX | RGB | Uso |
|--------|------|------|-----|
| Purple 500 | #5A2D82 | rgb(90,45,130) | Branding |
| Blue 500 | #00A3E0 *(Estimativa baseada no logo)* | rgb(0,163,224) | Branding |
| Light Pink | #FBE3EE | rgb(251,227,238) | Backgrounds suaves |
 
---
 
## Tons Neutros
 
| Token | HEX |
|--------|------|
| Gray 900 | #202124 |
| Gray 800 | #333333 |
| Gray 700 | #555555 |
| Gray 600 | #666666 |
| Gray 500 | #8A8A8A |
| Gray 400 | #BDBDBD |
| Gray 300 | #DADADA |
| Gray 200 | #EEEEEE |
| Gray 100 | #F6F6F6 |
| White | #FFFFFF |
 
---
 
## Estados
 
### Success
 
| Token | HEX |
|--------|------|
| Success | #22C55E *(Estimativa)* |
 
### Error
 
| Token | HEX |
|--------|------|
| Error | #EF4444 *(Estimativa)* |
 
### Warning
 
| Token | HEX |
|--------|------|
| Warning | #F59E0B *(Estimativa)* |
 
### Information
 
| Token | HEX |
|--------|------|
| Info | #0EA5E9 *(Estimativa)* |
 
---
 
# Tipografia
 
## Família tipográfica
 
Visualmente utiliza uma fonte sans-serif moderna muito próxima de:
 
- Inter (Estimativa)
- Open Sans
- Roboto
- Arial
- sans-serif
 
Fallback:
 
```css
font-family:
Inter,
"Open Sans",
Roboto,
Arial,
sans-serif;
```
 
---
 
## Hierarquia
 
| Estilo | Peso | Tamanho | Line Height | Letter Spacing |
|---------|------|----------|-------------|----------------|
| H1 | 700 | 48px | 56px | -0.5px |
| H2 | 700 | 40px | 48px | -0.4px |
| H3 | 700 | 32px | 40px | -0.3px |
| H4 | 600 | 28px | 36px | 0 |
| H5 | 600 | 24px | 32px | 0 |
| H6 | 600 | 20px | 28px | 0 |
| Subtitle | 600 | 18px | 28px | 0 |
| Body Large | 400 | 18px | 28px | 0 |
| Body | 400 | 16px | 24px | 0 |
| Body Small | 400 | 14px | 20px | 0 |
| Caption | 400 | 12px | 16px | 0 |
| Button | 600 | 16px | 24px | 0 |
| Label | 500 | 14px | 20px | 0 |
 
---
 
# Grid e Layout
 
## Breakpoints
 
| Breakpoint | Largura |
|------------|----------|
| xs | 0–479px |
| sm | 480px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |
| xxl | 1440px |
 
---
 
## Container
 
Desktop:
 
```text
max-width: 1280px
```
 
Wide:
 
```text
1440px (Estimativa)
```
 
---
 
## Grid
 
- 12 colunas
- Gutters: 24px
- Margens laterais:
    - Desktop: 80px
    - Tablet: 32px
    - Mobile: 16px
 
---
 
# Sistema de Espaçamento
 
Escala utilizada (base 4px)
 
| Token | Valor |
|---------|-------|
| xs | 4 |
| sm | 8 |
| md | 12 |
| lg | 16 |
| xl | 24 |
| 2xl | 32 |
| 3xl | 40 |
| 4xl | 48 |
| 5xl | 64 |
| 6xl | 80 |
 
---
 
Padding observado
 
Botão
 
```text
16px 32px
```
 
Input
 
```text
16px
```
 
Cards
 
```text
24px
```
 
Navbar
 
```text
24px
```
 
---
 
# Bordas
 
## Border Radius
 
| Token | Valor |
|---------|-------|
| xs | 4px |
| sm | 8px |
| md | 12px |
| lg | 16px |
| xl | 24px |
| pill | 999px |
 
Observações:
 
Botões:
 
```text
999px
```
 
Cards
 
```text
16px
```
 
Inputs
 
```text
16px
```
 
---
 
## Espessura
 
```text
1px
2px (focus)
```
 
---
 
# Sombras
 
Pouco uso de elevação.
 
## Elevation 1
 
```css
0 2px 8px rgba(0,0,0,.08)
```
 
## Elevation 2
 
```css
0 8px 24px rgba(0,0,0,.12)
```
 
## Elevation 3
 
```css
0 12px 32px rgba(0,0,0,.18)
```
 
---
 
# Componentes
 
## Navbar
 
Características:
 
- Logo
- Mega menu
- Busca
- Localização
- Notificações
- Conta
- Carrinho
 
Altura estimada:
 
```text
72px
```
 
---
 
## Breadcrumb
 
Formato:
 
```
Início / Produtos / Produto
```
 
Cor ativa:
 
Primary
 
---
 
## Botões
 
### Primary
 
Background:
 
Primary 500
 
Texto:
 
Branco
 
Radius:
 
999px
 
Hover:
 
Primary 600
 
---
 
### Secondary
 
Fundo branco
 
Borda cinza
 
Texto escuro
 
---
 
## Inputs
 
Características
 
- Radius 16px
- Border 1px
- Focus verde
- Ícone interno opcional
 
---
 
## Select
 
Mesmo padrão do Input
 
Ícone Chevron
 
---
 
## Cards
 
Observado na seleção de apresentação.
 
Características
 
- Border 1px
- Radius 16px
- Hover
- Estado selecionado
 
---
 
## Checkbox *(Estimativa)*
 
Provavelmente segue padrão:
 
- 20x20
- Radius 4px
 
---
 
## Radio
 
Estimativa:
 
- 20x20
- Filled Primary
 
---
 
## Alertas
 
Estimativa
 
Success
 
Verde
 
Warning
 
Amarelo
 
Danger
 
Vermelho
 
Info
 
Azul
 
---
 
## Badges
 
Observado:
 
Quantidade do carrinho
 
Características
 
- Circular
- Rosa
- Texto branco
 
---
 
## Footer
 
Estrutura esperada
 
- Links
- Institucional
- Redes sociais
- Copyright
 
---
 
## Paginação
 
Não identificada
 
Estimativa:
 
- Botões numéricos
- Next / Previous
 
---
 
## Tabelas
 
Não encontradas.
 
---
 
# Ícones
 
Muito semelhantes ao:
 
- Material Symbols Outlined
- Heroicons
- Remix Icon
 
(Estimativa)
 
Tamanhos
 
| Uso | Tamanho |
|------|----------|
| Small | 16 |
| Default | 20 |
| Large | 24 |
| Hero | 32 |
 
Espessura
 
```text
2px
```
 
---
 
# Responsividade
 
## Desktop
 
Imagem + informações em duas colunas.
 
```
Imagem | Conteúdo
```
 
---
 
## Tablet
 
Imagem reduzida.
 
Cards reorganizados.
 
---
 
## Mobile
 
Provavelmente:
 
Imagem
 
↓
 
Nome
 
↓
 
Preço
 
↓
 
Cards
 
↓
 
CTA
 
↓
 
Descrição
 
Botão ocupa largura total.
 
---
 
# Motion
 
Estimativa
 
Hover
 
```css
transition: .2s ease;
```
 
Botões
 
```css
transform: translateY(-1px);
```
 
Focus
 
Outline + Border
 
---
 
# Tokens
 
## Colors
 
```
color.primary.500
color.primary.600
color.gray.100
color.gray.900
color.success
color.warning
color.error
color.info
```
 
---
 
## Typography
 
```
font.family.base
 
font.size.xs
font.size.sm
font.size.md
font.size.lg
font.size.xl
 
font.weight.regular
font.weight.medium
font.weight.semibold
font.weight.bold
```
 
---
 
## Radius
 
```
radius.sm
radius.md
radius.lg
radius.pill
```
 
---
 
## Shadows
 
```
shadow.sm
shadow.md
shadow.lg
```
 
---
 
## Spacing
 
```
space.1
space.2
space.3
space.4
space.5
space.6
space.8
space.10
space.12
space.16
space.20
```
 
---
 
## Z-index
 
| Token | Valor |
|--------|--------|
| dropdown | 100 |
| sticky | 200 |
| overlay | 400 |
| modal | 1000 |
| toast | 1100 |
| tooltip | 1200 |
 
(Estimativa)
 
---
 
## Opacity
 
| Token | Valor |
|--------|--------|
| disabled | .38 |
| hover | .08 |
| pressed | .12 |
| overlay | .60 |
 
---
 
# Convenção de nomenclatura
 
Segue padrão semelhante ao Design Tokens Community Group.
 
```
color.primary.500
 
color.gray.200
 
space.4
 
radius.lg
 
shadow.md
 
font.size.md
 
font.weight.bold
```
 
---
 
# CSS Variables
 
```css
:root{
 
--color-primary:#F51C79;
--color-primary-hover:#E0156D;
 
--color-purple:#5A2D82;
--color-blue:#00A3E0;
 
--color-white:#FFFFFF;
--color-gray-900:#202124;
--color-gray-100:#F6F6F6;
 
--color-success:#22C55E;
--color-error:#EF4444;
--color-warning:#F59E0B;
--color-info:#0EA5E9;
 
--space-1:4px;
--space-2:8px;
--space-3:12px;
--space-4:16px;
--space-5:24px;
--space-6:32px;
--space-7:40px;
--space-8:48px;
--space-9:64px;
 
--radius-sm:8px;
--radius-md:12px;
--radius-lg:16px;
--radius-pill:999px;
 
--shadow-sm:0 2px 8px rgba(0,0,0,.08);
--shadow-md:0 8px 24px rgba(0,0,0,.12);
--shadow-lg:0 12px 32px rgba(0,0,0,.18);
 
}
```
 
---
 
# Design Tokens (JSON)
 
```json
{
  "color": {
    "primary": {
      "500": "#F51C79",
      "600": "#E0156D"
    },
    "secondary": {
      "purple": "#5A2D82",
      "blue": "#00A3E0"
    },
    "neutral": {
      "900": "#202124",
      "100": "#F6F6F6",
      "0": "#FFFFFF"
    },
    "state": {
      "success": "#22C55E",
      "error": "#EF4444",
      "warning": "#F59E0B",
      "info": "#0EA5E9"
    }
  },
  "spacing": {
    "1": 4,
    "2": 8,
    "3": 12,
    "4": 16,
    "5": 24,
    "6": 32,
    "7": 40,
    "8": 48,
    "9": 64
  },
  "radius": {
    "sm": 8,
    "md": 12,
    "lg": 16,
    "pill": 999
  },
  "shadow": {
    "sm": "0 2px 8px rgba(0,0,0,.08)",
    "md": "0 8px 24px rgba(0,0,0,.12)",
    "lg": "0 12px 32px rgba(0,0,0,.18)"
  },
  "typography": {
    "family": {
      "base": "Inter, Lexend, Open Sans, Roboto, Arial, sans-serif"
    },
    "weight": {
      "regular": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    }
  }
}
```
