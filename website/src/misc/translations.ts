import { Episode, ErrorCode, ErrorPageContent, Language } from "./models";

const LONG_DATE_FORMAT = {
  day: "2-digit",
  month: "long",
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
  footer: string;
  loading: string;
  language: string;
  loginShort: string;
  dateFormat: Intl.DateTimeFormat;
  dateTimeFormat: Intl.DateTimeFormat;
  numberFormat: Intl.NumberFormat;
  networkError: string;
  loggedOut: string;
  profile: {
    title: string;
    body: string;
    loading: string;
    invalidCredentials: string;
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
      markWatched: string;
      markAllWatched: string;
      un: string;
      serialiseEpisode: (episode: Episode) => string;
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
    };
    mostPopular: {
      title: string;
    };
    download: {
      pending: string;
      failed: string;
      downloaded: string;
    };
  };
  error: { [code in ErrorCode]: ErrorPageContent };
}>;

const TRANSLATIONS: { [lang in Language]: Translation } = {
  EN: {
    footer: "{YEAR} \u00a9 Konrad Guzek",
    loading: "Loading",
    language: "Language",
    loginShort: "Log in",
    dateFormat: new Intl.DateTimeFormat("en-GB", LONG_DATE_FORMAT),
    dateTimeFormat: new Intl.DateTimeFormat("en-GB", {
      ...LONG_DATE_FORMAT,
      ...SHORT_TIME_FORMAT,
    }),
    numberFormat: new Intl.NumberFormat("en-GB"),
    networkError:
      "A network error occurred while performing this action. Please try again later.",
    loggedOut: "You have been logged out.",
    profile: {
      title: "Profile",
      body: "Welcome to your profile!",
      loading: "Validating",
      invalidCredentials: "Invalid credentials.",
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
        markWatched: "Mark episode as {UN}watched",
        markAllWatched: "Mark all episodes in season as {UN}watched",
        un: "un",
        serialiseEpisode: (episode) =>
          `S${episode.season.toString().padStart(2, "0")}E${episode.episode
            .toString()
            .padStart(2, "0")}`,
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
        noLikes: "You have no liked shows.",
        explore: "Explore",
        shows: "Shows",
        login: "You must be logged in to use that function.",
      },
      mostPopular: {
        title: "Most Popular",
      },
      download: {
        pending: "Download pending",
        failed: "Download failed",
        downloaded: "Downloaded",
      },
    },
  },
  PL: {
    footer: "{YEAR} \u00a9 Konrad Guzek",
    loading: "Trwa ładowanie strony",
    language: "Język",
    loginShort: "Zaloguj",
    dateFormat: new Intl.DateTimeFormat("pl-PL", LONG_DATE_FORMAT),
    dateTimeFormat: new Intl.DateTimeFormat("pl-PL", {
      ...LONG_DATE_FORMAT,
      ...SHORT_TIME_FORMAT,
    }),
    numberFormat: new Intl.NumberFormat("pl-PL"),
    networkError:
      "Nastąpił błąd sieciowy podczas wykonywania tej czynności. Spróbuj ponownie wkrótce.",
    loggedOut: "Wylogowano z konta.",
    profile: {
      title: "Profil",
      body: "Witamy na Twoim profilu!",
      loading: "Trwa walidacja",
      invalidCredentials: "Niepoprawne dane loginowe.",
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
        markWatched: "Zaznacz odcinek jako {UN}obejrzany",
        markAllWatched:
          "Zaznacz wszystkie odcinki w sezonie jako {UN}obejrzane",
        un: "nie",
        serialiseEpisode: (episode) => `S${episode.season}:O${episode.episode}`,
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
        noLikes: "Nie masz żadnych polubionych seriali.",
        explore: "Przeglądaj",
        shows: "Seriale",
        login: "Żeby skorzystać z tej funkcji, musisz się zalogować.",
      },
      mostPopular: {
        title: "Najpopularniejsze",
      },
      download: {
        pending: "Oczekuje na pobranie",
        failed: "Pobranie nie powiodło się",
        downloaded: "Pobrane",
      },
    },
  },
};

export default TRANSLATIONS;
