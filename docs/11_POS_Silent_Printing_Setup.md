# POS Silent Receipt Printing — Terminal Setup

Receipts print via the **WebUSB Remote Print** pipeline: the paired browser tab
renders each receipt to a canvas, encodes it as raw ESC/POS bytes, and sends
it directly to the Xprinter XP-N160II over USB — no `window.print()`, no OS
print dialog, no browser popup. This works for sales made on *any* device
(mobile or the laptop itself); the printer laptop just needs one tab open
with the printer paired.

(This replaces an earlier `--kiosk-printing` + `window.print()` setup. That
approach is retired — printing now goes exclusively through WebUSB, so there
is no longer a Windows-default-printer or special Chrome launch flag to
configure.)

## 1. One-time driver setup (Zadig)

Browsers can only claim a USB device's interface directly if it's bound to a
generic **WinUSB** driver, not the printer's normal Windows print-spooler
driver. If pairing fails or the browser's device picker doesn't show the
printer:

1. Download [Zadig](https://zadig.akeo.ie/).
2. Plug in the Xprinter XP-N160II, open Zadig, enable **Options → List All
   Devices**.
3. Select the printer's interface, choose **WinUSB** as the target driver,
   and click **Replace Driver** (or **Install Driver**).
4. This only needs to be done once per laptop. Note it means the printer will
   no longer show up as a normal Windows printer for other apps — it's now
   dedicated to the browser's WebUSB connection.

## 2. Pair the printer in the browser

1. Use **Chrome or Edge** on the printer laptop — WebUSB isn't supported in
   Firefox or Safari.
2. Open `https://zahrtelkhlig.vercel.app/pos` and log in.
3. Click the printer button in the header ("إقران طابعة الاستلام" /
   "طابعة الاستلام متصلة") and pick the Xprinter from the browser's device
   chooser. This one click is required by the browser (WebUSB needs a user
   gesture the first time); after that, the pairing is remembered for this
   browser profile and reconnects silently on future visits.
4. The button turns green ("طابعة الاستلام متصلة") once connected.

## 3. Keep a tab open

Auto-printing only runs while a tab/window with the app open is running on
the paired laptop (see `src/hooks/usePrinterStation.ts` — it polls for new
unprinted sales roughly every 4 seconds via a SharedWorker). Installing the
app as a desktop PWA (Chrome's "Install this site as an app") and leaving it
open is the simplest way to keep this always running.

A ready-made launcher is at `docs/pos-launcher.bat` — copy it to the POS PC
and drop a shortcut to it on the desktop / startup folder so staff always
open POS through it in its own window.

## 4. Test

1. Launch POS via the shortcut (or the installed PWA).
2. Pair the printer once if not already paired.
3. Complete a sale — either on this laptop or from a mobile device logged in
   as staff. The receipt should print within a few seconds, with no dialog.
4. Manual reprints are available from the order-history detail pages (owner
   and admin) for any past POS sale, on whichever device has the printer
   paired.

If printing doesn't happen: check the printer button's status color/tooltip
first (unpaired / disconnected / error are all shown there), then confirm
the Zadig driver step above was done.
