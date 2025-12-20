# 🚕 Taxi Izveštaj - Aplikacija sa autentifikacijom

Moderna Next.js aplikacija za praćenje rada taksista sa potpunim sistemom autentifikacije i upravljanja korisnicima.

## ✨ Funkcionalnosti

### 🔐 Autentifikacija i bezbednost
- ✅ Login sistem sa NextAuth v5
- ✅ Bcrypt heširanje lozinki
- ✅ JWT sesije
- ✅ Middleware zaštita ruta
- ✅ Promena lozinke
- ✅ Nema javne registracije

### 👥 Upravljanje korisnicima
- ✅ Role-based access control (Admin/User)
- ✅ Admin panel za kreiranje korisnika
- ✅ Lista svih korisnika (samo admin)
- ✅ Brisanje korisnika (samo admin)
- ✅ Zaštita od brisanja poslednjeg admina

### 📊 Praćenje zapisa
- ✅ Kreiranje Start/Stop zapisa
- ✅ Filtriranje zapisa po korisniku
- ✅ Admini vide sve zapise
- ✅ Obični korisnici vide samo svoje zapise
- ✅ Automatsko dodeljivanje userId

### 🎨 UI/UX
- ✅ Moderna navigacija sa logout dugmetom
- ✅ Responzivni dizajn
- ✅ Tailwind CSS styling
- ✅ Role badges
- ✅ Error handling i validacija

## 🚀 Brzi start

### Nova instalacija

```bash
# 1. Instaliraj zavisnosti
npm install

# 2. Konfiguriši .env.local
# Dodaj MONGODB_URL i AUTH_SECRET

# 3. Kreiraj admin korisnika
npm run create-admin

# 4. Pokreni aplikaciju
npm run dev
```

**Detaljno uputstvo:** [SETUP.md](./SETUP.md)

### Nadogradnja postojeće aplikacije

```bash
# 1. Napravi BACKUP baze podataka!

# 2. Instaliraj zavisnosti
npm install

# 3. Kreiraj admin korisnika
npm run create-admin

# 4. Pokreni migraciju
npm run migrate

# 5. Pokreni aplikaciju
npm run dev
```

**Detaljno uputstvo:** [MIGRATION.md](./MIGRATION.md)

## 📝 Prvi koraci

1. Prijavi se na http://localhost:3000/sign-in
   - Username: `admin`
   - Password: `admin123`

2. **ODMAH promeni lozinku:**
   - Klikni "Promeni lozinku" u navigaciji
   - Unesi novu sigurnu lozinku

3. Kreiraj nove korisnike:
   - Idi na Admin panel
   - Dodaj korisnike sa odgovarajućim ulogama

## 👥 Uloge korisnika

### Admin
- Puna kontrola nad sistemom
- Može kreirati i brisati korisnike
- Vidi SVE zapise svih korisnika
- Ima pristup admin panelu

### User (Korisnik)
- Može kreirati zapise
- Vidi SAMO svoje zapise
- Može promeniti svoju lozinku
- NEMA pristup admin panelu

## 📋 Dostupni npm scripts

```bash
npm run dev          # Pokreni development server
npm run build        # Build aplikaciju za produkciju
npm run start        # Pokreni production server
npm run lint         # Pokreni ESLint
npm run create-admin # Kreiraj admin korisnika
npm run migrate      # Migracija postojećih podataka
```

## 🗂️ Struktura projekta

```
taxi_izvestaj/
├── app/
│   ├── (auth)/              # Auth stranice (sign-in, sign-up)
│   ├── (root)/              # Zaštićene stranice
│   │   ├── admin/           # Admin panel
│   │   ├── change-password/ # Promena lozinke
│   │   ├── pregled/         # Pregled zapisa
│   │   └── endshift/        # Kraj smene
│   └── api/
│       ├── auth/            # NextAuth endpoints
│       ├── admin/           # Admin API endpoints
│       └── user/            # User API endpoints
├── components/
│   ├── forms/               # Forme (StartForm, StopForm)
│   ├── navbar/              # Navigacija
│   └── ui/                  # UI komponente
├── database/
│   ├── user.model.js        # User model (sa role)
│   ├── startModel.js        # Start model (sa userId)
│   ├── stopModel.js         # Stop model (sa userId)
│   └── nalog.model.js       # Nalog model (sa userId)
├── lib/
│   ├── actions/             # Server actions
│   ├── mongoose.js          # MongoDB konekcija
│   └── validations.js       # Zod validacije
├── scripts/
│   ├── create-admin.js      # Skripta za kreiranje admina
│   └── migrate-data.js      # Skripta za migraciju
├── auth.js                  # NextAuth konfiguracija
├── middleware.js            # Route protection
├── .env.local               # Environment varijable
├── AUTH.md                  # Dokumentacija autentifikacije
├── MIGRATION.md             # Dokumentacija migracije
└── SETUP.md                 # Setup uputstvo
```

## 🔐 Bezbednost

### Implementirane mere:
- ✅ Bcrypt heširanje lozinki (10 rounds)
- ✅ JWT tokens sa kratkim rokom trajanja
- ✅ Middleware zaštita svih ruta
- ✅ Server-side validacija svih unosa
- ✅ CSRF zaštita (NextAuth)
- ✅ Role-based access control
- ✅ Admin guard na API endpointima

### Preporuke:
- 🔒 Koristi jake lozinke (minimum 8 karaktera)
- 🔒 Generiši jak AUTH_SECRET (32+ karaktera)
- 🔒 Redovno pravi backup baze
- 🔒 Promeni default admin lozinku odmah
- 🔒 Nemoj deliti .env.local fajl

## 📚 Dokumentacija

- [SETUP.md](./SETUP.md) - Korak-po-korak setup uputstvo
- [AUTH.md](./AUTH.md) - Kompletna dokumentacija autentifikacije
- [MIGRATION.md](./MIGRATION.md) - Uputstvo za migraciju podataka

## 🛠️ Tehnologije

- **Framework:** Next.js 15.1.2
- **Autentifikacija:** NextAuth v5
- **Baza podataka:** MongoDB + Mongoose
- **Styling:** Tailwind CSS
- **Forme:** React Hook Form + Zod
- **UI komponente:** Radix UI
- **Heširanje:** bcryptjs

## 📊 API Endpoints

### Admin endpoints (zahtevaju admin ulogu)
- `POST /api/admin/create-user` - Kreiraj korisnika
- `GET /api/admin/get-users` - Lista korisnika
- `DELETE /api/admin/delete-user` - Obriši korisnika

### User endpoints (zahtevaju autentifikaciju)
- `POST /api/user/change-password` - Promeni lozinku

### Auth endpoints
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout

## ❓ FAQ

**Q: Kako resetujem lozinku ako sam je zaboravio?**
A: Admin može kreirati novi nalog. Obični korisnik treba da kontaktira admina.

**Q: Zašto ne vidim sve zapise?**
A: Obični korisnici vide samo svoje zapise. Samo admini vide sve.

**Q: Mogu li imati više admina?**
A: Da! Admin može kreirati nove admin korisnike iz admin panela.

**Q: Kako obrišem sve podatke i počnem ispočetka?**
A: Obriši sve kolekcije u MongoDB i pokreni `npm run create-admin`.

**Više pitanja:** [AUTH.md - FAQ sekcija](./AUTH.md#-često-postavljana-pitanja)

## 🆘 Troubleshooting

### Greška: "Cannot read properties of undefined"
- Pokrenite migraciju: `npm run migrate`

### Greška: "Admin korisnik ne postoji"
- Kreirajte admina: `npm run create-admin`

### Ne mogu da se prijavim
- Proverite da li je MongoDB povezan
- Proverite korisničko ime i lozinku
- Proverite da li postoji admin korisnik u bazi

### Aplikacija ne kompajlira
- Pokrenite: `npm install`
- Proverite da li postoji `.env.local` sa MONGODB_URL i AUTH_SECRET

## 📄 Licenca

Ovaj projekat je privatna aplikacija.

## 🤝 Kontribuiranje

Ovo je privatni projekat. Za pitanja ili sugestije, kontaktiraj developera.

---

**Verzija:** 2.0.0 (sa autentifikacijom)
**Poslednje ažuriranje:** 2025-01-12

**Autor:** [Tvoje ime]
**Email:** [Tvoj email]

---

## 🎉 Changelog

### v2.0.0 (2025-01-12)
- ✨ Dodato: Potpun sistem autentifikacije
- ✨ Dodato: Role-based access control (Admin/User)
- ✨ Dodato: Admin panel za upravljanje korisnicima
- ✨ Dodato: Promena lozinke
- ✨ Dodato: Filtriranje zapisa po korisniku
- ✨ Dodato: Migraciona skripta za postojeće podatke
- 🔒 Poboljšano: Bezbednost sa bcrypt i JWT
- 📚 Dodato: Kompletna dokumentacija

### v1.0.0 (2024-12-21)
- 🎉 Inicijalna verzija bez autentifikacije
