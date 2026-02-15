const vehicleData = {
  Acura: [
    { name: 'ILX', yearStart: 2013, yearEnd: 2022, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Leather Seats', 'Sunroof', 'Backup Camera', 'Apple CarPlay'] },
    { name: 'Integra', yearStart: 2023, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Sunroof', 'Wireless CarPlay'] },
    { name: 'MDX', yearStart: 2001, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['Third Row', 'Leather Seats', 'Navigation', 'Sunroof', 'Heated Seats'] },
    { name: 'RDX', yearStart: 2007, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Sunroof', 'Navigation', 'Heated Seats'] },
    { name: 'TLX', yearStart: 2015, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Sunroof'] },
  ],
  Audi: [
    { name: 'A3', yearStart: 2006, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Sunroof', 'Apple CarPlay'] },
    { name: 'A4', yearStart: 1996, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Sunroof', 'Heated Seats'] },
    { name: 'A6', yearStart: 1995, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Sunroof', 'Premium Audio'] },
    { name: 'Q3', yearStart: 2015, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Panoramic Roof', 'Backup Camera'] },
    { name: 'Q5', yearStart: 2009, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Panoramic Roof', 'Heated Seats'] },
    { name: 'Q7', yearStart: 2007, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['Third Row', 'Leather Seats', 'Navigation', 'Panoramic Roof', 'Premium Audio'] },
  ],
  BMW: [
    { name: '3 Series', yearStart: 1975, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Sunroof', 'Heated Seats'] },
    { name: '5 Series', yearStart: 1972, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Sunroof', 'Premium Audio'] },
    { name: 'X1', yearStart: 2013, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Panoramic Roof', 'Backup Camera'] },
    { name: 'X3', yearStart: 2004, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Panoramic Roof', 'Heated Seats'] },
    { name: 'X5', yearStart: 2000, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Panoramic Roof', 'Premium Audio', 'Third Row'] },
  ],
  Buick: [
    { name: 'Enclave', yearStart: 2008, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Third Row', 'Leather Seats', 'Navigation', 'Heated Seats'] },
    { name: 'Encore', yearStart: 2013, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Backup Camera', 'Apple CarPlay'] },
    { name: 'Envision', yearStart: 2016, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Leather Seats', 'Navigation', 'Panoramic Roof', 'Heated Seats'] },
  ],
  Cadillac: [
    { name: 'CT4', yearStart: 2020, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Heated Seats'] },
    { name: 'CT5', yearStart: 2020, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Sunroof', 'Premium Audio'] },
    { name: 'Escalade', yearStart: 1999, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: '4wd', suggestedFeatures: ['V8', 'Leather Seats', 'Navigation', 'Premium Audio', 'Third Row', 'Heated Seats'] },
    { name: 'XT4', yearStart: 2019, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Heated Seats'] },
    { name: 'XT5', yearStart: 2017, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Leather Seats', 'Navigation', 'Panoramic Roof', 'Heated Seats'] },
  ],
  Chevrolet: [
    { name: 'Camaro', yearStart: 1967, yearEnd: 2024, type: 'coupe', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['V6', 'Backup Camera', 'Apple CarPlay', 'Performance Package'] },
    { name: 'Colorado', yearStart: 2004, yearEnd: 2025, type: 'truck', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['Towing Package', 'Backup Camera', 'Apple CarPlay', 'Bed Liner'] },
    { name: 'Equinox', yearStart: 2005, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Backup Camera', 'Apple CarPlay', 'Heated Seats'] },
    { name: 'Malibu', yearStart: 1964, yearEnd: 2024, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Backup Camera', 'Apple CarPlay', 'Heated Seats'] },
    { name: 'Silverado 1500', yearStart: 1999, yearEnd: 2025, type: 'truck', defaultTransmission: 'automatic', defaultDrivetrain: '4wd', suggestedFeatures: ['V8', 'Towing Package', 'Backup Camera', 'Bed Liner', 'Heated Seats'] },
    { name: 'Suburban', yearStart: 1935, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: '4wd', suggestedFeatures: ['V8', 'Third Row', 'Leather Seats', 'Navigation', 'Towing Package'] },
    { name: 'Tahoe', yearStart: 1995, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: '4wd', suggestedFeatures: ['V8', 'Third Row', 'Leather Seats', 'Navigation', 'Towing Package'] },
    { name: 'Traverse', yearStart: 2009, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Third Row', 'Backup Camera', 'Apple CarPlay', 'Heated Seats'] },
  ],
  Chrysler: [
    { name: '300', yearStart: 2005, yearEnd: 2023, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['V6', 'Leather Seats', 'Navigation', 'Heated Seats'] },
    { name: 'Pacifica', yearStart: 2017, yearEnd: 2025, type: 'minivan', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Stow-n-Go', 'Rear Entertainment', 'Navigation', 'Leather Seats'] },
    { name: 'Voyager', yearStart: 2020, yearEnd: 2023, type: 'minivan', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Stow-n-Go', 'Backup Camera', 'Apple CarPlay'] },
  ],
  Dodge: [
    { name: 'Challenger', yearStart: 2008, yearEnd: 2023, type: 'coupe', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['V8', 'Leather Seats', 'Navigation', 'Performance Package'] },
    { name: 'Charger', yearStart: 2006, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['V8', 'Leather Seats', 'Navigation', 'Heated Seats'] },
    { name: 'Durango', yearStart: 1998, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['V6', 'Third Row', 'Leather Seats', 'Towing Package', 'Navigation'] },
    { name: 'Hornet', yearStart: 2023, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Backup Camera', 'Apple CarPlay', 'Heated Seats'] },
  ],
  Ford: [
    { name: 'Bronco', yearStart: 2021, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: '4wd', suggestedFeatures: ['Off-Road Package', 'Removable Top', 'Trail Camera', 'Navigation'] },
    { name: 'Edge', yearStart: 2007, yearEnd: 2024, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Panoramic Roof'] },
    { name: 'Escape', yearStart: 2001, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Backup Camera', 'Apple CarPlay', 'Heated Seats'] },
    { name: 'Explorer', yearStart: 1991, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['Third Row', 'Leather Seats', 'Navigation', 'Towing Package', 'Heated Seats'] },
    { name: 'F-150', yearStart: 1948, yearEnd: 2025, type: 'truck', defaultTransmission: 'automatic', defaultDrivetrain: '4wd', suggestedFeatures: ['V8', 'Towing Package', 'Bed Liner', 'Navigation', 'Heated Seats'] },
    { name: 'Maverick', yearStart: 2022, yearEnd: 2025, type: 'truck', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Hybrid', 'Backup Camera', 'Apple CarPlay', 'Bed Liner'] },
    { name: 'Mustang', yearStart: 1964, yearEnd: 2025, type: 'coupe', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['V8', 'Leather Seats', 'Performance Package', 'Premium Audio'] },
    { name: 'Ranger', yearStart: 1983, yearEnd: 2025, type: 'truck', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['Towing Package', 'Backup Camera', 'Apple CarPlay', 'Off-Road Package'] },
  ],
  Genesis: [
    { name: 'G70', yearStart: 2019, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Sunroof', 'Heated Seats'] },
    { name: 'G80', yearStart: 2017, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Premium Audio', 'Heated Seats'] },
    { name: 'GV70', yearStart: 2022, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Panoramic Roof', 'Heated Seats'] },
    { name: 'GV80', yearStart: 2021, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Premium Audio', 'Heated Seats'] },
  ],
  GMC: [
    { name: 'Acadia', yearStart: 2007, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Third Row', 'Backup Camera', 'Apple CarPlay', 'Heated Seats'] },
    { name: 'Canyon', yearStart: 2004, yearEnd: 2025, type: 'truck', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['Towing Package', 'Backup Camera', 'Apple CarPlay', 'Off-Road Package'] },
    { name: 'Sierra 1500', yearStart: 1999, yearEnd: 2025, type: 'truck', defaultTransmission: 'automatic', defaultDrivetrain: '4wd', suggestedFeatures: ['V8', 'Towing Package', 'Bed Liner', 'Navigation', 'Heated Seats'] },
    { name: 'Terrain', yearStart: 2010, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Backup Camera', 'Apple CarPlay', 'Heated Seats'] },
    { name: 'Yukon', yearStart: 1992, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: '4wd', suggestedFeatures: ['V8', 'Third Row', 'Leather Seats', 'Navigation', 'Towing Package'] },
  ],
  Honda: [
    { name: 'Accord', yearStart: 1976, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Sunroof', 'Apple CarPlay', 'Heated Seats'] },
    { name: 'Civic', yearStart: 1973, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Backup Camera', 'Apple CarPlay', 'Heated Seats'] },
    { name: 'CR-V', yearStart: 1997, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Sunroof', 'Apple CarPlay', 'Heated Seats'] },
    { name: 'HR-V', yearStart: 2016, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Backup Camera', 'Apple CarPlay', 'Heated Seats'] },
    { name: 'Odyssey', yearStart: 1995, yearEnd: 2025, type: 'minivan', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Rear Entertainment', 'Leather Seats', 'Navigation', 'Power Sliding Doors'] },
    { name: 'Passport', yearStart: 2019, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['V6', 'Leather Seats', 'Navigation', 'Heated Seats'] },
    { name: 'Pilot', yearStart: 2003, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['V6', 'Third Row', 'Leather Seats', 'Navigation', 'Heated Seats'] },
    { name: 'Ridgeline', yearStart: 2006, yearEnd: 2025, type: 'truck', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['V6', 'In-Bed Trunk', 'Navigation', 'Heated Seats'] },
  ],
  Hyundai: [
    { name: 'Elantra', yearStart: 1992, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Backup Camera', 'Apple CarPlay', 'Heated Seats', 'Blind Spot Monitor'] },
    { name: 'Ioniq 5', yearStart: 2022, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['Electric', 'Fast Charging', 'Navigation', 'Heated Seats', 'Premium Audio'] },
    { name: 'Kona', yearStart: 2018, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Backup Camera', 'Apple CarPlay', 'Heated Seats'] },
    { name: 'Palisade', yearStart: 2020, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Third Row', 'Leather Seats', 'Navigation', 'Premium Audio', 'Heated Seats'] },
    { name: 'Santa Fe', yearStart: 2001, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Panoramic Roof', 'Heated Seats'] },
    { name: 'Sonata', yearStart: 1985, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Sunroof', 'Apple CarPlay', 'Heated Seats'] },
    { name: 'Tucson', yearStart: 2005, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Backup Camera', 'Apple CarPlay', 'Heated Seats', 'Panoramic Roof'] },
  ],
  Infiniti: [
    { name: 'Q50', yearStart: 2014, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Sunroof', 'Heated Seats'] },
    { name: 'Q60', yearStart: 2017, yearEnd: 2024, type: 'coupe', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Sunroof'] },
    { name: 'QX50', yearStart: 2019, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Panoramic Roof'] },
    { name: 'QX60', yearStart: 2014, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Third Row', 'Leather Seats', 'Navigation', 'Panoramic Roof', 'Heated Seats'] },
    { name: 'QX80', yearStart: 2011, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: '4wd', suggestedFeatures: ['V8', 'Third Row', 'Leather Seats', 'Navigation', 'Premium Audio'] },
  ],
  Jeep: [
    { name: 'Cherokee', yearStart: 2014, yearEnd: 2023, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['V6', 'Off-Road Package', 'Navigation', 'Heated Seats'] },
    { name: 'Compass', yearStart: 2007, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Backup Camera', 'Apple CarPlay', 'Heated Seats'] },
    { name: 'Gladiator', yearStart: 2020, yearEnd: 2025, type: 'truck', defaultTransmission: 'automatic', defaultDrivetrain: '4wd', suggestedFeatures: ['V6', 'Off-Road Package', 'Removable Top', 'Towing Package'] },
    { name: 'Grand Cherokee', yearStart: 1993, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: '4wd', suggestedFeatures: ['V6', 'Leather Seats', 'Navigation', 'Panoramic Roof', 'Off-Road Package'] },
    { name: 'Wagoneer', yearStart: 2022, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: '4wd', suggestedFeatures: ['V8', 'Third Row', 'Leather Seats', 'Navigation', 'Premium Audio'] },
    { name: 'Wrangler', yearStart: 1987, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: '4wd', suggestedFeatures: ['Removable Top', 'Off-Road Package', 'Navigation', 'Towing Package'] },
  ],
  Kia: [
    { name: 'EV6', yearStart: 2022, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['Electric', 'Fast Charging', 'Navigation', 'Heated Seats', 'Premium Audio'] },
    { name: 'Forte', yearStart: 2010, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Backup Camera', 'Apple CarPlay', 'Heated Seats'] },
    { name: 'K5', yearStart: 2021, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Sunroof', 'Apple CarPlay', 'Heated Seats'] },
    { name: 'Seltos', yearStart: 2021, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Backup Camera', 'Apple CarPlay', 'Heated Seats'] },
    { name: 'Sorento', yearStart: 2002, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Third Row', 'Leather Seats', 'Navigation', 'Heated Seats'] },
    { name: 'Sportage', yearStart: 1995, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Panoramic Roof', 'Apple CarPlay', 'Heated Seats'] },
    { name: 'Telluride', yearStart: 2020, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Third Row', 'Leather Seats', 'Navigation', 'Premium Audio', 'Heated Seats'] },
  ],
  'Land Rover': [
    { name: 'Defender', yearStart: 2020, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: '4wd', suggestedFeatures: ['Off-Road Package', 'Leather Seats', 'Navigation', 'Panoramic Roof'] },
    { name: 'Discovery', yearStart: 1994, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: '4wd', suggestedFeatures: ['Third Row', 'Leather Seats', 'Navigation', 'Off-Road Package'] },
    { name: 'Range Rover', yearStart: 1970, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: '4wd', suggestedFeatures: ['V8', 'Leather Seats', 'Navigation', 'Premium Audio', 'Panoramic Roof'] },
    { name: 'Range Rover Evoque', yearStart: 2012, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Panoramic Roof'] },
    { name: 'Range Rover Sport', yearStart: 2006, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: '4wd', suggestedFeatures: ['V6', 'Leather Seats', 'Navigation', 'Premium Audio', 'Heated Seats'] },
  ],
  Lexus: [
    { name: 'ES', yearStart: 1989, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Leather Seats', 'Navigation', 'Sunroof', 'Premium Audio', 'Heated Seats'] },
    { name: 'IS', yearStart: 1999, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Sunroof', 'Heated Seats'] },
    { name: 'NX', yearStart: 2015, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Sunroof', 'Heated Seats'] },
    { name: 'RX', yearStart: 1999, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Leather Seats', 'Navigation', 'Sunroof', 'Premium Audio', 'Heated Seats'] },
    { name: 'GX', yearStart: 2003, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: '4wd', suggestedFeatures: ['V6', 'Leather Seats', 'Navigation', 'Third Row', 'Off-Road Package'] },
  ],
  Lincoln: [
    { name: 'Aviator', yearStart: 2020, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['Third Row', 'Leather Seats', 'Navigation', 'Premium Audio', 'Panoramic Roof'] },
    { name: 'Corsair', yearStart: 2020, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Panoramic Roof', 'Heated Seats'] },
    { name: 'Nautilus', yearStart: 2019, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Panoramic Roof', 'Premium Audio'] },
    { name: 'Navigator', yearStart: 1998, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['V6 Turbo', 'Third Row', 'Leather Seats', 'Navigation', 'Premium Audio'] },
  ],
  Mazda: [
    { name: 'CX-30', yearStart: 2020, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Backup Camera', 'Apple CarPlay', 'Heated Seats', 'Blind Spot Monitor'] },
    { name: 'CX-5', yearStart: 2013, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Sunroof', 'Heated Seats'] },
    { name: 'CX-50', yearStart: 2023, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Panoramic Roof', 'Off-Road Package'] },
    { name: 'CX-90', yearStart: 2024, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['Turbo', 'Third Row', 'Leather Seats', 'Navigation', 'Premium Audio'] },
    { name: 'Mazda3', yearStart: 2004, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Sunroof', 'Heated Seats'] },
    { name: 'MX-5 Miata', yearStart: 1990, yearEnd: 2025, type: 'convertible', defaultTransmission: 'manual', defaultDrivetrain: 'rwd', suggestedFeatures: ['Leather Seats', 'Navigation', 'Limited Slip Differential'] },
  ],
  'Mercedes-Benz': [
    { name: 'A-Class', yearStart: 2019, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Sunroof'] },
    { name: 'C-Class', yearStart: 1994, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Sunroof', 'Premium Audio'] },
    { name: 'E-Class', yearStart: 1994, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Sunroof', 'Premium Audio', 'Heated Seats'] },
    { name: 'GLA', yearStart: 2015, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Panoramic Roof'] },
    { name: 'GLC', yearStart: 2016, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Panoramic Roof', 'Heated Seats'] },
    { name: 'GLE', yearStart: 2016, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['Turbo', 'Third Row', 'Leather Seats', 'Navigation', 'Premium Audio'] },
    { name: 'GLS', yearStart: 2017, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['Third Row', 'Leather Seats', 'Navigation', 'Premium Audio', 'Heated Seats'] },
  ],
  Mini: [
    { name: 'Clubman', yearStart: 2008, yearEnd: 2024, type: 'wagon', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Panoramic Roof'] },
    { name: 'Cooper', yearStart: 2002, yearEnd: 2025, type: 'hatchback', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Panoramic Roof'] },
    { name: 'Countryman', yearStart: 2011, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Panoramic Roof', 'Heated Seats'] },
  ],
  Mitsubishi: [
    { name: 'Eclipse Cross', yearStart: 2018, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Backup Camera', 'Apple CarPlay', 'Heated Seats'] },
    { name: 'Mirage', yearStart: 2014, yearEnd: 2025, type: 'hatchback', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Backup Camera', 'Apple CarPlay'] },
    { name: 'Outlander', yearStart: 2003, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Third Row', 'Backup Camera', 'Apple CarPlay', 'Heated Seats'] },
    { name: 'Outlander Sport', yearStart: 2011, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Backup Camera', 'Apple CarPlay', 'Heated Seats'] },
  ],
  Nissan: [
    { name: 'Altima', yearStart: 1993, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Sunroof', 'Apple CarPlay', 'Heated Seats'] },
    { name: 'Frontier', yearStart: 1998, yearEnd: 2025, type: 'truck', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['V6', 'Towing Package', 'Backup Camera', 'Apple CarPlay'] },
    { name: 'Kicks', yearStart: 2018, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Backup Camera', 'Apple CarPlay', 'Blind Spot Monitor'] },
    { name: 'Murano', yearStart: 2003, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['V6', 'Leather Seats', 'Navigation', 'Panoramic Roof', 'Heated Seats'] },
    { name: 'Pathfinder', yearStart: 1986, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['V6', 'Third Row', 'Leather Seats', 'Navigation', 'Towing Package'] },
    { name: 'Rogue', yearStart: 2008, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Panoramic Roof', 'Heated Seats'] },
    { name: 'Sentra', yearStart: 1982, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Backup Camera', 'Apple CarPlay', 'Heated Seats'] },
    { name: 'Titan', yearStart: 2004, yearEnd: 2025, type: 'truck', defaultTransmission: 'automatic', defaultDrivetrain: '4wd', suggestedFeatures: ['V8', 'Towing Package', 'Bed Liner', 'Navigation', 'Heated Seats'] },
  ],
  Porsche: [
    { name: '911', yearStart: 1964, yearEnd: 2025, type: 'coupe', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Sport Chrono', 'Premium Audio'] },
    { name: 'Cayenne', yearStart: 2003, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Panoramic Roof', 'Premium Audio'] },
    { name: 'Macan', yearStart: 2015, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Panoramic Roof', 'Sport Chrono'] },
    { name: 'Taycan', yearStart: 2020, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['Electric', 'Leather Seats', 'Navigation', 'Premium Audio', 'Performance Package'] },
  ],
  RAM: [
    { name: '1500', yearStart: 1994, yearEnd: 2025, type: 'truck', defaultTransmission: 'automatic', defaultDrivetrain: '4wd', suggestedFeatures: ['V8', 'Towing Package', 'Bed Liner', 'Navigation', 'Heated Seats'] },
    { name: '2500', yearStart: 1994, yearEnd: 2025, type: 'truck', defaultTransmission: 'automatic', defaultDrivetrain: '4wd', suggestedFeatures: ['Diesel', 'Towing Package', 'Bed Liner', 'Navigation', 'Heated Seats'] },
    { name: 'ProMaster', yearStart: 2014, yearEnd: 2025, type: 'van', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Backup Camera', 'Bluetooth'] },
  ],
  Subaru: [
    { name: 'Ascent', yearStart: 2019, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['Third Row', 'Leather Seats', 'Navigation', 'Panoramic Roof', 'Heated Seats'] },
    { name: 'Crosstrek', yearStart: 2013, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['Backup Camera', 'Apple CarPlay', 'Heated Seats', 'Off-Road Package'] },
    { name: 'Forester', yearStart: 1998, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['Panoramic Roof', 'Leather Seats', 'Navigation', 'Heated Seats'] },
    { name: 'Impreza', yearStart: 1993, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['Backup Camera', 'Apple CarPlay', 'Heated Seats'] },
    { name: 'Outback', yearStart: 1995, yearEnd: 2025, type: 'wagon', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Panoramic Roof', 'Heated Seats'] },
    { name: 'WRX', yearStart: 2002, yearEnd: 2025, type: 'sedan', defaultTransmission: 'manual', defaultDrivetrain: 'awd', suggestedFeatures: ['Turbo', 'Performance Package', 'Recaro Seats', 'Limited Slip Differential'] },
  ],
  Tesla: [
    { name: 'Model 3', yearStart: 2017, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['Electric', 'Autopilot', 'Glass Roof', 'Fast Charging', 'Premium Audio'] },
    { name: 'Model S', yearStart: 2012, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['Electric', 'Autopilot', 'Glass Roof', 'Fast Charging', 'Premium Audio', 'Ludicrous Mode'] },
    { name: 'Model X', yearStart: 2016, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['Electric', 'Autopilot', 'Falcon Wing Doors', 'Third Row', 'Fast Charging'] },
    { name: 'Model Y', yearStart: 2020, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['Electric', 'Autopilot', 'Glass Roof', 'Fast Charging', 'Premium Audio'] },
    { name: 'Cybertruck', yearStart: 2024, yearEnd: 2025, type: 'truck', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['Electric', 'Autopilot', 'Stainless Steel Body', 'Fast Charging'] },
  ],
  Toyota: [
    { name: '4Runner', yearStart: 1984, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: '4wd', suggestedFeatures: ['V6', 'Off-Road Package', 'Navigation', 'Leather Seats', 'Towing Package'] },
    { name: 'Camry', yearStart: 1983, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Leather Seats', 'Sunroof', 'Apple CarPlay', 'Heated Seats'] },
    { name: 'Corolla', yearStart: 1966, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Backup Camera', 'Apple CarPlay', 'Heated Seats'] },
    { name: 'GR86', yearStart: 2022, yearEnd: 2025, type: 'coupe', defaultTransmission: 'manual', defaultDrivetrain: 'rwd', suggestedFeatures: ['Rear-Wheel Drive', 'Performance Package', 'Limited Slip Differential'] },
    { name: 'Highlander', yearStart: 2001, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Third Row', 'Leather Seats', 'Navigation', 'Heated Seats'] },
    { name: 'RAV4', yearStart: 1996, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Hybrid Available', 'Backup Camera', 'Apple CarPlay', 'Heated Seats'] },
    { name: 'Tacoma', yearStart: 1995, yearEnd: 2025, type: 'truck', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['V6', 'Off-Road Package', 'Towing Package', 'Backup Camera'] },
    { name: 'Tundra', yearStart: 2000, yearEnd: 2025, type: 'truck', defaultTransmission: 'automatic', defaultDrivetrain: '4wd', suggestedFeatures: ['V8', 'Towing Package', 'Bed Liner', 'Navigation', 'Heated Seats'] },
  ],
  Volkswagen: [
    { name: 'Atlas', yearStart: 2018, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Third Row', 'Leather Seats', 'Navigation', 'Panoramic Roof'] },
    { name: 'Golf', yearStart: 1975, yearEnd: 2025, type: 'hatchback', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Sunroof', 'Apple CarPlay'] },
    { name: 'GTI', yearStart: 1983, yearEnd: 2025, type: 'hatchback', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Performance Package', 'Leather Seats', 'Navigation'] },
    { name: 'ID.4', yearStart: 2021, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'rwd', suggestedFeatures: ['Electric', 'Fast Charging', 'Navigation', 'Heated Seats'] },
    { name: 'Jetta', yearStart: 1980, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Backup Camera', 'Apple CarPlay', 'Heated Seats'] },
    { name: 'Taos', yearStart: 2022, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Backup Camera', 'Apple CarPlay', 'Heated Seats'] },
    { name: 'Tiguan', yearStart: 2009, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Third Row', 'Leather Seats', 'Panoramic Roof', 'Heated Seats'] },
  ],
  Volvo: [
    { name: 'S60', yearStart: 2001, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Sunroof', 'Heated Seats'] },
    { name: 'S90', yearStart: 2017, yearEnd: 2025, type: 'sedan', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Premium Audio', 'Heated Seats'] },
    { name: 'XC40', yearStart: 2019, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Panoramic Roof'] },
    { name: 'XC60', yearStart: 2010, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'fwd', suggestedFeatures: ['Turbo', 'Leather Seats', 'Navigation', 'Panoramic Roof', 'Heated Seats'] },
    { name: 'XC90', yearStart: 2003, yearEnd: 2025, type: 'suv', defaultTransmission: 'automatic', defaultDrivetrain: 'awd', suggestedFeatures: ['Third Row', 'Leather Seats', 'Navigation', 'Premium Audio', 'Panoramic Roof'] },
  ],
}

export function getMakes() {
  return Object.keys(vehicleData).sort()
}

export function getModels(make) {
  return vehicleData[make] || []
}

export function getModelInfo(make, modelName) {
  const models = vehicleData[make]
  if (!models) return null
  // Try exact match first, then normalized match (e.g. "F150" matches "F-150")
  const normalize = (s) => s.replace(/[-\s]/g, '').toLowerCase()
  return models.find((m) => m.name === modelName) ||
    models.find((m) => normalize(m.name) === normalize(modelName)) ||
    null
}

export function getYearRange(make, modelName) {
  const info = getModelInfo(make, modelName)
  if (!info) return null
  return { start: info.yearStart, end: info.yearEnd }
}

export function getSuggestedFeatures(make, modelName) {
  const info = getModelInfo(make, modelName)
  if (!info) return []
  return info.suggestedFeatures
}

export default vehicleData
