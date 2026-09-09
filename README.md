# Emoji Art

Zamień dowolne zdjęcie (upload z dysku albo URL) w mozaikę złożoną z emoji, która wizualnie odwzorowuje oryginał. Aplikacja działa w całości w przeglądarce — bez backendu.

## Spis treści

- [Szybki start](#szybki-start)
- [Funkcje](#funkcje)
- [Jak to działa](#jak-to-działa)
- [Struktura projektu](#struktura-projektu)
- [Znane ograniczenia](#znane-ograniczenia)
- [Stack technologiczny](#stack-technologiczny)

## Szybki start

Wymagany Node.js 20+.

```bash
npm install
npm run dev       # serwer deweloperski z HMR
```

Inne dostępne komendy:

```bash
npm run build     # typecheck (tsc -b) + build produkcyjny do dist/
npm run preview   # podgląd builda produkcyjnego
npm run lint      # oxlint
```

> Projekt nie ma jeszcze zestawu testów — `vitest` jest w `devDependencies` jako baza pod przyszłe testy logiki (`src/lib/`), ale nie ma skryptu `test` ani plików `*.test.ts`.

## Funkcje

- **Wejście**: upload pliku graficznego lub wklejony URL obrazu.
- **Rozdzielczość**: dowolna liczba kolumn × wierszy siatki emoji.
- **Sposób dopasowania**: po kolorze, po kształcie, albo mieszany z suwakiem wag kolor/kształt.
- **Styl emoji**: systemowe (czcionka emoji Twojego urządzenia), [Twemoji](https://github.com/jdecked/twemoji) lub [OpenMoji](https://github.com/hfg-gmuend/openmoji) — te dwa ostatnie rysowane jako realne grafiki, więc wyglądają tak samo niezależnie od systemu operacyjnego widza.
- **Typografia wyniku**: rozmiar czcionki, wysokość linii, odstęp między emoji — z podglądem na żywo, który pokazuje, jaki fragment zdjęcia zostanie przycięty.
- **Dwa tryby wyniku**:
  - **Tekst** — prawdziwy, kopiowalny blok tekstu złożony z emoji.
  - **Obraz** — render do pliku PNG (przydatny przy wysokich rozdzielczościach, gdzie tryb tekstowy przestaje być praktyczny), z konfigurowalnym rozmiarem komórki.
- Dopasowywanie i renderowanie obrazu działają w Web Workerach (z paskiem postępu), więc interfejs nie zamraża się nawet przy dużych siatkach.
- Cechy palety emoji (kolor + kształt) są liczone raz i trzymane w pamięci podręcznej (IndexedDB), więc kolejne generowania są dużo szybsze.
- Ustawienia zapisują się w `localStorage` i wracają po odświeżeniu strony.

## Jak to działa

1. Obraz źródłowy jest przycinany do proporcji zgodnej z rzeczywistym kształtem jednej komórki (mierzonym w DOM na podstawie rozmiaru czcionki, wysokości linii i odstępów), a nie zakładanego kwadratu.
2. Przycięty obraz jest dzielony na siatkę `kolumny × wiersze`, a każda komórka jest próbkowana do średniego koloru (w przestrzeni Lab) oraz uproszczonej mapy jasności 8×8 (kształt).
3. Każdy kandydat z palety emoji (kilkaset znaków) jest renderowany raz do ukrytego canvasu i analizowany dokładnie w ten sam sposób, więc komórki obrazu i emoji są bezpośrednio porównywalne.
4. Dla każdej komórki wybierany jest emoji o najmniejszym dystansie (kolor / kształt / ważona kombinacja obu).
5. Wynik renderowany jest jako tekst (czcionka emoji przeglądarki) albo jako obraz PNG (prawdziwe grafiki stylu Twemoji/OpenMoji albo `fillText` dla stylu systemowego).

Szczegóły implementacji poszczególnych kroków (z odwołaniami do konkretnych plików) opisuje [`CLAUDE.md`](./CLAUDE.md).

## Struktura projektu

```
src/
  components/     komponenty UI (upload, ustawienia, podgląd, wyniki tekst/obraz)
  state/          globalny stan (Zustand, z persystencją ustawień)
  lib/            cała logika: wczytywanie obrazu, ekstrakcja cech emoji,
                  próbkowanie obrazu, dopasowywanie, renderowanie, eksport
  workers/        Web Workery: dopasowywanie emoji (convert.worker.ts)
                  i render obrazu PNG (render.worker.ts)
```

## Znane ograniczenia

- **CORS przy wklejaniu URL** — odczyt pikseli obrazu z innej domeny wymaga, żeby serwer wysyłał nagłówki CORS. Jeśli się nie uda, aplikacja pokaże czytelny komunikat z sugestią pobrania i wgrania pliku ręcznie. To ograniczenie wynika z braku backendu (świadoma decyzja projektowa) i nie da się go obejść wyłącznie po stronie klienta.
- **Tryb tekstowy a styl emoji** — prawdziwy tekst zawsze renderuje się czcionką emoji urządzenia osoby, która na niego patrzy. Wybrany styl (Twemoji/OpenMoji) wpływa na to, *które* emoji zostały dobrane, ale nie zagwarantuje identycznego wyglądu w trybie tekstowym — pełną gwarancję stylu daje wyłącznie eksport do PNG, bo tam rysowane są realne grafiki.
- **Style Twemoji/OpenMoji** pobierają grafiki z jsDelivr (`cdn.jsdelivr.net`) w locie — wymagają połączenia z internetem i dostępności tego CDN-a.
- **Licencje grafik**: Twemoji — CC-BY 4.0, OpenMoji — CC-BY-SA 4.0 (obrazy wyeksportowane w stylu OpenMoji podlegają wymogowi share-alike). Odpowiednia adnotacja pojawia się w stopce aplikacji przy wybranym stylu.

## Stack technologiczny

React + TypeScript + Vite, Zustand (stan), `culori` (konwersje kolorów RGB↔Lab). Brak backendu — całość liczona w przeglądarce (Canvas API, Web Workers, OffscreenCanvas, IndexedDB).
