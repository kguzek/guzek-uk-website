import { Translation } from ".";
import {
  LIVESERIES_SERVER_HOMEPAGE,
  LONG_DATE_FORMAT,
  SHORT_DATE_FORMAT,
  SHORT_TIME_FORMAT,
} from "./common";

export const POLISH: Translation = {
  footer: (year) => `${year} \u00a9 Konrad Guzek`,
  loading: "Trwa ładowanie strony",
  language: "Język",
  loginShort: "Zaloguj",
  dateFormat: new Intl.DateTimeFormat("pl-PL", LONG_DATE_FORMAT),
  dateShortFormat: new Intl.DateTimeFormat("pl-PL", SHORT_DATE_FORMAT),
  dateTimeFormat: new Intl.DateTimeFormat("pl-PL", {
    ...LONG_DATE_FORMAT,
    ...SHORT_TIME_FORMAT,
  }),
  dateTimeShortFormat: new Intl.DateTimeFormat("pl-PL", {
    ...SHORT_DATE_FORMAT,
    ...SHORT_TIME_FORMAT,
  }),
  numberFormat: new Intl.NumberFormat("pl-PL"),
  networkError:
    "Nastąpił błąd sieciowy podczas wykonywania tej czynności. Spróbuj wkrótce ponownie.",
  unknownError:
    "Nastąpił nieoczekiwany bład. Proszę skontaktować się z konrad@guzek.uk",
  loggedOut: "Wylogowano z konta.",
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
    },
  },
  error: {
    400: {
      title: "Błąd Zapytania",
      body: "Zapytanie nie zostało zrozumiane. Spróbuj ponownie.",
    },
    401: {
      title: "Nieautoryzowano",
      body: "Ta strona jest dostępna tylko dla zalogowanych użytkowników.",
    },
    403: {
      title: "Zabroniono",
      body: "Nie masz uprawnień do wyświetlania tego zasobu.",
    },
    404: {
      title: "Nie Znaleziono",
      body: "Nie znaleziono zasobu, którego szukasz.",
    },
    500: {
      title: "Błąd Serwera",
      body: "Nastąpił błąd serwera. Spróbuj ponownie później.",
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
  },
  liveSeries: {
    title: "LiveSeries",
    whatsThis: "Co to?",
    explanation: `Aby móc wyszukiwać i pobierać torrenty seriali, musisz skonfigurować serwer LiveSeries. Serwer ten będzie używany do pobierania torrentów i przesyłania do przeglądarki filmów. Dowiedz się więcej na ${LIVESERIES_SERVER_HOMEPAGE}`,
    tvShowList: {
      showing: "Wynik",
      of: "z",
      page: "Strona",
    },
    tvShow: {
      title: "Dane Serialu",
      unknown: "Nieznane",
      present: "Obecnie",
      source: "Źródło",
      images: "Galeria",
      episodes: "Odcinki",
      noEpisodes: "Brak odcinków do wyświetlenia.",
      episode: "Odcinek",
      season: "Sezon",
      like: "Polub",
      unlike: "Odlub",
      subscribe: "Włącz automatyczne pobieranie odcinków",
      confirmSubscribe: (unwatched) =>
        `Uwaga: Czy na pewno chcesz automatycznie pobierać wszystkie nieobejrzane odcinki dla tego serialu? Ilość nieobejrzanych odcinków: ${unwatched}.`,
      showDetails: "Dane Serialu",
      markWatched: (un) => `Zaznacz odcinek jako ${un}obejrzany`,
      markAllWatched: (un) =>
        `Zaznacz wszystkie odcinki w sezonie jako ${un}obejrzane`,
      un: "nie",
      unwatched: "Nieobejrzane",
    },
    search: {
      title: "Wyszukiwarka",
      label: "Wyszukaj Serial",
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
        `Na pewno chcesz usunąć ${episode} z serwera?`,
      deleted: (episode) => `Pomyślnie usunięto odcinek ${episode}.`,
      serialise: (episode) => `S${episode.season}:O${episode.episode}`,
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
