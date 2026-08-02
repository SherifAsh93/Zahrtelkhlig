@echo off
REM POS terminal launcher — starts Chrome with silent thermal-receipt printing.
REM Copy this file to the POS PC and create a desktop shortcut pointing to it.
REM See docs/11_POS_Silent_Printing_Setup.md for full setup instructions.

set CHROME="C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist %CHROME% set CHROME="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

start "" %CHROME% --kiosk-printing --new-window "https://zahrtelkhlig.vercel.app/pos"
