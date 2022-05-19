export interface Translation {
  readonly header: string;
  readonly footer: string;
  readonly title: string;
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
  readonly titlePipeDesigner: string;
  readonly bodyPipeDesigner: string;
}

interface TranslationContainer {
  [lang: string]: Translation;
}

const TRANSLATIONS: TranslationContainer = {
  EN: {
    header: "Guzek UK",
    footer: "{YEAR} \u00a9 Konrad Guzek",
    title: "Guzek UK",
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
    titlePipeDesigner: "Pipe Designer",
    bodyPipeDesigner: "Redirecting to the pipe designer failed. Please try again later, or refresh your page manually.",
  },
  PL: {
    header: "Guzek UK",
    footer: "{YEAR} \u00a9 Konrad Guzek",
    title: "Guzek UK",
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
    titlePipeDesigner: "Kreator rur",
    bodyPipeDesigner: "Przekierowywanie do kreatora rur nie powiodło się. Spróbuj ponownie wkrótce lub odśwież stronę ręcznie.",
  },
};

export default TRANSLATIONS;
