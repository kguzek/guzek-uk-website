export interface Translation {
  readonly header: string;
  readonly footer: string;
  readonly title: string;
  readonly loading: string;
  readonly language: string;
  readonly bodyHome: string;
  readonly bodyKonrad: string;
  readonly goHome: string;
  readonly goKonrad: string;
  readonly guest: string;
  readonly title403: string;
  readonly title404: string;
  readonly body403: string;
  readonly body404: string;
  readonly pipeDesigner: {
    title: string;
    body: string;
  };
  readonly profile: {
    body: string;
    loading: string;
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
}

const TRANSLATIONS: { [lang: string]: Translation } = {
  EN: {
    header: "Guzek UK",
    footer: "{YEAR} \u00a9 Konrad Guzek",
    title: "Guzek UK",
    loading: "Loading",
    language: "Language",
    bodyHome: "Welcome to the Guzek UK Homepage!",
    bodyKonrad: "Welcome to Konrad's Homepage!",
    goHome: "Home",
    goKonrad: "Konrad",
    guest: "Guest",
    title403: "403 Forbidden",
    title404: "404 Not Found",
    body403: "403: You do not have permission to view this resource.",
    body404: "404: The requested resource was not found.",
    pipeDesigner: {
      title: "Pipe Designer",
      body: "Redirecting to the pipe designer failed. Please try again later, or refresh your page manually.",
    },
    profile: {
      body: "Welcome to your profile!",
      loading: "Loading profile",
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
  },
  PL: {
    header: "Guzek UK",
    footer: "{YEAR} \u00a9 Konrad Guzek",
    title: "Guzek UK",
    loading: "Trwa ładowanie strony",
    language: "Język",
    bodyHome: "Witaj na stronie głównej Guzek UK!",
    bodyKonrad: "Witaj na stronie Konrada!",
    goHome: "Strona Główna",
    goKonrad: "Konrad",
    guest: "Gość",
    title403: "403 Zabroniono",
    title404: "404 Nie Znaleziono",
    body403: "403: Nie masz uprawnień do wyświetlania tego zasobu.",
    body404: "404: Nie znaleziono zasobu, którego szukasz.",
    pipeDesigner: {
      title: "Kreator rur",
      body: "Przekierowywanie do kreatora rur nie powiodło się. Spróbuj ponownie wkrótce lub odśwież stronę ręcznie.",
    },
    profile: {
      body: "Witamy na Twoim profilu!",
      loading: "Trwa ładowanie profilu",
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
  },
};

export default TRANSLATIONS;
