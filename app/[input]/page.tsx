"use client";

import React, { useState, useMemo, useEffect } from "react";
import { use } from "react";
import { DateTime } from "luxon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Head from "next/head";
import countriesData from "world-countries";
import moment from "moment-timezone";
import * as Flags from "country-flag-icons/react/3x2";
import { 
  GlobeAltIcon,
  ChevronDownIcon, 
  ChevronUpIcon, 
  XMarkIcon, 
  MagnifyingGlassIcon 
} from "@heroicons/react/24/outline";

// MUI Imports
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { 
  TextField, 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  FormControl, 
  FormLabel, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  Typography, 
  Box, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText, 
  Collapse,
  ListItemButton,
  Chip,
  Alert,
  Paper,
  Container
} from "@mui/material";

import CountrySelector, { Country } from "@/components/CountrySelector";

// DeepSeek inspired theme - Clean, modern, professional
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1a73e8",
      light: "#4285f4",
      dark: "#0d47a1",
    },
    secondary: {
      main: "#5f6368",
    },
    background: {
      default: "#f8f9fa",
      paper: "#ffffff",
    },
    text: {
      primary: "#202124",
      secondary: "#5f6368",
    },
    divider: "#dadce0",
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    h1: {
      fontSize: "2.5rem",
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 500,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          border: "1px solid #e8eaed",
          transition: "box-shadow 0.2s ease",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 500,
          fontSize: "0.875rem",
          padding: "8px 16px",
        },
        contained: {
          backgroundColor: "#1a73e8",
          color: "white",
          "&:hover": {
            backgroundColor: "#0d47a1",
          },
        },
        outlined: {
          borderColor: "#dadce0",
          color: "#1a73e8",
          "&:hover": {
            borderColor: "#1a73e8",
            backgroundColor: "rgba(26, 115, 232, 0.04)",
          },
        },
      },
    },
  },
});

// FlagComponent type
type FlagComponent = React.ComponentType<{ className?: string; title?: string }>;

/** Common timezone abbreviations */
const getSpecialTzMap = (): Record<string, string> => ({
  CET: "Europe/Paris",
  IST: "Asia/Kolkata",
  PST: "America/Los_Angeles",
  UTC: "UTC",
  EST: "America/New_York",
  GMT: "Europe/London",
  JST: "Asia/Tokyo",
  AEST: "Australia/Sydney",
});

/** Get timezone info */
function getTimeZoneFromCode(code: string): { timezone: string; displayName: string; flagComponent: React.ReactNode } | null {
  const upperCode = code.toUpperCase();
  const specialMap = getSpecialTzMap();

  if (specialMap[upperCode]) {
    return {
      timezone: specialMap[upperCode],
      displayName: upperCode,
      flagComponent: <GlobeAltIcon className="w-6 h-4 text-blue-500" />,
    };
  }

  if (upperCode.length === 2) {
    const matchedCountry = countriesData.find((c) => c.cca2.toUpperCase() === upperCode);
    if (matchedCountry) {
      const primaryTz = moment.tz.zonesForCountry(matchedCountry.cca2)[0] || null;
      if (primaryTz) {
        const FlagComponent = Flags[matchedCountry.cca2.toUpperCase() as keyof typeof Flags] as FlagComponent;
        return {
          timezone: primaryTz,
          displayName: matchedCountry.name.common,
          flagComponent: <FlagComponent className="w-6 h-4" />,
        };
      }
    }
  }

  return null;
}

/** Warning screen */
const WarningScreen = ({
  title,
  message,
  usageExample,
  validCodes,
}: {
  title: string;
  message: string;
  usageExample: string;
  validCodes: string[];
}) => (
  <ThemeProvider theme={theme}>
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 3,
      }}
    >
      <Card sx={{ maxWidth: 450, width: "100%", textAlign: "center" }}>
        <CardContent sx={{ p: 4 }}>
          <Box 
            sx={{ 
              width: 64, 
              height: 64, 
              mx: "auto", 
              mb: 3, 
              bgcolor: "primary.main", 
              borderRadius: "50%", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center" 
            }}
          >
            <MagnifyingGlassIcon className="w-8 h-8" style={{ color: "white" }} />
          </Box>
          <Typography variant="h4" component="h1" color="primary" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3 }}>
            {message}
          </Typography>
          <Paper sx={{ bgcolor: "background.paper", p: 2, borderRadius: 2, mb: 3, border: "1px solid #e8eaed" }}>
            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
              <strong>Correct format:</strong> <code>/codeHHMM</code> or <code>/codenow</code>
            </Typography>
            <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
              Example: <code style={{ backgroundColor: "#e8f0fe", color: "#1a73e8", padding: "4px 8px", borderRadius: 4, fontFamily: "monospace" }}>{usageExample}</code>
            </Typography>
          </Paper>
          <Typography variant="body2" color="text.primary" gutterBottom sx={{ fontWeight: 500, mb: 2 }}>
            Valid codes (examples):
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center", mb: 3 }}>
            {validCodes.map((code) => (
              <Chip 
                key={code} 
                label={code} 
                variant="outlined" 
                size="small"
                sx={{ 
                  borderColor: "#dadce0",
                  color: "text.primary",
                  fontWeight: 500
                }} 
              />
            ))}
          </Box>
          <Link href="/searchhelp" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              startIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
              color="primary"
              sx={{ borderRadius: 2 }}
            >
              Search Help & Country Codes
            </Button>
          </Link>
        </CardContent>
      </Card>
    </Box>
  </ThemeProvider>
);

interface TimezonePageProps {
  params: Promise<{ input: string }>;
}

function parseUserInput(input: string) {
  const cleaned = input.trim().toUpperCase();

  for (const codeLen of [3, 2]) {
    if (cleaned.length < codeLen + 3) continue; // Min length for "now"

    const codePart = cleaned.slice(0, codeLen);
    const timePart = cleaned.slice(codeLen).toLowerCase();

    let isValidTime = false;
    if (timePart === "now") {
      isValidTime = true;
    } else if (
      timePart.length === 4 &&
      /^\d{4}$/.test(timePart) &&
      parseInt(timePart.substring(0, 2), 10) <= 23 &&
      parseInt(timePart.substring(2, 4), 10) <= 59
    ) {
      isValidTime = true;
    }

    if (!isValidTime) {
      continue;
    }

    const zoneInfo = getTimeZoneFromCode(codePart);
    if (zoneInfo) {
      return { codePart, timePart, zoneInfo };
    }
  }

  return null;
}

export default function TimezonePage({ params }: TimezonePageProps) {
  const router = useRouter();
  const [isChanging, setIsChanging] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newTimeMode, setNewTimeMode] = useState<"now" | "custom">("custom");
  const [newTimeValue, setNewTimeValue] = useState<DateTime | null>(null);
  const [error, setError] = useState("");
  const [showPopular, setShowPopular] = useState(true);
  const [selectedCountries, setSelectedCountries] = useState<Country[]>([]);
  const [currentTime, setCurrentTime] = useState<DateTime>(() => DateTime.now()); // Initial for SSR

  const resolvedParams = use(params);
  const { input } = resolvedParams;

  if (!input || input.length < 3) {
    return (
      <WarningScreen 
        title="Invalid Input" 
        message="Your input is too short or incomplete. Please provide a valid code and time." 
        usageExample="TRnow or CET1330" 
        validCodes={["TR", "US", "FR", "DE", "GB", "CET", "IST", "PST", "UTC", "EST"]} 
      />
    );
  }

  const parsed = parseUserInput(input);
  if (!parsed) {
    return (
      <WarningScreen 
        title="Unrecognized Input" 
        message={`Couldn't parse "${input}". Make sure your code is valid and time is HHMM or 'now'.`} 
        usageExample="TR1330 or ISTnow" 
        validCodes={["TR", "US", "FR", "DE", "GB", "CET", "IST", "PST", "UTC", "EST"]} 
      />
    );
  }

  const { zoneInfo, timePart } = parsed;

  // Fix: Client-only interval for live updates
  useEffect(() => {
    if (timePart !== "now") return;
    if (typeof window === 'undefined') return; // SSR guard

    const interval = setInterval(() => {
      setCurrentTime(DateTime.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [timePart]);

  let baseTime: DateTime;
  if (timePart === "now") {
    baseTime = currentTime.setZone(zoneInfo.timezone);
  } else {
    const hour = parseInt(timePart.substring(0, 2), 10);
    const minute = parseInt(timePart.substring(2, 4), 10);
    baseTime = DateTime.fromObject({ hour, minute, second: 0 }, { zone: zoneInfo.timezone });
    if (!baseTime.isValid || hour > 23 || minute > 59) {
      return <WarningScreen title="Invalid Time" message="The time you entered isn't valid (must be 00:00 to 23:59)." usageExample="TR1430 or CETnow" validCodes={["TR", "US", "CET", "PST"]} />;
    }
  }

  const formattedLocalTime = timePart === "now" 
    ? baseTime.toFormat("HH:mm:ss")
    : baseTime.toFormat("HH:mm");

  const pageTitle = timePart === "now" 
    ? `Time Zone Baby: Current Time in ${zoneInfo.displayName}` 
    : `Time Zone Baby: ${formattedLocalTime} in ${zoneInfo.displayName}`;

  const getCountryTime = useMemo(() => (timezone: string) => {
    try {
      const refTime = timePart === "now" ? currentTime : baseTime;
      return timePart === "now" 
        ? refTime.setZone(timezone).toFormat("HH:mm:ss")
        : refTime.setZone(timezone).toFormat("HH:mm");
    } catch (err) {
      console.warn("Timezone conversion failed:", err);
      return (timePart === "now" ? currentTime : baseTime).setZone("UTC").toFormat("HH:mm");
    }
  }, [currentTime, baseTime, timePart]);

  const handleClearAll = () => setSelectedCountries([]);
  const handleRemoveCountry = (code: string) => setSelectedCountries(prev => prev.filter(c => c.code !== code));

  const handleChangeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const trimmedCode = newCode.trim().toUpperCase();
    if (!trimmedCode || trimmedCode.length < 2) {
      setError("Enter a valid code (e.g., TR, CET, US).");
      return;
    }

    if (newTimeMode === "now") {
      router.push(`/${trimmedCode}now`);
      return;
    }

    if (!newTimeValue) {
      setError("Select a time or choose 'now'.");
      return;
    }

    const hour = newTimeValue.hour.toString().padStart(2, '0');
    const minute = newTimeValue.minute.toString().padStart(2, '0');
    const sanitizedTime = `${hour}${minute}`;
    router.push(`/${trimmedCode}${sanitizedTime}`);
  };

  const popularTimezones = [
    { name: "CET (Paris)", timezone: "Europe/Paris", flagComponent: <Flags.FR className="w-6 h-4" />, code: "CET" },
    { name: "IST (India)", timezone: "Asia/Kolkata", flagComponent: <Flags.IN className="w-6 h-4" />, code: "IST" },
    { name: "PST (Los Angeles)", timezone: "America/Los_Angeles", flagComponent: <Flags.US className="w-6 h-4" />, code: "PST" },
    { name: "UTC (Universal)", timezone: "UTC", flagComponent: <GlobeAltIcon className="w-6 h-4 text-blue-500" />, code: "UTC" },
    { name: "Istanbul (TR)", timezone: "Europe/Istanbul", flagComponent: <Flags.TR className="w-6 h-4" />, code: "TR" },
    { name: "EST (New York)", timezone: "America/New_York", flagComponent: <Flags.US className="w-6 h-4" />, code: "EST" },
    { name: "JST (Tokyo)", timezone: "Asia/Tokyo", flagComponent: <Flags.JP className="w-6 h-4" />, code: "JST" },
  ];

  const handleAddPopular = (tz: { name: string; timezone: string; flagComponent: React.ReactNode; code: string }) => {
    const existing = selectedCountries.find(c => c.timezone === tz.timezone);
    if (!existing) {
      const mockCountry: Country & { flagComponent: React.ReactNode } = {
        name: tz.name,
        code: tz.code,
        timezone: tz.timezone,
        flag: "", // Dummy
        flagComponent: tz.flagComponent,
      };
      setSelectedCountries(prev => [...prev, mockCountry]);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <Head>
          <title>{pageTitle}</title>
          <meta name="description" content={`Explore the time in ${zoneInfo.displayName} and compare with other timezones`} />
        </Head>
        
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
          {/* Header */}
 

          <Container maxWidth="lg">
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3, pb: 4 }}>
              
              {/* Left Panel */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                
                {/* Current Timezone Card */}
                <Card>
                  <CardHeader
                    title="Current Timezone"
                    action={
                      !isChanging && (
                        <Button
                          onClick={() => setIsChanging(true)}
                          variant="contained"
                          size="small"
                          color="primary"
                        >
                          Change
                        </Button>
                      )
                    }
                    titleTypographyProps={{ variant: "h6", color: "text.primary", fontWeight: 600 }}
                  />
                  <CardContent>
                    <Box sx={{ textAlign: "center", py: 2 }}>
                      <Box sx={{ mx: "auto", mb: 3, width: 48, height: 32 }}>
                        {zoneInfo.flagComponent}
                      </Box>
                      <Typography variant="h3" color="primary" sx={{ fontWeight: 600, mb: 2 }}>
                        {zoneInfo.displayName}
                      </Typography>
                      <Typography 
                        variant="h2" 
                        color="text.primary" 
                        sx={{ 
                          fontFamily: "monospace", 
                          fontSize: { xs: "2.5rem", md: "3rem" },
                          fontWeight: 600,
                          mb: 2
                        }}
                        suppressHydrationWarning // Fix: Suppress mismatch for live time
                      >
                        {formattedLocalTime}
                      </Typography>
                      {timePart === "now" && (
                        <Chip 
                          label="🔴 Live" 
                          color="success" 
                          size="small" 
                          sx={{ 
                            fontWeight: 600,
                            backgroundColor: "#34a853",
                            color: "white"
                          }} 
                        />
                      )}
                      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                        {zoneInfo.timezone}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                {/* Change Settings Card */}
                {isChanging && (
                  <Card>
                    <CardHeader 
                      title="Change Settings" 
                      titleTypographyProps={{ variant: "h6", color: "text.primary", fontWeight: 600 }}
                    />
                    <CardContent>
                      <Box component="form" onSubmit={handleChangeSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {error && (
                          <Alert severity="error" sx={{ borderRadius: 2 }}>
                            {error}
                          </Alert>
                        )}
                        
                        <TextField
                          label="Country or Timezone Code"
                          placeholder="e.g., TR, CET, PST, US"
                          value={newCode}
                          onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                          variant="outlined"
                          fullWidth
                          helperText="Enter 2-letter country code or timezone abbreviation"
                        />
                        
                        <FormControl>
                          <FormLabel sx={{ color: "text.primary", fontWeight: 500, mb: 1 }}>
                            Time Mode
                          </FormLabel>
                          <RadioGroup
                            value={newTimeMode}
                            onChange={(e) => setNewTimeMode(e.target.value as "now" | "custom")}
                            row
                            sx={{ gap: 2 }}
                          >
                            <FormControlLabel 
                              value="now" 
                              control={<Radio color="primary" />} 
                              label="Now (Live)" 
                            />
                            <FormControlLabel 
                              value="custom" 
                              control={<Radio color="primary" />} 
                              label="Custom Time" 
                            />
                          </RadioGroup>
                        </FormControl>
                        
                        {newTimeMode === "custom" && (
                          <TimePicker
                            label="Select Time"
                            value={newTimeValue}
                            onChange={setNewTimeValue}
                            sx={{ width: "100%" }}
                          />
                        )}
                        
                        <Box sx={{ display: "flex", gap: 2 }}>
                          <Button type="submit" variant="contained" fullWidth size="large">
                            Update Timezone
                          </Button>
                          <Button
                            type="button"
                            onClick={() => {
                              setIsChanging(false);
                              setError("");
                              setNewCode("");
                              setNewTimeValue(null);
                              setNewTimeMode("custom");
                            }}
                            variant="outlined"
                            fullWidth
                            size="large"
                          >
                            Cancel
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {/* Selected Comparisons */}
                {selectedCountries.length > 0 && (
                  <Card>
                    <CardHeader
                      title="Selected Comparisons"
                      action={
                        <Button
                          onClick={handleClearAll}
                          size="small"
                          color="primary"
                          startIcon={<XMarkIcon className="w-4 h-4" />}
                        >
                          Clear All
                        </Button>
                      }
                      titleTypographyProps={{ variant: "h6", color: "text.primary", fontWeight: 600 }}
                    />
                    <CardContent>
                      <List sx={{ maxHeight: 400, overflow: "auto" }}>
                        {selectedCountries.map((country) => (
                          <ListItem
                            key={country.code}
                            secondaryAction={
                              <IconButton 
                                edge="end" 
                                onClick={() => handleRemoveCountry(country.code)}
                                size="small"
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </IconButton>
                            }
                            sx={{ px: 1 }}
                          >
                            <ListItemButton sx={{ borderRadius: 2, py: 2 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                                <Box sx={{ width: 32, height: 20 }}>
                                  {country.flagComponent}
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography variant="body1" color="text.primary" fontWeight={500}>
                                    {country.name}
                                  </Typography>
                                  <Typography 
                                    variant="body2" 
                                    color="primary" 
                                    sx={{ 
                                      fontFamily: "monospace",
                                      fontWeight: 600,
                                      fontSize: "1.1rem"
                                    }}
                                    suppressHydrationWarning // Fix: Suppress mismatch for live comparison times
                                  >
                                    {getCountryTime(country.timezone)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {country.timezone}
                                  </Typography>
                                </Box>
                              </Box>
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                )}

                {/* Popular Timezones */}
                <Card>
                  <CardHeader
                    title="Popular Timezones"
                    action={
                      <IconButton onClick={() => setShowPopular(!showPopular)}>
                        {showPopular ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                      </IconButton>
                    }
                    titleTypographyProps={{ variant: "h6", color: "text.primary", fontWeight: 600 }}
                  />
                  <Collapse in={showPopular}>
                    <CardContent>
                      <List>
                        {popularTimezones.map((tz) => (
                          <ListItem key={tz.timezone} sx={{ px: 1 }}>
                            <ListItemButton 
                              onClick={() => handleAddPopular(tz)}
                              sx={{ borderRadius: 2, py: 2 }}
                            >
                              <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                                <Box sx={{ width: 32, height: 20 }}>
                                  {tz.flagComponent}
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography variant="body1" color="text.primary" fontWeight={500}>
                                    {tz.name}
                                  </Typography>
                                  <Typography 
                                    variant="body2" 
                                    color="primary"
                                    sx={{ 
                                      fontFamily: "monospace",
                                      fontWeight: 600
                                    }}
                                    suppressHydrationWarning // Fix: Suppress mismatch for live popular times
                                  >
                                    {getCountryTime(tz.timezone)}
                                  </Typography>
                                </Box>
                              </Box>
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Collapse>
                </Card>
              </Box>

              {/* Right Panel - Country Selector */}
              <Box>
                <CountrySelector
                  onSelectCountry={(country) => {
                    const FlagComponent = Flags[country.code.toUpperCase() as keyof typeof Flags] as FlagComponent;
                    setSelectedCountries((prev) =>
                      prev.some((x) => x.code === country.code) 
                        ? prev 
                        : [...prev, { 
                            ...country, 
                            flagComponent: <FlagComponent className="w-6 h-4" /> 
                          }]
                    );
                  }}
                />
              </Box>
            </Box>
          </Container>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
}