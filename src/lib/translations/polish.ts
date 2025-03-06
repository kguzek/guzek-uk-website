import { LONG_DATE_FORMAT, SHORT_DATE_FORMAT, SHORT_TIME_FORMAT } from "@/lib/constants";

import type { Translation } from ".";

export const POLISH: Translation = {
  footer: (year) => `${year} \u00a9 Konrad Guzek`,
  loading: "Trwa ładowanie strony",
  redirecting: "Trwa przekierowywanie",
  language: "Język",
  loginShort: "Zaloguj",
  format: {
    date: new Intl.DateTimeFormat("pl-PL", LONG_DATE_FORMAT),
    dateShort: new Intl.DateTimeFormat("pl-PL", SHORT_DATE_FORMAT),
    dateTime: new Intl.DateTimeFormat("pl-PL", {
      ...LONG_DATE_FORMAT,
      ...SHORT_TIME_FORMAT,
    }),
    dateTimeShort: new Intl.DateTimeFormat("pl-PL", {
      ...SHORT_DATE_FORMAT,
      ...SHORT_TIME_FORMAT,
    }),
    number: new Intl.NumberFormat("pl-PL"),
    quote: (text) => `„${text}”`,
  },
  networkError:
    "Nastąpił błąd sieciowy podczas wykonywania tej czynności. Spróbuj wkrótce ponownie.",
  unknownError: "Nastąpił nieoczekiwany bład. Proszę skontaktować się z konrad@guzek.uk",
  loggedOut: "Wylogowano z konta.",
  placeholder: {
    email: "jan@kowalski.pl",
    username: "jankow",
  },
  profile: {
    title: "Profil",
    body: "Witamy na Twoim profilu!",
    loading: "Trwa walidacja",
    invalidCredentials: "Niepoprawne dane loginowe.",
    passwordMismatch: "Hasła się nie zgadzają.",
    passwordLength: "Hasło musi zawierać co najmniej 8 znaków.",
    serverUrlUpdated: (url) =>
      `Pomyślnie zaktualizowano URL serwera LiveSeries na ${url}`,
    formDetails: {
      username: "Nazwa użytkownika",
      email: "Email",
      loginPrompt: "Nazwa użytkownika lub email",
      creationDate: "Data utworzenia konta",
      type: "Typ konta",
      administrator: "administrator",
      regularUser: "zwykły",
      password: "Hasło",
      passwordRepeat: "Hasło (ponownie)",
      login: "Zaloguj się",
      signup: "Załóż konto",
      or: "lub",
      haveAccountAlready: "masz już konto?",
      logout: "Wyloguj się",
      serverUrl: "URL serwera LiveSeries",
      success: "Profil został zaktualizowany pomyślnie",
      verifyEmail: {
        header: "Weryfikacja Email",
        info: (email) =>
          `Email z linkiem weryfikacyjnym został wysłany na adres ${email || "podany w formularzu"}.`,
        cta: "Sprawdź swoją skrzynkę odbiorczą.",
        success: "Email został pomyślnie zweryfikowany",
      },
      forgotPassword: {
        header: "Nie znasz hasła",
        info: (email) =>
          `Jeśli na adres ${email || "podany w formularzu"} jest zarejestrowane konto, otrzyma ono email z linkiem do zmiany hasła.`,
        success: "Email z linkiem do zresetowania hasła został wysłany.",
      },
      resetPassword: {
        header: "Reset Hasła",
        field: "Nowe hasło",
        submit: "Zresetuj hasło",
        success: "Hasło zostało pomyślnie zresetowane",
      },
      delete: {
        label: "Usuń konto",
        confirmation: "Na pewno chcesz usunąć swoje konto?",
        currentUser: (user) => `Obecnie jesteś zalogowany jako ${user}`,
        success: "Konto zostało pomyślnie usunięte",
      },
    },
  },
  error: {
    400: {
      title: "Błąd Zapytania",
      body: "Zapytanie nie zostało zrozumiane. Spróbuj ponownie",
    },
    401: {
      title: "Nieautoryzowano",
      body: "Ta strona jest dostępna tylko dla zalogowanych użytkowników",
    },
    403: {
      title: "Zabroniono",
      body: "Nie masz uprawnień do wyświetlania tego zasobu",
    },
    404: {
      title: "Nie Znaleziono",
      body: "Nie znaleziono zasobu, którego szukasz",
    },
    500: {
      title: "Błąd Serwera",
      body: "Nastąpił błąd serwera. Spróbuj ponownie później",
    },
  },
  admin: {
    title: "Narzędzia Administracyjne",
    contentManager: {
      title: "Edytor Treści",
      selectedPage: "Wybrana strona",
      addPage: "Stwórz stronę",
      formDetails: {
        title: "Tytuł",
        label: "Etykieta",
        url: "URL",
        adminOnly: "Ukryta",
        localUrl: "Dynamiczna",
        shouldFetch: "Edytuj treść",
        update: "Zaktualizuj",
      },
    },
    users: {
      title: "Użytkownicy",
      confirmDelete: "Na pewno chcesz usunąć tego użytkownika?",
      deleted: (username) => `Pomyślnie usunięto użytkownika ${username}.`,
    },
    logs: {
      title: "Logi",
    },
  },
  modal: {
    yes: "Tak",
    no: "Nie",
    warnIrreversible: "Ta operacja jest nieodwracalna.",
  },
  projects: {
    title: "Projekty",
    download: "Pobierz",
    gallery: "Galeria",
    visit: "Odwiedź",
  },
  liveSeries: {
    title: "LiveSeries",
    whatsThis: "Co to?",
    explanation:
      "Aby móc wyszukiwać i pobierać torrenty seriali, musisz skonfigurować serwer LiveSeries. Serwer ten będzie używany do pobierania torrentów i przesyłania do przeglądarki filmów.",
    cta: "Dowiedz się więcej na ",
    setup: "Odwiedz swój profil aby ustawić adres serwera LiveSeries.",
    tvShowList: {
      showing: "Wynik",
      of: "z",
      page: "Strona",
      previous: "Poprzednia",
      next: "Następna",
    },
    tvShow: {
      title: "Dane Serialu",
      unknown: "Nieznane",
      present: "Obecnie",
      source: "Źródło",
      images: "Galeria",
      previousImage: "Poprzednie zdjęcie",
      nextImage: "Następne zdjęcie",
      episodes: "Odcinki",
      noEpisodes: "Brak odcinków do wyświetlenia.",
      episode: "Odcinek",
      season: "Sezon",
      like: "Polub",
      unlike: "Odlub",
      subscribe: "Włącz automatyczne pobieranie odcinków",
      unsubscribe: "Wyłącz automatyczne pobieranie odcinków",
      confirmSubscribe:
        "Czy na pewno chcesz automatycznie pobierać wszystkie nieobejrzane odcinki dla tego serialu?",
      unwatchedEpisodes: (unwatched) => `Liczba nieobejrzanych odcinków: ${unwatched}.`,
      showDetails: "Dane Serialu",
      markWatched: (un) => `Zaznacz odcinek jako ${un}obejrzany`,
      markAllWatched: (un) => `Zaznacz wszystkie odcinki w sezonie jako ${un}obejrzane`,
      un: "nie",
      unwatched: "Nieobejrzane",
    },
    search: {
      title: "Wyszukiwarka",
      label: "Wyszukaj Serial",
      labelShort: "Znajdź Serial",
      prompt: "Co chciałbyś obejrzeć?",
      search: "Wyszkuaj",
      searching: "Szukam",
      cancel: "Anuluj",
      results: "Wyniki wyszukania",
      noResults: "Brak wyników. Spróbuj wyszukać coś innego.",
    },
    home: {
      title: "Główna",
      likedShows: "Polubione Seriale",
      noLikes:
        "Witaj w serwisie LiveSeries! Aby zacząć, znajdź serial do obejrzenia. \n\
Użyj wyszukiwarki, aby znaleźć swój ulubiony serial, lub przeglądaj najpopularniejsze seriale. \n\
Gdy znajdziesz serial, który Ci się podoba, kliknij ikonę serca, aby dodać go do ulubionych—znajdziesz go potem tutaj!",
      explore: "Przeglądaj",
      shows: "Seriale",
      login: "Z tej funkcji mogą korzystać tylko użytkownicy zalogowani.",
      noUnwatched: "Nie masz żadnych nieobjerzanych odcinków!",
    },
    mostPopular: {
      title: "Najpopularniejsze",
    },
    episodes: {
      downloadStatus: {
        1: "Pobierz",
        2: "W trakcie pobierania",
        3: "Odtwórz",
        4: "Pobranie nie powiodło się",
        5: "Status pobierania nieznany",
        6: "Trwa weryfikacja",
      },
      downloadComplete: (episode) => `Pomyśłnie pobrano ${episode}.`,
      downloadError: (episode) => `Pobieranie ${episode} nie powiodło się.`,
      confirmDelete: (episode) =>
        `Czy na pewno chcesz usunąć z serwera odcinek ${episode}?`,
      deleted: (episode) => `Pomyślnie usunięto odcinek ${episode}.`,
      serialise: (episode) => `S${episode.season}:O${episode.number}`,
    },
    watch: {
      playbackError:
        "Nastąpił błąd podczas odtwarzania tego filmu. Spróbuj wkrótce ponownie.",
      previous: "Poprzedni",
      next: "Kolejny",
    },
    websockets: {
      connectionFailed:
        "Nie udało się nawiązać połączenia z serwerem. Upewnij się że URL serwera LiveSeries zostało skonfigurowane poprawnie i spróbuj ponownie później.",
      error:
        "Nastąpił nieoczekiwany błąd podczas komunikacji z serwerem LiveSeries. Spróbuj ponownie później.",
      askReconnect:
        "Połączenie z serwerem LiveSeries zostało przerwane. Ponowić próbę połączenia?",
    },
  },
};
