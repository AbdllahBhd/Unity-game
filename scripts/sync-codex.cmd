@echo off
rem Windows wrapper: runs sync-codex.sh through GIT BASH (not the WSL bash stub,
rem which "bash" resolves to in PowerShell/cmd and fails without a WSL distro).
rem Usage from PowerShell or cmd, at the repo root:  scripts\sync-codex.cmd
setlocal
set "BASH="
if exist "%ProgramFiles%\Git\bin\bash.exe" set "BASH=%ProgramFiles%\Git\bin\bash.exe"
if not defined BASH if exist "%ProgramFiles(x86)%\Git\bin\bash.exe" set "BASH=%ProgramFiles(x86)%\Git\bin\bash.exe"
if not defined BASH if exist "%LocalAppData%\Programs\Git\bin\bash.exe" set "BASH=%LocalAppData%\Programs\Git\bin\bash.exe"
if not defined BASH (
  echo ERROR: Git Bash not found. Install Git for Windows, or run:
  echo   "<your-git-folder>\bin\bash.exe" scripts/sync-codex.sh
  exit /b 1
)
"%BASH%" "%~dp0sync-codex.sh" %*
endlocal
