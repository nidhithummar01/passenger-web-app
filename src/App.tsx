import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { PassengerTrackingWeb } from './screens/PassengerTrackingWeb';
import { MembershipScreen } from './screens/MembershipScreen';
import { MembershipPaymentScreen } from './screens/MembershipPaymentScreen';
import { ReserveRideScreen } from './screens/ReserveRideScreen';
import { TuxedoLandingScreen } from './screens/TuxedoLandingScreen';
import { DriverListScreen } from './screens/DriverListScreen';
import { DriverProfileScreen } from './screens/DriverProfileScreen';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="dark min-h-screen bg-black max-w-screen overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/track-ride" replace />} />
            <Route path="/track-ride" element={<PassengerTrackingWeb />} />
            <Route path="/membership" element={<MembershipScreen />} />
            <Route path="/membership-payment" element={<MembershipPaymentScreen />} />
            <Route path="/reserve-ride" element={<ReserveRideScreen />} />
            <Route path="/tuxedo-landing" element={<TuxedoLandingScreen />} />
            <Route path="/driver-list" element={<DriverListScreen />} />
            <Route path="/driver-profile" element={<DriverProfileScreen />} />
            <Route path="*" element={<Navigate to="/track-ride" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
