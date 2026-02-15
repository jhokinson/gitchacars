const mockUsers = {
  buyer: {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'buyer@test.com',
    role: 'buyer',
    createdAt: '2024-01-15T10:00:00Z',
  },
  seller: {
    id: 'user-2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'seller@test.com',
    role: 'seller',
    createdAt: '2024-01-16T10:00:00Z',
  },
  admin: {
    id: 'user-3',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@test.com',
    role: 'admin',
    createdAt: '2024-01-10T10:00:00Z',
  },
}

// Fake JWT that decodes to { exp: far future, sub: 'user-1' }
const makeFakeToken = (user) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      exp: Math.floor(Date.now() / 1000) + 86400,
    })
  )
  return `${header}.${payload}.fakesignature`
}

const mockWantListings = [
  {
    id: 'wl-1',
    title: 'Looking for a reliable sedan',
    make: 'Toyota',
    model: 'Camry',
    yearMin: 2018,
    yearMax: 2023,
    budgetMin: 15000,
    budgetMax: 25000,
    zipCode: '90210',
    radius: 50,
    mileageMax: 60000,
    transmission: 'Automatic',
    drivetrain: 'FWD',
    condition: 'Used',
    description: 'Looking for a well-maintained Toyota Camry with low mileage.',
    status: 'active',
    userId: 'user-1',
    buyerName: 'John Doe',
    createdAt: '2024-02-01T10:00:00Z',
  },
  {
    id: 'wl-2',
    title: 'SUV for family',
    make: 'Honda',
    model: 'CR-V',
    yearMin: 2020,
    yearMax: 2024,
    budgetMin: 25000,
    budgetMax: 35000,
    zipCode: '10001',
    radius: 30,
    mileageMax: 40000,
    transmission: 'Automatic',
    drivetrain: 'AWD',
    condition: 'Any',
    description: 'Need a spacious SUV for a family of four. Safety features are a priority.',
    status: 'active',
    userId: 'user-1',
    buyerName: 'John Doe',
    createdAt: '2024-02-05T10:00:00Z',
  },
  {
    id: 'wl-3',
    title: 'Sports car weekend driver',
    make: 'Ford',
    model: 'Mustang',
    yearMin: 2019,
    yearMax: 2024,
    budgetMin: 30000,
    budgetMax: 50000,
    zipCode: '60601',
    radius: 100,
    mileageMax: 30000,
    transmission: 'Manual',
    drivetrain: 'RWD',
    condition: 'Used',
    description: 'Looking for a fun weekend car. GT trim preferred.',
    status: 'active',
    userId: 'user-4',
    buyerName: 'Mike Johnson',
    createdAt: '2024-02-10T10:00:00Z',
  },
  {
    id: 'wl-4',
    title: 'Electric commuter',
    make: 'Tesla',
    model: 'Model 3',
    yearMin: 2021,
    yearMax: 2024,
    budgetMin: 28000,
    budgetMax: 42000,
    zipCode: '94102',
    radius: 75,
    mileageMax: 50000,
    transmission: 'Automatic',
    drivetrain: 'AWD',
    condition: 'Any',
    description: 'Want an electric car for daily commute. Long range preferred.',
    status: 'active',
    userId: 'user-5',
    buyerName: 'Sarah Lee',
    createdAt: '2024-02-12T10:00:00Z',
  },
  {
    id: 'wl-5',
    title: 'Pickup truck for work',
    make: 'Chevrolet',
    model: 'Silverado',
    yearMin: 2017,
    yearMax: 2022,
    budgetMin: 20000,
    budgetMax: 38000,
    zipCode: '75201',
    radius: 60,
    mileageMax: 80000,
    transmission: 'Automatic',
    drivetrain: '4WD',
    condition: 'Used',
    description: 'Need a durable pickup for construction work. Towing capacity important.',
    status: 'archived',
    userId: 'user-1',
    buyerName: 'John Doe',
    createdAt: '2024-01-20T10:00:00Z',
  },
]

const mockVehicles = [
  {
    id: 'v-1',
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    mileage: 35000,
    price: 22000,
    zipCode: '90211',
    description: 'Well-maintained 2020 Camry SE. Single owner, all maintenance records available.',
    transmission: 'Automatic',
    drivetrain: 'FWD',
    images: [
      'https://placehold.co/400x300?text=Camry+1',
      'https://placehold.co/400x300?text=Camry+2',
      'https://placehold.co/400x300?text=Camry+3',
    ],
    status: 'active',
    userId: 'user-2',
    sellerName: 'Jane Smith',
    createdAt: '2024-02-03T10:00:00Z',
  },
  {
    id: 'v-2',
    make: 'Honda',
    model: 'CR-V',
    year: 2022,
    mileage: 18000,
    price: 30000,
    zipCode: '10002',
    description: 'Like-new CR-V EX-L. Leather seats, sunroof, Honda Sensing suite.',
    transmission: 'Automatic',
    drivetrain: 'AWD',
    images: [
      'https://placehold.co/400x300?text=CRV+1',
      'https://placehold.co/400x300?text=CRV+2',
      'https://placehold.co/400x300?text=CRV+3',
    ],
    status: 'active',
    userId: 'user-2',
    sellerName: 'Jane Smith',
    createdAt: '2024-02-06T10:00:00Z',
  },
  {
    id: 'v-3',
    make: 'Ford',
    model: 'Mustang',
    year: 2021,
    mileage: 22000,
    price: 38000,
    zipCode: '60602',
    description: 'Mustang GT Premium with performance package. Grabber Blue.',
    transmission: 'Manual',
    drivetrain: 'RWD',
    images: [
      'https://placehold.co/400x300?text=Mustang+1',
      'https://placehold.co/400x300?text=Mustang+2',
      'https://placehold.co/400x300?text=Mustang+3',
    ],
    status: 'active',
    userId: 'user-6',
    sellerName: 'Bob Williams',
    createdAt: '2024-02-08T10:00:00Z',
  },
]

const mockIntroductions = [
  {
    id: 'intro-1',
    vehicleId: 'v-1',
    wantListingId: 'wl-1',
    sellerId: 'user-2',
    buyerId: 'user-1',
    message: 'I have a 2020 Camry that matches what you\'re looking for. It\'s been well-maintained with all service records.',
    status: 'pending',
    vehicle: mockVehicles[0],
    wantListing: mockWantListings[0],
    sellerName: 'Jane Smith',
    buyerName: 'John Doe',
    createdAt: '2024-02-07T10:00:00Z',
  },
  {
    id: 'intro-2',
    vehicleId: 'v-2',
    wantListingId: 'wl-2',
    sellerId: 'user-2',
    buyerId: 'user-1',
    message: 'My CR-V is a perfect family SUV with great safety features. Would love to discuss!',
    status: 'accepted',
    vehicle: mockVehicles[1],
    wantListing: mockWantListings[1],
    sellerName: 'Jane Smith',
    buyerName: 'John Doe',
    createdAt: '2024-02-09T10:00:00Z',
  },
  {
    id: 'intro-3',
    vehicleId: 'v-3',
    wantListingId: 'wl-3',
    sellerId: 'user-6',
    buyerId: 'user-4',
    message: 'Got a beautiful Mustang GT in Grabber Blue. Let me know if you\'re interested!',
    status: 'rejected',
    vehicle: mockVehicles[2],
    wantListing: mockWantListings[2],
    sellerName: 'Bob Williams',
    buyerName: 'Mike Johnson',
    createdAt: '2024-02-11T10:00:00Z',
  },
]

const mockNotifications = [
  {
    id: 'notif-1',
    type: 'introduction_received',
    message: 'Jane Smith introduced a 2020 Toyota Camry for your want listing.',
    read: false,
    link: '/introductions',
    createdAt: '2024-02-07T10:00:00Z',
  },
  {
    id: 'notif-2',
    type: 'introduction_accepted',
    message: 'John Doe accepted your introduction for the Honda CR-V.',
    read: false,
    link: '/messages/intro-2',
    createdAt: '2024-02-09T12:00:00Z',
  },
  {
    id: 'notif-3',
    type: 'new_message',
    message: 'You have a new message from Jane Smith.',
    read: true,
    link: '/messages/intro-2',
    createdAt: '2024-02-10T10:00:00Z',
  },
]

const allMockUsers = [
  mockUsers.buyer,
  mockUsers.seller,
  mockUsers.admin,
  { id: 'user-4', firstName: 'Mike', lastName: 'Johnson', email: 'mike@test.com', role: 'buyer', createdAt: '2024-01-20T10:00:00Z' },
  { id: 'user-5', firstName: 'Sarah', lastName: 'Lee', email: 'sarah@test.com', role: 'buyer', createdAt: '2024-01-22T10:00:00Z' },
  { id: 'user-6', firstName: 'Bob', lastName: 'Williams', email: 'bob@test.com', role: 'seller', createdAt: '2024-01-25T10:00:00Z' },
]

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

const mockApi = {
  auth: {
    register: async (data) => {
      await delay()
      const user = { id: 'user-new', firstName: data.firstName, lastName: data.lastName, email: data.email, role: data.role, createdAt: new Date().toISOString() }
      return { data: { token: makeFakeToken(user), user } }
    },
    login: async (data) => {
      await delay()
      const match = Object.values(mockUsers).find((u) => u.email === data.email)
      if (!match) throw { response: { data: { message: 'Invalid email or password' } } }
      return { data: { token: makeFakeToken(match), user: match } }
    },
  },
  wantListings: {
    list: async (params = {}) => {
      await delay()
      const page = params.page || 1
      const limit = params.limit || 10
      const active = mockWantListings.filter((l) => l.status === 'active')
      const start = (page - 1) * limit
      return { data: { listings: active.slice(start, start + limit), total: active.length, page, limit } }
    },
    getMine: async () => {
      await delay()
      const mine = mockWantListings.filter((l) => l.userId === 'user-1')
      return { data: { listings: mine } }
    },
    get: async (id) => {
      await delay()
      const listing = mockWantListings.find((l) => l.id === id)
      if (!listing) throw { response: { status: 404, data: { message: 'Not found' } } }
      return { data: listing }
    },
    create: async (data) => {
      await delay()
      const listing = { id: 'wl-new-' + Date.now(), ...data, status: 'active', userId: 'user-1', buyerName: 'John Doe', createdAt: new Date().toISOString() }
      mockWantListings.push(listing)
      return { data: listing }
    },
    update: async (id, data) => {
      await delay()
      const idx = mockWantListings.findIndex((l) => l.id === id)
      if (idx === -1) throw { response: { status: 404, data: { message: 'Not found' } } }
      Object.assign(mockWantListings[idx], data)
      return { data: mockWantListings[idx] }
    },
    archive: async (id) => {
      await delay()
      const listing = mockWantListings.find((l) => l.id === id)
      if (listing) listing.status = 'archived'
      return { data: listing }
    },
  },
  vehicles: {
    list: async (params = {}) => {
      await delay()
      return { data: { vehicles: mockVehicles, total: mockVehicles.length } }
    },
    getMine: async () => {
      await delay()
      const mine = mockVehicles.filter((v) => v.userId === 'user-2')
      return { data: { vehicles: mine } }
    },
    get: async (id) => {
      await delay()
      const vehicle = mockVehicles.find((v) => v.id === id)
      if (!vehicle) throw { response: { status: 404, data: { message: 'Not found' } } }
      return { data: vehicle }
    },
    create: async (data) => {
      await delay()
      const vehicle = { id: 'v-new-' + Date.now(), ...data, status: 'active', userId: 'user-2', sellerName: 'Jane Smith', createdAt: new Date().toISOString() }
      mockVehicles.push(vehicle)
      return { data: vehicle }
    },
    update: async (id, data) => {
      await delay()
      const idx = mockVehicles.findIndex((v) => v.id === id)
      if (idx === -1) throw { response: { status: 404, data: { message: 'Not found' } } }
      Object.assign(mockVehicles[idx], data)
      return { data: mockVehicles[idx] }
    },
    uploadImage: async () => {
      await delay(500)
      return { data: { url: `https://placehold.co/400x300?text=Upload+${Date.now()}` } }
    },
    getMatches: async () => {
      await delay()
      return { data: { listings: mockWantListings.filter((l) => l.status === 'active').slice(0, 3) } }
    },
  },
  introductions: {
    create: async (data) => {
      await delay()
      const intro = { id: 'intro-new-' + Date.now(), ...data, status: 'pending', createdAt: new Date().toISOString() }
      return { data: intro }
    },
    getReceived: async () => {
      await delay()
      const received = mockIntroductions.filter((i) => i.buyerId === 'user-1')
      return { data: { introductions: received } }
    },
    getSent: async () => {
      await delay()
      const sent = mockIntroductions.filter((i) => i.sellerId === 'user-2')
      return { data: { introductions: sent } }
    },
    accept: async (id) => {
      await delay()
      const intro = mockIntroductions.find((i) => i.id === id)
      if (intro) intro.status = 'accepted'
      return { data: intro }
    },
    reject: async (id) => {
      await delay()
      const intro = mockIntroductions.find((i) => i.id === id)
      if (intro) intro.status = 'rejected'
      return { data: intro }
    },
  },
  notifications: {
    getAll: async () => {
      await delay()
      return { data: { notifications: mockNotifications } }
    },
    getUnreadCount: async () => {
      await delay(100)
      return { data: { count: mockNotifications.filter((n) => !n.read).length } }
    },
    markRead: async (id) => {
      await delay()
      const notif = mockNotifications.find((n) => n.id === id)
      if (notif) notif.read = true
      return { data: notif }
    },
    markAllRead: async () => {
      await delay()
      mockNotifications.forEach((n) => (n.read = true))
      return { data: { success: true } }
    },
  },
  admin: {
    getUsers: async (params = {}) => {
      await delay()
      let users = [...allMockUsers]
      if (params.search) {
        users = users.filter((u) => u.email.includes(params.search))
      }
      return { data: { users, total: users.length, page: params.page || 1, limit: params.limit || 50 } }
    },
    deleteUser: async (id) => {
      await delay()
      return { data: { success: true } }
    },
    getWantListings: async (params = {}) => {
      await delay()
      return { data: { listings: mockWantListings, total: mockWantListings.length, page: params.page || 1, limit: params.limit || 50 } }
    },
    deleteWantListing: async (id) => {
      await delay()
      return { data: { success: true } }
    },
    getVehicles: async (params = {}) => {
      await delay()
      return { data: { vehicles: mockVehicles, total: mockVehicles.length, page: params.page || 1, limit: params.limit || 50 } }
    },
    deleteVehicle: async (id) => {
      await delay()
      return { data: { success: true } }
    },
  },
}

export default mockApi
