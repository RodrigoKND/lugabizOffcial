const isProduction = import.meta.env.MODE;

export const baseUrl = isProduction === "Production" ? "https://lugabiz-api.vercel.app" : "http://localhost:5432";
