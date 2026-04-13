export type UserRole = 'concierge' | 'manager' | 'passenger';
export type RideStatus = 'creating' | 'matching' | 'assigned' | 'arriving' | 'onboard' | 'enroute' | 'completed' | 'cancelled';
export type VehicleType = 'sedan' | 'suv' | 'luxury' | 'van';
export type PaymentType = 'card' | 'cash';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  hotelId: string;
  hotelName: string;
  deviceBound: boolean;
  deviceName?: string;
  kycStatus: 'pending' | 'approved' | 'rejected';
  isMember: boolean;
  rideCredit: number;
}

export interface Ride {
  id: string;
  status: RideStatus;
  pickupLocation: string;
  destination?: string;
  vehicleType: VehicleType;
  paymentType: PaymentType;
  fare: number;
  commission: number;
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
  dropOffLocation?: string;
  paymentMethod?: string | null;
  driverMoving?: boolean;
}
