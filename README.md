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

O resultado é `dist/index.html`: um arquivo independente, com CSS, JavaScript e contornos vetoriais das fontes incorporados, que também pode ser aberto diretamente no navegador. Não depende de CDN nem baixa fontes ou bibliotecas.

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
- Duas cores independentes: **cor principal** para o fundo da caixa e **cor dos detalhes** para desenhos, enfeites e textos. O modo de economia de tinta usa fundo branco durante a impressão/prévia sem apagar a cor escolhida.
- Vinte coleções de arte vetorial: jardim, bosque, safari, céu, oceano, fé e afeto, festa, liso, ursinho, gatinho, cachorrinho, dinossauro, unicórnio, borboletas, abelhinhas, arco-íris, astronauta, sereia, Natal e fazendinha.
- Texto de tema reconhecido por palavras-chave. Temas não reconhecidos mantêm a coleção escolhida e sugerem enviar uma imagem. **Não há geração por IA de qualquer tema livre.**
- Pedido de arte preparado localmente a partir do tema digitado, cores, medidas e visores. Por padrão, pede uma única composição quadrada que será repetida nas quatro faces, sem colagem ou variações. Pode ser copiado para usar em um gerador externo de imagens; também permite preparar uma face específica e escolher entre cinco estilos. O site não faz chamadas a uma API de IA.
- Uma arte própria PNG/JPG/WebP pode preencher as quatro faces com um único envio. O botão **Usar nas quatro** também reaproveita qualquer imagem já enviada. Até quatro artes diferentes continuam disponíveis, com troca e remoção independentes. A imagem é centralizada e ajustada proporcionalmente, sem deformação. O PNG original transparente é preservado; seu fundo é recomposto na cor atual ao gerar o PDF, que incorpora a arte como JPEG. Cada arquivo pode ter até 12 MB, e sua resolução é limitada a 1600 px no maior lado.
- Textos opcionais e independentes nas quatro faces, até 80 caracteres por face. Quatro estilos: Clássica, Moderna, Delicada e Marcante. O usuário escolhe tamanho (9 a 30 pt) e posição (em cima, ao centro ou embaixo). O texto usa a cor dos detalhes e se ajusta automaticamente à largura disponível.
- Nas faces com visor, os textos permanecem na moldura superior ou inferior. A opção central usa a moldura inferior. Se o texto não couber de forma legível, a exportação é bloqueada e o site pede para encurtá-lo ou ampliar a moldura.
- Prévia tridimensional que gira, simulação dos visores, e prévia de cada folha A4.
- PDF vetorial para a arte padrão e os textos escolhidos; imagens enviadas mantêm sua natureza raster. A tipografia usa os mesmos contornos vetoriais na prévia e no PDF, incluindo acentos em português. Não há medidas, nomes de peças, instruções ou marcas de página visíveis. O tema digitado não é impresso como texto.
- Vincos opcionais, modo de economia de tinta, margem imprimível e espessura de papel ajustáveis.
- Salvar e abrir projeto em JSON, incluindo as quatro imagens, os textos, as cores e a fonte escolhida. As configurações são lembradas por `localStorage`; as imagens só são preservadas ao salvar o projeto em JSON. Projetos antigos continuam abrindo: a antiga cor passa a ser a cor dos detalhes e a imagem única continua na frente e no verso.
- Impressão pelo navegador como alternativa ao PDF.

## Como as faces cabem no A4

Todas as coordenadas são calculadas em milímetros. As paredes laterais permanecem inteiras. As emendas ficam nas uniões entre faces ou entre uma face e uma aba. Cada parede tem uma aba de união na direita; quando necessário, é utilizada uma tira interna separada. Abas superiores e inferiores são preservadas junto ao corpo quando cabem e separadas na dobra quando necessário.

As peças são distribuídas nas folhas por um algoritmo MaxRects com rotação rígida de 90°, sem redução de escala. O encaixe prioriza usar folhas existentes; não promete a quantidade mínima matemática de folhas. Se uma face ou peça indivisível não couber com a margem escolhida, a exportação é bloqueada e o site orienta reduzir medidas, folga ou margem. Não há modo que recorte uma face em várias páginas.

O PDF declara páginas de 210 × 297 mm e preferência de impressão sem escala. O diálogo da impressora ainda deve ser configurado em **Tamanho real / 100%**, A4 e impressão em uma face.

## Preparar uma arte sem integração paga

1. Digite o tema desejado e escolha as cores.
2. Abra **Preparar uma arte para meu tema**. Escolha o estilo e mantenha **Uma arte para todas**, que pede apenas uma imagem reutilizável.
3. Clique em **Copiar pedido**. Use **Abrir ChatGPT** ou cole em outro gerador de imagens que você utiliza, conforme os recursos e limites da sua conta.
4. Salve a imagem gerada e envie em **Uma imagem para todas**. Ela será aplicada na frente, no verso e nas duas laterais. Se a imagem já estiver em uma face, clique em **Usar nas quatro** nesse cartão.
5. Se quiser variar alguma face, troque somente a imagem daquele cartão. O pedido para uma face específica continua disponível.

O pedido padrão descreve uma única composição quadrada, com elementos inteiros e margem transparente, que funciona sozinha em cada face. Evita panoramas, quadrantes, colagens e pedidos de quatro arquivos separados. As medidas indicam os limites de aplicação, e a arte se ajusta proporcionalmente mesmo quando a largura das laterais difere da frente. Nas faces com visor, a abertura recorta a imagem, inclusive elementos centrais; remova ou troque a arte nessas faces se necessário.

O pedido não solicita moldes, cotas ou textos: a geometria e a tipografia continuam a cargo do Dobra. O prompt não é incluído na impressão. Seu preparo não requer chave de API, cadastro adicional nem conexão automática com outro serviço. A geração da imagem ocorre fora do site, por ação do usuário.

## Montagem e limites físicos

O guia interativo mostra as instruções fora do arquivo de impressão. A sequência é: recortar, vincar, aplicar os visores, colar as emendas internas das paredes, unir eventuais abas separadas, encaixar o fundo e fechar a tampa.

As medidas informadas, mais a folga, são o espaço interno alvo. A espessura de papel ajusta as medidas de vinco e a folga da tampa separada. Isso é uma aproximação para papel/cartolina, não uma simulação física do material. A espessura do visor não é descontada do espaço interno. A alça é decorativa e não foi dimensionada para transporte de carga.

Faça um protótipo para avaliar o ajuste do papel, da cola e do visor, e a resistência do fundo ao peso da peça. Nenhum modelo foi validado por montagem física ou por máquina de corte industrial.

## Organização

```text
index.html                 Interface e campos acessíveis
src/style.css              Layout responsivo e prévia 3D em CSS
src/engine.js              Geometria, temas, visores, planejamento A4, SVG e PDF
src/fonts.js               Subconjuntos de fontes como contornos vetoriais
src/app.js                 Interações, uploads e persistência local
scripts/build.mjs          Compilação sem dependências para HTML independente
scripts/serve.mjs          Servidor local de desenvolvimento
tests/engine.test.mjs      Testes das regras de fabricação e exportação
tests/fixtures/images.json Quatro imagens sintéticas para conferir cada face
FONT-LICENSE.txt           Licença das fontes derivadas de DejaVu
vercel.json               Configuração de deploy
.github/workflows/ci.yml   Testes e build no GitHub
```

## Verificação realizada

Foram executados 21 testes automatizados de geometria, preservação de faces, limites A4, rotação sem escala, sobreposição, visores por face, posicionamento da trava, ausência de textos quando desligados, vinte temas, cores independentes, quatro imagens, uma arte repetida sem deformação, migração de projetos, fontes com acentos e geração dos pedidos de arte. PDFs das tampas e de modelos com artes, textos e visores foram abertos por um leitor PDF independente; as páginas A4 e a renderização foram conferidas. Os textos opcionais são contornos vetoriais; não usam fontes externas nem dependem das fontes instaladas no dispositivo.

As fontes Dobra são subconjuntos derivados de DejaVu com a licença incluída em `FONT-LICENSE.txt`. `scripts/prepare-fonts.py` permite regenerá-los com FontTools e os arquivos DejaVu disponíveis localmente. Essa ferramenta de manutenção não é executada no build e não adiciona dependências Python ao deploy.

Não foi executada uma sessão de navegador real neste ambiente. Verifique a prévia 3D, envio de imagens e downloads em Chrome/Safari, incluindo um celular, antes de colocar o site em produção.
