# POS Silent Receipt Printing — Terminal Setup

The `/pos` page opens a receipt window and calls `window.print()` automatically
right after every sale (see `src/app/pos/page.tsx`, `printReceipt()` /
`processSale()`). That is the most the app itself can ever do — browsers do
not allow a webpage to send data straight to a printer without some kind of
confirmation, as a security measure. The one exception is Chrome/Edge's
`--kiosk-printing` launch flag, which tells the browser to skip the print
dialog and print silently to the **current Windows default printer**.

This means silent printing requires a **one-time setup on the physical POS
PC** — it is not something a code change can turn on by itself.

## 1. Set the thermal printer as the Windows default

1. Windows Settings → Bluetooth & devices → Printers & scanners.
2. Turn **off** "Let Windows manage my default printer" (otherwise Windows
   may silently switch the default away from the receipt printer).
3. Click the thermal receipt printer → **Set as default**.
4. In the printer's driver properties, confirm the paper size profile is set
   to match an 80mm roll — the receipt HTML already declares
   `@page { size: 80mm auto; margin: 0; }`, but the printer driver must be
   configured for the same width or output will be clipped/rescaled.

## 2. Launch Chrome with `--kiosk-printing`

Do **not** open the POS page from a normal Chrome shortcut/taskbar icon —
that always shows the print dialog. Instead, use a shortcut that launches
Chrome with the flag.

Create a desktop shortcut on the POS PC with this **Target**:

```
"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing --new-window "https://zahrtelkhlig.vercel.app/pos"
```

(If Chrome is 32-bit, the path is
`C:\Program Files (x86)\Google\Chrome\Application\chrome.exe` instead.)

A ready-made launcher batch file is included at
`docs/pos-launcher.bat` — copy it to the POS PC and drop a shortcut to it on
the desktop / startup folder so staff always open POS through it.

Optional: add `--kiosk` as well for a locked-down, fullscreen terminal (no
address bar, no tabs, no way to navigate away). Leave it out if staff need to
occasionally use the same machine for other browsing.

## 3. Test

1. Launch POS via the shortcut (not a normal Chrome window).
2. Log in, add a product, complete a sale.
3. The receipt should print immediately with **no dialog at all**.
4. If a dialog still appears, double-check the shortcut's Target actually
   includes `--kiosk-printing` (Chrome ignores flags if Chrome was already
   running when the shortcut launched — fully close Chrome first) and that
   step 1 (default printer) is set correctly.
