export interface User {
  id: string;
  name: string;
  email: string;
  role: 'donor' | 'recipient' | 'admin';
  avatar?: string;
  bloodGroup?: string;
  city?: string;
  contactNumber?: string;
}

export interface Donor {
  id: string;
  name: string;
  bloodGroup: string;
  city: string;
  contactNumber: string;
  lastDonated?: string;
  distance?: {
    km: number;
    miles: number;
  };
  rating?: number;
  donationsCount?: number;
}

export interface BloodRequest {
  id: string;
  patientName: string;
  bloodGroup: string;
  city: string;
  hospital: string;
  neededBy: string;
  units: number;
  contactNumber: string;
  email?: string;
  status: 'pending' | 'fulfilled' | 'cancelled';
  createdAt?: string;
  urgency?: 'high' | 'medium' | 'low';
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}
