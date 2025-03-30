import { LayoutDashboard,BarChart, Book, User, Car, CreditCard, Ticket, TicketCheck, LogOut, Menu } from "lucide-react";

export type DrawerData = {
    id: number;
    name: string;
    icon?: undefined | any;
    link: string;
    adminOnly: boolean;
}
// adminOnly false - show to all users
// adminOnly true - show only to admins 
export const drawerData: DrawerData[] = [

    {
        id: 4,
        name: 'Profile',
        icon: User,
        link: 'profile',
        adminOnly: false
    },
    {
        id: 0,
        name: 'Analytics',
        icon: BarChart,
        link: 'analytics',
        adminOnly: false
    },
    {
        id: 1,
        name: 'All Bookings',
        icon: Book,
        link: 'view_all_bookings',
        adminOnly: true
    },
    {
        id: 2,
        name: 'Book Now ✔ ',
        icon: Book,
        link: 'booking_form',
        adminOnly: false
    },
    {
        id: 3,
        name: 'My Bookings',
        icon: Book,
        link: 'my_bookings',
        adminOnly: false
    },
  
    {
        id: 5,
        name: 'Manage Vehicles',
        icon: Car,
        link: 'vehicles',
        adminOnly: true
    },
    // {
    //     id: 6,
    //     name: 'Payments',
    //     icon: CreditCard,
    //     link: 'payments',
    //     adminOnly: true
    // },
    {
        id: 8,
        name: 'Manage Users',
        icon: User,
        link: 'users',
        adminOnly: true,
      },
    {
        id: 9, // Unique ID
        name: 'Archived Bookings',
        icon: Book, // You can use a different icon if needed
        link: 'archived_bookings',
        adminOnly: true // Only admins can see this
    },
]