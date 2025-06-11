# projekt-inzynierski-pwa

## Spis treści
- [Wprowadzenie](#wprowadzenie)
- [Aplikacja PWA](#aplikacja-pwa)
- [Backend](#backend)

## Wprowadzenie
Projekt zakłada implementację i wdrożenie aplikacji PWA (Progressive Web Application) przeznaczonej do przechowywania oraz współdzielenia zasobów multimedialnych, takich jak zdjęcia, filmy, pliki tras itp. System umożliwia użytkownikom zarządzanie własnymi zasobami oraz dzielenie się nimi z innymi zarejestrowanymi użytkownikami.

Backend aplikacji zostanie zrealizowany w technologii ASP.NET z wykorzystaniem języka F#. Frontend zostanie oparty na nowoczesnym frameworku SPA (Single Page Application) - React TS, umożliwiającym dynamiczne i responsywne działanie interfejsu użytkownika w środowisku przeglądarkowym.

Dodatkowo, w ramach projektu powstanie narzędzie .NET umożliwiające efektywne przesyłanie dużych plików (np. filmów o rozmiarze do 4 GB), z zachowaniem stabilności i bezpieczeństwa transferu. Przechowywane materiały wideo będą zapisywane w oryginalnej jakości, jednak system zapewni również możliwość automatycznego lub ręcznego konwertowania ich do wersji o niższej jakości (tzw. downgrade), co pozwoli na płynne odtwarzanie na starszych urządzeniach lub w warunkach ograniczonego dostępu do szybkiego internetu.

Projekt zakłada również zastosowanie odpowiednich mechanizmów bezpieczeństwa, ochrony danych oraz skalowalnej architektury serwerowej, umożliwiającej dalszy rozwój funkcjonalny serwisu.
## Aplikacja PWA

### Jak uruchomić 🚀

#### Wymagania
- [Node.js](https://nodejs.org/en)

1. Pobierz pliki z repozytorium:
```bash
git clone https://github.com/AdrianZdankowski/projekt-inzynierski-pwa.git
cd projekt-inzynierski-pwa
```

2. Pobierz wymagane zależności:
```bash
npm install
```

3. Uruchom aplikację:
```bash
npm run dev
```

4. Jeśli funkcjonalność PWA nie działa, wykonaj:
```bash
npm run build
npm run preview
```
lub
```bash
npm run build
npm install -g serve
serve -s build
```
