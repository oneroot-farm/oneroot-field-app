export const DEFAULT_THEME = "light";

export const getOtherTheme = (theme) => {
  switch (theme) {
    case "dark":
      return "light";
    case "light":
      return "dark";
    case "system":
    default:
      return DEFAULT_THEME;
  }
};

export const getColors = (theme) => {
  if (theme === "dark") {
    return {
      primary: {
        main: "#76A63A",
        white: "#FBFCFC",
        black: "#010101",
        grey1: "#BCBCBB",
        grey2: "#6C6C74",
        grey3: "#DDDDDD",
        grey4: "#423E3E",
        grey5: "#E4ECEC",
        grey6: "#545454",
        grey7: "#D4D4D4",
        fresh: "#BFF27C",
        info: "#1E73EA",
        warning: "#F4EC7C",
        notification: "#FFA687",
        alert: "#D32F2F",
        transparent: "transparent",

        "projection-requested": "#84BCD4",
        "projection-accepted": "#76A63A",
        "projection-declined": "#FFA687",

        "indent-unassigned": "#E8E8E2",
        "indent-requested": "#84BCD4",
        "indent-loading": "#F4EC7C",
        "indent-in-transit": "#E8AA14",
        "indent-payment-pending": "#FFA687",
        "indent-completed": "#76A63A",

        "purchase-proceed-payment": "#FFA687",
        "purchase-paid": "#76A63A",
      },
      secondary: {
        main: "#76A63A",
        white: "#FBFCFC",
        black: "#010101",
        grey1: "#BCBCBB",
        grey2: "#6C6C74",
        grey3: "#DDDDDD",
        grey4: "#423E3E",
        grey5: "#E4ECEC",
        grey6: "#545454",
        grey7: "#D4D4D4",
        fresh: "#BFF27C",
        info: "#1E73EA",
        warning: "#F4EC7C",
        notification: "#FFA687",
        alert: "#D32F2F",
        transparent: "transparent",

        "projection-requested": "#84BCD4",
        "projection-accepted": "#76A63A",
        "projection-declined": "#FFA687",

        "indent-unassigned": "#E8E8E2",
        "indent-requested": "#84BCD4",
        "indent-loading": "#F4EC7C",
        "indent-in-transit": "#E8AA14",
        "indent-payment-pending": "#FFA687",
        "indent-completed": "#76A63A",

        "purchase-proceed-payment": "#FFA687",
        "purchase-paid": "#76A63A",
      },
    };
  }

  if (theme === "light") {
    return {
      primary: {
        main: "#76A63A",
        white: "#FBFCFC",
        black: "#010101",
        grey1: "#BCBCBB",
        grey2: "#6C6C74",
        grey3: "#DDDDDD",
        grey4: "#423E3E",
        grey5: "#E4ECEC",
        grey6: "#545454",
        grey7: "#D4D4D4",
        fresh: "#BFF27C",
        info: "#1E73EA",
        warning: "#F4EC7C",
        notification: "#FFA687",
        alert: "#D32F2F",
        transparent: "transparent",

        "projection-requested": "#84BCD4",
        "projection-accepted": "#76A63A",
        "projection-declined": "#FFA687",

        "indent-unassigned": "#E8E8E2",
        "indent-requested": "#84BCD4",
        "indent-loading": "#F4EC7C",
        "indent-in-transit": "#E8AA14",
        "indent-payment-pending": "#FFA687",
        "indent-completed": "#76A63A",

        "purchase-proceed-payment": "#FFA687",
        "purchase-paid": "#76A63A",
      },
      secondary: {
        main: "#76A63A",
        white: "#FBFCFC",
        black: "#010101",
        grey1: "#BCBCBB",
        grey2: "#6C6C74",
        grey3: "#DDDDDD",
        grey4: "#423E3E",
        grey5: "#E4ECEC",
        grey6: "#545454",
        grey7: "#D4D4D4",
        fresh: "#BFF27C",
        info: "#1E73EA",
        warning: "#F4EC7C",
        notification: "#FFA687",
        alert: "#D32F2F",
        transparent: "transparent",

        "projection-requested": "#84BCD4",
        "projection-accepted": "#76A63A",
        "projection-declined": "#FFA687",

        "indent-cc-unassigned": "#E8E8E2",
        "indent-requested": "#84BCD4",
        "indent-loading": "#F4EC7C",
        "indent-in-transit": "#E8AA14",
        "indent-payment-pending": "#FFA687",
        "indent-completed": "#76A63A",

        "purchase-proceed-payment": "#FFA687",
        "purchase-paid": "#76A63A",
      },
    };
  }

  return { primary: {}, secondary: {} };
};

export const generateSettings = (mode) => {
  // Colors
  const darkColors = getColors("dark");
  const lightColors = getColors("light");

  const ThemeOptions = {
    palette: {
      mode: mode,
      ...(mode === "dark"
        ? {
            primary: {
              ...darkColors.primary,
            },
            secondary: {
              ...darkColors.secondary,
            },
          }
        : {
            primary: {
              ...lightColors.primary,
            },
            secondary: {
              ...lightColors.secondary,
            },
          }),
    },
    typography: {
      fontFamily: ["Poppins", "sans-serif"].join(","),
      fontSize: 12,
      h1: {
        fontFamily: ["Poppins", "sans-serif"].join(","),
        fontSize: 40,
      },
      h2: {
        fontFamily: ["Poppins", "sans-serif"].join(","),
        fontSize: 32,
      },
      h3: {
        fontFamily: ["Poppins", "sans-serif"].join(","),
        fontSize: 24,
      },
      h4: {
        fontFamily: ["Poppins", "sans-serif"].join(","),
        fontSize: 20,
      },
      h5: {
        fontFamily: ["Poppins", "sans-serif"].join(","),
        fontSize: 16,
      },
      h6: {
        fontFamily: ["Poppins", "sans-serif"].join(","),
        fontSize: 14,
      },
    },
    shadows: ["none"],
  };

  return ThemeOptions;
};
