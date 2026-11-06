$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$applicationFolder = Join-Path $projectRoot 'home'
$electronCandidates = @()
if ($env:CABANON_ELECTRON -and (Test-Path -LiteralPath $env:CABANON_ELECTRON -PathType Leaf)) {
  $electronCandidates += $env:CABANON_ELECTRON
}
$electronCandidates += @(
  (Join-Path $applicationFolder 'node_modules\electron\dist\electron.exe'),
  (Join-Path $projectRoot 'node_modules\electron\dist\electron.exe'),
  (Join-Path (Split-Path -Parent $projectRoot) 'blind\node_modules\electron\dist\electron.exe'),
  (Join-Path (Split-Path -Parent $projectRoot) 'cabanon\node_modules\electron\dist\electron.exe')
)
$electronBinary = $electronCandidates | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
if (-not $electronBinary) { throw 'Electron not found. Install the project dependencies first.' }
$electronBinary = (Resolve-Path -LiteralPath $electronBinary).Path

$shortcutPath = Join-Path $applicationFolder 'start.lnk'
$shortcutShell = New-Object -ComObject WScript.Shell
$shortcut = $shortcutShell.CreateShortcut($shortcutPath)
# Launch the application itself: no cmd.exe or start.cmd in the shortcut chain.
$shortcut.TargetPath = $electronBinary
$shortcut.Arguments = '"' + $applicationFolder + '"'
$shortcut.WorkingDirectory = $applicationFolder
$shortcut.WindowStyle = 1
$shortcut.Description = 'Start Cabanon'
$shortcut.IconLocation = $electronBinary + ',0'
$shortcut.Save()
Write-Output $shortcutPath
