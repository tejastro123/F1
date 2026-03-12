import { useState } from 'react';

const getTrackImageUrl = (race) => {
  // Extract official F1 track outline slug names
  const slugMap = {
    'Bahrain': 'Bahrain',
    'Saudi Arabia': 'Saudi_Arabia',
    'Australia': 'Australia',
    'Japan': 'Japan',
    'China': 'China',
    'Miami': 'Miami',
    'Emilia': 'Emilia_Romagna',
    'Italy': 'Italy',
    'Monaco': 'Monaco',
    'Canada': 'Canada',
    'Spain': 'Spain',
    'Austria': 'Austria',
    'Great Britain': 'Great_Britain',
    'UK': 'Great_Britain',
    'Hungary': 'Hungary',
    'Belgium': 'Belgium',
    'Netherlands': 'Netherlands',
    'Azerbaijan': 'Azerbaijan',
    'Singapore': 'Singapore',
    'Vegas': 'Las_Vegas',
    'United States': 'USA',
    'USA': 'USA',
    'Mexico': 'Mexico',
    'Brazil': 'Brazil',
    'Qatar': 'Qatar',
    'Abu Dhabi': 'Abu_Dhabi',
    'UAE': 'Abu_Dhabi',
  };

  const searchString = `${race.country} ${race.grandPrixName} ${race.venue}` || '';
  let slug = 'Bahrain';

  for (const [key, value] of Object.entries(slugMap)) {
    if (searchString.includes(key)) {
      if (key === 'Italy' && searchString.includes('Emilia')) {
        slug = 'Emilia_Romagna';
        break;
      }
      if ((key === 'United States' || key === 'USA') && searchString.includes('Vegas')) {
        slug = 'Las_Vegas';
        break;
      }
      if ((key === 'United States' || key === 'USA') && searchString.includes('Miami')) {
        slug = 'Miami';
        break;
      }
      slug = value;
      break;
    }
  }

  // Official F1 media CDN source for the classic grey/red 2D track layouts
  return `https://media.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/${slug}_Circuit.png`;
};

export default function CircuitImage({ trackData }) {
  const [imgError, setImgError] = useState(false);

  if (!trackData) return null;

  const outlineUrl = getTrackImageUrl(trackData);

  return (
    <div className="w-full h-full min-h-[500px] bg-gradient-to-br from-f1-panel to-f1-dark/80 flex flex-col relative group">
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h4 className="text-white font-black text-xl flex items-center gap-2">
          <span>{trackData.flag}</span> {trackData.grandPrixName}
        </h4>
        <p className="text-gray-400 text-sm">2D Circuit Outline</p>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4 mt-12">
        {!imgError ? (
          <img 
            src={outlineUrl} 
            alt={`${trackData.grandPrixName} layout`}
            onError={() => setImgError(true)}
            // Brighten up the image so it pops nicely on a dark background since standard lines are dark grey
            className="w-full max-h-[600px] object-contain filter brightness-[2] drop-shadow-2xl transition-transform duration-[2000ms] group-hover:scale-[1.03]"
            draggable={false}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <span className="text-4xl block mb-2 opacity-60">🛣️</span>
            <span className="font-medium text-sm">Circuit map available soon</span>
          </div>
        )}
      </div>
    </div>
  );
}
