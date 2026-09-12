export const INITIAL_SITE_SETTINGS = {
  siteTitle: "Uttar Pradesh Municipal Civic Issue Complaints Portal (UP-MCD)",
  siteImage: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
  headerMarquee: "🚨 Swachh Bharat & Jan Seva Mission UP: Report Civic Issues directly to your District Magistrate. Resolution time guaranteed within 20 Days! Helpline: 1800-180-0001",
};

export const COMPLAINT_TYPES = [
  "Potholes & Road Damage",
  "Garbage & Solid Waste Dump",
  "Streetlight Breakdown",
  "Water Supply Leakage & Pipeline Burst",
  "Drainage Blockage & Sewage Overflow",
  "Stray Cattle & Animal Hazard",
  "Illegal Construction & Encroachment",
  "Public Sanitation & Toilet Maintenance",
  "Damaged Traffic Signboard & Signals",
  "Park & Greenery Maintenance",
  "Noise & Environmental Pollution"
];

// Pre-seeded Districts & Representatives from UP Department of Appointment & Personnel (district_managers.pdf)
export const INITIAL_DISTRICTS = [
  { id: "dist_1", name: "Agra", division: "Agra Division", representative: "Manish Bansal", phone: "9454417509", email: "dmagr@nic.in", adminId: "agra_manish1", adminPass: "Welcome@74829" },
  { id: "dist_2", name: "Firozabad", division: "Agra Division", representative: "Santosh Kumar Sharma", phone: "9454417510", email: "dmfir@nic.in", adminId: "firozabad_santosh1", adminPass: "Welcome@38210" },
  { id: "dist_3", name: "Mainpuri", division: "Agra Division", representative: "Indramani Tripathi", phone: "9454417511", email: "dmmai@nic.in", adminId: "mainpuri_indramani1", adminPass: "Welcome@92104" },
  { id: "dist_4", name: "Mathura", division: "Agra Division", representative: "Chandra Prakash Singh", phone: "9454417512", email: "dmmat@nic.in", adminId: "mathura_chandra1", adminPass: "Welcome@61942" },
  { id: "dist_5", name: "Prayagraj", division: "Prayagraj Division", representative: "Manish Kumar Verma", phone: "9454417517", email: "dmall@nic.in", adminId: "prayagraj_manish1", adminPass: "Welcome@83912" },
  { id: "dist_6", name: "Kaushambi", division: "Prayagraj Division", representative: "Amit Pal", phone: "9454417519", email: "dmkos@nic.in", adminId: "kaushambi_amit1", adminPass: "Welcome@19482" },
  { id: "dist_7", name: "Fatehpur", division: "Prayagraj Division", representative: "Nidhi Gupta Vatsa", phone: "9454417518", email: "dmfat@nic.in", adminId: "fatehpur_nidhi1", adminPass: "Welcome@57391" },
  { id: "dist_8", name: "Pratapgarh", division: "Prayagraj Division", representative: "Abhishek Pandey", phone: "9454417520", email: "dmpra@nic.in", adminId: "pratapgarh_abhishek1", adminPass: "Welcome@48201" },
  { id: "dist_9", name: "Kanpur Nagar", division: "Kanpur Division", representative: "Jitendra Pratap Singh", phone: "9454417554", email: "dmpkap@nic.in", adminId: "kanpurnagar_jitendra1", adminPass: "Welcome@62914" },
  { id: "dist_10", name: "Kanpur Dehat", division: "Kanpur Division", representative: "Kapil Singh", phone: "9454417553", email: "dmkan@nic.in", adminId: "kanpurdehat_kapil1", adminPass: "Welcome@81943" },
  { id: "dist_11", name: "Etawah", division: "Kanpur Division", representative: "Shubhrant Kumar Shukla", phone: "9454417551", email: "dmetw@nic.in", adminId: "etawah_shubhrant1", adminPass: "Welcome@72910" },
  { id: "dist_12", name: "Ayodhya", division: "Ayodhya Division", representative: "Shashank Tripathi", phone: "9454417541", email: "dmfai@nic.in", adminId: "ayodhya_shashank1", adminPass: "Welcome@39182" },
  { id: "dist_13", name: "Gorakhpur", division: "Gorakhpur Division", representative: "Deepak Meena", phone: "9454417544", email: "dmgor@nic.in", adminId: "gorakhpur_deepak1", adminPass: "Welcome@59281" },
  { id: "dist_14", name: "Jhansi", division: "Jhansi Division", representative: "Gaurang Rathi", phone: "9454417547", email: "dmjha@nic.in", adminId: "jhansi_gaurang1", adminPass: "Welcome@18392" },
  { id: "dist_15", name: "Lucknow", division: "Lucknow Division", representative: "Visak G", phone: "9415005000", email: "dmluc@nic.in", adminId: "lucknow_visak1", adminPass: "Welcome@54321" },
  { id: "dist_16", name: "Meerut", division: "Meerut Division", representative: "Dr. Vijay Kumar Singh", phone: "9454417566", email: "dmmee@nic.in", adminId: "meerut_vijay1", adminPass: "Welcome@83921" },
  { id: "dist_17", name: "Gautam Buddha Nagar", division: "Meerut Division", representative: "Medha Roopam", phone: "9971020646", email: "dmgbn@nic.in", adminId: "gautambuddhanagar_medha1", adminPass: "Welcome@67890" },
  { id: "dist_18", name: "Ghaziabad", division: "Meerut Division", representative: "Ravindra Kumar Mandar", phone: "9454417565", email: "dmgha@nic.in", adminId: "ghaziabad_ravindra1", adminPass: "Welcome@29184" },
  { id: "dist_19", name: "Bareilly", division: "Bareilly Division", representative: "Avinash Singh", phone: "9454417524", email: "dmbar@nic.in", adminId: "bareilly_avinash1", adminPass: "Welcome@94821" },
  { id: "dist_20", name: "Moradabad", division: "Moradabad Division", representative: "Rajendra Pensiya", phone: "9454417572", email: "dmmor@nic.in", adminId: "moradabad_rajendra1", adminPass: "Welcome@72819" },
  { id: "dist_21", name: "Varanasi", division: "Varanasi Division", representative: "Satyendra Kumar", phone: "9454417579", email: "dmvar@nic.in", adminId: "varanasi_satyendra1", adminPass: "Welcome@38192" },
  { id: "dist_22", name: "Azamgarh", division: "Azamgarh Division", representative: "Ravindra Kumar II", phone: "9454417521", email: "dmaza@nic.in", adminId: "azamgarh_ravindra1", adminPass: "Welcome@48192" },
  { id: "dist_23", name: "Mirzapur", division: "Mirzapur Division", representative: "Pawan Kumar Gangwar", phone: "9454417567", email: "dmmir@nic.in", adminId: "mirzapur_pawan1", adminPass: "Welcome@29481" },
  { id: "dist_24", name: "Basti", division: "Basti Division", representative: "Krittika Jyotsna", phone: "9454417528", email: "dmbas@nic.in", adminId: "basti_krittika1", adminPass: "Welcome@92814" },
  { id: "dist_25", name: "Aligarh", division: "Aligarh Division", representative: "Avinash Kumar", phone: "9454417513", email: "dmali@nic.in", adminId: "aligarh_avinash1", adminPass: "Welcome@19284" }
];

// Pre-seeded Workers assigned to specific districts & admins
export const INITIAL_WORKERS = [
  { id: "wrk_1", name: "Ramesh Sharma", phone: "9876543210", district: "Lucknow", workerId: "ramesh3210", pass: "9876543210", email: "ramesh3210@up-mcd.gov.in" },
  { id: "wrk_2", name: "Suresh Verma", phone: "9812345678", district: "Lucknow", workerId: "suresh5678", pass: "9812345678", email: "suresh5678@up-mcd.gov.in" },
  { id: "wrk_3", name: "Vikram Kumar", phone: "9899112233", district: "Kanpur Nagar", workerId: "vikram2233", pass: "9899112233", email: "vikram2233@up-mcd.gov.in" },
  { id: "wrk_4", name: "Amit Yadav", phone: "9766554433", district: "Ayodhya", workerId: "amit4433", pass: "9766554433", email: "amit4433@up-mcd.gov.in" },
  { id: "wrk_5", name: "Dinesh Patel", phone: "9655443322", district: "Varanasi", workerId: "dinesh3322", pass: "9655443322", email: "dinesh3322@up-mcd.gov.in" },
  { id: "wrk_6", name: "Rajesh Singh", phone: "9544332211", district: "Gautam Buddha Nagar", workerId: "rajesh2211", pass: "9544332211", email: "rajesh2211@up-mcd.gov.in" },
  { id: "wrk_7", name: "Mahesh Chandra", phone: "9433221100", district: "Agra", workerId: "mahesh1100", pass: "9433221100", email: "mahesh1100@up-mcd.gov.in" },
  { id: "wrk_8", name: "Pankaj Tiwari", phone: "9322110099", district: "Prayagraj", workerId: "pankaj0099", pass: "9322110099", email: "pankaj0099@up-mcd.gov.in" },
  { id: "wrk_9", name: "Sunil Saini", phone: "9211009988", district: "Gorakhpur", workerId: "sunil9988", pass: "9211009988", email: "sunil9988@up-mcd.gov.in" }
];

// Pre-seeded Sample Complaints for Demonstration
export const INITIAL_COMPLAINTS = [
  {
    id: "CMP-UP-2026-001",
    clientName: "Rahul Srivastava",
    clientEmail: "rahul.client@gmail.com",
    clientPhone: "9876123450",
    district: "Lucknow",
    complaintType: "Potholes & Road Damage",
    description: "Deep dangerous pothole near Hazratganj main crossing causing severe traffic jams and risk of accidents.",
    address: "Hazratganj Main Chauraha, Near MG Marg, Lucknow, UP",
    lat: 26.8467,
    lng: 80.9462,
    photos: [
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80"
    ],
    status: "Worker Finalised", // Pending Admin, Admin Assigned, In Progress, Worker Finalised, Resolved, Resolve Declined
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    expectedTimeDays: 7,
    expectedDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    workerId: "wrk_1",
    workerName: "Ramesh Sharma",
    workerPhone: "9876543210",
    adminReply: "Urgent repair order dispatched. Expected completion within 7 days.",
    workerRemark: "Pothole filled with cold asphalt mix, leveled and compacted thoroughly.",
    workerPhotos: [
      "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=600&q=80"
    ],
    workerFinalisedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago (starts 5-day auto resolve timer)
    rejectionReason: "",
    rejectionPhoto: "",
    resolvedAt: null
  },
  {
    id: "CMP-UP-2026-002",
    clientName: "Priya Sharma",
    clientEmail: "priya.sharma@gmail.com",
    clientPhone: "9812998877",
    district: "Lucknow",
    complaintType: "Garbage & Solid Waste Dump",
    description: "Huge uncollected garbage heap behind Gomti Nagar Market creating foul odor and health hazard.",
    address: "Patrakarpuram Market, Gomti Nagar, Lucknow, UP",
    lat: 26.8500,
    lng: 81.0000,
    photos: [
      "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=600&q=80"
    ],
    status: "In Progress",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expectedTimeDays: 5,
    expectedDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    workerId: "wrk_2",
    workerName: "Suresh Verma",
    workerPhone: "9812345678",
    adminReply: "Sanitation team assigned for immediate waste removal.",
    workerRemark: "",
    workerPhotos: [],
    workerFinalisedAt: null,
    rejectionReason: "",
    rejectionPhoto: "",
    resolvedAt: null
  },
  {
    id: "CMP-UP-2026-003",
    clientName: "Alok Gupta",
    clientEmail: "alok.g@gmail.com",
    clientPhone: "9711223344",
    district: "Kanpur Nagar",
    complaintType: "Streetlight Breakdown",
    description: "Entire street lights non-functional from Civil Lines to Railway Station road.",
    address: "Civil Lines, Near Mall Road, Kanpur, UP",
    lat: 26.4499,
    lng: 80.3319,
    photos: [
      "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80"
    ],
    status: "Pending Admin",
    createdAt: new Date().toISOString(),
    expectedTimeDays: null,
    expectedDate: null,
    workerId: "",
    workerName: "",
    workerPhone: "",
    adminReply: "",
    workerRemark: "",
    workerPhotos: [],
    workerFinalisedAt: null,
    rejectionReason: "",
    rejectionPhoto: "",
    resolvedAt: null
  }
];

// Pre-seeded Chats between clients, admins, and workers
export const INITIAL_CHATS = [
  {
    complaintId: "CMP-UP-2026-001",
    messages: [
      { id: "m1", senderRole: "client", senderName: "Rahul Srivastava", text: "Please expedite this repair, traffic is standstill.", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "m2", senderRole: "admin", senderName: "Visak G (DM Lucknow)", text: "Worker Ramesh Sharma has been assigned with high priority.", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000).toISOString() },
      { id: "m3", senderRole: "worker", senderName: "Ramesh Sharma", text: "Work in progress. Materials delivered at spot.", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  }
];
