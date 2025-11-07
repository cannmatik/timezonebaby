"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import countriesData from "world-countries";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import { DateTime } from "luxon";

import {
  ThemeProvider,
  createTheme,
  Container,
  Box,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Paper,
  Divider,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";

import Head from "next/head";

// Theme - Dark mode with gradient simulation
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1a73e8",
      light: "#4285f4",
      dark: "#0d47a1",
    },
    secondary: {
      main: "#5f6368",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b3b3b3",
    },
    divider: "#333333",
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      lineHeight: 1.2,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(30, 30, 30, 0.8)",
          backdropFilter: "blur(10px)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.875rem",
          padding: "12px 24px",
        },
        contained: {
          backgroundColor: "#1a73e8",
          color: "white",
          "&:hover": {
            backgroundColor: "#0d47a1",
            transform: "scale(1.05)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            backgroundColor: "#121212",
            "& fieldset": {
              borderColor: "#333333",
            },
            "&:hover fieldset": {
              borderColor: "#555555",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#1a73e8",
            },
          },
        },
      },
    },
    MuiTimePicker: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-root": {
            borderRadius: 8,
            backgroundColor: "#121212",
            "& fieldset": {
              borderColor: "#333333",
            },
            "&:hover fieldset": {
              borderColor: "#555555",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#1a73e8",
            },
          },
        },
      },
    },
  },
});

interface CountryItem {
  code: string;
  name: string;
}

export default function Home() {
  const router = useRouter();

  // Ülke arama + seçim
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryItem | null>(null);

  // Zaman modu
  const [timeMode, setTimeMode] = useState<"now" | "custom">("custom");
  // TimePicker değeri DateTime | null
  const [timeValue, setTimeValue] = useState<DateTime | null>(null);

  const [error, setError] = useState("");

  // Tüm ülkeler
  const allCountries = useMemo<CountryItem[]>(() => {
    return countriesData.map((c) => ({
      code: c.cca2.toUpperCase(),
      name: c.name.common,
    }));
  }, []);

  // Ülke filtreleme
  const filteredCountries = useMemo<CountryItem[]>(() => {
    if (!search) return allCountries;
    const lower = search.toLowerCase();
    return allCountries.filter(
      (c) =>
        c.code.toLowerCase().includes(lower) ||
        c.name.toLowerCase().includes(lower)
    );
  }, [search, allCountries]);

  // Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedCountry) {
      setError("Please select a valid country from the list.");
      return;
    }

    if (timeMode === "now") {
      router.push(`/${selectedCountry.code.toLowerCase()}now`);
      return;
    }

    // custom => TimePicker değeri kontrol et
    if (!timeValue) {
      setError("Please pick a valid time or choose 'now'.");
      return;
    }

    // DateTime'dan HHMM çıkar
    const hour = timeValue.hour.toString().padStart(2, "0");
    const minute = timeValue.minute.toString().padStart(2, "0");
    const sanitizedTime = `${hour}${minute}`;

    router.push(`/${selectedCountry.code.toLowerCase()}${sanitizedTime}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <Head>
          <title>TimeZone.Baby - Home</title>
          <meta name="description" content="Choose a country and time to explore timezones" />
        </Head>
        <Box
          sx={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #121212 0%, #000000 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 3,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Gradient Overlay for depth */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "radial-gradient(circle at 20% 80%, rgba(26, 115, 232, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 0, 0, 0.1) 0%, transparent 50%)",
              zIndex: 0,
            }}
          />

          <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
            {/* Başlık */}
            <Typography
              variant="h1"
              component="h1"
              sx={{
                textAlign: "center",
                mb: 2,
                fontWeight: 700,
                color: "text.primary",
                fontSize: { xs: "2rem", md: "2.5rem" },
              }}
            >
              Welcome to TimeZone.Baby
            </Typography>
            <Typography
              variant="body1"
              sx={{
                textAlign: "center",
                mb: 4,
                color: "text.secondary",
              }}
            >
              Choose a country and a time mode, then click “Go.”
            </Typography>

            {/* Hata */}
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {/* Form */}
            <Paper
              component="form"
              onSubmit={handleSubmit}
              sx={{
                p: 4,
                borderRadius: 2,
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {/* Ülke arama */}
              <Box>
                <FormLabel sx={{ mb: 1, color: "text.primary", fontWeight: 600 }}>
                  Search or Select a Country
                </FormLabel>
                <TextField
                  placeholder="Type name or code (e.g. TR, Turkey)..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSelectedCountry(null);
                  }}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
                {search && (
                  <Paper
                    sx={{
                      mt: 1,
                      maxHeight: 160,
                      overflow: "auto",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <List disablePadding>
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map((item) => {
                          const isSelected = selectedCountry?.code === item.code;
                          return (
                            <ListItem
                              key={item.code}
                              disablePadding
                              onClick={() => {
                                setSelectedCountry(item);
                                setSearch(item.name);
                              }}
                              sx={{
                                cursor: "pointer",
                                "&:hover": {
                                  bgcolor: "action.hover",
                                },
                                bgcolor: isSelected ? "primary.main" : "transparent",
                                color: isSelected ? "white" : "inherit",
                              }}
                            >
                              <ListItemText
                                primary={`${item.name} (${item.code})`}
                                primaryTypographyProps={{
                                  fontWeight: isSelected ? 600 : 500,
                                }}
                              />
                              {isSelected && (
                                <ListItemIcon sx={{ minWidth: 32, justifyContent: "flex-end" }}>
                                  <CheckCircleIcon sx={{ color: "white", fontSize: 20 }} />
                                </ListItemIcon>
                              )}
                            </ListItem>
                          );
                        })
                      ) : (
                        <ListItem disablePadding>
                          <ListItemText primary="No matching countries found." sx={{ color: "text.secondary" }} />
                        </ListItem>
                      )}
                    </List>
                  </Paper>
                )}
              </Box>

              {/* Zaman Modu */}
              <FormControl>
                <FormLabel sx={{ color: "text.primary", fontWeight: 600 }}>
                  Time Mode
                </FormLabel>
                <RadioGroup
                  value={timeMode}
                  onChange={(e) => setTimeMode(e.target.value as "now" | "custom")}
                  row
                  sx={{ mt: 1 }}
                >
                  <FormControlLabel value="now" control={<Radio />} label="Now" />
                  <FormControlLabel value="custom" control={<Radio />} label="Custom (HH:mm)" />
                </RadioGroup>
              </FormControl>

              {/* Custom ise TimePicker göster */}
              {timeMode === "custom" && (
                <Box>
                  <FormLabel sx={{ mb: 1, color: "text.primary", fontWeight: 600 }}>
                    Pick Time
                  </FormLabel>
                  <TimePicker
                    value={timeValue}
                    onChange={setTimeValue}
                    ampm={false} // 24 saatlik format için
                    sx={{ width: "100%" }}
                  />
                </Box>
              )}

              {/* Buton */}
              <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 2 }}>
                Go
              </Button>
            </Paper>
          </Container>

          {/* Footer */}
          <Box sx={{ mt: 6, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Developed by{" "}
              <Typography component="span" variant="body2" color="primary" fontWeight={700} sx={{ fontSize: "1.25rem" }}>
                Can Matik
              </Typography>
              {" "}With{" "}
              <Typography component="span" variant="body2" color="error" fontWeight={700} sx={{ fontSize: "1.25rem", animation: "pulse 2s infinite" }}>
                Love
              </Typography>
            </Typography>
          </Box>
        </Box>

        <style jsx global>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </LocalizationProvider>
    </ThemeProvider>
  );
}