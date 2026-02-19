import { Booking, Product, Review, User } from "../types/product.types";

export const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://i.pravatar.cc/150?u=1",
    rating: 4.8,
    memberSince: "2023-01-15",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    avatar: "https://i.pravatar.cc/150?u=2",
    rating: 4.9,
    memberSince: "2023-03-20",
  },
];

export const mockProducts: Product[] = [
  {
    id: "1",
    title: "Sony A7III Camera",
    description:
      "Professional mirrorless camera in excellent condition. Includes kit lens and battery.",
    price: 50,
    priceUnit: "day",
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400",
    ],
    category: "Cameras",
    owner: mockUsers[0],
    location: "New York, NY",
    rating: 4.9,
    reviewsCount: 24,
    available: true,
    specs: {
      brand: "Sony",
      model: "A7III",
      condition: "Like New",
    },
    createdAt: "2024-01-10",
  },
  {
    id: "2",
    title: 'MacBook Pro 14"',
    description: "2023 model with M2 Pro chip, 16GB RAM, 512GB SSD",
    price: 75,
    priceUnit: "day",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
    ],
    category: "Electronics",
    owner: mockUsers[1],
    location: "Los Angeles, CA",
    rating: 4.8,
    reviewsCount: 18,
    available: true,
    specs: {
      brand: "Apple",
      model: "MacBook Pro 14",
      condition: "Excellent",
    },
    createdAt: "2024-01-15",
  },
  {
    id: "3",
    title: "Electric Drill Set",
    description:
      "Professional grade drill set with multiple bits and accessories",
    price: 15,
    priceUnit: "day",
    images: [
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400",
    ],
    category: "Tools",
    owner: mockUsers[0],
    location: "Chicago, IL",
    rating: 4.7,
    reviewsCount: 12,
    available: true,
    specs: {
      brand: "DeWalt",
      condition: "Good",
    },
    createdAt: "2024-01-20",
  },
];

export const mockReviews: Review[] = [
  {
    id: "1",
    productId: "1",
    userId: "2",
    userName: "Jane Smith",
    userAvatar: "https://i.pravatar.cc/150?u=2",
    rating: 5,
    comment: "Great camera, worked perfectly for my photoshoot!",
    date: "2024-01-25",
  },
  {
    id: "2",
    productId: "1",
    userId: "1",
    userName: "John Doe",
    userAvatar: "https://i.pravatar.cc/150?u=1",
    rating: 4,
    comment: "Good condition, owner was helpful.",
    date: "2024-01-20",
  },
];

export const mockBookings: Booking[] = [
  {
    id: "1",
    productId: "1",
    userId: "2",
    startDate: "2024-02-01",
    endDate: "2024-02-05",
    totalPrice: 200,
    status: "confirmed",
  },
];
