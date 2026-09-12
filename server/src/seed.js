import mongoose from 'mongoose';
import { config } from './config/index.js';
import {
  User,
  Vendor,
  DeliveryAgent,
  Category,
  Product,
  Coupon,
  CommissionSettings,
} from './models/index.js';
import { logger } from './utils/logger.js';

const seedDatabase = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info('Connected to MongoDB for seeding...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Vendor.deleteMany({}),
      DeliveryAgent.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Coupon.deleteMany({}),
      CommissionSettings.deleteMany({}),
    ]);
    logger.info('Cleared existing collections.');

    // 1. Create Commission Settings
    await CommissionSettings.create({
      defaultPercentage: 5.0,
    });

    // 2. Create Admin
    const admin = await User.create({
      name: 'LocalKart Admin',
      email: 'admin@localkart.com',
      phone: '9876543210',
      password: 'Admin@localkart2026',
      role: 'ADMIN',
      preferredLanguage: 'en',
    });

    // 3. Create Customers
    const customer1 = await User.create({
      name: 'Rahul Sharma',
      email: 'customer@localkart.com',
      phone: '9861012345',
      password: 'Customer@123',
      role: 'CUSTOMER',
      preferredLanguage: 'en',
      addresses: [
        {
          tag: 'Home',
          recipientName: 'Rahul Sharma',
          phone: '9861012345',
          streetAddress: 'Plot 104, BDA Colony, Saheed Nagar',
          landmark: 'Near RD Women’s College',
          city: 'Bhubaneswar',
          state: 'Odisha',
          pincode: '751007',
          location: {
            type: 'Point',
            coordinates: [85.8340, 20.2980],
          },
          isDefault: true,
        },
      ],
    });

    const customer2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@localkart.com',
      phone: '9861054321',
      password: 'Customer@123',
      role: 'CUSTOMER',
      preferredLanguage: 'hi',
    });

    // 4. Create Vendor Owners
    const vendorUser1 = await User.create({
      name: 'Ramesh Sahoo',
      email: 'ramesh@localkart.com',
      phone: '9437012345',
      password: 'Vendor@123',
      role: 'VENDOR',
      preferredLanguage: 'od',
    });

    const vendorUser2 = await User.create({
      name: 'Bijay Nayak',
      email: 'bijay@localkart.com',
      phone: '9437054321',
      password: 'Vendor@123',
      role: 'VENDOR',
      preferredLanguage: 'od',
    });

    const vendorUser3 = await User.create({
      name: 'Santosh Pradhan',
      email: 'santosh@localkart.com',
      phone: '9437098765',
      password: 'Vendor@123',
      role: 'VENDOR',
      preferredLanguage: 'hi',
    });

    // 5. Create Delivery Agent Users
    const agentUser1 = await User.create({
      name: 'Manoj Jena',
      email: 'delivery@localkart.com',
      phone: '9777012345',
      password: 'Delivery@123',
      role: 'DELIVERY_AGENT',
      preferredLanguage: 'od',
    });

    const agentUser2 = await User.create({
      name: 'Sunil Mohanty',
      email: 'sunil@localkart.com',
      phone: '9777054321',
      password: 'Delivery@123',
      role: 'DELIVERY_AGENT',
      preferredLanguage: 'od',
    });

    // 6. Create Categories
    const categories = await Category.insertMany([
      {
        name: { en: 'Fresh Vegetables', hi: 'ताज़ी सब्जियां', od: 'ସତେଜ ପନିପରିବା' },
        slug: 'vegetables',
        icon: 'Carrot',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
        displayOrder: 1,
      },
      {
        name: { en: 'Farm Fresh Fruits', hi: 'ताजे फल', od: 'ସତେଜ ଫଳ' },
        slug: 'fruits',
        icon: 'Apple',
        image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80',
        displayOrder: 2,
      },
      {
        name: { en: 'Dairy & Eggs', hi: 'डेयरी और अंडे', od: 'ଦୁଗ୍ଧ ଓ ଅଣ୍ଡା' },
        slug: 'dairy',
        icon: 'Milk',
        image: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=400&q=80',
        displayOrder: 3,
      },
      {
        name: { en: 'Atta, Rice & Dals', hi: 'आटा, दाल और चावल', od: 'ଅଟା, ଚାଉଳ ଓ ଡାଲି' },
        slug: 'staples',
        icon: 'Wheat',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
        displayOrder: 4,
      },
      {
        name: { en: 'Spices & Cooking Oil', hi: 'मसाले और तेल', od: 'ମସଲା ଓ ତେଲ' },
        slug: 'spices-oils',
        icon: 'Flame',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80',
        displayOrder: 5,
      },
      {
        name: { en: 'Daily Bakery & Snacks', hi: 'स्नैक्स और बेकरी', od: 'ନାସ୍ତା ଓ ବେକେରୀ' },
        slug: 'snacks',
        icon: 'Cookie',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
        displayOrder: 6,
      },
    ]);

    const catMap = {};
    categories.forEach((c) => (catMap[c.slug] = c._id));

    // 7. Create Vendors
    const vendor1 = await Vendor.create({
      userId: vendorUser1._id,
      shopName: 'Maa Tarini Fresh Vegetables & Greens',
      ownerName: 'Ramesh Sahoo',
      phone: '9437012345',
      email: 'ramesh@localkart.com',
      shopType: 'VEGETABLES',
      description: 'Daily morning farm harvest direct from Nimapada mandi. 100% crisp and green.',
      logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80',
      banner: 'https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=1000&q=80',
      location: {
        type: 'Point',
        coordinates: [85.8310, 20.2970], // Saheed Nagar
      },
      address: {
        street: 'Shop 12, Daily Vegetable Market',
        area: 'Saheed Nagar',
        city: 'Bhubaneswar',
        state: 'Odisha',
        pincode: '751007',
      },
      deliveryRadiusKm: 6,
      minOrderAmount: 49,
      deliveryFee: 20,
      freeDeliveryAbove: 249,
      openingTime: '06:00',
      closingTime: '21:30',
      isOpen: true,
      status: 'APPROVED',
      rating: 4.9,
      totalRatings: 184,
      totalOrders: 620,
      featuredToday: true,
      hasFreshStockToday: true,
      freshStockUpdatedAt: new Date(),
    });

    const vendor2 = await Vendor.create({
      userId: vendorUser2._id,
      shopName: 'Utkal Organic Mandi & Fruits',
      ownerName: 'Bijay Nayak',
      phone: '9437054321',
      email: 'bijay@localkart.com',
      shopType: 'ORGANIC_PRODUCE',
      description: 'Pesticide-free certified organic local farm produce and seasonal fruits.',
      logo: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=300&q=80',
      banner: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1000&q=80',
      location: {
        type: 'Point',
        coordinates: [85.8200, 20.2910], // Master Canteen
      },
      address: {
        street: 'Booth No. 4, Organic Hub',
        area: 'Unit 3, Kharvel Nagar',
        city: 'Bhubaneswar',
        state: 'Odisha',
        pincode: '751001',
      },
      deliveryRadiusKm: 8,
      minOrderAmount: 99,
      deliveryFee: 25,
      freeDeliveryAbove: 349,
      openingTime: '07:00',
      closingTime: '21:00',
      isOpen: true,
      status: 'APPROVED',
      rating: 4.8,
      totalRatings: 96,
      totalOrders: 310,
      featuredToday: true,
      hasFreshStockToday: true,
    });

    const vendor3 = await Vendor.create({
      userId: vendorUser3._id,
      shopName: 'Annapurna Kirana & Daily Needs Store',
      ownerName: 'Santosh Pradhan',
      phone: '9437098765',
      email: 'santosh@localkart.com',
      shopType: 'GROCERY',
      description: 'Your neighborhood trusted grocery store for 25 years. Staples, Spices, Dairy & Daily essentials.',
      logo: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=300&q=80',
      banner: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1000&q=80',
      location: {
        type: 'Point',
        coordinates: [85.8450, 20.3010], // Rasulgarh
      },
      address: {
        street: 'Plot 45, Main Square',
        area: 'Rasulgarh',
        city: 'Bhubaneswar',
        state: 'Odisha',
        pincode: '751010',
      },
      deliveryRadiusKm: 7,
      minOrderAmount: 149,
      deliveryFee: 30,
      freeDeliveryAbove: 499,
      openingTime: '06:30',
      closingTime: '22:00',
      isOpen: true,
      status: 'APPROVED',
      rating: 4.7,
      totalRatings: 215,
      totalOrders: 850,
      featuredToday: false,
      hasFreshStockToday: false,
    });

    // 8. Create Delivery Agents
    await DeliveryAgent.create({
      userId: agentUser1._id,
      vendorId: vendor1._id,
      name: 'Manoj Jena',
      phone: '9777012345',
      vehicleType: 'MOTORCYCLE',
      vehicleNumber: 'OD-02-AK-9821',
      isAvailable: true,
      completedDeliveries: 142,
      totalEarnings: 4260,
      rating: 4.9,
    });

    await DeliveryAgent.create({
      userId: agentUser2._id,
      vendorId: vendor2._id,
      name: 'Sunil Mohanty',
      phone: '9777054321',
      vehicleType: 'EV_SCOOTER',
      vehicleNumber: 'OD-02-EV-4412',
      isAvailable: true,
      completedDeliveries: 78,
      totalEarnings: 2340,
      rating: 4.8,
    });

    // 9. Seed Products
    const productsData = [
      // Vendor 1: Maa Tarini Fresh Vegetables
      {
        vendorId: vendor1._id,
        categoryId: catMap['vegetables'],
        name: { en: 'Farm Fresh Desi Tomatoes (ଟମାଟୋ)', hi: 'देसी टमाटर', od: 'ଦେଶୀ ଟମାଟୋ' },
        description: {
          en: 'Juicy, vine-ripened local farm tomatoes harvested this morning at 5 AM. Rich in flavor.',
          hi: 'आज सुबह खेत से तोड़े गए ताजे और रसीले टमाटर।',
          od: 'ଆଜି ସକାଳେ ତୋଳା ହୋଇଥିବା ସତେଜ ଦେଶୀ ଟମାଟୋ।',
        },
        price: 35,
        discountPercent: 10,
        unit: 'kg',
        unitQuantity: 1,
        stockQuantity: 80,
        freshnessStatus: 'FRESH_TODAY',
        badge: 'FRESH_HARVEST',
        harvestedDate: 'Today Morning 5:15 AM',
        images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'],
        tags: ['tomato', 'fresh', 'vegetable', 'harvest'],
      },
      {
        vendorId: vendor1._id,
        categoryId: catMap['vegetables'],
        name: { en: 'Crisp Green Cauliflower (ଫୁଲକୋବି)', hi: 'ताज़ी फूलगोभी', od: 'ସତେଜ ଫୁଲକୋବି' },
        description: {
          en: 'Snow-white, firm and compact cauliflower heads with fresh green outer leaves.',
          hi: 'ताज़ी और साफ फूलगोभी।',
          od: 'ସତେଜ ଏବଂ ସଫା ଧଳା ଫୁଲକୋବି।',
        },
        price: 40,
        discountPercent: 12,
        unit: 'piece',
        unitQuantity: 1,
        stockQuantity: 45,
        freshnessStatus: 'FRESH_TODAY',
        badge: 'FRESH_HARVEST',
        harvestedDate: 'Today Morning 5:30 AM',
        images: ['https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=600&q=80'],
        tags: ['cauliflower', 'gobi', 'fresh', 'vegetable'],
      },
      {
        vendorId: vendor1._id,
        categoryId: catMap['vegetables'],
        name: { en: 'Tender Green Bhindi / Okra (ଭେଣ୍ଡି)', hi: 'ताज़ी भिंडी', od: 'ସତେଜ ଭେଣ୍ଡି' },
        description: {
          en: 'Crisp, slender, tender ladies fingers without hard seeds.',
          hi: 'मुलायम और ताज़ी भिंडी।',
          od: 'ନରମ ଏବଂ ସତେଜ ଭେଣ୍ଡି।',
        },
        price: 45,
        discountPercent: 0,
        unit: 'kg',
        unitQuantity: 1,
        stockQuantity: 60,
        freshnessStatus: 'FRESH_TODAY',
        badge: 'FRESH_HARVEST',
        harvestedDate: 'Today Morning 5:00 AM',
        images: ['https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?auto=format&fit=crop&w=600&q=80'],
        tags: ['bhindi', 'okra', 'vegetable', 'green'],
      },
      {
        vendorId: vendor1._id,
        categoryId: catMap['vegetables'],
        name: { en: 'Fresh Palak / Spinach (ପାଳଙ୍ଗ ଶାଗ)', hi: 'ताज़ा पालक', od: 'ପାଳଙ୍ଗ ଶାଗ' },
        description: {
          en: 'Dew-kissed leafy green spinach bundles. High iron & nutrient content.',
          hi: 'खेत से लाया हुआ हरा पालक।',
          od: 'ସତେଜ ସବୁଜ ପାଳଙ୍ଗ ଶାଗ।',
        },
        price: 25,
        discountPercent: 0,
        unit: 'bundle',
        unitQuantity: 1,
        stockQuantity: 50,
        freshnessStatus: 'FRESH_TODAY',
        badge: 'FRESH_HARVEST',
        harvestedDate: 'Today Morning 4:45 AM',
        images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80'],
        tags: ['spinach', 'palak', 'greens', 'shaag'],
      },
      {
        vendorId: vendor1._id,
        categoryId: catMap['vegetables'],
        name: { en: 'Desi Baigana / Purple Brinjal (ବାଇଗଣ)', hi: 'ताज़ा बैंगन', od: 'ଦେଶୀ ବାଇଗଣ' },
        description: {
          en: 'Glossy purple local brinjals perfect for roasted Baigan Bharta or Dalma.',
          hi: 'चमकदार और ताजा बैंगन।',
          od: 'ଡାଲମା ଏବଂ ଭର୍ତ୍ତା ପାଇଁ ଉପଯୁକ୍ତ ବାଇଗଣ।',
        },
        price: 30,
        discountPercent: 10,
        unit: 'kg',
        unitQuantity: 1,
        stockQuantity: 70,
        freshnessStatus: 'FRESH_TODAY',
        badge: 'BESTSELLER',
        harvestedDate: 'Today Morning 5:20 AM',
        images: ['https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&w=600&q=80'],
        tags: ['brinjal', 'eggplant', 'baigan', 'dalma'],
      },
      {
        vendorId: vendor1._id,
        categoryId: catMap['vegetables'],
        name: { en: 'Potala / Pointed Gourd (ପୋଟଳ)', hi: 'ताज़ा परवल', od: 'ସତେଜ ପୋଟଳ' },
        description: {
          en: 'Crisp green pointed gourds straight from local riverbank farms.',
          hi: 'ताज़ा परवल।',
          od: 'ନଦୀ କୂଳ ଫାର୍ମରୁ ସତେଜ ପୋଟଳ।',
        },
        price: 50,
        discountPercent: 5,
        unit: 'kg',
        unitQuantity: 1,
        stockQuantity: 40,
        freshnessStatus: 'FRESH_TODAY',
        badge: 'FRESH_HARVEST',
        harvestedDate: 'Today Morning 5:00 AM',
        images: ['https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=600&q=80'],
        tags: ['parwal', 'potala', 'pointed gourd'],
      },
      {
        vendorId: vendor1._id,
        categoryId: catMap['vegetables'],
        name: { en: 'Fresh Coriander & Green Chillies Combo (ଧନିଆ ଓ ଲଙ୍କା)', hi: 'धनिया और हरी मिर्च', od: 'ଧନିଆ ଓ କଞ୍ଚା ଲଙ୍କା' },
        description: {
          en: 'Fragrant freshly plucked coriander bunch (100g) with pungent green chillies (100g).',
          hi: 'ताज़ा हरा धनिया और तीखी हरी मिर्च।',
          od: 'ସୁଗନ୍ଧିତ ସତେଜ ଧନିଆ ପତ୍ର ଏବଂ କଞ୍ଚା ଲଙ୍କା।',
        },
        price: 20,
        discountPercent: 0,
        unit: 'bundle',
        unitQuantity: 1,
        stockQuantity: 90,
        freshnessStatus: 'FRESH_TODAY',
        badge: 'LOCAL_SPECIAL',
        harvestedDate: 'Today Morning 4:30 AM',
        images: ['https://images.unsplash.com/photo-1588879462716-568d40776b29?auto=format&fit=crop&w=600&q=80'],
        tags: ['coriander', 'chilli', 'dhaniya', 'combo'],
      },

      // Vendor 2: Utkal Organic Mandi
      {
        vendorId: vendor2._id,
        categoryId: catMap['fruits'],
        name: { en: 'Organic Nagpur Sweet Oranges (କମଳା)', hi: 'नागपुर संतरे', od: 'ମିଠା କମଳା' },
        description: {
          en: 'Citrusy, sweet and juicy farm-fresh Nagpur oranges. Chemical-free.',
          hi: 'मीठे और रसीले नागपुरी संतरे।',
          od: 'ମିଠା ଏବଂ ରସାଳ ନାଗପୁରୀ କମଳା।',
        },
        price: 90,
        discountPercent: 15,
        unit: 'kg',
        unitQuantity: 1,
        stockQuantity: 35,
        freshnessStatus: 'FRESH_TODAY',
        badge: 'ORGANIC',
        harvestedDate: 'Direct Orchard Arrival',
        images: ['https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=80'],
        tags: ['orange', 'fruits', 'citrus', 'organic'],
      },
      {
        vendorId: vendor2._id,
        categoryId: catMap['fruits'],
        name: { en: 'Local Champa Bananas (ଚମ୍ପା କଦଳୀ)', hi: 'चंपा केला', od: 'ଚମ୍ପା କଦଳୀ' },
        description: {
          en: 'Naturally tree-ripened Champa sweet bananas. No calcium carbide used.',
          hi: 'प्राकृतिक रूप से पके हुए मीठे केले।',
          od: 'ଗଛ ପାଚିଲା ସ୍ୱାଦିଷ୍ଟ ଚମ୍ପା କଦଳୀ।',
        },
        price: 60,
        discountPercent: 0,
        unit: 'dozen',
        unitQuantity: 1,
        stockQuantity: 50,
        freshnessStatus: 'FRESH_TODAY',
        badge: 'ORGANIC',
        harvestedDate: 'Naturally Ripened',
        images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80'],
        tags: ['banana', 'kadali', 'fruits', 'organic'],
      },
      {
        vendorId: vendor2._id,
        categoryId: catMap['fruits'],
        name: { en: 'Shimla Royal Delicious Apples (ସେଓ)', hi: 'शिमला सेब', od: 'ଶିମଲା ସେଓ' },
        description: {
          en: 'Crisp, sweet, non-waxed red apples directly from Himachal orchards.',
          hi: 'मीठे और कुरकुरे शिमला सेब।',
          od: 'ମିଠା ଏବଂ ସତେଜ ଶିମଲା ସେଓ।',
        },
        price: 160,
        discountPercent: 10,
        unit: 'kg',
        unitQuantity: 1,
        stockQuantity: 30,
        freshnessStatus: 'AVAILABLE',
        badge: 'ORGANIC',
        images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80'],
        tags: ['apple', 'fruits', 'shimla'],
      },
      {
        vendorId: vendor2._id,
        categoryId: catMap['vegetables'],
        name: { en: 'Organic Baby Carrots (ଗାଜର)', hi: 'ऑर्गेनिक गाजर', od: 'ଅର୍ଗାନିକ୍ ଗାଜର' },
        description: {
          en: 'Sweet, vibrant orange chemical-free winter carrots.',
          hi: 'मीठी और लाल ऑर्गेनिक गाजर।',
          od: 'ମିଠା ଏବଂ ସତେଜ ଗାଜର।',
        },
        price: 45,
        discountPercent: 0,
        unit: 'kg',
        unitQuantity: 1,
        stockQuantity: 40,
        freshnessStatus: 'FRESH_TODAY',
        badge: 'ORGANIC',
        harvestedDate: 'Today Morning 6:00 AM',
        images: ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80'],
        tags: ['carrot', 'gajar', 'organic'],
      },

      // Vendor 3: Annapurna Kirana & Daily Needs
      {
        vendorId: vendor3._id,
        categoryId: catMap['staples'],
        name: { en: 'Aashirvaad Shudh Chakki Atta 5kg (ଅଟା)', hi: 'आशीर्वाद आटा 5kg', od: 'ଆଶୀର୍ବାଦ ଅଟା 5 କେଜି' },
        description: {
          en: '100% pure whole wheat flour processed with traditional stone chakki technique for soft rotis.',
          hi: '100% शुद्ध गेहूं का आटा।',
          od: '୧୦୦% ଶୁଦ୍ଧ ଗହମ ଅଟା।',
        },
        price: 245,
        discountPercent: 8,
        unit: 'packet',
        unitQuantity: 5,
        stockQuantity: 60,
        freshnessStatus: 'AVAILABLE',
        badge: 'BESTSELLER',
        images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'],
        tags: ['atta', 'wheat', 'flour', 'staples'],
      },
      {
        vendorId: vendor3._id,
        categoryId: catMap['staples'],
        name: { en: 'Royal Odisha Gobindobhog Rice 1kg (ସୁଗନ୍ଧିତ ଚାଉଳ)', hi: 'गोविंदोभोग चावल', od: 'ଗୋବିନ୍ଦଭୋଗ ଚାଉଳ' },
        description: {
          en: 'Aromatic short-grain heritage rice perfect for Kheeri, Khichdi, and Pulao.',
          hi: 'सुगंधित गोविंदोभोग चावल।',
          od: 'ଖିରି ଏବଂ ପଲାଉ ପାଇଁ ସୁଗନ୍ଧିତ ଗୋବିନ୍ଦଭୋଗ ଚାଉଳ।',
        },
        price: 95,
        discountPercent: 5,
        unit: 'kg',
        unitQuantity: 1,
        stockQuantity: 80,
        freshnessStatus: 'AVAILABLE',
        badge: 'LOCAL_SPECIAL',
        images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'],
        tags: ['rice', 'gobindobhog', 'aromatic', 'staples'],
      },
      {
        vendorId: vendor3._id,
        categoryId: catMap['staples'],
        name: { en: 'Tata Sampann Unpolished Toor Dal 1kg (ହରଡ଼ ଡାଲି)', hi: 'टाटा संपन्न अरहर दाल', od: 'ହରଡ଼ ଡାଲି' },
        description: {
          en: 'Unpolished protein-rich Toor dal without artificial water or oil polish.',
          hi: 'बिना पॉलिश की हुई अरहर दाल।',
          od: 'ପ୍ରୋଟିନ ଯୁକ୍ତ ବିନା ପଲିସ୍ ହରଡ଼ ଡାଲି।',
        },
        price: 175,
        discountPercent: 6,
        unit: 'kg',
        unitQuantity: 1,
        stockQuantity: 50,
        freshnessStatus: 'AVAILABLE',
        badge: 'BESTSELLER',
        images: ['https://images.unsplash.com/photo-1585994192701-f1a505c817ea?auto=format&fit=crop&w=600&q=80'],
        tags: ['dal', 'toor', 'pulses', 'staples'],
      },
      {
        vendorId: vendor3._id,
        categoryId: catMap['spices-oils'],
        name: { en: 'Fortune Sunlite Refined Sunflower Oil 1L (ସୂର୍ଯ୍ୟମୁଖୀ ତେଲ)', hi: 'फॉर्च्यून सनफ्लावर तेल 1L', od: 'ଫର୍ଚୁନ ସୂର୍ଯ୍ୟମୁଖୀ ତେଲ' },
        description: {
          en: 'Enriched with Vitamin A and D. Light and healthy cooking oil.',
          hi: 'फॉर्च्यून रिफाइंड सनफ्लावर तेल।',
          od: 'ଭିଟାମିନ A ଓ D ଯୁକ୍ତ ସ୍ୱାସ୍ଥ୍ୟକର ତେଲ।',
        },
        price: 135,
        discountPercent: 7,
        unit: 'litre',
        unitQuantity: 1,
        stockQuantity: 40,
        freshnessStatus: 'AVAILABLE',
        badge: 'NONE',
        images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80'],
        tags: ['oil', 'cooking oil', 'fortune'],
      },
      {
        vendorId: vendor3._id,
        categoryId: catMap['dairy'],
        name: { en: 'OMFED Toned Fresh Milk 500ml (ଓମଫେଡ୍ କ୍ଷୀର)', hi: 'ओम्फेड टोंड दूध 500ml', od: 'ଓମଫେଡ୍ ଟୋଣ୍ଡ କ୍ଷୀର' },
        description: {
          en: 'Pasteurized homogenized cow milk fresh stock delivered twice daily.',
          hi: 'ओम्फेड ताज़ा पाश्चुरीकृत दूध।',
          od: 'ସତେଜ ପାଶ୍ଚୁରାଇଜ୍ଡ ଓମଫେଡ୍ ଗାଈ କ୍ଷୀର।',
        },
        price: 24,
        discountPercent: 0,
        unit: 'packet',
        unitQuantity: 1,
        stockQuantity: 100,
        freshnessStatus: 'FRESH_TODAY',
        badge: 'BESTSELLER',
        harvestedDate: 'Today Morning 5:00 AM Batch',
        images: ['https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=600&q=80'],
        tags: ['milk', 'omfed', 'dairy', 'fresh'],
      },
      {
        vendorId: vendor3._id,
        categoryId: catMap['dairy'],
        name: { en: 'Farm Fresh White Eggs (ଅଣ୍ଡା) - Pack of 6', hi: 'ताजे अंडे (6 का पैक)', od: 'ସତେଜ ଅଣ୍ଡା (୬ଟି)' },
        description: {
          en: 'Nutrient-rich, graded fresh poultry farm eggs.',
          hi: 'ताजे और प्रोटीन युक्त अंडे।',
          od: 'ପ୍ରୋଟିନ ଯୁକ୍ତ ସତେଜ କୁକୁଡ଼ା ଅଣ୍ଡା।',
        },
        price: 42,
        discountPercent: 5,
        unit: 'packet',
        unitQuantity: 1,
        stockQuantity: 60,
        freshnessStatus: 'FRESH_TODAY',
        badge: 'NONE',
        images: ['https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80'],
        tags: ['eggs', 'protein', 'dairy'],
      },
    ];

    await Product.insertMany(productsData);
    logger.info(`Inserted ${productsData.length} realistic products.`);

    // 10. Seed Coupons
    await Coupon.insertMany([
      {
        code: 'FRESH50',
        description: 'Flat ₹50 OFF on Fresh Vegetables & Grocery orders above ₹199',
        discountType: 'FLAT',
        discountValue: 50,
        minOrderAmount: 199,
        maxDiscountAmount: 50,
        isActive: true,
      },
      {
        code: 'LOCAL20',
        description: '20% discount on order up to ₹80',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderAmount: 149,
        maxDiscountAmount: 80,
        isActive: true,
      },
      {
        code: 'WELCOME10',
        description: '10% discount for all customers',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderAmount: 99,
        maxDiscountAmount: 50,
        isActive: true,
      },
    ]);
    logger.info('Inserted active promotional coupons.');

    logger.info('====================================================');
    logger.info('✅ LocalKart Database Seeding Completed Successfully!');
    logger.info('====================================================');
    logger.info('Sample Login Credentials:');
    logger.info('👑 Admin:          admin@localkart.com / Admin@localkart2026');
    logger.info('🛒 Customer:       customer@localkart.com / Customer@123');
    logger.info('🏪 Vegetable Vendor: ramesh@localkart.com / Vendor@123');
    logger.info('🏪 Organic Vendor:   bijay@localkart.com / Vendor@123');
    logger.info('🏪 Grocery Vendor:   santosh@localkart.com / Vendor@123');
    logger.info('🛵 Delivery Agent:   delivery@localkart.com / Delivery@123');
    logger.info('====================================================');

    process.exit(0);
  } catch (error) {
    logger.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
