# 🔒 Security Setup Guide

Acest ghid te ajută să configurezi securitatea aplicației folosind Row Level Security (RLS) în Supabase.

## 📋 Pași de implementare

### 1. Aplică migrațiile SQL în Supabase

1. Deschide **Supabase Dashboard** → Proiectul tău
2. Mergi la **SQL Editor**
3. Copiază conținutul din `supabase/migrations/001_admin_security.sql`
4. Rulează SQL-ul în editor
5. Verifică că toate tabelele au RLS enabled

### 2. Configurează Storage Policies

Pentru bucket-urile de imagini, trebuie să creezi policies manual în Supabase Dashboard:

1. Mergi la **Storage** → **Policies**
2. Pentru fiecare bucket (`product-images`, `brand-images`, `discovery-sets-images`):

#### Policy: "Public can read images"
- **Operation**: SELECT
- **Policy definition**: 
  ```sql
  bucket_id = 'product-images'
  ```

#### Policy: "Admins can upload images"
- **Operation**: INSERT
- **Policy definition**:
  ```sql
  bucket_id = 'product-images' AND is_admin()
  ```

#### Policy: "Admins can update images"
- **Operation**: UPDATE
- **Policy definition**:
  ```sql
  bucket_id = 'product-images' AND is_admin()
  ```

#### Policy: "Admins can delete images"
- **Operation**: DELETE
- **Policy definition**:
  ```sql
  bucket_id = 'product-images' AND is_admin()
  ```

Repetă pentru toate bucket-urile.

### 3. Adaugă primul admin user

#### Metoda 1: Via SQL (Recomandat)

1. Deschide **Supabase Dashboard** → **Authentication** → **Users**
2. Găsește user-ul tău și copiază **User ID** (UUID)
3. Mergi la **SQL Editor** și rulează:

```sql
-- Înlocuiește USER_ID_AICI cu UUID-ul user-ului tău
-- Înlocuiește EMAIL_AICI cu email-ul user-ului
INSERT INTO admin_users (user_id, email)
VALUES ('USER_ID_AICI', 'EMAIL_AICI');
```

#### Metoda 2: Via Supabase Dashboard

1. Deschide **Supabase Dashboard** → **Table Editor**
2. Selectează tabelul `admin_users`
3. Click **Insert** → **Insert row**
4. Completează:
   - `user_id`: UUID-ul user-ului (din Authentication → Users)
   - `email`: Email-ul user-ului

### 4. Verifică configurația

1. Loghează-te în aplicație cu user-ul admin
2. Accesează `/admin`
3. Ar trebui să vezi panoul admin fără erori
4. Încearcă să creezi un produs - ar trebui să funcționeze

### 5. Elimină Service Role Key din Environment Variables

**IMPORTANT**: După ce ai aplicat migrațiile și ai testat:

1. **Nu mai adăuga** `VITE_SUPABASE_SERVICE_ROLE_KEY` în Vercel environment variables
2. **Șterge** din `.env` local (dacă nu e deja în `.gitignore`)
3. Service role key nu mai este necesar în frontend!

## 🔐 Ce s-a schimbat?

### Înainte (Nesigur):
- ❌ Service role key expus în frontend
- ❌ Orice user autentificat putea accesa `/admin`
- ❌ Nu existau verificări de rol
- ❌ RLS nu era configurat

### Acum (Sigur):
- ✅ Service role key eliminat din frontend
- ✅ Doar adminii pot accesa `/admin`
- ✅ Verificări multiple: ProtectedRoute + Admin.tsx + RLS
- ✅ RLS configurat pentru toate tabelele
- ✅ Storage policies pentru imagini

## 🧪 Testare

### Test 1: User normal
1. Creează un user normal în Supabase
2. Loghează-te cu acel user
3. Încearcă să accesezi `/admin`
4. **Rezultat așteptat**: Redirect la `/login`

### Test 2: Admin user
1. Loghează-te cu user-ul admin
2. Accesează `/admin`
3. **Rezultat așteptat**: Panoul admin se încarcă

### Test 3: Operații admin
1. Cu user admin, încearcă să:
   - Creezi un produs
   - Actualizezi un produs
   - Ștergi un produs
2. **Rezultat așteptat**: Toate operațiile funcționează

### Test 4: Operații non-admin
1. Cu user normal, încearcă să faci operații admin direct prin API
2. **Rezultat așteptat**: Erori de permisiune (RLS blochează)

## 🚨 Troubleshooting

### Eroare: "permission denied for table admin_users"
- **Cauză**: Policy-ul pentru admin_users nu este configurat corect
- **Soluție**: Verifică că ai rulat complet migrația SQL

### Eroare: "new row violates row-level security policy"
- **Cauză**: User-ul nu este admin
- **Soluție**: Verifică că user-ul este în tabelul `admin_users`

### Admin panel nu se încarcă
- **Cauză**: User-ul nu este recunoscut ca admin
- **Soluție**: 
  1. Verifică că user-ul este în `admin_users`
  2. Verifică că `is_admin()` funcția funcționează
  3. Verifică console-ul pentru erori

### Imagini nu se încarcă
- **Cauză**: Storage policies nu sunt configurate
- **Soluție**: Configurează policies pentru bucket-uri (vezi pasul 2)

## 📝 Note importante

1. **Service Role Key**: Nu mai este necesar în frontend. Poți să-l păstrezi doar pentru operații server-side (dacă ai nevoie în viitor).

2. **Adăugare admini noi**: 
   ```sql
   INSERT INTO admin_users (user_id, email)
   VALUES ('user-uuid', 'email@example.com');
   ```

3. **Eliminare admin**:
   ```sql
   DELETE FROM admin_users WHERE user_id = 'user-uuid';
   ```

4. **Backup**: Înainte de a aplica migrațiile, fă backup la baza de date!

## ✅ Checklist final

- [ ] Migrațiile SQL au fost aplicate
- [ ] Storage policies sunt configurate
- [ ] Primul admin user a fost adăugat
- [ ] Testat cu user admin - funcționează
- [ ] Testat cu user normal - este blocat
- [ ] Service role key eliminat din environment variables
- [ ] Aplicația funcționează corect în producție

## 🎉 Gata!

Aplicația ta este acum securizată! Service role key nu mai este expus, și doar adminii pot face operații administrative.
