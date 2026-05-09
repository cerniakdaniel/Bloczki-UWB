# 🟦 Bloczki — Edytor Diagramów Blokowych z Generowaniem Pseudokodu

### Interaktywna aplikacja webowa do tworzenia diagramów blokowych i automatycznego generowania pseudokodu algorytmicznego.

---

### 📖 Opis projektu

Aplikacja pozwala budować diagramy blokowe w przeglądarce i automatycznie przekształcać je na pseudokod w języku polskim:

- **Edytor graficzny** — przeciągaj bloki na canvas, łącz je strzałkami z etykietami
- **Walidator** — sprawdza poprawność logiczną diagramu (brak START/STOP, bloki nieosiągalne, cykle bez wyjścia, niekompletne warunki)
- **Generator pseudokodu** — algorytm DFS przemierza graf i generuje czytelny pseudokod
- **Zapis i eksport** — diagramy zapisywane są w bazie danych, możliwy eksport do JSON

---

### 🚀 Uruchomienie

Projekt uruchamiany jest przy pomocy Docker Compose.

1. Upewnij się, że masz zainstalowany **Docker Desktop**
2. Sklonuj repozytorium
3. W głównym katalogu projektu uruchom:

```bash
docker-compose up --build
```

4. Otwórz przeglądarkę:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

---

### 🎮 Dostępne bloki

| Blok | Kolor | Opis |
|------|-------|------|
| 🟢 START | Zielony | Początek algorytmu |
| 🔴 STOP | Czerwony | Koniec algorytmu |
| 🔵 OPERATION | Niebieski | Operacja / przypisanie |
| 🟣 INPUT | Fioletowy | Wczytanie danych (read) |
| 🟠 OUTPUT | Pomarańczowy | Wypisanie danych (write) |
| 🟡 CONDITION | Żółty | Warunek (if/else) — wymaga gałęzi TAK i NIE |
| 🟩 LOOP_WHILE | Miętowy | Pętla warunkowa (while) |
| 🩵 LOOP_FOR | Turkusowy | Pętla zliczająca (for) |

---

### 🛠 Technologie

**Frontend:**
- **React 18** + **TypeScript** — interfejs użytkownika
- **ReactFlow** — interaktywny edytor graficzny (canvas)
- **Vite** — bundler i serwer deweloperski

**Backend:**
- **Node.js** + **Express.js** — REST API
- **NeDB** — wbudowana baza danych NoSQL (pliki lokalne)
- **uuid** — generowanie unikalnych identyfikatorów

**Infrastruktura:**
- **Docker** + **Docker Compose** — konteneryzacja
- **Jest** — testy jednostkowe

---

### 📂 Struktura projektu

```
bloczki/
├── backend/
│   ├── src/
│   │   ├── index.js              # Serwer Express
│   │   ├── routes/diagrams.js    # Endpointy REST API
│   │   ├── services/
│   │   │   ├── validator.js      # Walidacja diagramu (DFS)
│   │   │   └── generator.js      # Generowanie pseudokodu (DFS)
│   │   └── models/database.js    # Baza danych NeDB
│   └── tests/
│       ├── validator.test.js
│       └── generator.test.js
├── frontend/
│   └── src/
│       ├── App.tsx
│       ├── api/client.ts
│       ├── types/index.ts
│       └── components/Canvas/
│           ├── index.tsx
│           ├── CustomNode.tsx
│           ├── JunctionNode.tsx
│           └── EdgeLabelModal.tsx
├── data/
├── docker-compose.yml
└── README.md
```

---

### 🔌 API REST

| Metoda | Endpoint | Opis |
|--------|----------|------|
| POST | `/diagrams` | Utwórz nowy diagram |
| GET | `/diagrams` | Lista wszystkich diagramów |
| GET | `/diagrams/:id` | Pobierz diagram z blokami |
| PUT | `/diagrams/:id` | Zapisz stan diagramu |
| PATCH | `/diagrams/:id` | Zmień nazwę diagramu |
| DELETE | `/diagrams/:id` | Usuń diagram |
| POST | `/diagrams/:id/validate` | Zwaliduj diagram |
| POST | `/diagrams/:id/generate` | Wygeneruj pseudokod |
| POST | `/diagrams/:id/export` | Eksportuj do JSON |

---

### 🧪 Testy

```bash
cd backend
npm install
npm test
```

---

### GIT: https://github.com/cerniakdaniel/Bloczki-UWB
