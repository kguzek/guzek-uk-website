import {
  Episode,
  ErrorCode,
  ErrorPageContent,
  Language,
  DownloadedEpisode,
} from "./models";

const LONG_DATE_FORMAT = {
  day: "2-digit",
  month: "long",
  year: "numeric",
} as const;

const SHORT_DATE_FORMAT = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
} as const;

const SHORT_TIME_FORMAT = {
  hour: "2-digit",
  minute: "2-digit",
} as const;

// const LONG_TIME_FORMAT = {
//   ...SHORT_TIME_FORMAT,
//   second: "2-digit",
// } as const;

export type Translation = Readonly<{
  footer: (year: string) => string;
  loading: string;
  language: string;
  loginShort: string;
  dateFormat: Intl.DateTimeFormat;
  dateShortFormat: Intl.DateTimeFormat;
  dateTimeFormat: Intl.DateTimeFormat;
  dateTimeShortFormat: Intl.DateTimeFormat;
  numberFormat: Intl.NumberFormat;
  networkError: string;
  unknownError: string;
  loggedOut: string;
  profile: {
    title: string;
    body: string;
    loading: string;
    invalidCredentials: string;
    passwordMismatch: string;
    formDetails: {
      username: string;
      email: string;
      creationDate: string;
      type: string;
      administrator: string;
      regularUser: string;
      password: string;
      passwordRepeat: string;
      login: string;
      signup: string;
      or: string;
      haveAccountAlready: string;
      logout: string;
    };
  };
  admin: {
    title: string;
    contentManager: {
      title: string;
      selectedPage: string;
      addPage: string;
      formDetails: {
        title: string;
        url: string;
        adminOnly: string;
        shouldFetch: string;
        localUrl: string;
        update: string;
      };
    };
    users: {
      title: string;
      confirmDelete: string;
      deleted: (username: string) => string;
    };
    logs: {
      title: string;
    };
  };
  modal: {
    yes: string;
    no: string;
  };
  liveSeries: {
    title: "LiveSeries";
    tvShowList: {
      showing: string;
      of: string;
      page: string;
    };
    tvShow: {
      title: string;
      unknown: string;
      present: string;
      source: string;
      images: string;
      episodes: string;
      episode: string;
      season: string;
      like: string;
      unlike: string;
      showDetails: string;
      markWatched: (un: string) => string;
      markAllWatched: (un: string) => string;
      un: string;
      unwatched: string;
    };
    search: {
      title: string;
      label: string;
      prompt: string;
      search: string;
      searching: string;
      cancel: string;
      results: string;
      noResults: string;
    };
    home: {
      title: string;
      noLikes: string;
      explore: string;
      shows: string;
      login: string;
      noUnwatched: string;
    };
    mostPopular: {
      title: string;
    };
    episodes: {
      downloadStatus: Record<DownloadedEpisode["status"], string>;
      downloadComplete: (episode: string) => string;
      downloadError: (episode: string) => string;
      confirmDelete: (episode: string) => string;
      deleted: (episode: string) => string;
      serialise: (episode: Pick<Episode, "episode" | "season">) => string;
    };
    watch: {
      playbackError: string;
      previous: string;
      next: string;
    };
  };
  error: { [code in ErrorCode]: ErrorPageContent };
}>;

export const TRANSLATIONS: { [lang in Language]: Translation } = {
  EN: {
    footer: (year) => `${year} \u00a9 Konrad Guzek`,
    loading: "Loading",
    language: "Language",
    loginShort: "Log in",
    dateFormat: new Intl.DateTimeFormat("en-GB", LONG_DATE_FORMAT),
    dateShortFormat: new Intl.DateTimeFormat("en-GB", SHORT_DATE_FORMAT),
    dateTimeFormat: new Intl.DateTimeFormat("en-GB", {
      ...LONG_DATE_FORMAT,
      ...SHORT_TIME_FORMAT,
    }),
    dateTimeShortFormat: new Intl.DateTimeFormat("en-GB", {
      ...SHORT_DATE_FORMAT,
      ...SHORT_TIME_FORMAT,
    }),
    numberFormat: new Intl.NumberFormat("en-GB"),
    networkError:
      "A network error occurred while performing this action. Please try again later.",
    unknownError: "An unknown error occured. Please contact konrad@guzek.uk",
    loggedOut: "You have been logged out.",
    profile: {
      title: "Profile",
      body: "Welcome to your profile!",
      loading: "Validating",
      invalidCredentials: "Invalid credentials.",
      passwordMismatch: "Passwords do not match.",
      formDetails: {
        username: "Username",
        email: "Email",
        creationDate: "Account creation date",
        type: "Account type",
        administrator: "administrator",
        regularUser: "regular user",
        password: "Password",
        passwordRepeat: "Repeat password",
        login: "Log In",
        signup: "Sign Up",
        or: "or",
        haveAccountAlready: "have an account already?",
        logout: "Log out",
      },
    },
    error: {
      401: {
        title: "Unauthorized",
        body: "This page is only available to logged in users.",
      },
      403: {
        title: "Forbidden",
        body: "You do not have permission to view this resource.",
      },
      404: {
        title: "Not Found",
        body: "The requested resource was not found.",
      },
    },
    admin: {
      title: "Admin Tools",
      contentManager: {
        title: "Content Manager",
        selectedPage: "Selected page",
        addPage: "Create page",
        formDetails: {
          title: "Title",
          url: "URL",
          adminOnly: "Admin only",
          localUrl: "Dynamic",
          shouldFetch: "Custom contents",
          update: "Update",
        },
      },
      users: {
        title: "Users",
        confirmDelete: "Are you sure you want to delete this user?",
        deleted: (username) => `User ${username} has been deleted.`,
      },
      logs: {
        title: "Logs",
      },
    },
    modal: {
      yes: "Yes",
      no: "No",
    },
    liveSeries: {
      title: "LiveSeries",
      tvShowList: {
        showing: "Showing",
        of: "of",
        page: "Page",
      },
      tvShow: {
        title: "Show Details",
        unknown: "Unknown",
        present: "Present",
        source: "Source",
        images: "Gallery",
        episodes: "Episodes",
        episode: "Episode",
        season: "Season",
        like: "Like",
        unlike: "Unlike",
        showDetails: "Show Details",
        markWatched: (un) => `Mark episode as ${un}watched`,
        markAllWatched: (un) => `Mark all episodes in season as ${un}watched`,
        un: "un",
        unwatched: "Unwatched",
      },
      search: {
        title: "Search",
        label: "Search TV Shows",
        prompt: "What would you like to watch?",
        search: "Search",
        searching: "Searching",
        cancel: "Cancel",
        results: "Results for",
        noResults:
          "Your query returned no results. Try searching for something else.",
      },
      home: {
        title: "Home",
        noLikes:
          "Welcome to LiveSeries! To get started, find a show to watch. \n\
Use the search bar to find your favourite TV shows, or explore the most popular ones. \n\
Once you find a show you like, click the heart icon to add it to your liked shows—you will then find it here!",
        explore: "Explore",
        shows: "Shows",
        login: "You must be logged in to use that function.",
        noUnwatched: "You're all up-to-date!",
      },
      mostPopular: {
        title: "Most Popular",
      },
      episodes: {
        downloadStatus: {
          1: "Download",
          2: "Downloading",
          3: "Watch",
          4: "Download failed",
          5: "Unknown status",
          6: "Verifying",
        },
        downloadComplete: (episode) => `${episode} has finished downloading.`,
        downloadError: (episode) => `${episode} download has failed.`,
        confirmDelete: (episode) =>
          `Are you sure you want to delete ${episode} from the server?`,
        deleted: (episode) => `Episode ${episode} was successfully deleted.`,
        serialise: (episode) =>
          `S${episode.season.toString().padStart(2, "0")}E${episode.episode
            .toString()
            .padStart(2, "0")}`,
      },
      watch: {
        playbackError:
          "There was a problem playing that video. Please try again later.",
        previous: "Previous",
        next: "Next",
      },
    },
  },
  PL: {
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
      formDetails: {
        username: "Nazwa użytkownika",
        email: "Email",
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
      },
    },
    error: {
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
    },
    admin: {
      title: "Narzędzia Administracyjne",
      contentManager: {
        title: "Edytor Treści",
        selectedPage: "Wybrana strona",
        addPage: "Stwórz stronę",
        formDetails: {
          title: "Tytuł",
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
        episode: "Odcinek",
        season: "Sezon",
        like: "Polub",
        unlike: "Odlub",
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
    },
  },
};
