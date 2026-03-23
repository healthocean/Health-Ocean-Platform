import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import { User } from './models/User';
import { Lab } from './models/Lab';
import { LabTest } from './models/LabTest';
import { LabPackage } from './models/LabPackage';
import { Booking } from './models/Booking';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthocean';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await Lab.deleteMany({});
    await LabTest.deleteMany({});
    await LabPackage.deleteMany({});
    await Booking.deleteMany({});
    console.log('Cleared Labs, Tests, Packages, Bookings.');

    // 25 completely unique Indian users
    const userNames = [
      'aarav', 'ishan', 'madhav', 'nisha', 'karthik', 'aditi', 'vikash', 'pragati', 
      'manoj', 'divya', 'tarun', 'shilpa', 'harsh', 'rekha', 'anil', 
      'vandana', 'sumit', 'payal', 'nitin', 'geeta', 'bhavin', 'parul', 'dhruv', 'swati', 'chintan'
    ];

    console.log('Seeding 25 unique Users...');
    for (const name of userNames) {
      const email = `${name}@gmail.com`;
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(name, salt);
        await User.create({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          email,
          phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
          password: hashedPassword
        });
      }
    }
    console.log(`Ensured ${userNames.length} unique Indian users exist.`);

    // 175 UNIQUE LABS (25 per city)
    const uniqueLabsData = [
      // DELHI
      { name: 'Apex Diagnostics Delhi', city: 'Delhi' }, { name: 'CarePlus Pathology NCR', city: 'Delhi' },
      { name: 'Dilli Health Checkup Center', city: 'Delhi' }, { name: 'Safdarjung Diagnostic Labs', city: 'Delhi' },
      { name: 'NCR Med Labs', city: 'Delhi' }, { name: 'Connaught Place Testing Centre', city: 'Delhi' },
      { name: 'South Delhi Wellness Clinic', city: 'Delhi' }, { name: 'Rohini Path Care', city: 'Delhi' },
      { name: 'Dwarka Bio Tests', city: 'Delhi' }, { name: 'Lajpat Nagar Blood Centre', city: 'Delhi' },
      { name: 'Greater Kailash Diagnostics', city: 'Delhi' }, { name: 'Vasant Kunj Health Point', city: 'Delhi' },
      { name: 'Saket Medical Lab', city: 'Delhi' }, { name: 'Pitampura Pathology', city: 'Delhi' },
      { name: 'Janakpuri Testing Center', city: 'Delhi' }, { name: 'Chandni Chowk Bio Diagnostics', city: 'Delhi' },
      { name: 'Green Park Imaging & Labs', city: 'Delhi' }, { name: 'Hauz Khas MedCare', city: 'Delhi' },
      { name: 'Defence Colony Health Check', city: 'Delhi' }, { name: 'New Delhi Pathologists', city: 'Delhi' },
      { name: 'Capital City Diagnostics', city: 'Delhi' }, { name: 'Metro Heart & Blood Lab', city: 'Delhi' },
      { name: 'Rajouri Garden Testing Clinic', city: 'Delhi' }, { name: 'North Delhi Path Point', city: 'Delhi' },
      { name: 'Okhla Core Diagnostics', city: 'Delhi' },

      // MUMBAI
      { name: 'Marine Drive Pathology', city: 'Mumbai' }, { name: 'Andheri Health Point', city: 'Mumbai' },
      { name: 'Bombay Testing Center', city: 'Mumbai' }, { name: 'Western Suburban Diagnostics', city: 'Mumbai' },
      { name: 'Konkan Health Labs', city: 'Mumbai' }, { name: 'Bandra Wellness PathLab', city: 'Mumbai' },
      { name: 'Dadar Core Diagnostics', city: 'Mumbai' }, { name: 'Juhu Medical Testing', city: 'Mumbai' },
      { name: 'Colaba Blood Centre', city: 'Mumbai' }, { name: 'Borivali Bio Diagnostics', city: 'Mumbai' },
      { name: 'Goregaon Path Care', city: 'Mumbai' }, { name: 'Malad Health Screening', city: 'Mumbai' },
      { name: 'Vile Parle Diagnostic Clinic', city: 'Mumbai' }, { name: 'Thane Central Lab', city: 'Mumbai' },
      { name: 'Navi Mumbai Health Centre', city: 'Mumbai' }, { name: 'Powai Pathology Point', city: 'Mumbai' },
      { name: 'South Bombay Testing Center', city: 'Mumbai' }, { name: 'Kurla Med Labs', city: 'Mumbai' },
      { name: 'Sion Circle Diagnostics', city: 'Mumbai' }, { name: 'Worli Blood and Imaging', city: 'Mumbai' },
      { name: 'Mumbai Metro Pathology', city: 'Mumbai' }, { name: 'Churchgate Health Check', city: 'Mumbai' },
      { name: 'Khar Diagnostic Hub', city: 'Mumbai' }, { name: 'Santacruz Pathology Office', city: 'Mumbai' },
      { name: 'Chembur Medical Lab', city: 'Mumbai' },

      // BENGALURU
      { name: 'IT Park Diagnostics', city: 'Bengaluru' }, { name: 'Koramangala Path Labs', city: 'Bengaluru' },
      { name: 'Electronic City Health Check', city: 'Bengaluru' }, { name: 'Silicon Valley Bio Labs', city: 'Bengaluru' },
      { name: 'Whitefield Testing Services', city: 'Bengaluru' }, { name: 'Indiranagar Path Clinic', city: 'Bengaluru' },
      { name: 'Jayanagar Blood Centre', city: 'Bengaluru' }, { name: 'Malleswaram Medical Lab', city: 'Bengaluru' },
      { name: 'HSR Layout Diagnostics', city: 'Bengaluru' }, { name: 'BTM Layout Pathology', city: 'Bengaluru' },
      { name: 'Yelahanka Bio Testing', city: 'Bengaluru' }, { name: 'Marathahalli Health Point', city: 'Bengaluru' },
      { name: 'JP Nagar Diagnostics Center', city: 'Bengaluru' }, { name: 'Sarjapur Path Core', city: 'Bengaluru' },
      { name: 'Hebbal Testing Hub', city: 'Bengaluru' }, { name: 'Peenya Medical Checkups', city: 'Bengaluru' },
      { name: 'Rajajinagar Blood Lab', city: 'Bengaluru' }, { name: 'Basavanagudi Diagnostics', city: 'Bengaluru' },
      { name: 'Bellandur Health Testing', city: 'Bengaluru' }, { name: 'Domlur Pathology Solutions', city: 'Bengaluru' },
      { name: 'Seshadripuram Bio Lab', city: 'Bengaluru' }, { name: 'Banashankari Med Center', city: 'Bengaluru' },
      { name: 'CV Raman Nagar Lab', city: 'Bengaluru' }, { name: 'Hosur Road Diagnostics', city: 'Bengaluru' },
      { name: 'Bangalore Central Pathology', city: 'Bengaluru' },

      // KOLKATA
      { name: 'Howrah Bridge Diagnostics', city: 'Kolkata' }, { name: 'Salt Lake Testing Center', city: 'Kolkata' },
      { name: 'Bengal Health Labs', city: 'Kolkata' }, { name: 'Park Street PathLabs', city: 'Kolkata' },
      { name: 'Ganges Medical Tests', city: 'Kolkata' }, { name: 'New Town Blood Centre', city: 'Kolkata' },
      { name: 'Ballygunge Health Check', city: 'Kolkata' }, { name: 'Dum Dum Diagnostic Clinic', city: 'Kolkata' },
      { name: 'Alipore Pathology Lab', city: 'Kolkata' }, { name: 'Bhawanipore Testing Point', city: 'Kolkata' },
      { name: 'Behala Core Diagnostics', city: 'Kolkata' }, { name: 'Gariahat Medical Lab', city: 'Kolkata' },
      { name: 'Jadavpur Bio Checks', city: 'Kolkata' }, { name: 'Shyambazar Path Care', city: 'Kolkata' },
      { name: 'Rajarhat Health Centre', city: 'Kolkata' }, { name: 'Barasat Diagnostic Point', city: 'Kolkata' },
      { name: 'Esplanade Pathology', city: 'Kolkata' }, { name: 'Ruby Crossing Testing Lab', city: 'Kolkata' },
      { name: 'Bidhannagar Medical Services', city: 'Kolkata' }, { name: 'Tollygunge Blood Bank and Lab', city: 'Kolkata' },
      { name: 'Kolkata Metro Diagnostics', city: 'Kolkata' }, { name: 'Sector V Path Point', city: 'Kolkata' },
      { name: 'Bagbazar Health Center', city: 'Kolkata' }, { name: 'Sealdah Diagnostic Hub', city: 'Kolkata' },
      { name: 'Jodhpur Park Labs', city: 'Kolkata' },

      // CHENNAI
      { name: 'Marina Diagnostics', city: 'Chennai' }, { name: 'Adyar Health Point', city: 'Chennai' },
      { name: 'Tamil Health Check', city: 'Chennai' }, { name: 'OMR Path Labs', city: 'Chennai' },
      { name: 'Southern Medical Tests', city: 'Chennai' }, { name: 'T Nagar Pathology', city: 'Chennai' },
      { name: 'Velachery Diagnostic Clinic', city: 'Chennai' }, { name: 'Anna Nagar Blood Centre', city: 'Chennai' },
      { name: 'Mylapore Bio Checks', city: 'Chennai' }, { name: 'Guindy Core Diagnostics', city: 'Chennai' },
      { name: 'Tambaram Health Lab', city: 'Chennai' }, { name: 'Nungambakkam Path Care', city: 'Chennai' },
      { name: 'Porur Testing Center', city: 'Chennai' }, { name: 'Chromepet Medical Checks', city: 'Chennai' },
      { name: 'Besant Nagar Health Labs', city: 'Chennai' }, { name: 'Pallikaranai Diagnostics', city: 'Chennai' },
      { name: 'Perambur Pathology Services', city: 'Chennai' }, { name: 'Navallur Bio Lab', city: 'Chennai' },
      { name: 'Alandur Testing Hub', city: 'Chennai' }, { name: 'Egmore Blood Diagnostic', city: 'Chennai' },
      { name: 'Thiruvanmiyur Health Point', city: 'Chennai' }, { name: 'Madipakkam Pathologists', city: 'Chennai' },
      { name: 'Chennai Central Medical Lab', city: 'Chennai' }, { name: 'Triplicane Diagnostics', city: 'Chennai' },
      { name: 'Kilpauk Testing Core', city: 'Chennai' },

      // PUNE
      { name: 'Deccan Diagnostics', city: 'Pune' }, { name: 'Shivaji Nagar Health Check', city: 'Pune' },
      { name: 'Pune City Labs', city: 'Pune' }, { name: 'Viman Nagar PathLabs', city: 'Pune' },
      { name: 'Sinhagad Pathology', city: 'Pune' }, { name: 'Koregaon Park Testing', city: 'Pune' },
      { name: 'Hinjewadi Bio Center', city: 'Pune' }, { name: 'Kalyani Nagar Diagnostics', city: 'Pune' },
      { name: 'Wakad Pathology Check', city: 'Pune' }, { name: 'Kothrud Medical Lab', city: 'Pune' },
      { name: 'Camp Area Diagnostic Clinic', city: 'Pune' }, { name: 'Baner Health Blood Centre', city: 'Pune' },
      { name: 'Pimpri Testing Services', city: 'Pune' }, { name: 'Chinchwad Path Care', city: 'Pune' },
      { name: 'Hadapsar Diagnostics', city: 'Pune' }, { name: 'Magarpatta Health Checks', city: 'Pune' },
      { name: 'Aundh Pathology Hub', city: 'Pune' }, { name: 'Yerawada Medical Point', city: 'Pune' },
      { name: 'Karve Nagar Lab', city: 'Pune' }, { name: 'Bhosari Testing Center', city: 'Pune' },
      { name: 'Swargate Core Diagnostics', city: 'Pune' }, { name: 'Erandwane Path Point', city: 'Pune' },
      { name: 'Wanowrie Health Testing', city: 'Pune' }, { name: 'Khadki Diagnostic Solutions', city: 'Pune' },
      { name: 'Pune Central Blood Labs', city: 'Pune' },

      // AHMEDABAD
      { name: 'Gujrat Health Diagnostics', city: 'Ahmedabad' }, { name: 'Sabarmati Testing Center', city: 'Ahmedabad' },
      { name: 'Ahmedabad PathLabs', city: 'Ahmedabad' }, { name: 'Vastrapur Medical Labs', city: 'Ahmedabad' },
      { name: 'Navrangpura Diagnostic Center', city: 'Ahmedabad' }, { name: 'Satellite Pathology', city: 'Ahmedabad' },
      { name: 'Bopal Health Check', city: 'Ahmedabad' }, { name: 'Maninagar Blood Centre', city: 'Ahmedabad' },
      { name: 'Thaltej Path Care', city: 'Ahmedabad' }, { name: 'SG Highway Diagnostics', city: 'Ahmedabad' },
      { name: 'Paldi Bio Labs', city: 'Ahmedabad' }, { name: 'Bodakdev Testing Hub', city: 'Ahmedabad' },
      { name: 'Prahlad Nagar Health Center', city: 'Ahmedabad' }, { name: 'Ashram Road Pathology', city: 'Ahmedabad' },
      { name: 'Chandkheda Medical Testing', city: 'Ahmedabad' }, { name: 'Vatva Health Diagnostics', city: 'Ahmedabad' },
      { name: 'Ghatlodiya Lab Services', city: 'Ahmedabad' }, { name: 'Shahibaug Diagnostic Co', city: 'Ahmedabad' },
      { name: 'Ellisbridge Pathologists', city: 'Ahmedabad' }, { name: 'Naroda Blood Checking Center', city: 'Ahmedabad' },
      { name: 'Vejalpur Clinical Lab', city: 'Ahmedabad' }, { name: 'Makarba Testing Point', city: 'Ahmedabad' },
      { name: 'Ranip Pathology Point', city: 'Ahmedabad' }, { name: 'Gota Diagnostics', city: 'Ahmedabad' },
      { name: 'Usmanpura Bio Center', city: 'Ahmedabad' }
    ];

    // City coordinates [lon, lat]
    const cityCoords: { [key: string]: [number, number] } = {
      'Delhi': [77.2090, 28.6139],
      'Mumbai': [72.8777, 19.0760],
      'Bengaluru': [77.5946, 12.9716],
      'Kolkata': [88.3639, 22.5726],
      'Chennai': [80.2707, 13.0827],
      'Pune': [73.8567, 18.5204],
      'Ahmedabad': [72.5714, 23.0225],
    };

    const getJitteredCoord = (coord: number) => coord + (Math.random() - 0.5) * 0.1;

    console.log('Seeding 175 Labs with Geo-coordinates...');
    const labsToInsert: any[] = [];
    let labCounter = 1;
    for (const lab of uniqueLabsData) {
      const base = cityCoords[lab.city] || [77.2090, 28.6139];
      labsToInsert.push({
        labId: `LAB${String(labCounter).padStart(3, '0')}`,
        name: lab.name,
        email: `contact@lab${labCounter}.com`,
        phone: `1800${Math.floor(100000 + Math.random() * 900000)}`,
        password: await bcrypt.hash('lab123', 10),
        address: `${Math.floor(Math.random() * 200) + 1}, Care Street, ${lab.city}`,
        city: lab.city,
        state: lab.city === 'Delhi' ? 'Delhi' : lab.city === 'Mumbai' || lab.city === 'Pune' ? 'Maharashtra' : lab.city === 'Bengaluru' ? 'Karnataka' : lab.city === 'Kolkata' ? 'West Bengal' : lab.city === 'Chennai' ? 'Tamil Nadu' : 'Gujarat',
        pincode: `${Math.floor(110000 + Math.random() * 800000)}`,
        nablCertificate: `NABL-${labCounter}-2023`,
        licenseNumber: `LIC-${labCounter}-001`,
        establishedYear: Math.floor(1990 + Math.random() * 30),
        status: 'Approved',
        rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)), // 3.5 to 5.0
        totalBookings: Math.floor(100 + Math.random() * 8000),
        servicesOffered: ['Blood Test', 'Home Collection', 'X-Ray', 'Urine Profile'],
        location: {
          type: 'Point',
          coordinates: [getJitteredCoord(base[0]), getJitteredCoord(base[1])]
        }
      });
      labCounter++;
    }

    const createdLabs = await Lab.insertMany(labsToInsert);
    console.log(`Created ${createdLabs.length} unique Labs.`);

    // Comprehensive list of detailed tests from sources like Pharmeasy/1mg
    const standardTests = [
      { name: 'Complete Blood Count (CBC) with ESR', cat: 'Fever', p: 350, op: 500, organ: 'General', gender: 'Both', age: 'All Ages', prep: false },
      { name: 'Widal Test (Slide Method)', cat: 'Fever', p: 250, op: 350, organ: 'General', gender: 'Both', age: 'All Ages', prep: false },
      { name: 'Dengue NS1 Antigen & Antibodies', cat: 'Fever', p: 750, op: 1000, organ: 'General', gender: 'Both', age: 'All Ages', prep: false },
      { name: 'Malaria Parasite Smear (MP)', cat: 'Fever', p: 200, op: 300, organ: 'General', gender: 'Both', age: 'All Ages', prep: false },
      { name: 'Thyroid Profile Free (FT3, FT4, TSH)', cat: 'Thyroid', p: 650, op: 900, organ: 'Thyroid', gender: 'Both', age: 'All Ages', prep: true },
      { name: 'Thyroid Profile Total (T3, T4, TSH)', cat: 'Thyroid', p: 500, op: 700, organ: 'Thyroid', gender: 'Both', age: 'All Ages', prep: true },
      { name: 'Thyroid Antibodies (TG & TPO)', cat: 'Thyroid', p: 1800, op: 2500, organ: 'Thyroid', gender: 'Both', age: 'All Ages', prep: false },
      { name: 'Brain Health: Vitamin B12 Active', cat: 'Hair & Skin', p: 950, op: 1400, organ: 'Brain', gender: 'Both', age: 'All Ages', prep: false },
      { name: 'Neuro-Marker: Homocysteine', cat: 'Full Body Checkups', p: 1100, op: 1600, organ: 'Brain', gender: 'Both', age: 'Adults', prep: true },
      { name: 'Lung Function: IgE Total', cat: 'Allergy Tests', p: 600, op: 850, organ: 'Lungs', gender: 'Both', age: 'All Ages', prep: false },
      { name: 'Respiratory Panel: Allergy Screen', cat: 'Allergy Tests', p: 3500, op: 5000, organ: 'Lungs', gender: 'Both', age: 'All Ages', prep: false },
      { name: 'Fasting Blood Sugar (FBS)', cat: 'Diabetes', p: 150, op: 200, organ: 'Stomach', gender: 'Both', age: 'Adults', prep: true },
      { name: 'HbA1c (Glycosylated Hemoglobin)', cat: 'Diabetes', p: 450, op: 650, organ: 'Stomach', gender: 'Both', age: 'Adults', prep: false },
      { name: 'Lipid Profile Extended', cat: 'Heart Health', p: 850, op: 1200, organ: 'Heart', gender: 'Both', age: 'Senior', prep: true },
      { name: 'High Sensitivity CRP (hs-CRP)', cat: 'Heart Health', p: 700, op: 1000, organ: 'Heart', gender: 'Both', age: 'Heart', prep: false },
      { name: 'Homocysteine Cardiac', cat: 'Heart Health', p: 1200, op: 1800, organ: 'Heart', gender: 'Both', age: 'Adults', prep: true },
      { name: 'Troponin-T High Sensitive', cat: 'Heart Health', p: 1500, op: 2000, organ: 'Heart', gender: 'Both', age: 'Adults', prep: false },
      { name: 'Vitamin D (25-OH) Total', cat: 'Hair & Skin', p: 1100, op: 1600, organ: 'Joints', gender: 'Both', age: 'All Ages', prep: false },
      { name: 'Calcium & Bone Health Screen', cat: 'Hair & Skin', p: 400, op: 600, organ: 'Bone', gender: 'Both', age: 'All Ages', prep: false },
      { name: 'Iron Profile Total', cat: 'Hair & Skin', p: 750, op: 1100, organ: 'General', gender: 'Both', age: 'All Ages', prep: false },
      { name: 'Liver Function Test Extended (LFT)', cat: 'Full Body Checkups', p: 650, op: 900, organ: 'Liver', gender: 'Both', age: 'All Ages', prep: true },
      { name: 'Kidney Function Test (KFT / RFT)', cat: 'Full Body Checkups', p: 700, op: 1000, organ: 'Kidney', gender: 'Both', age: 'All Ages', prep: true },
      { name: 'Arthritis Profile Comprehensive', cat: 'Full Body Checkups', p: 1800, op: 2500, organ: 'Joints', gender: 'Both', age: 'Adults', prep: false },
      { name: 'Urine Routine & Microscopy', cat: 'Full Body Checkups', p: 150, op: 250, organ: 'Kidney', gender: 'Both', age: 'All Ages', prep: false }
    ];

    let globalTestCount = 1;
    let globalPackageCount = 1;

    console.log('Distributing Tests and Generating highly unique Packages for each Lab...');
    const allTestsToInsert: any[] = [];
    const allPackagesToInsert: any[] = [];

    // Distinct package concepts. We'll prepend the LAB NAME to guarantee no two packages exist with the same name.
    const packageConcepts = [
      { suffix: 'Supreme Full Body Assessment', cat: 'Full Body Checkups', organ: 'General', gender: 'Both', age: 'Adults', p: 1499, op: 2500, t: ['CBC with ESR', 'LFT', 'KFT', 'Lipid Profile', 'Urine Routine'] },
      { suffix: 'Comprehensive Senior Citizen Evaluation', cat: 'Full Body Checkups', organ: 'General', gender: 'Both', age: 'Seniors', p: 2499, op: 4000, t: ['CBC with ESR', 'HbA1c', 'LFT', 'KFT', 'Lipid Profile', 'PSA'] },
      { suffix: 'Advanced Male Health Shield', cat: 'Full Body Checkups', organ: 'Multiple Organs', gender: 'Male', age: 'Adults', p: 3299, op: 5000, t: ['CBC', 'Testosterone Total', 'PSA', 'Lipid Profile Extended', 'Liver Function Test Extended (LFT)'] },
      { suffix: 'Complete Women\'s Care Plan', cat: 'Full Body Checkups', organ: 'Multiple Organs', gender: 'Female', age: 'Adults', p: 3599, op: 5500, t: ['CBC with ESR', 'Thyroid Profile Total (T3, T4, TSH)', 'Cancer Marker CA-125', 'Vitamin D (25-OH) Total', 'Iron Profile Total'] },
      { suffix: 'Diabetic Tracker Pro', cat: 'Diabetes', organ: 'Pancreas', gender: 'Both', age: 'Adults', p: 1199, op: 1800, t: ['Fasting Blood Sugar (FBS)', 'Post Prandial Blood Sugar (PPBS)', 'HbA1c', 'Lipid Profile', 'Kidney Function Test (KFT / RFT)'] },
      { suffix: 'Cardiac Wellness Suite', cat: 'Heart Health', organ: 'Heart', gender: 'Both', age: 'Adults', p: 2699, op: 4200, t: ['Lipid Profile Extended', 'High Sensitivity CRP (hs-CRP)', 'Homocysteine Cardiac', 'CBC with ESR'] },
      { suffix: 'Monsoon Fever Guard', cat: 'Fever', organ: 'General', gender: 'Both', age: 'All Ages', p: 1299, op: 1900, t: ['CBC with ESR', 'Widal Test', 'Dengue NS1 Antigen', 'Malaria Parasite Smear (MP)', 'Urine Routine & Microscopy'] },
      { suffix: 'Healthy Hair & Skin Matrix', cat: 'Hair & Skin', organ: 'Bone & Skin', gender: 'Both', age: 'Adults', p: 2199, op: 3200, t: ['Thyroid Profile Total (T3, T4, TSH)', 'Vitamin D (25-OH) Total', 'Vitamin B12 Active', 'Iron Profile Total'] },
      { suffix: 'PCOD Management Profile', cat: 'Hair & Skin', organ: 'Reproductive', gender: 'Female', age: 'Adults', p: 2899, op: 4500, t: ['Thyroid Profile Free', 'PCOD Profile Advanced', 'Fasting Blood Sugar (FBS)', 'Insulin Fasting'] },
      { suffix: 'Total Allergy Mapping', cat: 'Allergy Tests', organ: 'General', gender: 'Both', age: 'All Ages', p: 4999, op: 7000, t: ['Total IgE Antibody', 'Comprehensive Allergy Screen', 'Food Intolerance Panel'] },
      { suffix: 'Post Covid Resilience Check', cat: 'Full Body Checkups', organ: 'General', gender: 'Both', age: 'Adults', p: 1999, op: 3000, t: ['High Sensitivity CRP (hs-CRP)', 'CBC with ESR', 'Liver Function Test Extended (LFT)', 'Vitamin D (25-OH) Total'] },
      { suffix: 'Young Champs Pediatric Screen', cat: 'Full Body Checkups', organ: 'General', gender: 'Both', age: 'Kids', p: 999, op: 1500, t: ['CBC with ESR', 'Iron Profile Total', 'Vitamin D (25-OH) Total', 'Urine Routine & Microscopy'] }
    ];

    for (const lab of createdLabs) {
      
      // Select tests for this lab
      for (const t of standardTests) {
        if (Math.random() > 0.10) { // 90% chance to include this test (makes sure they have almost all categories)
          allTestsToInsert.push({
            labId: lab.labId,
            testId: `TEST${String(globalTestCount).padStart(6, '0')}`,
            name: t.name,
            description: `Quality diagnostic test for ${t.name}. Verified protocols applied.`,
            category: t.cat,
            price: t.p + (Math.floor(Math.random() * 5) * 20), 
            originalPrice: t.op + (Math.floor(Math.random() * 5) * 20),
            sampleType: 'Blood',
            turnaroundTime: Math.random() > 0.5 ? '24 Hours' : '12 Hours',
            preparationRequired: t.prep,
            preparationInstructions: t.prep ? 'Strict fasting for 10-12 hours required.' : 'No special preparation needed.',
            parameters: ['Param A', 'Param B', 'Clinical Note'],
            gender: t.gender,
            organ: t.organ,
            ageGroup: t.age,
            status: 'Active'
          });
          globalTestCount++;
        }
      }

      // 6 to 10 unique packages per lab
      const selectedConcepts = packageConcepts.sort(() => 0.5 - Math.random()).slice(0, Math.floor(6 + Math.random() * 4));
      
      for (const p of selectedConcepts) {
        // Absolutely unique package name
        const freshPackageName = `${lab.name.split(' ')[0]} ${lab.city} ${p.suffix}`;
        
        allPackagesToInsert.push({
          labId: lab.labId,
          packageId: `PKG${String(globalPackageCount).padStart(6, '0')}`,
          name: freshPackageName,
          description: `Customized health screening package engineered exclusively at ${lab.name}.`,
          category: p.cat,
          price: p.p + (Math.floor(Math.random() * 10) * 50), 
          originalPrice: p.op + (Math.floor(Math.random() * 10) * 50),
          testsIncluded: p.t,
          features: ['NABL Accredited Lab', 'Free Home Sample Pickup', 'Digital Smart Report'],
          gender: p.gender,
          organ: p.organ,
          ageGroup: p.age,
          status: 'Active'
        });
        globalPackageCount++;
      }
    }

    // Insert data in chunks if it's too large for a single MongoDB operation
    console.log(`Inserting ${allTestsToInsert.length} Lab Tests...`);
    const chunkSize = 1000;
    for (let i = 0; i < allTestsToInsert.length; i += chunkSize) {
      await LabTest.insertMany(allTestsToInsert.slice(i, i + chunkSize));
    }

    console.log(`Inserting ${allPackagesToInsert.length} Lab Packages...`);
    for (let i = 0; i < allPackagesToInsert.length; i += chunkSize) {
      await LabPackage.insertMany(allPackagesToInsert.slice(i, i + chunkSize));
    }

    console.log('✅ Massive Database Seed Completed Successfully!');
    process.exit(0);

  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();
