# 🚀 Setup - Brz Start

Ovo je korak-po-korak uputstvo za pokretanje Taxi Izveštaj aplikacije sa autentifikacijom.

## 📋 Sadržaj

- [Nova instalacija](#-nova-instalacija-bez-postojećih-podataka)
- [Nadogradnja postojeće aplikacije](#-nadogradnja-postojeće-aplikacije-sa-podacima)
- [Prva prijava](#-prva-prijava)
- [Kreiranje korisnika](#-kreiranje-novih-korisnika)

---

## 🆕 Nova instalacija (bez postojećih podataka)

Ako pokrećeš aplikaciju prvi put ili sa praznom bazom:

### 1. Instaliraj zavisnosti

```bash
npm install
```

### 2. Konfiguriši .env.local

Otvori `.env.local` fajl i proveri:

```env
MONGODB_URL=mongodb+srv://...
AUTH_SECRET=your-secret-key-here
```

**Generiši AUTH_SECRET:**

```bash
# Na Linux/Mac:
openssl rand -base64 32

# Na Windows PowerShell:
# Otvori https://generate-secret.vercel.app/32
```

Kopiraj generisani string i zameni `your-secret-key-here`.

### 3. Kreiraj admin korisnika

```bash
npm run create-admin
```

Ovo će kreirati prvog admin korisnika:
- **Username:** admin
- **Password:** admin123

⚠️ **VAŽNO**: Promeni ovu lozinku odmah nakon prve prijave!

### 4. Pokreni aplikaciju

```bash
npm run dev
```

Aplikacija je dostupna na: http://localhost:3000

### 5. Prijavi se

1. Otvori http://localhost:3000/sign-in
2. Username: `admin`
3. Password: `admin123`
4. Klikni "Prijavi se"

### 6. Promeni admin lozinku

1. Klikni "Promeni lozinku" u navigaciji
2. Trenutna lozinka: `admin123`
3. Nova lozinka: (upiši novu sigurnu lozinku)
4. Klikni "Promeni Lozinku"

✅ **Gotovo!** Sada možeš koristiti aplikaciju.

---

## 🔄 Nadogradnja postojeće aplikacije (sa podacima)

Ako već imaš postojeće podatke u bazi:

### 1. **OBAVEZNO** - Napravi backup

```bash
# MongoDB Atlas - koristi Dashboard: Backup/Restore

# Lokalni MongoDB:
mongodump --db taxi_izvestaj --out ./backup
```

### 2. Instaliraj nove zavisnosti

```bash
npm install
```

### 3. Konfiguriši .env.local

Dodaj novu liniju u `.env.local`:

```env
MONGODB_URL=mongodb+srv://... (već postoji)
AUTH_SECRET=your-secret-key-here  (DODAJ OVO)
```

Generiši AUTH_SECRET kao gore.

### 4. Kreiraj admin korisnika

```bash
npm run create-admin
```

### 5. Pokreni migraciju

```bash
npm run migrate
```

Ovo će:
- Dodati `userId` svim postojećim zapisima (Start, Stop, Nalog)
- Dodati `role` postojećim korisnicima
- Dodeliti sve stare zapise admin korisniku

Videćeš output sa statistikom:

```
✅ Migracija uspešno završena!
Ukupno Start zapisa: 15
Ukupno Stop zapisa: 23
...
```

**Detaljno uputstvo:** Pogledaj [MIGRATION.md](./MIGRATION.md)

### 6. Pokreni aplikaciju

```bash
npm run dev
```

### 7. Prijavi se kao admin

Username: `admin`, Password: `admin123`

### 8. Proveri da li sve radi

- Proveri da li vidiš stare zapise u pregledu
- Kreiraj novi zapis i proveri da li radi
- Promeni admin lozinku

✅ **Migracija završena!**

---

## 👤 Prva prijava

### Login

1. Otvori http://localhost:3000
2. Automatski ćeš biti preusmerен na `/sign-in`
3. Unesi korisničko ime i lozinku
4. Klikni "Prijavi se"

### Šta vidiš nakon prijave:

**Navigacija:**
- Upis - Kreiranje novog zapisa
- Pregled - Pregled zapisa (vidiš samo svoje zapise, admin vidi sve)
- Kraj smene - Završavanje smene
- Admin - Admin panel (samo za admin korisnike)
- Promeni lozinku - Promena lozinke
- Odjavi se - Logout

---

## 👥 Kreiranje novih korisnika

**Samo admin može kreirati nove korisnike.**

### 1. Prijavi se kao admin

### 2. Idi na Admin panel

Klikni "Admin" u navigaciji ili idi na http://localhost:3000/admin

### 3. Popuni formu

- **Korisničko ime:** Unikatno ime korisnika (npr. "marko")
- **Lozinka:** Minimum 6 karaktera
- **Uloga:** Izaberi "Korisnik" ili "Administrator"

### 4. Klikni "Kreiraj Korisnika"

Nov korisnik može odmah da se prijavi.

### Razlika između uloga:

| Funkcionalnost | Admin | Korisnik |
|---------------|-------|----------|
| Kreiranje zapisa | ✅ | ✅ |
| Pregled svojih zapisa | ✅ | ✅ |
| Pregled svih zapisa | ✅ | ❌ |
| Kreiranje korisnika | ✅ | ❌ |
| Brisanje korisnika | ✅ | ❌ |
| Pristup admin panelu | ✅ | ❌ |
| Promena lozinke | ✅ | ✅ |

---

## 🔐 Sigurnost

### Preporuke:

1. ✅ Promeni admin lozinku odmah nakon instalacije
2. ✅ Koristi jake lozinke (minimum 8 karaktera, kombinacija slova, brojeva i simbola)
3. ✅ Generiši jak AUTH_SECRET
4. ✅ Kreiraj samo potreban broj admin naloga
5. ✅ Redovno pravi backup baze podataka
6. ⚠️ Nemoj deliti `.env.local` fajl

### Lozinke su zaštićene:

- Heširanje sa bcrypt algoritmom (10 rounds)
- Nikada se ne čuvaju u plain text formatu
- Nikada se ne prikazuju u API odgovorima

---

## ❓ Najčešća pitanja

**Q: Zaboravio sam admin lozinku. Šta sada?**

Možeš kreirati novog admin korisnika direktno u MongoDB bazi, ili:

1. Otvori MongoDB Compass
2. Pronađi `users` kolekciju
3. Pronađi admin korisnika
4. Kopiraj heširanu lozinku nekog drugog korisnika čiju lozinku znaš
5. Paste-uj u admin polje `password`
6. Sada možeš da se prijaviš sa tom lozinkom

**Q: Aplikacija ne radi, dobijam grešku "Cannot read properties of undefined"?**

Verovatno ti fali `userId` u starim zapisima. Pokreni migraciju:
```bash
npm run migrate
```

**Q: Ne vidim "Admin" link u navigaciji?**

"Admin" link se prikazuje samo korisnicima sa admin ulogom. Proveri svoju ulogu u admin panelu.

**Q: Mogu li resetovati sve i početi ispočetka?**

Da! U MongoDB Compassu:
```javascript
// Obriši sve podatke
use taxi_izvestaj
db.starts.deleteMany({})
db.stops.deleteMany({})
db.nalogs.deleteMany({})
db.users.deleteMany({})

// Zatim:
npm run create-admin
npm run dev
```

---

## 📚 Dodatna dokumentacija

- [AUTH.md](./AUTH.md) - Detaljno o autentifikaciji
- [MIGRATION.md](./MIGRATION.md) - Migracija postojećih podataka
- [README.md](./README.md) - Opšte informacije o projektu

---

## 🆘 Pomoć

Ako imaš problema:

1. Proveri da li je MongoDB povezan
2. Proveri da li postoji `.env.local` fajl
3. Proveri konzolu za greške
4. Proveri da li si pokrenuo `npm install`
5. Proveri da li je admin korisnik kreiran (`npm run create-admin`)

---

**Verzija:** 1.0
**Poslednje ažuriranje:** 2025-01-12
