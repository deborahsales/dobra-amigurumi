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
- Duas cores independentes para personalizar as coleções prontas e os textos: **cor principal** para o fundo da caixa e **cor dos detalhes** para desenhos, enfeites e textos. A paleta do prompt é escolhida pela IA, sem receber essas cores. O modo de economia de tinta usa fundo branco durante a impressão/prévia sem apagar a cor escolhida.
- Vinte coleções de arte vetorial: jardim, bosque, safari, céu, oceano, fé e afeto, festa, liso, ursinho, gatinho, cachorrinho, dinossauro, unicórnio, borboletas, abelhinhas, arco-íris, astronauta, sereia, Natal e fazendinha.
- Texto de tema reconhecido por palavras-chave. Temas não reconhecidos mantêm a coleção escolhida e sugerem enviar uma imagem. **Não há geração por IA de qualquer tema livre.**
- Pedido de arte preparado localmente a partir do tema digitado, estilo, medidas e visores. As cores selecionadas no site não entram no prompt: a IA escolhe uma paleta harmoniosa e um fundo próprio conforme o tema. Por padrão, pede um único panorama com frente → lateral direita → verso → lateral esquerda, lado a lado. Informa a largura total, altura, proporção e a largura e posição de cada face. Também permite preparar uma face específica e escolher entre cinco estilos. O site não faz chamadas a uma API de IA.
- **Enviar panorama** recebe uma única imagem PNG/JPG/WebP e divide sua largura nas proporções reais das quatro faces. Cada face recebe apenas o trecho correspondente em toda sua área; não é uma repetição da imagem inteira. A prévia mostra guias e medidas que não são impressas. As divisões automáticas acompanham as medidas. O usuário pode arrastar os três cortes sobre a imagem ou usar os controles de posição; cortes manuais são preservados quando as medidas mudam, e **Restaurar cortes automáticos** volta à divisão pelas larguras físicas.
- O panorama mantém todos os pixels horizontais e a proporção da imagem, ajustando pela largura total. Se a proporção gerada diferir da solicitada, a altura é centralizada e pode ter recorte ou espaço livre em cima e embaixo. O site sinaliza essa diferença para conferência. Quando a IA posicionar as composições de outra forma, os cortes podem ser ajustados manualmente. O site não identifica personagens ou separadores desenhados pela ferramenta. Cada trecho selecionado mantém a proporção e pode ter seu enquadramento ajustado por face.
- **Ajustar arte**, em cada face, permite ampliar ou reduzir de 10% a 500%, arrastar a imagem e ajustar a posição horizontal e vertical por controles. **Caber na face** mostra a imagem inteira; **Preencher face** cobre a área; **Restaurar** recupera a aplicação inicial. Os ajustes funcionam também nos trechos do panorama e são idênticos na prévia e no PDF. O recorte de um trecho do panorama permanece isolado, mesmo ao diminuir ou mover a imagem.
- Até quatro artes individuais continuam disponíveis, com troca e remoção independentes. Elas usam a aplicação centralizada anterior, e **Repetir nas quatro** reaproveita a mesma ilustração inteira. **Aplicar nas quatro** restaura os quatro trechos do panorama. **Remover panorama** mantém imagens individuais que tenham substituído algum trecho.
- O PNG original transparente é preservado; as áreas transparentes recebem a cor de fundo atual no PDF, que incorpora a arte como JPEG. O panorama substitui os desenhos da coleção nas faces em que está aplicado. Cada arquivo pode ter até 12 MB: panoramas são limitados a 4096 px no maior lado e artes individuais a 1600 px.
- Textos opcionais e independentes nas quatro faces, até 80 caracteres por face. Doze estilos criativos: Manuscrita, Feita à mão, Rabiscada, Arredondada, Retrô, Divertida, Quadrinhos, Fofinha, Alongada, Balão, Descontraída e Desenhada. As opções anteriores com serifa e de máquina de escrever são substituídas automaticamente ao abrir projetos salvos, preservando os textos e tamanhos escolhidos. O usuário escolhe tamanho (9 a 120 pt) e posição (em cima, ao centro ou embaixo). O texto usa a cor dos detalhes e se ajusta automaticamente ao espaço disponível. A área de texto cresce para permitir tamanhos maiores em faces sem visor; quando é preciso reduzir a fonte, a interface informa o tamanho efetivo por face. Acentos, letras inclinadas e seus limites reais são considerados para não cortar os caracteres.
- Nas faces com visor, os textos permanecem na moldura superior ou inferior. A opção central usa a moldura inferior. Se o texto não couber de forma legível, a exportação é bloqueada e o site pede para encurtá-lo ou ampliar a moldura.
- Prévia tridimensional que gira, simulação dos visores, e prévia de cada folha A4.
- PDF vetorial para a arte padrão e os textos escolhidos; imagens enviadas mantêm sua natureza raster. A tipografia usa os mesmos contornos vetoriais na prévia e no PDF, incluindo acentos em português. Não há medidas, nomes de peças, instruções ou marcas de página visíveis. O tema digitado não é impresso como texto.
- Vincos opcionais, modo de economia de tinta, margem imprimível e espessura de papel ajustáveis.
- Salvar e abrir projeto em JSON, incluindo o panorama, as posições dos cortes, os ajustes de tamanho e posição por face, as imagens individuais, os textos, as cores e a fonte escolhida. O formato v3 guarda imagens compartilhadas uma só vez, com referências por face; projetos v1 e v2 continuam abrindo. As configurações são lembradas por `localStorage`; as imagens só são preservadas ao salvar o projeto em JSON. Projetos antigos continuam abrindo: a antiga cor passa a ser a cor dos detalhes e a imagem única continua na frente e no verso.
- Impressão pelo navegador como alternativa ao PDF.

## Como as faces cabem no A4

Todas as coordenadas são calculadas em milímetros. As paredes laterais permanecem inteiras. As emendas ficam nas uniões entre faces ou entre uma face e uma aba. Cada parede tem uma aba de união na direita; quando necessário, é utilizada uma tira interna separada. Abas superiores e inferiores são preservadas junto ao corpo quando cabem e separadas na dobra quando necessário.

As peças são distribuídas nas folhas por um algoritmo MaxRects com rotação rígida de 90°, sem redução de escala. O encaixe prioriza usar folhas existentes; não promete a quantidade mínima matemática de folhas. Se uma face ou peça indivisível não couber com a margem escolhida, a exportação é bloqueada e o site orienta reduzir medidas, folga ou margem. Não há modo que recorte uma face em várias páginas.

O PDF declara páginas de 210 × 297 mm e preferência de impressão sem escala. O diálogo da impressora ainda deve ser configurado em **Tamanho real / 100%**, A4 e impressão em uma face.

## Preparar uma arte sem integração paga

1. Informe as medidas da peça, a folga e o tema. As cores do site personalizam as coleções prontas e os textos; a IA escolhe as cores da arte gerada.
2. Abra **Preparar uma arte para meu tema**. Escolha o estilo e mantenha **Panorama das 4 faces**.
3. Clique em **Copiar pedido**. Use **Abrir ChatGPT** ou cole em outro gerador de imagens que você utiliza, conforme os recursos e limites da sua conta.
4. Salve o arquivo único, com as quatro faces em uma fileira e sem molduras externas, guias ou espaços entre elas. Envie em **Enviar panorama**.
5. Confira a imagem e arraste as três linhas para ajustar as divisões, se necessário. Também é possível usar os controles abaixo do panorama. Os cortes não se cruzam; cada face ocupa pelo menos 1% da largura da imagem.
6. Abra **Ajustar arte** em cada cartão. Arraste a imagem, ajuste o tamanho e a posição, ou use **Caber na face** / **Preencher face**. A prévia 3D e o PDF A4 acompanham os ajustes. Você pode substituir qualquer imagem individualmente.
7. Use **Salvar projeto** para conservar as imagens, os cortes e os enquadramentos. **Restaurar cortes automáticos** recupera somente a divisão pelas medidas; **Restaurar**, em cada face, recupera somente o enquadramento daquela imagem.

A largura da arte é `2 × (largura da face frontal + largura da face lateral)`; a altura é a altura final da face. Essas dimensões já incluem a folga e o ajuste de espessura usados no molde. Por exemplo, nas medidas padrão de 19 × 8 × 7 cm, com folga de 0,5 cm e papel de 0,3 mm, o panorama mede **32,12 × 19,53 cm**. As faixas, da esquerda para a direita, têm **8,53 / 7,53 / 8,53 / 7,53 cm**.

O pedido informa também as posições acumuladas e percentuais das faixas. Não pede linhas divisórias, medidas escritas, tampa, fundo de encaixe ou abas: somente a arte plana das quatro paredes. A imagem atravessa as emendas entre faces, e o arquivo A4 continua preservando cada face inteira. Nas faces com visor, o pedido orienta manter elementos importantes na moldura; a abertura recorta o centro da arte.

O prompt e as guias de divisão não são incluídos na impressão. Seu preparo não requer chave de API, cadastro adicional nem conexão automática com outro serviço. A geração da imagem ocorre fora do site, por ação do usuário.

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
tests/fixtures/panorama.json Panorama sintético com faixas de larguras diferentes
FONT-LICENSE.txt           Créditos e licenças dos subconjuntos de fontes
scripts/font-sources.json  Origens, versões e hashes das fontes criativas
vercel.json               Configuração de deploy
.github/workflows/ci.yml   Testes e build no GitHub
```

## Verificação realizada

Foram executados 37 testes automatizados de geometria, preservação de faces, limites A4, rotação sem escala, sobreposição, visores por face, posicionamento da trava, ausência de textos quando desligados, vinte temas, cores independentes, quatro imagens, uma arte repetida sem deformação, panorama com recortes proporcionais e manuais, zoom, deslocamento por face, isolamento de trechos, coordenadas decimais válidas no PDF, mudança de medidas, migração de projetos, doze fontes criativas com acentos, migração das fontes antigas nos três formatos de projeto, caracteres sem recorte em tamanho grande, fontes de até 120 pt e pedidos de arte independentes das cores selecionadas. PDFs das tampas e de modelos com artes, textos e visores foram abertos por um leitor PDF independente; as páginas A4 e a renderização foram conferidas. Na atualização do panorama, 48 amostras de cor renderizadas por um leitor independente confirmaram os trechos corretos, as larguras e a orientação nas três tampas, incluindo um visor. Na atualização dos controles, outros 23 pontos renderizados confirmaram os cortes manuais, o zoom, o deslocamento e as margens sem vazamento de faces vizinhas. Uma prova das doze fontes e caixas com textos a 120 pt e visores também foram renderizadas e inspecionadas. Os textos opcionais são contornos vetoriais; não usam fontes externas nem dependem das fontes instaladas no dispositivo.

As fontes Dobra são subconjuntos modificados de Caveat, Patrick Hand, Kalam, Fredoka, Pacifico, Chewy, Bangers, Lilita One, Amatic SC, Baloo 2, Indie Flower e Architects Daughter, com DejaVu Sans para símbolos e caracteres adicionais. Cada família inclui seus próprios acentos portugueses. Créditos e licenças OFL, Apache e DejaVu estão completos em `FONT-LICENSE.txt` e incorporados ao HTML independente. `scripts/font-sources.json` fixa o commit e os hashes dos arquivos oficiais do repositório Google Fonts. `python scripts/prepare-fonts.py` permite regenerá-los com FontTools, DejaVu Sans e acesso aos arquivos oficiais; os downloads são conferidos e guardados em `.font-cache/`. Essa ferramenta de manutenção não é executada no build e não adiciona dependências Python ao deploy. Os contornos gerados já estão no repositório.

Não foi executada uma sessão de navegador real neste ambiente. Verifique a prévia 3D, envio de imagens e downloads em Chrome/Safari, incluindo um celular, antes de colocar o site em produção.
