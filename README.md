<div align="center">

<br/>

# IA Academy

### Se Former. Innover. Transformer.

<br/>

[![Live](https://img.shields.io/badge/Production-Live-00C96B?style=flat-square)](https://iaacademy.fr)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Deno](https://img.shields.io/badge/Deno-000000?style=flat-square&logo=deno&logoColor=white)](https://deno.com)
[![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=flat-square&logo=stripe&logoColor=white)](https://stripe.com)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/fr/docs/Web/HTML)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/fr/docs/Web/JavaScript)
[![VS Code](https://img.shields.io/badge/VS%20Code-007ACC?style=flat-square&logo=visualstudiocode&logoColor=white)](https://code.visualstudio.com)

<br/>

> Plateforme d'apprentissage moderne dédiée à l'intelligence artificielle.
> Formations structurées, certifications, et interface admin complète — en production.

<br/>

</div>

---

## 📋 Sommaire

- [✨ Fonctionnalités](#-fonctionnalités)
- [🛠️ Stack technique](#️-stack-technique)
- [🏗️ Architecture](#️-architecture)
- [📁 Structure du projet](#-structure-du-projet)
- [🚀 Déploiement](#-déploiement)
- [🔐 Sécurité](#-sécurité)
- [🤝 Contribuer](#-contribuer)

---

## ✨ Fonctionnalités

**Apprenants**
- Catalogue de formations IA filtrable par thématique
- Lecteur de cours intégré avec progression sauvegardée
- Certifications téléchargeables à la fin de chaque parcours
- Profil personnalisé avec statistiques
- Ticker d'actualités IA en temps réel (OpenAI, Anthropic…)

**Authentification**
- Inscription et connexion par email / mot de passe
- Timeout automatique après 30 min d'inactivité
- Avertissement 2 min avant expiration avec countdown interactif
- Déconnexion propre sur toutes les surfaces

**Paiements**
- Abonnements Premium via Stripe Checkout
- Redirection validée uniquement vers `checkout.stripe.com`
- Session de paiement créée côté serveur via Edge Function Deno

**Interface**
- Responsive design complet avec menu burger mobile
- Animations CSS et micro-interactions soignées
- Design system cohérent via variables CSS

---

## 🛠️ Stack technique

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Frontend | HTML5 · CSS3 · JavaScript ES6+ | Interface utilisateur |
| Typographie | Google Fonts (Fraunces + DM Sans) | Design |
| Auth & BDD | Supabase (GoTrue + PostgreSQL) | Utilisateurs, données |
| Storage | Supabase Storage | Médias et fichiers |
| Edge Functions | Deno via Supabase | Logique serveur, checkout |
| Paiements | Stripe Checkout | Abonnements Premium |
| IDE | VS Code + Deno extension | Développement |

---

## 🏗️ Architecture

```
Browser
├── index.html     → App principale (landing · cours · profil)
└── admin.html     → Tableau de bord administrateur
         │
         ▼
Supabase
├── Auth (GoTrue)
├── Database (PostgreSQL)
├── Storage
└── Edge Functions (Deno)
    └── create-checkout
         │
         ▼
Stripe API
└── Checkout · Billing · Webhooks
```

---

## 📁 Structure du projet

```
iaacademy/
│
├── index.html                   # App principale
├── admin.html                   # Interface admin
│
├── favicon.svg
├── favicon.ico
├── favicon-32x32.png
├── favicon-16x16.png
├── apple-touch-icon.png
│
├── supabase/
│   └── functions/
│       └── create-checkout/     # Edge Function Deno
│
├── .vscode/
│   ├── settings.json            # Deno activé sur supabase/functions uniquement
│   └── extensions.json          # Recommande denoland.vscode-deno
│
└── README.md
```

> Architecture monolithique : styles et scripts embarqués dans les HTML, aucun build step requis.

---

## 🚀 Déploiement

### Prérequis

- Compte [Supabase](https://supabase.com)
- Compte [Stripe](https://stripe.com)
- [Supabase CLI](https://supabase.com/docs/guides/cli) installée
- Hébergeur statique — Vercel, Netlify ou GitHub Pages

### 1. Cloner

```bash
git clone https://github.com/ton-username/iaacademy.git
cd iaacademy
```

### 2. Relier Supabase

Dans `index.html`, remplace les deux valeurs :

```javascript
const sb = supabase.createClient(
  'https://TON-PROJECT-ID.supabase.co',
  'TON-ANON-KEY'
);
```

### 3. Déployer les Edge Functions

```bash
supabase login
supabase link --project-ref TON-PROJECT-ID
supabase functions deploy create-checkout
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_PRICE_ID=price_...
```

### 4. Déployer le frontend

```bash
# Vercel
npx vercel --prod

# ou Netlify — drag & drop index.html + admin.html
# ou GitHub Pages — activer sur la branche main
```

---

## 🔐 Sécurité

| Mesure | Détail |
|--------|--------|
| Anti-clickjacking | `X-Frame-Options: DENY` |
| Anti-sniffing | `X-Content-Type-Options: nosniff` |
| Anti-XSS | `X-XSS-Protection: 1; mode=block` |
| Referrer | `strict-origin-when-cross-origin` |
| Session timeout | Auto-logout après 30 min d'inactivité |
| Warning session | Countdown 2 min avant expiration |
| Stripe | Validation de l'URL avant toute redirection |
| Avatars | Whitelist stricte des domaines d'images |

### Cycle de vie de la session

```
Activité utilisateur  →  Timer reset
                               │
                         28 min sans activité
                               │
                               ▼
                      ┌─── Avertissement ───┐
                      │   Countdown 2:00    │
                      └─────────┬───────────┘
                                │
               ┌────────────────┴────────────────┐
               │                                 │
       "Rester connecté"               "Se déconnecter"
               │                                 │
          Timer reset                      Logout immédiat
                                                 │
                                          30 min atteintes
                                                 │
                                            Auto-logout
```

---

## 🤝 Contribuer

```bash
git checkout -b feature/ma-feature
git commit -m "feat: description"
git push origin feature/ma-feature
# → Ouvrir une Pull Request
```

| Préfixe | Usage |
|---------|-------|
| `feat:` | Nouvelle fonctionnalité |
| `fix:` | Correction de bug |
| `style:` | CSS / UI |
| `refactor:` | Refactorisation |
| `docs:` | Documentation |
| `chore:` | Maintenance |

---

<div align="center">

*© 2025 IA Academy — Se Former. Innover. Transformer.*

</div>
