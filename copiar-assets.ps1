# ============================================================
# Pralis Conduta — copiar assets de marca para o projeto
# Execute no terminal do VS Code:  .\copiar-assets.ps1
# Idempotente: pode rodar quantas vezes quiser.
# ============================================================

$ErrorActionPreference = 'Stop'
$root    = $PSScriptRoot
$design  = Join-Path (Split-Path $root -Parent) 'Design'   # ..\Design
$destino = Join-Path $root 'src\assets\brand'
$drop    = Join-Path $root 'assets'                          # pasta opcional p/ extras

New-Item -ItemType Directory -Force -Path $destino | Out-Null

function Copiar($src, $nome) {
  if (Test-Path -LiteralPath $src) {
    Copy-Item -LiteralPath $src -Destination (Join-Path $destino $nome) -Force
    Write-Host "  ok  $nome" -ForegroundColor Green
  } else {
    Write-Host "  --  faltando: $(Split-Path $src -Leaf)" -ForegroundColor DarkYellow
  }
}

Write-Host "`nCopiando logos de '$design'..." -ForegroundColor Cyan
$png = Join-Path $design 'PNG (Web)'
Copiar (Join-Path $png 'Pralis-Logotipo-Final-RGB_03-Logotipo-Primario-Cor-Laranja.png') 'logo-primario-laranja.png'
Copiar (Join-Path $png 'Pralis-Logotipo-Final-RGB_01-Logotipo-Primario-Cor-Bege.png')    'logo-primario-bege.png'
Copiar (Join-Path $png 'Pralis-Logotipo-Final-RGB_06-Logotipo-Primario-Fundo-Bordo.png') 'logo-primario-fundo-bordo.png'
Copiar (Join-Path $png 'Pralis-Logotipo-Final-RGB_09-Logotipo-Secundario-Cor-Bege.png')  'logo-secundario-bege.png'
Copiar (Join-Path $png 'Pralis-Logotipo-Final-RGB_13-Logotipo-Secundario-Cor-Bordo.png') 'logo-secundario-bordo.png'

# Extras opcionais: qualquer coisa que você jogar em .\assets\ também é copiada
if (Test-Path $drop) {
  Write-Host "`nCopiando extras de '$drop'..." -ForegroundColor Cyan
  Copy-Item "$drop\*" -Destination $destino -Recurse -Force
}

Write-Host "`nAssets em src/assets/brand/:" -ForegroundColor Cyan
Get-ChildItem $destino | ForEach-Object { Write-Host "  - $($_.Name)" }
Write-Host "`nConcluido.`n" -ForegroundColor Green
