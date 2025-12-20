# 🔄 Migracija postojećih podataka

Ovaj dokument objašnjava kako migrirati postojeće podatke na novu verziju aplikacije sa autentifikacijom i korisničkim ulogama.

## 📋 Šta radi migracija?

Migraciona skripta automatski:

1. **Dodaje userId svim postojećim zapisima** - Svi Start, Stop i Nalog zapisi koji nemaju `userId` dobijaju referencu na admin korisnika
2. **Dodaje role postojećim korisnicima** - Svi korisnici koji nemaju `role` polje dobijaju default "user" ulogu
3. **Prikazuje statistiku** - Nakon migracije, vidiš koliko je zapisa ažurirano

## ⚠️ Pre pokretanja migracije

**VAŽNO**: Pre nego što pokreneš migraciju, OBAVEZNO:

### 1. Napravi backup baze podataka

```bash
# MongoDB Atlas (cloud)
# Idi na MongoDB Atlas Dashboard -> Backup/Restore

# Lokalni MongoDB
mongodump --db taxi_izvestaj --out ./backup
```

### 2. Proveri da li imaš admin korisnika

```bash
npm run create-admin
```

Ako admin već postoji, videćeš poruku "Admin korisnik već postoji!". Ako ne postoji, skripta će ga kreirati.

## 🚀 Pokretanje migracije

### Korak 1: Zaustavi development server

Ako server radi, zaustavi ga (`Ctrl + C`).

### Korak 2: Pokreni migraciju

```bash
npm run migrate
```

### Korak 3: Prati output

Videćeš nešto slično kao:

```
🔌 Povezivanje sa MongoDB bazom...
✅ Povezan sa MongoDB bazom

👤 Tražim admin korisnika...
✅ Admin korisnik pronađen: admin

📊 Migriram Start zapise...
  ✅ Ažurirano 15 Start zapisa

📊 Migriram Stop zapise...
  ✅ Ažurirano 23 Stop zapisa

📊 Migriram Nalog zapise...
  ✅ Svi Nalog zapisi već imaju userId

👥 Ažuriram korisnike bez role polja...
  ✅ Ažurirano 3 korisnika

==================================================
📊 STATISTIKA MIGRACIJE
==================================================
Ukupno Start zapisa: 15
Ukupno Stop zapisa: 23
Ukupno Nalog zapisa: 0
Ukupno korisnika: 4
  - Admin: 1
  - User: 3

✅ Migracija uspešno završena!
ℹ️  Svi postojeći zapisi su dodeljeni admin korisniku: admin

💡 Možeš sada pokrenuti aplikaciju i testirati autentifikaciju!
```

## ✅ Provera migracije

Nakon migracije, proveri da li je sve prošlo kako treba:

1. **Pokreni server:**
   ```bash
   npm run dev
   ```

2. **Prijavi se kao admin:**
   - Idi na http://localhost:3000/sign-in
   - Username: `admin`
   - Password: `admin123`

3. **Proveri pregled:**
   - Idi na http://localhost:3000/pregled
   - Admin bi trebao videti SVE zapise

4. **Kreiraj test korisnika:**
   - Idi na http://localhost:3000/admin
   - Kreiraj novog korisnika (npr. "test" sa ulogom "user")

5. **Prijavi se kao test korisnik:**
   - Odjavi se kao admin
   - Prijavi se kao "test"
   - Idi na pregled - test korisnik NE bi trebao videti stare zapise (oni pripadaju adminu)
   - Kreiraj novi zapis kao test korisnik
   - Proveri da test korisnik vidi samo svoj zapis

## 🔧 Šta se dešava tokom migracije?

### Start zapisi
- Traže se svi zapisi gde `userId` ne postoji ili je `null`
- Dodeljuje se `userId` admin korisnika
- Sada admin vidi sve stare zapise

### Stop zapisi
- Traže se svi zapisi gde `userId` ne postoji ili je `null`
- Dodeljuje se `userId` admin korisnika
- Sada admin vidi sve stare zapise

### Nalog zapisi
- Traže se svi zapisi gde `userId` ne postoji ili je `null`
- Dodeljuje se `userId` admin korisnika

### Korisnici
- Traže se svi korisnici gde `role` ne postoji ili je `null`
- Dodeljuje se default `role: "user"`
- Admin korisnik već ima `role: "admin"` (kreiran je sa tim poljem)

## ❓ Često postavljana pitanja

### Q: Šta ako pokrenem migraciju više puta?
**A:** Skripta je idempotentna - možeš je pokrenuti više puta bez problema. Ona ažurira samo zapise koji nemaju `userId`, tako da drugi put neće ništa ažurirati.

### Q: Mogu li odabrati drugog korisnika umesto admina za stare zapise?
**A:** Trenutno ne. Skripta automatski dodeljuje sve stare zapise prvom admin korisniku. Možeš ručno promeniti `userId` u MongoDB bazi ako želiš.

### Q: Šta ako nemam admin korisnika?
**A:** Migracija će prikazati grešku i zaustaviti se. Prvo pokreni `npm run create-admin`.

### Q: Da li mogu vratiti migraciju?
**A:** Možeš, ako imaš backup. Vrati backup i pokreni aplikaciju ponovo. Zato je VAŽNO napraviti backup pre migracije!

### Q: Mogu li obrisati sve podatke i početi ispočetka?
**A:** Da! Evo kako:

```javascript
// Otvori MongoDB Compass ili Mongo Shell i pokreni:
use taxi_izvestaj
db.starts.deleteMany({})
db.stops.deleteMany({})
db.nalogs.deleteMany({})
db.users.deleteMany({})

// Zatim kreiraj novog admina:
npm run create-admin

// I pokreni aplikaciju:
npm run dev
```

### Q: Šta ako već imam korisnike sa ulogama?
**A:** Migracija neće promeniti ništa. Ona ažurira samo korisnike koji NEMAJU `role` polje.

## 🛠️ Ručna migracija (ako automatska ne radi)

Ako iz nekog razloga automatska migracija ne radi, možeš ručno ažurirati podatke:

### Korišćenjem MongoDB Compass:

1. Otvori MongoDB Compass
2. Konektuj se na bazu `taxi_izvestaj`
3. Pronađi `users` kolekciju i nađi admin korisnika, kopiraj njegov `_id`
4. Ažuriraj Start kolekciju:
   ```javascript
   {
     userId: { $exists: false }
   }
   ```
   Set:
   ```javascript
   {
     userId: ObjectId("PASTE_ADMIN_ID_HERE")
   }
   ```
5. Ponovi za Stop i Nalog kolekcije

## 📞 Pomoć

Ako imaš problema sa migracijom:

1. Proveri da li je MongoDB povezan
2. Proveri da li postoji admin korisnik (`npm run create-admin`)
3. Proveri konzolu za greške
4. Napravi backup i pokušaj ponovo

---

**Verzija:** 1.0
**Poslednje ažuriranje:** 2025-01-12
