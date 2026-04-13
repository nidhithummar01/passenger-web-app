export interface Driver {
  id: string;
  name: string;
  rating: number;
  experience: number;
  vehicle: { brand: string; model: string; year: number; color: string; interior: string; plate: string; };
  amenities: { wifi: boolean; water: boolean; charger: boolean; childSeat: boolean; luggage: number; music: boolean; };
  eta: number;
  distance: number;
  status: 'online' | 'busy';
  verified: boolean;
  hotelPreferred: boolean;
}

export const mockDrivers: Driver[] = [
  { id: 'drv-001', name: 'Michael Thompson', rating: 4.9, experience: 12, vehicle: { brand: 'Mercedes-Benz', model: 'S-Class', year: 2024, color: 'Black', interior: 'Nappa Leather', plate: '***LUX24' }, amenities: { wifi: true, water: true, charger: true, childSeat: false, luggage: 3, music: true }, eta: 3, distance: 0.8, status: 'online', verified: true, hotelPreferred: true },
  { id: 'drv-002', name: 'Sarah Martinez', rating: 4.8, experience: 8, vehicle: { brand: 'BMW', model: '7 Series', year: 2023, color: 'White Pearl', interior: 'Cognac Leather', plate: '***BMW77' }, amenities: { wifi: true, water: true, charger: true, childSeat: true, luggage: 2, music: true }, eta: 5, distance: 1.2, status: 'online', verified: true, hotelPreferred: true },
  { id: 'drv-003', name: 'James Anderson', rating: 5.0, experience: 15, vehicle: { brand: 'Rolls-Royce', model: 'Phantom', year: 2024, color: 'Midnight Blue', interior: 'Arctic White Leather', plate: '***RR888' }, amenities: { wifi: true, water: true, charger: true, childSeat: false, luggage: 4, music: true }, eta: 7, distance: 2.1, status: 'online', verified: true, hotelPreferred: true },
  { id: 'drv-004', name: 'David Chen', rating: 4.7, experience: 6, vehicle: { brand: 'Cadillac', model: 'Escalade ESV', year: 2024, color: 'Black', interior: 'Jet Black Leather', plate: '***ESV99' }, amenities: { wifi: true, water: true, charger: true, childSeat: true, luggage: 6, music: false }, eta: 4, distance: 1.0, status: 'online', verified: true, hotelPreferred: false },
  { id: 'drv-005', name: 'Emily Roberts', rating: 4.9, experience: 10, vehicle: { brand: 'Mercedes-Benz', model: 'Maybach S680', year: 2024, color: 'Obsidian Black', interior: 'Macchiato Beige', plate: '***MAY01' }, amenities: { wifi: true, water: true, charger: true, childSeat: false, luggage: 3, music: true }, eta: 6, distance: 1.5, status: 'online', verified: true, hotelPreferred: true },
];
