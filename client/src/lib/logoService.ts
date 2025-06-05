// Logo service for fetching fund house and company logos
export interface SecurityLogo {
  url: string;
  fallback: string;
  type: 'company' | 'fund' | 'generic';
}

// Fund house logo mappings for Indian mutual funds
const FUND_HOUSE_LOGOS: Record<string, string> = {
  'hdfc': 'https://logo.clearbit.com/hdfcbank.com',
  'sbi': 'https://logo.clearbit.com/sbi.co.in',
  'icici': 'https://logo.clearbit.com/icicibank.com',
  'axis': 'https://logo.clearbit.com/axisbank.com',
  'kotak': 'https://logo.clearbit.com/kotak.com',
  'reliance': 'https://logo.clearbit.com/ril.com',
  'birla': 'https://logo.clearbit.com/adityabirlacapital.com',
  'franklin': 'https://logo.clearbit.com/franklintempleton.com',
  'dsp': 'https://logo.clearbit.com/dspim.com',
  'nippon': 'https://logo.clearbit.com/nipponindiaim.com',
  'utm': 'https://logo.clearbit.com/utimf.com',
  'tata': 'https://logo.clearbit.com/tatamutualfund.com',
  'invesco': 'https://logo.clearbit.com/invesco.com',
  'mirae': 'https://logo.clearbit.com/miraeasset.com',
  'mahindra': 'https://logo.clearbit.com/mahindramanulife.com',
  'edelweiss': 'https://logo.clearbit.com/edelweissmf.com',
  'l&t': 'https://logo.clearbit.com/ltfs.com',
  'sundaram': 'https://logo.clearbit.com/sundarammutual.com',
  'canara': 'https://logo.clearbit.com/canarahsbcoms.com',
  'union': 'https://logo.clearbit.com/unionmf.com',
  'quantum': 'https://logo.clearbit.com/quantumamc.com',
  'ppfas': 'https://logo.clearbit.com/ppfas.com',
  'motilal': 'https://logo.clearbit.com/motilaloswal.com',
  'pgim': 'https://logo.clearbit.com/pgimindiamf.com',
  'baroda': 'https://logo.clearbit.com/barodapioneer.in',
  'quant': 'https://logo.clearbit.com/quantmutual.com',
  'white': 'https://logo.clearbit.com/whiteoakmutual.com',
  'groww': 'https://logo.clearbit.com/groww.in',
  'samco': 'https://logo.clearbit.com/samco.in',
  'navi': 'https://logo.clearbit.com/navi.com',
  'trust': 'https://logo.clearbit.com/trustmf.com',
  'bandhan': 'https://logo.clearbit.com/bandhanmutual.com',
  'mahindra manulife': 'https://logo.clearbit.com/mahindramanulife.com',
  'old bridge': 'https://logo.clearbit.com/oldbridgecapital.com',
  'helios': 'https://logo.clearbit.com/heliosmutual.com',
  'nj': 'https://logo.clearbit.com/njmutualfund.com',
};

// Company logo mappings for direct equity
const COMPANY_LOGOS: Record<string, string> = {
  // Major Indian companies
  'reliance industries': 'https://logo.clearbit.com/ril.com',
  'tcs': 'https://logo.clearbit.com/tcs.com',
  'hdfc bank': 'https://logo.clearbit.com/hdfcbank.com',
  'infosys': 'https://logo.clearbit.com/infosys.com',
  'icici bank': 'https://logo.clearbit.com/icicibank.com',
  'sbi': 'https://logo.clearbit.com/sbi.co.in',
  'airtel': 'https://logo.clearbit.com/airtel.in',
  'asian paints': 'https://logo.clearbit.com/asianpaints.com',
  'itc': 'https://logo.clearbit.com/itcportal.com',
  'axis bank': 'https://logo.clearbit.com/axisbank.com',
  'bajaj finance': 'https://logo.clearbit.com/bajajfinserv.in',
  'wipro': 'https://logo.clearbit.com/wipro.com',
  'ultratech cement': 'https://logo.clearbit.com/ultratechcement.com',
  'maruti suzuki': 'https://logo.clearbit.com/marutisuzuki.com',
  'hul': 'https://logo.clearbit.com/hul.co.in',
  'mahindra': 'https://logo.clearbit.com/mahindra.com',
  'titan': 'https://logo.clearbit.com/titan.co.in',
  'nestle': 'https://logo.clearbit.com/nestle.in',
  'kotak bank': 'https://logo.clearbit.com/kotak.com',
  'techm': 'https://logo.clearbit.com/techmahindra.com',
  'hcl tech': 'https://logo.clearbit.com/hcltech.com',
  'dr reddy': 'https://logo.clearbit.com/drreddys.com',
  'sun pharma': 'https://logo.clearbit.com/sunpharma.com',
  'bajaj auto': 'https://logo.clearbit.com/bajajauto.com',
  'eicher motors': 'https://logo.clearbit.com/eichermotors.com',
  'hero motocorp': 'https://logo.clearbit.com/heromotocorp.com',
  'tata steel': 'https://logo.clearbit.com/tatasteel.com',
  'tata motors': 'https://logo.clearbit.com/tatamotors.com',
  'ongc': 'https://logo.clearbit.com/ongcindia.com',
  'ntpc': 'https://logo.clearbit.com/ntpc.co.in',
  'powergrid': 'https://logo.clearbit.com/powergridindia.com',
  'coal india': 'https://logo.clearbit.com/coalindia.in',
  'ioc': 'https://logo.clearbit.com/iocl.com',
  'bpcl': 'https://logo.clearbit.com/bharatpetroleum.in',
  'hindalco': 'https://logo.clearbit.com/hindalco.com',
  'vedanta': 'https://logo.clearbit.com/vedantalimited.com',
  'adani ports': 'https://logo.clearbit.com/adaniports.com',
  'adani enterprises': 'https://logo.clearbit.com/adani.com',
  'jindal steel': 'https://logo.clearbit.com/jindalsteel.com',
  'grasim': 'https://logo.clearbit.com/grasim.com',
  'cipla': 'https://logo.clearbit.com/cipla.com',
  'divis labs': 'https://logo.clearbit.com/divislabs.com',
  'apollo hospitals': 'https://logo.clearbit.com/apollohospitals.com',
  'britannia': 'https://logo.clearbit.com/britannia.co.in',
  'pidilite': 'https://logo.clearbit.com/pidilite.com',
  'berger paints': 'https://logo.clearbit.com/bergerpaints.com',
  'shree cement': 'https://logo.clearbit.com/shreecement.com',
  'acc': 'https://logo.clearbit.com/acclimited.com',
  'ambuja cement': 'https://logo.clearbit.com/ambujacement.com',
  'indusind bank': 'https://logo.clearbit.com/indusind.com',
  'yes bank': 'https://logo.clearbit.com/yesbank.in',
  'bandhan bank': 'https://logo.clearbit.com/bandhanbank.com',
  'pnb': 'https://logo.clearbit.com/pnbindia.in',
  'bank of baroda': 'https://logo.clearbit.com/bankofbaroda.in',
  'canara bank': 'https://logo.clearbit.com/canarabank.com',
  'union bank': 'https://logo.clearbit.com/unionbankofindia.co.in',
  'lti': 'https://logo.clearbit.com/lntinfotech.com',
  'mphasis': 'https://logo.clearbit.com/mphasis.com',
  'persistent': 'https://logo.clearbit.com/persistent.com',
  'mindtree': 'https://logo.clearbit.com/mindtree.com',
  'l&t': 'https://logo.clearbit.com/larsentoubro.com',
  'godrej': 'https://logo.clearbit.com/godrej.com',
  'dabur': 'https://logo.clearbit.com/dabur.com',
  'emami': 'https://logo.clearbit.com/emamiltd.in',
  'marico': 'https://logo.clearbit.com/marico.com',
  'colgate': 'https://logo.clearbit.com/colgate.co.in',
  'zomato': 'https://logo.clearbit.com/zomato.com',
  'paytm': 'https://logo.clearbit.com/paytm.com',
  'nykaa': 'https://logo.clearbit.com/nykaa.com',
  'policybazaar': 'https://logo.clearbit.com/policybazaar.com',
  'dmart': 'https://logo.clearbit.com/dmart.in',
  'avenue supermarts': 'https://logo.clearbit.com/dmart.in',
};

// Extract fund house name from mutual fund name
function extractFundHouse(fundName: string): string | null {
  const lowerName = fundName.toLowerCase();
  
  // Check each fund house
  for (const [house, _] of Object.entries(FUND_HOUSE_LOGOS)) {
    if (lowerName.includes(house.toLowerCase())) {
      return house;
    }
  }
  
  return null;
}

// Extract company name from security name
function extractCompanyName(securityName: string): string | null {
  const lowerName = securityName.toLowerCase();
  
  // Remove common suffixes
  const cleanName = lowerName
    .replace(/\s+(ltd|limited|corp|corporation|inc|company|co)\s*\.?$/i, '')
    .trim();
  
  // Check each company
  for (const [company, _] of Object.entries(COMPANY_LOGOS)) {
    if (cleanName.includes(company.toLowerCase()) || company.toLowerCase().includes(cleanName)) {
      return company;
    }
  }
  
  return null;
}

// Generate fallback avatar with initials
function generateFallbackAvatar(name: string): string {
  const words = name.split(' ').filter(word => word.length > 0);
  const initials = words.slice(0, 2).map(word => word[0].toUpperCase()).join('');
  
  // Generate a consistent color based on the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash) % 360;
  const backgroundColor = `hsl(${hue}, 65%, 45%)`;
  const textColor = '#ffffff';
  
  // Create SVG data URL
  const svg = `
    <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" fill="${backgroundColor}" rx="8"/>
      <text x="20" y="26" font-family="Arial, sans-serif" font-size="14" font-weight="bold" 
            text-anchor="middle" fill="${textColor}">${initials}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// Main function to get security logo
export function getSecurityLogo(securityName: string, securityType: string): SecurityLogo {
  const lowerType = securityType.toLowerCase();
  
  // Handle mutual funds
  if (lowerType.includes('mutual fund') || lowerType.includes('fund')) {
    const fundHouse = extractFundHouse(securityName);
    if (fundHouse && FUND_HOUSE_LOGOS[fundHouse]) {
      return {
        url: FUND_HOUSE_LOGOS[fundHouse],
        fallback: generateFallbackAvatar(securityName),
        type: 'fund'
      };
    }
  }
  
  // Handle direct equity
  if (lowerType.includes('equity') || lowerType.includes('stock') || lowerType.includes('share')) {
    const companyName = extractCompanyName(securityName);
    if (companyName && COMPANY_LOGOS[companyName]) {
      return {
        url: COMPANY_LOGOS[companyName],
        fallback: generateFallbackAvatar(securityName),
        type: 'company'
      };
    }
  }
  
  // Handle ETFs and other securities
  if (lowerType.includes('etf')) {
    if (securityName.toLowerCase().includes('gold')) {
      return {
        url: 'https://logo.clearbit.com/goldshare.com',
        fallback: generateFallbackAvatar(securityName),
        type: 'generic'
      };
    }
    if (securityName.toLowerCase().includes('nifty')) {
      return {
        url: 'https://logo.clearbit.com/nseindia.com',
        fallback: generateFallbackAvatar(securityName),
        type: 'generic'
      };
    }
  }
  
  // Handle bank accounts and savings
  if (lowerType.includes('account') || lowerType.includes('savings') || lowerType.includes('fd') || lowerType.includes('deposit')) {
    const bankName = extractCompanyName(securityName);
    if (bankName && COMPANY_LOGOS[bankName]) {
      return {
        url: COMPANY_LOGOS[bankName],
        fallback: generateFallbackAvatar(securityName),
        type: 'company'
      };
    }
  }
  
  // Default fallback
  return {
    url: '',
    fallback: generateFallbackAvatar(securityName),
    type: 'generic'
  };
}

// React hook for using security logos with error handling
export function useSecurityLogo(securityName: string, securityType: string) {
  const logo = getSecurityLogo(securityName, securityType);
  
  return {
    ...logo,
    onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
      e.currentTarget.src = logo.fallback;
    }
  };
}