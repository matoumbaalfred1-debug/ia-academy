<div align="center">

<br/>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://capsule-render.vercel.app/api?type=waving&color=7B2FFF&height=200&section=header&text=IA%20Academy&fontSize=60&fontColor=ffffff&fontAlignY=35&desc=Se%20Former.%20Innover.%20Transformer.&descAlignY=55&descSize=18&animation=fadeIn"/>
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,24&height=200&section=header&text=IA%20Academy&fontSize=60&fontColor=ffffff&fontAlignY=35&desc=Se%20Former.%20Innover.%20Transformer.&descAlignY=55&descSize=18&animation=fadeIn" width="100%"/>
</picture>

<br/>

[![Status](https://img.shields.io/badge/🚧%20En%20développement%20actif-orange?style=for-the-badge)](.)
[![Live](https://img.shields.io/badge/🚀%20Production-Live-00C96B?style=for-the-badge)](https://iaacademy.fr)

<br/>

[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Deno](https://img.shields.io/badge/Deno-000000?style=flat-square&logo=deno&logoColor=white)](https://deno.com)
[![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=flat-square&logo=stripe&logoColor=white)](https://stripe.com)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/fr/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/fr/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/fr/docs/Web/JavaScript)
[![VS Code](https://img.shields.io/badge/VS%20Code-007ACC?style=flat-square&logo=visualstudiocode&logoColor=white)](https://code.visualstudio.com)

<br/>

</div>

---

## 📌 Sommaire

| | Section |
|---|---------|
| 01 | [Vue d'ensemble](#-vue-densemble) |
| 02 | [À qui s'adresse la plateforme](#-à-qui-sadresse-la-plateforme) |
| 03 | [Ce que couvre la plateforme](#-ce-que-couvre-la-plateforme) |
| 04 | [Comment ça fonctionne](#-comment-ça-fonctionne) |
| 05 | [Modèle d'accès](#-modèle-daccès) |
| 06 | [État du projet](#-état-du-projet) |
| 07 | [Stack technique](#-stack-technique) |
| 08 | [Architecture](#-architecture) |
| 09 | [Structure du projet](#-structure-du-projet) |
| 10 | [Déploiement](#-déploiement) |
| 11 | [Sécurité](#-sécurité) |
| 12 | [Contribuer](#-contribuer) |

---

## 🌍 Vue d'ensemble

**IA Academy** est une plateforme d'apprentissage 100% dédiée à l'intelligence artificielle, accessible à **tout le monde** sans distinction de niveau ou de profil.

L'objectif est simple : **démocratiser l'accès à la formation en IA** en proposant un catalogue structuré de cours, tutoriels et certifications — des fondamentaux jusqu'aux applications les plus avancées — dans une interface moderne, fluide et sécurisée.

La plateforme fonctionne sur un modèle **Freemium** : une grande partie du contenu est accessible gratuitement, et un abonnement Premium débloque les formations avancées et les certifications.

> ⚠️ Le site est en production et fonctionnel. Des améliorations sont apportées en continu — certaines sections évoluent régulièrement.

---

## 🎯 À qui s'adresse la plateforme

<div align="center">

| Profil | Ce qu'il trouve sur IA Academy |
|--------|-------------------------------|
| Débutant | Cours d'introduction, vocabulaire, premiers outils IA |
| Étudiant | Formations structurées, certifications valorisables |
| Professionnel | Cas d'usage métier, automatisation, prompt engineering |
| Développeur | LLM, APIs IA, intégration, fine-tuning |
| Curieux | Veille, actualités IA, ressources libres d'accès |

</div>

---

## 📖 Ce que couvre la plateforme

Toutes les thématiques liées à l'intelligence artificielle sont représentées :

- **Fondamentaux de l'IA** — comprendre comment fonctionnent les modèles
- **Prompt Engineering** — maîtriser la communication avec les LLM
- **Outils no-code IA** — ChatGPT, Midjourney, Notion AI et autres
- **Développement IA** — APIs, LangChain, Python, intégrations
- **IA appliquée aux métiers** — marketing, design, juridique, finance, éducation
- **Actualités et veille** — ticker en temps réel sur les dernières évolutions (OpenAI, Anthropic…)

---

## ⚙️ Comment ça fonctionne

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   1. Inscription gratuite                                   │
│          │                                                  │
│          ▼                                                  │
│   2. Accès au catalogue — formations libres disponibles     │
│          │                                                  │
│          ▼                                                  │
│   3. Progression sauvegardée automatiquement                │
│          │                                                  │
│          ▼                                                  │
│   4. Certification obtenue à la fin de chaque parcours      │
│          │                                                  │
│          ▼                                                  │
│   5. Passage en Premium pour débloquer le contenu avancé    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Chaque utilisateur dispose d'un **profil personnalisé** avec ses statistiques de progression, ses formations en cours et ses certifications.

---

## 💎 Modèle d'accès

<div align="center">

| | Gratuit | Premium |
|-|---------|---------|
| Catalogue de base | ✅ | ✅ |
| Formations avancées | ❌ | ✅ |
| Certifications | ❌ | ✅ |
| Contenu exclusif | ❌ | ✅ |
| Support prioritaire | ❌ | ✅ |
| Accès anticipé | ❌ | ✅ |

</div>

L'abonnement Premium est géré via **Stripe Checkout** de manière entièrement sécurisée.

---

## 🔥 État du projet

Le projet est **en production et fonctionnel** mais le développement est actif et continu.

Les axes d'amélioration en cours :

- Optimisation des performances et du temps de chargement
- Enrichissement du catalogue (ajout régulier de formations)
- Amélioration de l'expérience mobile
- Nouvelles fonctionnalités pour l'espace membre
- Refactorisation progressive du code (CSS et JS désormais externalisés)

Les retours, signalements de bugs et contributions sont les bienvenus.

---

## 🛠️ Stack technique

<div align="center">

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Frontend | HTML5 · CSS3 · JavaScript ES6+ | Interface utilisateur |
| Typographie | Google Fonts — Fraunces + DM Sans | Design |
| Auth & BDD | Supabase (GoTrue + PostgreSQL) | Utilisateurs et données |
| Storage | Supabase Storage | Médias et fichiers |
| Edge Functions | Deno via Supabase | Logique serveur et checkout |
| Paiements | Stripe Checkout | Abonnements Premium |
| IDE | VS Code + extension Deno | Développement |

</div>

---

## 🏗️ Architecture

```
Browser
├── index.html     →  App principale (landing · cours · profil)
└── admin.html     →  Tableau de bord administrateur
         │
         ▼
Supabase
├── Auth (GoTrue)         →  Inscription, connexion, session
├── Database (PostgreSQL) →  Utilisateurs, formations, progressions
├── Storage               →  Médias et fichiers
└── Edge Functions (Deno)
    └── create-checkout   →  Création session Stripe
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
├── index.html                     # App principale
├── admin.html                     # Interface administrateur
├── README.md
│
├── css/
│   ├── style.css                  # Styles principaux (~8 600 lignes)
│   ├── password-checklist.css     # Checklist mot de passe (modale inscription)
│   └── nav-logged.css             # État connecté / navigation
│
├── js/
│   ├── main.js                    # Ticker + scroll reveal
│   ├── ui.js                      # UI complète : modales, navigation, reader de cours
│   ├── fixes.js                   # Correctifs boutons page détail cours
│   ├── stripe.js                  # Redirections et boutons Stripe
│   ├── supabase.min.js            # SDK Supabase bundlé (ne pas modifier)
│   ├── auth.js                    # Authentification : login, signup, OTP, profil
│   ├── catalogue.js               # Chargement dynamique du catalogue
│   ├── burger.js                  # Menu burger mobile
│   └── session.js                 # Timeout de session automatique (30 min)
│
├── favicon_io/
│   ├── favicon.svg
│   ├── favicon.ico
│   ├── favicon-32x32.png
│   ├── favicon-16x16.png
│   └── apple-touch-icon.png
│
└── supabase/
    └── functions/
        └── create-checkout/       # Edge Function Deno — session Stripe
```

> Les styles et scripts sont externalisés dans `css/` et `js/` — aucun build step requis.

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

Dans `js/auth.js`, remplace les deux valeurs :

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

# Netlify — drag & drop du dossier du projet
# GitHub Pages — activer sur la branche main
```

---

## 🔐 Sécurité

<div align="center">

| Mesure | Détail |
|--------|--------|
| Anti-clickjacking | `X-Frame-Options: DENY` |
| Anti-sniffing | `X-Content-Type-Options: nosniff` |
| Anti-XSS | `X-XSS-Protection: 1; mode=block` |
| Referrer | `strict-origin-when-cross-origin` |
| Session timeout | Auto-logout après 30 min d'inactivité |
| Warning session | Countdown 2 min avant expiration |
| Stripe | Validation de l'URL avant toute redirection |
| Avatars | Whitelist stricte des domaines autorisés |

</div>

---

## 🤝 Contribuer

```bash
git checkout -b feature/ma-feature
git commit -m "feat: description"
git push origin feature/ma-feature
# → Ouvrir une Pull Request
```

<div align="center">

| Préfixe | Usage |
|---------|-------|
| `feat:` | Nouvelle fonctionnalité |
| `fix:` | Correction de bug |
| `style:` | CSS / UI |
| `refactor:` | Refactorisation |
| `docs:` | Documentation |
| `chore:` | Maintenance |

</div>

---

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,24&height=100&section=footer" width="100%"/>

<div align="center">

*© 2025 IA Academy — Se Former. Innover. Transformer.*

</div>
