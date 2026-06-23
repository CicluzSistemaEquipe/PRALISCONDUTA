# Contexto do Projeto Pralis

## Estrutura de Pastas

### Design — `E:\Cicluz\Pralis-Conduta\Design`
Todo o material de identidade visual da marca:
- Paleta de cores
- Fontes/tipografia
- Manual da marca
- Demais ativos visuais

### Referências — `E:\Cicluz\Pralis-Conduta\Referencias`
Principal fonte de inspiração e direcionamento para criações. Consultar sempre antes de criar qualquer coisa.

### Sistema — `E:\Cicluz\Pralis-Conduta\Sistema`
Pasta de desenvolvimento. O sistema será desenvolvido aqui via VS Code.

## Fluxo de trabalho
1. Consultar `Referencias` para direcionamento criativo
2. Consultar `Design` para identidade visual (cores, fontes, manual)
3. Desenvolver o sistema em `Sistema` via VS Code

## Armazenamento de mídia (IMPORTANTE)

Os **vídeos brutos `.mov` (~5 GB no total)** ficam **apenas localmente** em
`E:\Cicluz\Pralis-Conduta\Sistema\public\` e **NÃO sobem para o GitHub**.

Motivo: o GitHub rejeita arquivos acima de 100 MB, e vários desses `.mov` têm
de 100 MB a 760 MB. São arquivos-fonte de edição (exports brutos, versões
`-clean`, `.gif`, `.sfk` e pastas de frames) que o aplicativo **não usa em
tempo de execução**. Eles estão listados no `.gitignore` (regras `public/*.mov`,
`*.gif`, `*.jpeg`, `*.sfk` e as pastas de frames).

O que **é versionado** no repositório é apenas a mídia **realmente referenciada
no código** (~12 MB no total):
- vídeos finais leves: `*-alpha.webm` (com canal alpha/colorkey) e
  `videocirculo-dashboard.mp4`;
- áudios de narração: `audio-*.mp3`.

> Ao clonar o repositório, o app roda normalmente com essas mídias leves. Se for
> preciso reeditar os vídeos, use os arquivos `.mov` brutos da pasta `public/`
> local (ou um backup em Google Drive/S3). **Recomendado:** manter um backup
> desses brutos fora da máquina, pois eles não estão no controle de versão.
