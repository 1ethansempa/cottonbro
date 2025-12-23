export const POPULAR_GOOGLE_FONTS = [
  "Roboto",
  "Open Sans",
  "Montserrat",
  "Lato",
  "Poppins",
  "Roboto Condensed",
  "Inter",
  "Oswald",
  "Raleway",
  "Nunito",
  "Ubuntu",
  "Merriweather",
  "Playfair Display",
  "Rubik",
  "Lora",
  "PT Sans",
  "Work Sans",
  "Noto Sans",
  "Quicksand",
  "Barlow",
  "Karla",
  "Mukta",
  "Heebo",
  "Titillium Web",
  "PT Serif",
  "Fira Sans",
  "Libre Franklin",
  "Josefin Sans",
  "Inconsolata",
  "Anton",
  "Urbanist",
  "Shrikhand",
  "Chicle",
  "Chewy",
  "Modak",
  "Fascinate Inline",
];

const loadedFonts = new Set<string>();
const pendingFonts = new Map<string, Promise<void>>();

/**
 * Dynamically loads a Google Font via stylesheet injection.
 * @param fontName The name of the font (e.g., "Open Sans")
 */
export async function loadGoogleFont(fontName: string): Promise<void> {
  if (loadedFonts.has(fontName)) return;

  const existing = pendingFonts.get(fontName);
  if (existing) return existing;

  const loaderPromise = new Promise<void>((resolve) => {
    if (typeof document === "undefined") {
      resolve();
      return;
    }

    const encodedName = encodeURIComponent(fontName).replace(/%20/g, "+");
    const selector = `link[data-google-font="${encodedName}"]`;
    let link = document.head.querySelector<HTMLLinkElement>(selector);

    if (!link) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      link.crossOrigin = "anonymous";
      link.dataset.googleFont = encodedName;
      link.href = `https://fonts.googleapis.com/css2?family=${encodedName}:wght@400;500;600;700&display=swap`;
      document.head.appendChild(link);
    }

    const fontFamilyCss = `"${fontName}"`;

    const finalize = () => {
      pendingFonts.delete(fontName);
      loadedFonts.add(fontName);
      resolve();
    };

    const fontSet = document.fonts;
    if (fontSet?.check?.(`1em ${fontFamilyCss}`)) {
      finalize();
      return;
    }

    if (fontSet?.load) {
      fontSet
        .load(`1em ${fontFamilyCss}`)
        .then(finalize)
        .catch((err) => {
          console.warn(`Font load fallback for ${fontName}`, err);
          finalize();
        });
    } else {
      link.addEventListener("load", finalize, { once: true });
      link.addEventListener(
        "error",
        () => {
          console.error(`Failed to load font stylesheet: ${fontName}`);
          finalize();
        },
        { once: true }
      );
    }
  });

  pendingFonts.set(fontName, loaderPromise);
  return loaderPromise;
}
