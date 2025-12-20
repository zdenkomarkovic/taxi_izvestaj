# Autentifikacija - Uputstvo za upotrebu

Sistem autentifikacije je uspešno implementiran u projektu Taxi Izveštaj. Ovaj dokument sadrži sve potrebne informacije za korišćenje i održavanje sistema.

## 🔒 Implementirane funkcionalnosti

### Osnovne funkcionalnosti
1. **Login sistem** - Korisnici se prijavljuju sa korisničkim imenom i lozinkom
2. **Heširanje lozinki** - Sve lozinke se čuvaju bezbedno heširane u bazi (bcrypt)
3. **Zaštita ruta** - Middleware automatski štiti sve stranice osim login stranice
4. **Odjava** - Dugme za odjavu dostupno u navigaciji
5. **Nema javne registracije** - Samo admin može dodavati nove korisnike

### Role-Based Access Control (RBAC)
6. **Admin uloga** - Puna kontrola nad sistemom, može kreirati i brisati korisnike
7. **User uloga** - Obični korisnici mogu samo da unose i pregledaju svoje zapise
8. **Admin panel** - Samo admini imaju pristup admin panelu
9. **Lista korisnika** - Admini mogu videti sve korisnike u sistemu
10. **Brisanje korisnika** - Admini mogu brisati korisnike (osim sebe)

### Upravljanje nalozima
11. **Promena lozinke** - Svi korisnici mogu promeniti svoju lozinku
12. **Izbor uloge** - Pri kreiranju korisnika, admin bira da li je korisnik admin ili običan user

### Filtriranje podataka
13. **Zapisi po korisniku** - Obični korisnici vide samo svoje zapise
14. **Admin pregled** - Admini mogu videti sve zapise svih korisnika

## 🚀 Kako pokrenuti

1. **Pokretanje servera:**
   ```bash
   npm run dev
   ```
   Server će biti dostupan na: http://localhost:3000

2. **Prvi put - kreiranje admin korisnika:**
   ```bash
   npm run create-admin
   ```
   Ova komanda kreira početnog admin korisnika sa sledećim podacima:
   - **Korisničko ime:** admin
   - **Lozinka:** admin123

   ⚠️ **VAŽNO:** Promeni ovu lozinku odmah nakon prve prijave!

## 📝 Kako koristiti sistem

### Prijava
1. Idi na `/sign-in` stranicu
2. Unesi korisničko ime i lozinku
3. Klikni na "Prijavi se"
4. Nakon uspešne prijave bićeš preusmerен na glavnu stranicu

### Dodavanje novih korisnika
1. Prijavi se kao admin
2. Idi na stranicu `/admin`
3. Unesi korisničko ime i lozinku za novog korisnika
4. Klikni "Kreiraj Korisnika"
5. Nov korisnik može odmah da se prijavi sa unetim podacima

### Odjava
- Klikni na dugme "Odjavi se" u gornjem desnom uglu navigacije

### Promena lozinke
1. Prijavi se u aplikaciju
2. Klikni na "Promeni lozinku" u navigaciji (ili idi na `/change-password`)
3. Unesi trenutnu lozinku
4. Unesi novu lozinku (minimum 6 karaktera)
5. Potvrdi novu lozinku
6. Klikni "Promeni Lozinku"

### Upravljanje korisnicima (samo za Admine)
1. Prijavi se kao admin
2. Idi na `/admin` stranicu
3. U levom delu ekrana možeš kreirati novog korisnika:
   - Unesi korisničko ime
   - Unesi lozinku (minimum 6 karaktera)
   - Izaberi ulogu (Korisnik ili Administrator)
   - Klikni "Kreiraj Korisnika"
4. U desnom delu ekrana vidiš listu svih korisnika:
   - Možeš obrisati bilo kog korisnika (osim sebe)
   - Vidiš ulogu svakog korisnika (Admin ili Korisnik)
   - Ne možeš obrisati poslednjeg admina

## 👥 Razlike između Admin i User uloga

### Admin
- **Može**: Kreirati nove korisnike
- **Može**: Brisati postojeće korisnike (osim sebe)
- **Može**: Videti listu svih korisnika
- **Može**: Videti SVE zapise svih korisnika u pregledu
- **Može**: Unositi nove zapise
- **Može**: Promeniti svoju lozinku
- **Ima pristup**: Admin panelu (`/admin`)

### Korisnik (User)
- **Ne može**: Kreirati nove korisnike
- **Ne može**: Brisati korisnike
- **Ne može**: Videti listu korisnika
- **Može**: Videti SAMO SVOJE zapise u pregledu
- **Može**: Unositi nove zapise (vezane za svoj nalog)
- **Može**: Promeniti svoju lozinku
- **Nema pristup**: Admin panelu

## 🔐 Filtriranje zapisa po korisniku

Aplikacija automatski filtrira zapise na osnovu uloge korisnika:

- **Obični korisnici**: Vide samo zapise koje su oni uneli
- **Admini**: Vide sve zapise svih korisnika

Ovo se primenjuje na:
- Stranicu "Pregled" - prikazuje filtrirane zapise
- Formu "Upis" - automatski dodeljuje userId prilikom kreiranja
- Formu "Kraj smene" - automatski dodeljuje userId prilikom kreiranja

## 🔧 Konfiguracija

### .env.local fajl

Proveri da imaš sledeće promenljive u `.env.local` fajlu:

```env
MONGODB_URL=mongodb+srv://...
AUTH_SECRET=your-secret-key-generate-with-openssl-rand-base64-32
```

**Generisanje AUTH_SECRET:**

Na Linux/Mac terminalu:
```bash
openssl rand -base64 32
```

Na Windows PowerShell:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Ili koristi bilo koji random string generator (32+ karaktera).

## 📁 Struktura fajlova

```
auth.js                                    # NextAuth konfiguracija
middleware.js                               # Zaštita ruta
app/
  ├── api/
  │   └── auth/[...nextauth]/route.js     # NextAuth API ruta
  │   └── admin/create-user/route.js      # API za kreiranje korisnika
  ├── (auth)/
  │   ├── sign-in/page.js                 # Login stranica
  │   └── sign-up/page.js                 # Disabled registracija
  └── (root)/
      └── admin/page.jsx                   # Admin panel
database/
  └── user.model.js                        # User model
lib/
  └── actions/user.action.js               # Server akcije za korisnike
components/
  ├── SessionProvider.jsx                  # NextAuth session provider
  └── navbar/page.jsx                      # Navigacija sa logout
scripts/
  └── create-admin.js                      # Skripta za kreiranje admina
```

## 🛡️ Sigurnosne mere

1. **Bcrypt heširanje** - Lozinke se nikada ne čuvaju u plain text formatu
2. **JWT sesije** - Siguran način čuvanja sesija
3. **Middleware zaštita** - Automatska zaštita svih stranica
4. **Nema javne registracije** - Sprečava neovlašćeno kreiranje naloga
5. **Validacija** - Server-side validacija svih unosa

## 📋 API Endpoints

### POST /api/admin/create-user
Kreira novog korisnika (zahteva autentifikaciju i admin ulogu)

**Request body:**
```json
{
  "name": "korisnicko_ime",
  "password": "lozinka123",
  "role": "user"
}
```

**Response (success):**
```json
{
  "success": true,
  "message": "Korisnik uspešno kreiran",
  "userId": "..."
}
```

### GET /api/admin/get-users
Vraća listu svih korisnika (zahteva autentifikaciju i admin ulogu)

**Response (success):**
```json
{
  "success": true,
  "users": [
    {
      "_id": "...",
      "name": "admin",
      "role": "admin",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

### DELETE /api/admin/delete-user
Briše korisnika (zahteva autentifikaciju i admin ulogu)

**Request body:**
```json
{
  "userId": "..."
}
```

**Response (success):**
```json
{
  "success": true,
  "message": "Korisnik uspešno obrisan"
}
```

### POST /api/user/change-password
Menja lozinku trenutnog korisnika (zahteva autentifikaciju)

**Request body:**
```json
{
  "currentPassword": "stara_lozinka",
  "newPassword": "nova_lozinka"
}
```

**Response (success):**
```json
{
  "success": true,
  "message": "Lozinka uspešno promenjena"
}
```

## ❓ Često postavljana pitanja

**Q: Šta ako zaboravim lozinku?**
A: Ako si admin, možeš kreirati novi nalog. Ako si običan korisnik, kontaktiraj admina da ti promeni lozinku ili kreira novi nalog.

**Q: Mogu li da promenim lozinku?**
A: Da! Idi na stranicu `/change-password` ili klikni "Promeni lozinku" u navigaciji. Trebaće ti trenutna lozinka i nova lozinka.

**Q: Kako da obrišem korisnika?**
A: Samo admin može brisati korisnike. Idi na `/admin` stranicu i klikni "Obriši" dugme pored korisnika.

**Q: Zašto ne vidim sve zapise u pregledu?**
A: Ako si običan korisnik, vidiš samo svoje zapise. Samo admini vide sve zapise svih korisnika.

**Q: Mogu li da promenim ulogu postojećeg korisnika?**
A: Trenutno ne. Moraš obrisati korisnika i kreirati novog sa drugačijom ulogom, ili ručno ažurirati u MongoDB bazi.

**Q: Šta se dešava ako obrišem korisnika koji ima zapise?**
A: Zapisi ostaju u bazi sa userId referencom. Preporučuje se da ne brišeš korisnike koji imaju aktivne zapise.

**Q: Mogu li imati više admina?**
A: Da! Admin može kreirati nove admin korisnike sa admin panela. Biraš ulogu pri kreiranju.

**Q: Kako mogu promeniti postojećeg korisnika u admina?**
A: Trenutno moraš ručno ažurirati u MongoDB bazi, ili obrisati korisnika i kreirati novog sa admin ulogom.

## 🔄 Migracija postojećih podataka

**VAŽNO**: Ako nadograđuješ postojeću aplikaciju sa podacima, moraš pokrenuti migraciju!

Nova verzija zahteva da svi zapisi (Start, Stop, Nalog) imaju `userId` polje. Stari zapisi bez ovog polja neće raditi.

### Kako pokrenuti migraciju:

1. **Napravi backup baze podataka** (OBAVEZNO!)
   ```bash
   # MongoDB Atlas - koristi Dashboard
   # Lokalni MongoDB:
   mongodump --db taxi_izvestaj --out ./backup
   ```

2. **Kreiraj admin korisnika** (ako još ne postoji)
   ```bash
   npm run create-admin
   ```

3. **Pokreni migraciju**
   ```bash
   npm run migrate
   ```

Migracija će automatski:
- Dodati `userId` svim postojećim zapisima (dodeljuje ih admin korisniku)
- Dodati `role` svim postojećim korisnicima
- Prikazati statistiku migrovanih podataka

**Detaljno uputstvo:** Pogledaj [MIGRATION.md](./MIGRATION.md) fajl za kompletne instrukcije.

## 📞 Podrška

Ako imaš problema sa autentifikacijom:
1. Proveri da li je MongoDB povezana
2. Proveri da li postoji AUTH_SECRET u .env.local
3. Proveri da li postoji korisnik u bazi
4. Proveri konzolu za greške

---

**Verzija:** 1.0
**Poslednje ažuriranje:** 2025-01-12
