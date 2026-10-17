# Dobra Ateliê

Site interativo em português para criar caixas montáveis de amigurumi. Recebe as medidas da peça e gera um PDF vetorial em A4, em escala real, preservando as faces inteiras.

## Executar

Requer Node.js 20 ou superior. Não há dependências externas, chaves de API, banco de dados ou serviços pagos.

```bash
npm run dev
```

Abra `http://localhost:5173`. Para compilar e conferir o projeto:

```bash
npm test
npm run build
```

O resultado é `dist/index.html`: um arquivo independente, com CSS e JavaScript incorporados, que também pode ser aberto diretamente no navegador. Não depende de CDN nem baixa fontes ou bibliotecas.

## GitHub

Código-fonte: [deborahsales/dobra-amigurumi](https://github.com/deborahsales/dobra-amigurumi).

Para obter uma cópia local, com acesso autorizado ao repositório:

```bash
git clone https://github.com/deborahsales/dobra-amigurumi.git
cd dobra-amigurumi
npm run dev
```

Há uma rotina de CI em `.github/workflows/ci.yml` para executar os testes e compilar em cada push ou pull request.

## Vercel

Importe **deborahsales/dobra-amigurumi** no painel **Add New → Project**. O arquivo `vercel.json` já define:

| Configuração | Valor |
| --- | --- |
| Framework Preset | Other |
| Root Directory | Raiz do repositório (`./`) |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Environment Variables | Nenhuma |

Publique. Os próximos commits na branch de produção serão implantados pela integração Git da Vercel. Referências oficiais: [configuração de builds](https://vercel.com/docs/builds/configure-a-build), [vercel.json](https://vercel.com/docs/project-configuration/vercel-json) e [integração Git](https://vercel.com/docs/git).

## O que o site faz

- Medidas do amigurumi em centímetros, com folga opcional acrescentada a cada dimensão total.
- Três tipos de tampa: embutir, separada e embutir com alça de linguetas.
- Fundo com abas laterais, painel principal com rasgo e lingueta de travamento. O fechamento do fundo não usa cola. As emendas das faces e as abas que saem separadas usam cola por dentro.
- Opção de visor em acrílico ou acetato, com seleção independente de frente, verso e duas laterais. A moldura é ajustável.
- Medidas de corte do material transparente calculadas com 5 mm de sobreposição em cada borda. O visor é aplicado por dentro; não há trilho para acrílico rígido.
- Oito coleções de arte vetorial: jardim, bosque, safari, céu, oceano, fé e afeto, festa e liso.
- Texto de tema reconhecido por palavras-chave. Temas não reconhecidos mantêm a coleção escolhida e sugerem enviar uma imagem. **Não há geração por IA de qualquer tema livre.**
- Arte própria PNG/JPG/WebP colocada na frente e no verso. O fundo transparente de uma imagem é composto sobre a cor de fundo escolhida; a imagem é incorporada ao PDF como JPEG.
- Prévia tridimensional que gira, simulação dos visores, e prévia de cada folha A4.
- PDF vetorial para a arte padrão; imagens enviadas mantêm sua natureza raster. Sem textos, medidas, números, instruções ou marcas de página visíveis. O tema não é impresso como texto.
- Vincos opcionais, modo de economia de tinta, margem imprimível e espessura de papel ajustáveis.
- Salvar e abrir projeto em JSON, inclusive imagem enviada. As configurações são lembradas por `localStorage`; a imagem só é preservada ao salvar o projeto em JSON.
- Impressão pelo navegador como alternativa ao PDF.

## Como as faces cabem no A4

Todas as coordenadas são calculadas em milímetros. As paredes laterais permanecem inteiras. As emendas ficam nas uniões entre faces ou entre uma face e uma aba. Cada parede tem uma aba de união na direita; quando necessário, é utilizada uma tira interna separada. Abas superiores e inferiores são preservadas junto ao corpo quando cabem e separadas na dobra quando necessário.

As peças são distribuídas nas folhas por um algoritmo MaxRects com rotação rígida de 90°, sem redução de escala. O encaixe prioriza usar folhas existentes; não promete a quantidade mínima matemática de folhas. Se uma face ou peça indivisível não couber com a margem escolhida, a exportação é bloqueada e o site orienta reduzir medidas, folga ou margem. Não há modo que recorte uma face em várias páginas.

O PDF declara páginas de 210 × 297 mm e preferência de impressão sem escala. O diálogo da impressora ainda deve ser configurado em **Tamanho real / 100%**, A4 e impressão em uma face.

## Montagem e limites físicos

O guia interativo mostra as instruções fora do arquivo de impressão. A sequência é: recortar, vincar, aplicar os visores, colar as emendas internas das paredes, unir eventuais abas separadas, encaixar o fundo e fechar a tampa.

As medidas informadas, mais a folga, são o espaço interno alvo. A espessura de papel ajusta as medidas de vinco e a folga da tampa separada. Isso é uma aproximação para papel/cartolina, não uma simulação física do material. A espessura do visor não é descontada do espaço interno. A alça é decorativa e não foi dimensionada para transporte de carga.

Faça um protótipo para avaliar o ajuste do papel, da cola e do visor, e a resistência do fundo ao peso da peça. Nenhum modelo foi validado por montagem física ou por máquina de corte industrial.

## Organização

```text
index.html                 Interface e campos acessíveis
src/style.css              Layout responsivo e prévia 3D em CSS
src/engine.js              Geometria, temas, visores, planejamento A4, SVG e PDF
src/app.js                 Interações, uploads e persistência local
scripts/build.mjs          Compilação sem dependências para HTML independente
scripts/serve.mjs          Servidor local de desenvolvimento
tests/engine.test.mjs      Testes das regras de fabricação e exportação
vercel.json               Configuração de deploy
.github/workflows/ci.yml   Testes e build no GitHub
```

## Verificação realizada

Foram executados os testes automatizados de geometria, preservação de faces, limites A4, rotação sem escala, sobreposição, visores por face, posicionamento da trava, texto ausente no PDF e configuração dos temas. Os PDFs das três tampas e de um modelo compacto foram abertos por um leitor PDF independente; páginas A4 e ausência de texto foram verificadas, e as páginas renderizadas foram inspecionadas visualmente.

Não foi executada uma sessão de navegador real neste ambiente. Verifique a prévia 3D, envio de imagens e downloads em Chrome/Safari, incluindo um celular, antes de colocar o site em produção.
