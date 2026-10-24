# TrustPass SHG — சுய உதவிக் குழு சேமிப்பு மேலாண்மை

TrustPass SHG is an offline-first digital savings and Self-Help Group (SHG) management system built for rural women's groups in Tamil Nadu, India. It provides a bilingual interface (Tamil & English) for managing groups, recording members, and tracking group activities.

## Features

- **Bilingual Interface**: Seamless switching between Tamil (`தமிழ்`) and English (`EN`).
- **Offline-First Connectivity Indicator**: Real-time status bar showing online and offline states with local persistent storage.
- **Group Management**:
  - View all active Self-Help Groups with meeting days, village/district locations, and member counts.
  - Create new groups with registration numbers, village, district, state, and scheduled meeting day.
  - View members belonging to each group.
- **Member Management**:
  - View member directories per group with roles (`MEMBER`, `TREASURER`, `PRESIDENT`, `ADMIN`).
  - Add registered users to groups with assigned roles.
  - On-demand user registration with phone number validation.
  - Soft-deactivation of members with confirmation safeguards.
- **Design System**: Fully responsive mobile-first UI tailored for accessible touch targets and typography with `Noto Sans Tamil` and `Inter`.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Dev Server**: Vite (running on port 3000)
- **Data Persistence**: Offline-capable local storage with seed data and business rule validation.

## Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```
