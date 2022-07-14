import { ErrorCode, ErrorPageContent, Language } from "./models";

export interface Translation {
  readonly header: string;
  readonly footer: string;
  readonly title: string;
  readonly loading: string;
  readonly language: string;
  readonly guest: string;
  readonly pipeDesigner: {
    title: string;
    body: string;
  };
  readonly profile: {
    body: string;
    loading: string;
    invalidCredentials: string;
  };
  readonly formDetails: {
    name: string;
    surname: string;
    email: string;
    password: string;
    passwordRepeat: string;
    login: string;
    signup: string;
    or: string;
    haveAccountAlready: string;
    logout: string;
  };
  readonly error: {
    [code in ErrorCode]: ErrorPageContent;
  };
}

const TRANSLATIONS: { [lang in Language]: Translation } = {
  EN: {
    header: "Guzek UK",
    footer: "{YEAR} \u00a9 Konrad Guzek",
    title: "Guzek UK",
    loading: "Loading",
    language: "Language",
    guest: "Guest",
    pipeDesigner: {
      title: "Pipe Designer",
      body: "Redirecting to the pipe designer failed. Please try again later, or refresh your page manually.",
    },
    profile: {
      body: "Welcome to your profile!",
      loading: "Validating",
      invalidCredentials: "Invalid credentials.",
    },
    formDetails: {
      name: "Name",
      surname: "Surname",
      email: "Email",
      password: "Password",
      passwordRepeat: "Repeat password",
      login: "Log In",
      signup: "Sign Up",
      or: "or",
      haveAccountAlready: "have an account already?",
      logout: "Log out",
    },
    error: {
      403: {
        title: "403 Forbidden",
        body: "403: You do not have permission to view this resource.",
      },
      404: {
        title: "404 Not Found",
        body: "404: The requested resource was not found.",
      },
    },
  },
  PL: {
    header: "Guzek UK",
    footer: "{YEAR} \u00a9 Konrad Guzek",
    title: "Guzek UK",
    loading: "Trwa ładowanie strony",
    language: "Język",
    guest: "Gość",
    pipeDesigner: {
      title: "Kreator rur",
      body: "Przekierowywanie do kreatora rur nie powiodło się. Spróbuj ponownie wkrótce lub odśwież stronę ręcznie.",
    },
    profile: {
      body: "Witamy na Twoim profilu!",
      loading: "Trwa walidacja",
      invalidCredentials: "Niepoprawne dane loginowe.",
    },
    formDetails: {
      name: "Imię",
      surname: "Nazwisko",
      email: "Email",
      password: "Hasło",
      passwordRepeat: "Hasło (ponownie)",
      login: "Zaloguj się",
      signup: "Załóż konto",
      or: "lub",
      haveAccountAlready: "masz już konto?",
      logout: "Wyloguj się",
    },

    error: {
      403: {
        title: "403 Zabroniono",
        body: "403: Nie masz uprawnień do wyświetlania tego zasobu.",
      },
      404: {
        title: "404 Nie Znaleziono",
        body: "404: Nie znaleziono zasobu, którego szukasz.",
      },
    },
  },
};

export default TRANSLATIONS;
