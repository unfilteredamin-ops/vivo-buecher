# vivo Bücher

Android-App zum Lesen deiner Bücher (PDF) mit Abo:

- Nutzer ohne Abo lesen die **ersten 3 Seiten**, danach kommt die Abo-Sperre
- Abonnenten lesen alles
- Die App **merkt sich die Seite**, bei der man aufgehört hat (auch geräteübergreifend)
- Du lädst Bücher über eine **Admin-Seite** hoch – sie erscheinen **automatisch** in der App, ohne Update
- Bibliothek mit Kategorien und Suche, bis zu 200 Bücher
- Die komplette PDF wird serverseitig nur an Abonnenten ausgeliefert (echter Schutz, nicht nur in der App versteckt)

So ist es aufgebaut: **App** (Capacitor + pdf.js) → **Supabase** (Login, Datenbank, Dateien) ← **Stripe** (Zahlung, meldet Abos per Webhook).

---

## Einrichtung (ca. 30–40 Minuten, einmalig)

### 1. GitHub: Projekt hochladen
1. Auf github.com ein Konto anlegen und ein neues Repository erstellen, z. B. `vivo-buecher`. Wähle **Public** (nur dann sind GitHub Pages für die Admin-Seite kostenlos). In den Dateien steht kein Geheimnis.
2. ZIP entpacken und **alle Dateien und Ordner** ins Repository hochladen (*Add file → Upload files*). Wichtig: auch der versteckte Ordner `.github` muss mit hoch.

### 2. Supabase: Backend anlegen
1. Auf supabase.com ein kostenloses Projekt erstellen.
2. **SQL Editor** öffnen, den kompletten Inhalt von `supabase/schema.sql` einfügen, **Run** drücken.
3. **Authentication → Providers → Email**: „Confirm email“ ausschalten (sonst muss jeder Nutzer erst eine Bestätigungsmail anklicken).
4. **Project Settings → API**: `Project URL` und `anon public key` kopieren.
5. In GitHub die Datei `public/config.js` öffnen (Stift-Symbol) und dort `SUPABASE_URL` und `SUPABASE_ANON_KEY` eintragen. Den Zahlungslink (`STRIPE_PAYMENT_LINK`) kannst du hier ebenfalls jederzeit austauschen. Speichern (Commit).

### 3. Stripe: Abos automatisch freischalten
Damit die App weiß, wer bezahlt hat:

1. **Supabase → Edge Functions → Create function**, Name: `stripe-webhook`. Den Inhalt von `supabase/functions/stripe-webhook/index.ts` einfügen und deployen. Bei der Funktion **„Verify JWT“ ausschalten**.
2. **Supabase → Edge Functions → Secrets** zwei Einträge anlegen:
   - `STRIPE_SECRET_KEY` = dein geheimer Stripe-Schlüssel (Stripe → Entwickler → API-Schlüssel)
   - `STRIPE_WEBHOOK_SECRET` = Signing-Secret aus dem nächsten Schritt
3. **Stripe → Entwickler → Webhooks → Endpunkt hinzufügen**
   - URL: `https://DEIN-PROJEKT.supabase.co/functions/v1/stripe-webhook`
   - Ereignisse: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Danach das „Signing-Secret“ (beginnt mit `whsec_`) kopieren und in Supabase als `STRIPE_WEBHOOK_SECRET` eintragen.

Die App hängt an deinen Zahlungslink automatisch die Nutzer-ID an. Daran erkennt der Webhook, wer bezahlt hat.

### 4. APK bauen (macht GitHub automatisch)
1. Im Repository **Actions → „APK bauen“ → Run workflow**.
2. Nach 5–10 Minuten fertig: Auf den Lauf klicken, unten bei **Artifacts** `vivo-buecher-apk` herunterladen und entpacken.
3. `app-debug.apk` aufs Handy kopieren und installieren (Android fragt einmal nach der Erlaubnis für „unbekannte Quellen“).

Bei jeder Änderung im Repository baut GitHub die APK neu.

### 5. Dich zum Admin machen
1. In der App ein Konto mit deiner E-Mail anlegen.
2. Im Supabase **SQL Editor** ausführen (E-Mail anpassen):
   ```sql
   update public.profiles set is_admin = true where email = 'DEINE-MAIL@BEISPIEL.DE';
   ```
   Als Admin sind in der App alle Bücher freigeschaltet, so kannst du alles testen.

### 6. Admin-Seite (Bücher hochladen)
1. Im Repository **Settings → Pages → Source: GitHub Actions** auswählen.
2. Unter **Actions → „Admin-Seite veröffentlichen“ → Run workflow** starten. Danach steht die Adresse unter Settings → Pages (`https://DEIN-NAME.github.io/vivo-buecher/`).
3. Dort mit deinem Admin-Konto anmelden, PDFs hineinziehen, Titel, Autor und Kategorie prüfen, **Hochladen**. Titelbild und Leseprobe (erste 3 Seiten) entstehen automatisch, deine PDF bleibt unverändert. Lesezeichen setzen, dann hast du immer Zugriff.

---

## Gut zu wissen

- **Debug-APK:** Die APK ist zum Installieren per Datei gedacht. Für den Google Play Store braucht es eine signierte Release-Version (kann ich nachrüsten).
- **Supabase-Gratisplan:** 1 GB Speicher, maximal 50 MB pro PDF. Für viele oder große Bücher reicht ein bezahlter Plan.
- **Zahlungslink:** Gilt der Link für ein Abo (monatlich), läuft der Zugang mit dem Abo aus. Bei Einmalzahlung bleibt er dauerhaft.
- **Veröffentlichung:** Für Play Store oder öffentlichen Vertrieb brauchst du Impressum und Datenschutzerklärung.
- **Nicht eingebaut:** Offline-Lesen und Nachtmodus.
