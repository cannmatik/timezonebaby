"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import countriesData from "world-countries";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material"; // MUI icon for check
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

import Head from "next/head";

// Theme - Matching the previous page's theme, but with dark mode for home
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
      default: "#121212", // Dark gradient simulation via Box
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
  },
});

interface CountryItem {
  code: string;
  name: string;
}

export default function Home() {
  const router = useRouter();

  // For searching and selecting a country
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryItem | null>(null);

  // For time input
  const [timeMode, setTimeMode] = useState<"now" | "custom">("custom");
  const [time, setTime] = useState("");

  // Error messages
  const [error, setError] = useState("");

  // Build an array of countries from world-countries
  const allCountries = useMemo<CountryItem[]>(() => {
    return countriesData.map((c) => ({
      code: c.cca2.toUpperCase(),
      name: c.name.common,
    }));
  }, []);

  // Filter countries based on user search
  const filteredCountries = useMemo<CountryItem[]>(() => {
    if (!search) return allCountries;
    const lower = search.toLowerCase();
    return allCountries.filter(
      (c) =>
        c.code.toLowerCase().includes(lower) ||
        c.name.toLowerCase().includes(lower)
    );
  }, [search, allCountries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 1) Check if a country is selected
    if (!selectedCountry) {
      setError("Please select a valid country from the list.");
      return;
    }

    // 2) If user chose "now"
    if (timeMode === "now") {
      router.push(`/${selectedCountry.code.toLowerCase()}now`);
      return;
    }

    // 3) Otherwise, user must provide a valid HHMM
    const timeRegex = /^(0\d|1\d|2[0-3])([0-5]\d)$/;
    if (!timeRegex.test(time)) {
      setError("Please enter time in HHMM format (e.g. 1330).");
      return;
    }

    // 4) If all is good, push to the route
    router.push(`/${selectedCountry.code.toLowerCase()}${time}`);
  };

  return (
    <ThemeProvider theme={theme}>
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
          {/* Title */}
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
            Welcome to The TimeZone App
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

          {/* Error Message */}
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
            {/* Country Search */}
            <Box>
              <FormLabel sx={{ mb: 1, color: "text.primary", fontWeight: 600 }}>
                Search or Select a Country
              </FormLabel>
              <TextField
                placeholder="Type name or code (e.g. TR, Turkey)..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedCountry(null); // reset selected country if user changes search
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

            {/* Time Input Mode */}
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
                <FormControlLabel value="custom" control={<Radio />} label="Custom (HHMM)" />
              </RadioGroup>
            </FormControl>

            {/* If custom time is chosen, show input */}
            {timeMode === "custom" && (
              <Box>
                <FormLabel sx={{ mb: 1, color: "text.primary", fontWeight: 600 }}>
                  Time (HHMM)
                </FormLabel>
                <TextField
                  placeholder="e.g. 1330"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="small"
                  inputProps={{ maxLength: 4 }}
                />
              </Box>
            )}

            {/* Submit Button */}
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
    </ThemeProvider>
  );
}
