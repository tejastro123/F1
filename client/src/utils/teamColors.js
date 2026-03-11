// Team color mapping matching server/models/Constructor.js
const teamColors = {
  'Mercedes': { primary: '#27F4D2', secondary: '#00A19C', bg: 'bg-team-mercedes' },
  'Ferrari': { primary: '#E8002D', secondary: '#FF2800', bg: 'bg-team-ferrari' },
  'Red Bull': { primary: '#3671C6', secondary: '#1B3B73', bg: 'bg-team-redbull' },
  'McLaren': { primary: '#FF8000', secondary: '#47C7FC', bg: 'bg-team-mclaren' },
  'Aston Martin': { primary: '#229971', secondary: '#00594F', bg: 'bg-team-astonmartin' },
  'Alpine': { primary: '#FF87BC', secondary: '#0093CC', bg: 'bg-team-alpine' },
  'Williams': { primary: '#1868DB', secondary: '#00A3E0', bg: 'bg-team-williams' },
  'RB': { primary: '#6692FF', secondary: '#1B3B73', bg: 'bg-team-rb' },
  'Haas': { primary: '#B6BABD', secondary: '#E6002D', bg: 'bg-team-haas' },
  'Audi': { primary: '#FF0000', secondary: '#2D826D', bg: 'bg-team-audi' },
  'Cadillac': { primary: '#DAA520', secondary: '#1D1D1B', bg: 'bg-team-cadillac' },
};

export const getTeamColor = (team) => teamColors[team]?.primary || '#FFFFFF';
export const getTeamSecondaryColor = (team) => teamColors[team]?.secondary || '#000000';
export const getTeamGradient = (team) => {
  const colors = teamColors[team];
  if (!colors) return 'linear-gradient(135deg, #333, #555)';
  return `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`;
};

export default teamColors;
