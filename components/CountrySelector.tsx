'use client';

import React, { useState, useMemo } from 'react';
import countriesData from 'world-countries';
import moment from 'moment-timezone';
import * as Flags from 'country-flag-icons/react/3x2'; // Fix: * as import
import {
  Box,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Collapse,
  Card,
  CardContent,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';

// FlagComponent type
type FlagComponent = React.ComponentType<{ className?: string; title?: string }>;

export interface Country {
  name: string;
  timezone: string;
  flag: string;
  code: string;
  flagComponent?: React.ReactNode;
}

export interface CountrySelectorProps {
  onSelectCountry: (country: Country) => void;
}

const getFlagComponent = (countryCode: string): React.ReactNode => {
  try {
    const FlagComponent = Flags[countryCode.toUpperCase() as keyof typeof Flags] as FlagComponent;
    return FlagComponent ? <FlagComponent className="w-6 h-4" /> : <span>🏳️</span>;
  } catch {
    return <span>🏳️</span>;
  }
};

const useGroupedCountries = () => {
  return useMemo(() => {
    const grouped: Record<string, Country[]> = {};

    if (!Array.isArray(countriesData)) {
      console.error('countriesData is not an array:', countriesData);
      return [];
    }

    countriesData.forEach((country) => {
      const region = country.region || 'Other';
      if (!grouped[region]) grouped[region] = [];

      const code = country.cca2;
      const timezones = moment.tz.zonesForCountry(code);
      const primaryTimezone = timezones && timezones.length > 0 ? timezones[0] : 'UTC';

      grouped[region].push({
        name: country.name.common,
        timezone: primaryTimezone,
        flag: code,
        code: code.toLowerCase(),
        flagComponent: getFlagComponent(code),
      });
    });

    return Object.keys(grouped)
      .sort()
      .map((continent) => ({
        continent,
        countries: grouped[continent].sort((a, b) =>
          a.name.localeCompare(b.name)
        ),
      }));
  }, []);
};

const CountrySelector: React.FC<CountrySelectorProps> = ({ onSelectCountry }) => {
  const [search, setSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const groupedCountries = useGroupedCountries();

  const toggleGroup = (continent: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(continent)) {
        newSet.delete(continent);
      } else {
        newSet.add(continent);
      }
      return newSet;
    });
  };

  const allCountries = useMemo(
    () => groupedCountries.flatMap((g) => g.countries),
    [groupedCountries]
  );

  const filteredCountries = useMemo(
    () =>
      search
        ? allCountries.filter((c) =>
            c.name.toLowerCase().includes(search.toLowerCase())
          )
        : null,
    [search, allCountries]
  );

  // Continent display names
  const getContinentDisplayName = (continent: string) => {
    const names: Record<string, string> = {
      'Africa': 'Africa',
      'Americas': 'Americas', 
      'Antarctic': 'Antarctic',
      'Asia': 'Asia',
      'Europe': 'Europe',
      'Oceania': 'Oceania',
      'Other': 'Other Regions'
    };
    return names[continent] || continent;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
          Select a Country
        </Typography>
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        {filteredCountries ? (
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredCountries.length > 0 ? (
              <List>
                {filteredCountries.map((country) => (
                  <ListItem key={country.code} disablePadding sx={{ mb: 1 }}>
                    <ListItemButton 
                      onClick={() => onSelectCountry(country)}
                      sx={{ 
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          '& .MuiListItemText-primary': {
                            color: 'white',
                          },
                          '& .MuiListItemText-secondary': {
                            color: 'white',
                          }
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Box sx={{ width: 24, height: 16 }}>
                          {country.flagComponent}
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={country.name}
                        secondary={country.timezone}
                        primaryTypographyProps={{
                          fontWeight: 500,
                          color: 'text.primary'
                        }}
                        secondaryTypographyProps={{
                          color: 'text.secondary',
                          fontSize: '0.75rem'
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  textAlign: 'center', 
                  py: 3,
                  fontStyle: 'italic'
                }}
              >
                No matching countries found
              </Typography>
            )}
          </Box>
        ) : (
          <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
            {groupedCountries.map((group) => (
              <Box key={group.continent} sx={{ mb: 2 }}>
                <ListItemButton 
                  onClick={() => toggleGroup(group.continent)}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: 'background.default',
                    border: '1px solid',
                    borderColor: 'divider',
                    mb: 1,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                          {getContinentDisplayName(group.continent)}
                        </Typography>
                        <Chip 
                          label={group.countries.length} 
                          size="small"
                          sx={{ 
                            backgroundColor: 'primary.main',
                            color: 'white',
                            fontWeight: 600
                          }} 
                        />
                      </Box>
                    }
                  />
                  {expandedGroups.has(group.continent) ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                
                <Collapse in={expandedGroups.has(group.continent)} timeout="auto">
                  <List sx={{ py: 0 }}>
                    {group.countries.map((country) => (
                      <ListItem key={country.code} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton 
                          onClick={() => onSelectCountry(country)}
                          sx={{ 
                            borderRadius: 2,
                            ml: 2,
                            '&:hover': {
                              backgroundColor: 'primary.light',
                              '& .MuiListItemText-primary': {
                                color: 'white',
                              },
                              '& .MuiListItemText-secondary': {
                                color: 'white',
                              }
                            }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Box sx={{ width: 24, height: 16 }}>
                              {country.flagComponent}
                            </Box>
                          </ListItemIcon>
                          <ListItemText
                            primary={country.name}
                            secondary={country.timezone}
                            primaryTypographyProps={{
                              fontWeight: 500,
                              color: 'text.primary'
                            }}
                            secondaryTypographyProps={{
                              color: 'text.secondary',
                              fontSize: '0.75rem'
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CountrySelector;