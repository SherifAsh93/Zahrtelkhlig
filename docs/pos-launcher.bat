@echo off
REM POS terminal launcher — opens the POS app in its own Chrome window.
REM Copy this file to the POS PC and create a desktop shortcut pointing to it.
REM See docs/11_POS_Silent_Printing_Setup.md for full setup instructions
REM (printer pairing over WebUSB — no special print flags needed anymore).

set CHROME="C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist %CHROME% set CHROME="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

start "" %CHROME% --new-window "https://zahrtelkhlig.vercel.app/pos"
