import { ErrorCode, ErrorPageContent, Language } from "./models";

export interface Translation {
  readonly footer: string;
  readonly loading: string;
  readonly language: string;
  readonly loginShort: string;
  readonly pipeDesigner: {
    title: string;
    body: string;
  };
  readonly profile: {
    title: string;
    body: string;
    loading: string;
    invalidCredentials: string;
    readonly formDetails: {
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
  readonly contentManager: {
    title: string;
    selectedPage: string;
    addPage: string;
    readonly formDetails: {
      title: string;
      url: string;
      adminOnly: string;
      shouldFetch: string;
      localUrl: string;
      update: string;
    };
  };
  readonly liveSeries: {
    title: "LiveSeries";
  };
  readonly error: { [code in ErrorCode]: ErrorPageContent };
}

const TRANSLATIONS: { [lang in Language]: Translation } = {
  EN: {
    footer: "{YEAR} \u00a9 Konrad Guzek",
    loading: "Loading",
    language: "Language",
    loginShort: "Log in",
    pipeDesigner: {
      title: "Pipe Designer",
      body: "Redirecting to the pipe designer failed. Please try again later, or refresh your page manually.",
    },
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
    },
  },
  PL: {
    footer: "{YEAR} \u00a9 Konrad Guzek",
    loading: "Trwa ładowanie strony",
    language: "Język",
    loginShort: "Zaloguj",
    pipeDesigner: {
      title: "Kreator Rur",
      body: "Przekierowywanie do kreatora rur nie powiodło się. Spróbuj ponownie wkrótce lub odśwież stronę ręcznie.",
    },
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
    },
  },
};

export default TRANSLATIONS;
