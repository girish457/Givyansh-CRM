import { useState, useEffect, useRef } from "react";
import { 
  LucideBriefcase, 
  LucidePlus, 
  LucideTrash2, 
  LucideEdit,
  LucideSearch,
  LucideMapPin,
  LucideLoader2,
  LucideChevronLeft,
  LucideBuilding2,
  LucideUser,
  LucideTarget,
  LucideBanknote,
  LucideHash,
  LucideGraduationCap,
  LucideUsers,
  LucideTimer,
  LucideCheckCircle2,
  LucideTimer as LucideClockIcon,
  LucideFilter,
  LucideFileText,
  LucideX,
  LucideRotateCcw,
  LucideChevronDown,
  LucideTrendingUp,
  LucideRocket,
  LucidePhoneOff,
  LucideCalendar,
  LucideAward,
  LucideCopy,
  LucideShare2,
  LucideHistory,
  LucideSparkles,
  LucideExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Job {
  id: number;
  title: string;
  category?: string;
  openings?: number;
  jobType?: string;
  workLocationType?: string;
  city?: string;
  locality?: string;
  gender?: string;
  qualification?: string;
  minExp?: string;
  maxExp?: string;
  salaryType?: string;
  salaryMin?: string;
  salaryMax?: string;
  incentives?: string;
  salaryRange?: string;
  benefits?: string;
  skills?: string;
  assets?: string;
  documents?: string;
  startTime?: string;
  endTime?: string;
  workingDays?: string;
  description?: string;
  isContract?: boolean;
  freshersOnly?: boolean;
  shift?: string;
  status: string;
  isHold?: boolean;
  client?: { id?: number; name: string };
  clientId?: number;
  clientIds?: number[];
  interviewRounds?: number;
  round1Name?: string;
  round2Name?: string;
  round3Name?: string;
  round4Name?: string;
  round5Name?: string;
}

interface Client {
  id: number;
  name: string;
}

const expOptions = ["Select", "0 month", "6 months", "1 year", "2 years", "3 years", "4 years", "5 years", "6 years", "6+ years"];
const jobTypes = ["Full time", "Part time", "Internship", "Freelancing"];
const locationTypes = ["Work from home", "Field Job", "Work from office"];
const genders = ["Any", "Male", "Female"];
const quals = ["Any", "10th pass", "12th pass", "Diploma", "Graduate", "Post Graduate"];

const JOB_DESIGNATIONS = [
  "2D Animation",
  "3D Animation",
  "3D Design",
  "AC Technician",
  "AI & Emerging Tech",
  "AI / Machine Learning",
  "AI Researcher",
  "AI Trainer",
  "AR/VR Development",
  "Academic Counselor",
  "Accounting",
  "Accounts Payable",
  "Accounts Receivable",
  "Acting",
  "Actuarial Science",
  "Administration",
  "Advertising",
  "Advocate / Lawyer",
  "Aerospace Engineering",
  "Affiliate Marketing",
  "Agile Management",
  "AgriTech",
  "Agriculture Officer",
  "Agronomy",
  "Air Force",
  "Air Ticketing",
  "Air Traffic Controller",
  "Aircraft Maintenance",
  "Airport Operations",
  "Amazon Flipkart Specialist",
  "Analytics",
  "Animal Husbandry",
  "Animation",
  "Animation & Gaming",
  "Anthropology",
  "Apiculture (Beekeeping)",
  "Apparel Industry",
  "Apparel Merchandising",
  "Appliance Repair",
  "Apprenticeship",
  "Aquaculture",
  "Arbitration",
  "Archaeology",
  "Architect",
  "Architecture",
  "Architecture & Planning",
  "Archivist",
  "Army",
  "Art Gallery Management",
  "Artisan Work",
  "Artist Management",
  "Assembly",
  "Assembly Line",
  "Asset Management",
  "Associate Product Manager",
  "Astrology",
  "Astronomy",
  "Athlete",
  "Atomic Research",
  "Auction House Operations",
  "Auction Services",
  "Audiology",
  "Auditing",
  "Auditing & Compliance",
  "Automation Testing",
  "Automobile Engineering",
  "Automobile Sales",
  "Aviation Support",
  "B2B Sales",
  "B2C Sales",
  "BPO Executive",
  "Babysitter",
  "Back Office Executive",
  "Backend Development",
  "Bakery",
  "Bakery & Confectionery",
  "Banking",
  "Banking Exams",
  "Banking Operations",
  "Bartender",
  "Battery Technology",
  "Beautician",
  "Beauty & Personal Care",
  "Behavioral Science",
  "Beverage Industry",
  "Beverage Production",
  "Bioinformatics",
  "Biotechnologist",
  "Blockchain",
  "Blockchain Consulting",
  "Blockchain Development",
  "Blogging",
  "Blue Collar / Ground Staff Categories (bahut important)",
  "Board Advisory",
  "Bookkeeping",
  "Botany",
  "Bouncer",
  "Brand Management",
  "Brand Marketing",
  "Brewing",
  "Broadcasting",
  "Broker",
  "Building Automation",
  "Business & Management",
  "Business Analyst",
  "Business Analytics",
  "Business Development",
  "Business Excellence",
  "Business Intelligence",
  "Business Operations",
  "Butler",
  "CCTV Operator",
  "CCTV Technician",
  "CEO Office",
  "CNC Operator",
  "CRM Administration",
  "CRM Real Estate",
  "CSR",
  "CXO Office",
  "Cab Driver",
  "Cabin Crew",
  "Call Center",
  "Call Center Executive",
  "Cane & Sugar Industry",
  "Captive Operations",
  "Car Wash Services",
  "Career Counseling",
  "Caregiver",
  "Caretaker",
  "Cargo Handling",
  "Carpenter",
  "Cashier",
  "Casino Operations",
  "Catalog Management",
  "Category Management",
  "Celebrity Management",
  "Cell Biology",
  "Cement Industry",
  "Census Operations",
  "Ceramics Industry",
  "Change Management",
  "Channel Management",
  "Channel Sales",
  "Charging Infrastructure",
  "Chartered Accountant (CA)",
  "Chat Support",
  "Chat Support Executive",
  "Chef",
  "Chemical Engineering",
  "Chemical Industry",
  "Chemist",
  "Child Development",
  "Chip Design",
  "Cinematography",
  "Civil Engineering",
  "Civil Law",
  "Civil Services",
  "Claims Management",
  "Cleaner",
  "Cleaning Services",
  "Clerical & Office Support",
  "Client Relations",
  "Clinical Data Management",
  "Clinical Research",
  "Cloud Computing",
  "Club Management",
  "Co-Founder",
  "Coach",
  "Coaching Institute",
  "Collection Agent",
  "Collection Executive",
  "Community Development",
  "Community Management",
  "Community Worker",
  "Compensation & Benefits",
  "Competitive Intelligence",
  "Compliance",
  "Computer Operator",
  "Computer Vision Engineer",
  "Concierge Services",
  "Construction Manager",
  "Consultant",
  "Consulting",
  "Content Creator",
  "Content Marketing",
  "Content Writing",
  "Contract Jobs",
  "Contract Management",
  "Cook",
  "Copywriting",
  "Corporate Banking",
  "Corporate Communication",
  "Corporate Communications",
  "Corporate Law",
  "Corporate Sales",
  "Corporate Social Responsibility (CSR)",
  "Corporate Trainer",
  "Counseling",
  "Courier Executive",
  "Creator Economy",
  "Creator Economy Manager",
  "Creator Management",
  "Criminal Law",
  "Crypto Analyst",
  "Crypto Research",
  "Cryptocurrency & Web3",
  "Curriculum Developer",
  "Customer Care Executive",
  "Customer Experience (CX)",
  "Customer Service",
  "Customer Success",
  "Customer Success Associate",
  "Customer Support",
  "Customer Support Executive",
  "Customs Clearance",
  "Cyber Security",
  "Cyber Security Analyst",
  "DTP Operator",
  "Daily Wage Worker",
  "Dairy & Livestock",
  "Dairy Farming",
  "Dairy Management",
  "Dairy Technology",
  "Dance",
  "Data Analytics",
  "Data Engineer",
  "Data Entry Operator",
  "Data Science",
  "Data Scientist",
  "Database Administration",
  "Dealer Network Management",
  "Defence",
  "Defence Exams",
  "Defence Manufacturing",
  "Defence Production",
  "Defence Services",
  "Delivery & Transportation",
  "Delivery Boy",
  "Delivery Executive",
  "Delivery Partner",
  "Dentist",
  "Dentistry",
  "DevOps",
  "Diamond Grading",
  "Dietitian",
  "Digital Creator Economy",
  "Digital Marketing",
  "Digital Transformation",
  "Diplomacy",
  "Direct Sales",
  "Direction",
  "Disability Support Services",
  "Disaster Management",
  "Disaster Recovery",
  "Dispatch Executive",
  "Distribution Management",
  "Doctor",
  "Documentation Executive",
  "Domestic BPO",
  "Domestic BPO Executive",
  "Domestic Services",
  "Driver",
  "Drone Operations",
  "Drone Pilot",
  "Drug Research",
  "E-commerce Executive",
  "E-learning",
  "EHS",
  "ERP / CRM Development",
  "ERP Implementation",
  "ESG",
  "EV Infrastructure",
  "EV Technician",
  "Ecommerce Marketing",
  "Econometrics",
  "Economics",
  "EdTech",
  "Editing",
  "Education Coordinator",
  "Education Counselor",
  "Elder Care Services",
  "Election Management",
  "Electric Vehicles (EV)",
  "Electrical Engineering",
  "Electrician",
  "Electronics Engineering",
  "Email Marketing",
  "Email Support",
  "Email Support Executive",
  "Embassy Operations",
  "Embedded & Hardware",
  "Embedded Systems",
  "Emergency Response",
  "Employee Engagement",
  "Enterprise Sales",
  "Entertainment Park Operations",
  "Entrepreneur",
  "Entrepreneurship",
  "Environmental Engineering",
  "Environmental Science",
  "Equity Research",
  "Ethical Hacking",
  "Event Coordinator",
  "Event Host",
  "Event Management",
  "Event Manager",
  "Event Marketing",
  "Event Production",
  "Executive Assistant",
  "Export",
  "Export Import",
  "FMCG",
  "FMCG Operations",
  "FMCG Sales",
  "Facility Management",
  "Facility Services",
  "Factory Management",
  "Factory Worker",
  "Family Office Management",
  "Farming",
  "Fashion Design",
  "Fashion Designer",
  "Fertilizer Industry",
  "Fiber Technician",
  "Field Executive",
  "Field Jobs",
  "Field Sales",
  "Field Sales Executive",
  "Film Production",
  "Financial Analysis",
  "Financial Analytics",
  "Financial Consulting",
  "Fire & Safety",
  "Fire Safety",
  "Fire Safety Officer",
  "Firmware Development",
  "Fisheries",
  "Fisheries & Aquaculture",
  "Fitness & Wellness",
  "Fitter",
  "Fleet Executive",
  "Fleet Management",
  "Floriculture",
  "Food Industry",
  "Food Processing",
  "Food Technology",
  "Footwear Production",
  "Foreign Services",
  "Forensics",
  "Forestry",
  "Founder Office",
  "Franchise Development",
  "Franchise Management",
  "Freelancer",
  "Front Desk Executive",
  "Front Office",
  "Front Office Executive",
  "Frontend Development",
  "Fuel Station Operations",
  "Full Stack Development",
  "Full Time Jobs",
  "Furniture Manufacturing",
  "GIS & Mapping",
  "GIS Specialist",
  "GRC Analyst",
  "GST",
  "GST Specialist",
  "Game Art",
  "Game Design",
  "Game Development",
  "Gardener",
  "Garment Manufacturing",
  "Garment Production",
  "Gemology",
  "Gems & Jewellery",
  "General Management",
  "Generative AI",
  "Genetics",
  "Genomics",
  "Geologist",
  "Geology",
  "Geophysics",
  "Geospatial Analytics",
  "Gig Economy",
  "Glass Industry",
  "Global Capability Center (GCC)",
  "Gold Appraiser",
  "Governance",
  "Government Clerk",
  "Government Exams & Public Service",
  "Granthi",
  "Graphic Design",
  "Ground Staff",
  "Growth Hacker",
  "Growth Marketing",
  "Growth Product Manager",
  "Guest Relations",
  "Guest Relations Executive",
  "Gunman",
  "Gym Instructor",
  "Gym Trainer",
  "HR Analytics",
  "HR Consulting",
  "HR Generalist",
  "HR Operations",
  "HR Recruiter",
  "HRBP",
  "HSE (Health Safety Environment)",
  "Hair Stylist",
  "Handicrafts",
  "Handicrafts & Artisans",
  "Handloom",
  "Hardware Design",
  "Healthcare Administration",
  "Hedge Funds",
  "Helper",
  "Home Automation",
  "Home Maintenance",
  "Home Tutor",
  "Horticulture",
  "Hospital Administration",
  "Hotel Management",
  "Household & Personal Services",
  "Household Services",
  "Housekeeper",
  "Housekeeping",
  "Housekeeping Services",
  "Housekeeping Staff",
  "Hydrology",
  "IT Consulting",
  "IT Helpdesk",
  "IT Recruiter",
  "IT Support",
  "Imam",
  "Immigration Services",
  "Import",
  "Import / Export",
  "Inbound Calling Executive",
  "Incubation Manager",
  "Independent Consultant",
  "Industrial Engineering",
  "Industrial Relations",
  "Industrial Research",
  "Influencer",
  "Influencer Marketing",
  "Innovation",
  "Innovation Management",
  "Inside Sales",
  "Instructional Design",
  "Instrumentalist",
  "Insurance",
  "Insurance Advisor",
  "Insurance Sales",
  "Intellectual Property",
  "Interior Decoration",
  "Interior Design",
  "Interior Designer",
  "Internal Audit",
  "International BPO",
  "International BPO Executive",
  "International Relations",
  "International Trade",
  "Internet of Things (IoT)",
  "Internship",
  "Interpretation",
  "Inventory",
  "Inventory Management",
  "Investigation",
  "Investment Banking",
  "Investor Relations",
  "IoT Development",
  "Irrigation Management",
  "Janitor",
  "Jewellery Design",
  "Jewellery Designer",
  "Jewellery Industry",
  "Journalism",
  "KPO",
  "KPO & Knowledge Services",
  "Knowledge Management",
  "Knowledge Process Outsourcing",
  "LLM Engineer",
  "Lab Technician",
  "Laboratory Research",
  "Labour",
  "Land Records",
  "Landscape Design",
  "Laptop Repair",
  "Laundry Services",
  "Lead Generation Executive",
  "Lean Management",
  "Lean Manufacturing",
  "Learning & Development",
  "Leasing",
  "Leather Industry",
  "Leather Manufacturing",
  "Lecturer",
  "Legal Advisor",
  "Legal Consulting",
  "Legal Enforcement",
  "Legal Operations",
  "Legal Research",
  "Librarian",
  "Library & Documentation",
  "Lift Technician",
  "Linguistics & Language",
  "Litigation",
  "Loader",
  "Loan Processing",
  "Localization",
  "Locomotive Services",
  "Logistics",
  "Logistics Coordinator",
  "Luxury Retail",
  "Luxury Services",
  "MIS Executive",
  "Machine Operator",
  "Maid",
  "Makeup Artist",
  "Management Consulting",
  "Marine Biology",
  "Marine Engineering",
  "Marine Technician",
  "Market Research",
  "Marketing Analytics",
  "Marketplace Operations",
  "Mason",
  "Material Science",
  "Matrimonial Services",
  "Mechanic",
  "Mechanical Engineering",
  "Mechatronics",
  "Media Planning",
  "Medical Billing",
  "Medical Coding",
  "Medical Representative",
  "Medical Research",
  "Medical Transcription",
  "Merchandiser",
  "Merchandising",
  "Merchant Navy",
  "Metallurgy",
  "Meteorology",
  "Microbiologist",
  "Microbiology",
  "Military Engineering",
  "Mining Engineer",
  "Mining Engineering",
  "Mobile App Development",
  "Mobile Repair",
  "Modular Kitchen Design",
  "Molecular Biology",
  "Motion Graphics",
  "Museum Management",
  "Music",
  "Music & Performing Arts",
  "Music Production",
  "NFT Specialist",
  "NLP Engineer",
  "Nail Artist",
  "Nanny",
  "Nanotechnology",
  "Navy",
  "Network Administration",
  "Network Engineer",
  "Network Engineering",
  "Network Technician",
  "News Reporting",
  "Non Voice Process",
  "Non-IT Recruiter",
  "Non-Voice Process Executive",
  "Nuclear Energy",
  "Nurse",
  "Nursing",
  "Nutrition Coach",
  "Nutritionist",
  "Occupational Therapy",
  "Oceanography",
  "Office Administration",
  "Office Assistant",
  "Office Boy",
  "Office Coordinator",
  "Ola Driver",
  "Online Consultant",
  "Online Instructor",
  "Operations Management",
  "Organic Farming",
  "Outbound Calling Executive",
  "Overseas Education",
  "PCB Design",
  "PMO",
  "PR / Public Relations",
  "PSU Jobs",
  "Packaging",
  "Packaging Design",
  "Packaging Development",
  "Packer",
  "Paint Industry",
  "Painter",
  "Pandit",
  "Pantry Boy",
  "Paper Industry",
  "Parking Management",
  "Part Time Jobs",
  "Payroll",
  "Penetration Tester",
  "Peon",
  "Performance Management",
  "Performance Marketing",
  "Personal Assistant",
  "Personal Driver",
  "Personal Styling",
  "Personal Stylist",
  "Pest Control",
  "Petrochemical Industry",
  "Petroleum Engineering",
  "Pharmacist",
  "Pharmacovigilance",
  "Photo Editing",
  "Photography",
  "Photography & Videography",
  "Physical Trainer",
  "Physicist",
  "Physiotherapist",
  "Physiotherapy",
  "Picker",
  "Pilot",
  "Plant Management",
  "Plant Operations",
  "Plastic Industry",
  "Plumber",
  "Podcaster",
  "Police",
  "Police Services",
  "Political Research",
  "Port Management",
  "Port Operations",
  "Ports & Logistics",
  "Pottery",
  "Poultry Farming",
  "Power Plant",
  "Pre-Press",
  "Precision Agriculture",
  "Premium Customer Experience",
  "Pricing Strategy",
  "Priest",
  "Printing & Media Production",
  "Printing & Publishing",
  "Printing Operator",
  "Printing Technology",
  "Private Equity",
  "Process Management",
  "Procurement",
  "Procurement & Sourcing",
  "Procurement / Purchasing",
  "Product Analytics",
  "Product Design",
  "Product Management",
  "Product Manager",
  "Product Marketing",
  "Product Owner",
  "Production",
  "Production Engineering",
  "Production Supervisor",
  "Professor",
  "Program Management",
  "Program Manager",
  "Project Coordination",
  "Project Engineer",
  "Project Management",
  "Prompt Engineer",
  "Prompt Engineering",
  "Property Consultant",
  "Proteomics",
  "Psychologist",
  "Psychology",
  "Public Administration",
  "Public Relations",
  "Public Relations (PR)",
  "Publishing",
  "Publishing Executive",
  "Pujari",
  "Pulp Industry",
  "Purchase",
  "Purchase Management",
  "QA / Testing",
  "QA Testing",
  "Quality",
  "Quality Assurance",
  "Quality Control",
  "Quantity Surveyor",
  "Quantum Computing",
  "RF Engineer",
  "Radio",
  "Radio Jockey",
  "Radiologist",
  "Radiology",
  "Railway Industry",
  "Railway Jobs",
  "Railway Operations",
  "Railways",
  "Rapido Captain",
  "Real Estate Agent",
  "Real Estate Sales",
  "Reception & Front Desk",
  "Receptionist",
  "Records Management",
  "Recovery Executive",
  "Recruitment",
  "Recruitment Industry",
  "Recycling",
  "Refrigerator Technician",
  "Regulatory Affairs",
  "Rehabilitation Services",
  "Religion & Spiritual Services",
  "Religious & Community Services",
  "Religious & Cultural",
  "Religious Teacher",
  "Remote Designer",
  "Remote Developer",
  "Remote Jobs",
  "Remote Recruiter",
  "Remote Sensing",
  "Renewable Energy",
  "Repair & Maintenance",
  "Research Analyst",
  "Research Scientist",
  "Restaurant Management",
  "Retail Banking",
  "Retail Operations",
  "Retail Sales",
  "Revenue Cycle Management",
  "Revenue Management",
  "Revenue Services",
  "Risk & Compliance",
  "Risk Management",
  "Robotics Engineering",
  "Robotics Process Automation (RPA)",
  "Rubber Industry",
  "SEM / PPC",
  "SEO",
  "SOC Analyst",
  "SSC",
  "SaaS Sales",
  "Sales Management",
  "Satellite Engineering",
  "School Administration",
  "Scientific Research",
  "Script Writing",
  "Scrum Master",
  "Seafarer",
  "Security Engineer",
  "Security Guard",
  "Security Officer",
  "Security Services",
  "Security Supervisor",
  "Seed Technology",
  "Seismology",
  "Self Employed",
  "Seller Management",
  "Semiconductor Industry",
  "Senior Leadership",
  "Sericulture",
  "Service Delivery",
  "Shared Services",
  "Ship Captain",
  "Ship Management",
  "Shipping Operations",
  "Singing",
  "Site Engineer",
  "Six Sigma",
  "Skilled Trades",
  "Skin Specialist",
  "Smart Cities & Infrastructure",
  "Smart Home Technology",
  "Smart Infrastructure",
  "Social Media Marketing",
  "Social Worker",
  "Software Development",
  "Solar Energy",
  "Solar Installation",
  "Solid Waste Management",
  "Spa Therapist",
  "Space & Astronomy",
  "Space Research",
  "Special Education",
  "Speech Therapy",
  "Spiritual Counselor",
  "Sports Management",
  "Staffing Specialist",
  "Startup Ecosystem",
  "Startup Founder",
  "Startup Operations",
  "Statistics",
  "Statutory Audit",
  "Stem Cell Research",
  "Store Executive",
  "Store Manager",
  "Store Operations",
  "Strategic Sourcing",
  "Strategy & Consulting",
  "Strategy & Planning",
  "Strategy Office",
  "Streamer",
  "Student Counseling",
  "Study Abroad Consulting",
  "Supply Chain Management",
  "Surgeon",
  "Surgery",
  "Surveillance Operator",
  "Survey Drone Services",
  "Survey Executive",
  "Surveying",
  "Sustainability",
  "Sustainability & ESG",
  "Sustainability Consultant",
  "System Administration",
  "TDS",
  "TV Anchor",
  "Tailor",
  "Talent Acquisition",
  "Talent Management",
  "Talent Sourcer",
  "Tattoo Artist",
  "Taxation",
  "Teacher",
  "Teaching",
  "Teaching Exams",
  "Technical Product Manager",
  "Technical Support",
  "Technical Writing",
  "Technician",
  "Telecaller",
  "Telecalling & Call Center",
  "Telecalling Executive",
  "Telecom Engineer",
  "Telecom Operations",
  "Telemarketing Executive",
  "Telesales",
  "Telesales Executive",
  "Television",
  "Temporary Jobs",
  "Test Preparation",
  "Textile Design",
  "Textile Designer",
  "Textile Industry",
  "Theatre",
  "Theme Park Operations",
  "Therapist",
  "Ticketing",
  "Toll Operations",
  "Tour Operator",
  "Tourism Management",
  "Toy Manufacturing",
  "Track Maintenance",
  "Trade Marketing",
  "Trainer",
  "Training & Development",
  "Transcription",
  "Translation",
  "Transportation",
  "Transportation Management",
  "Travel Consultant",
  "Treasury",
  "Truck Driver",
  "Tutor",
  "UAV Operations",
  "UI Design",
  "UI/UX Design",
  "UPSC",
  "UX Design",
  "Uber Driver",
  "Underwriting",
  "Unloader",
  "Unorganized Sector",
  "Urban Mobility",
  "Urban Planning",
  "User Experience (UX)",
  "VFX",
  "VLSI",
  "Vastu Consultant",
  "Vendor Development",
  "Vendor Management",
  "Venture Capital",
  "Venture Capital Analyst",
  "Verification Executive",
  "Veterinary",
  "Veterinary Science",
  "Veterinary Services",
  "Video Editing",
  "Videography",
  "Virtual Assistant",
  "Visa Consultancy",
  "Visa Processing",
  "Voice Over Artist",
  "Voice Process",
  "Voice Process Executive",
  "Volunteer Jobs",
  "Warehouse",
  "Warehouse & Logistics",
  "Warehouse Associate",
  "Warehouse Management",
  "Waste Management",
  "Wastewater Management",
  "Water Management",
  "Water Treatment",
  "Wealth Management",
  "Web Development",
  "Web3 Development",
  "Wedding Planner",
  "Welder",
  "Wildlife Conservation",
  "Wind Energy",
  "Wind Turbine Operations",
  "Wood Industry",
  "Work From Home",
  "Yarn Manufacturing",
  "Yoga Instructor",
  "YouTuber",
  "Zoology",
  "Zumba Trainer",
  "eSports"
];

export default function Jobs({ role }: { role: string }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"list" | "add" | "view" | "jdGen" | "edit">("list");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState({
    title: "",
    jobType: "",
    location: "",
    experience: "",
    salary: "",
    workSetup: "",
    qualification: "",
    workingDays: "",
    shift: "",
    gender: ""
  });
  const [candidates, setCandidates] = useState<any[]>([]);
  const [analyticsFilter, setAnalyticsFilter] = useState<string>(role === "recruiter" ? "month" : "monthly");
  const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" });
  const [selectedAnalyticsStatus, setSelectedAnalyticsStatus] = useState("Connected");
  const [jobStatusTab, setJobStatusTab] = useState<"opened" | "closed">("opened");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [tlViewFilter, setTlViewFilter] = useState<string>(
    role === "boss" || role === "manager" ? "all" : "team"
  );

  const isDomainMatch = (domain: string, title: string) => {
    if (!domain || !title) return false;
    const d = domain.toLowerCase().trim();
    const t = title.toLowerCase().trim();
    if (d === t) return true;
    if (d.includes(t) || t.includes(d)) return true;
    
    const dNorm = d.replace("development", "developer").replace("calling", "caller").replace("ing", "").trim();
    const tNorm = t.replace("development", "developer").replace("calling", "caller").replace("ing", "").trim();
    if (dNorm.includes(tNorm) || tNorm.includes(dNorm)) return true;
    return false;
  };

  const getMatchedLeadsForJob = (jobTitle: string) => {
    if (!currentUser) return [];
    const myId = String(currentUser.id || currentUser.userId || "").trim();
    const myName = currentUser.name?.toLowerCase().trim();

    const leadData = (() => {
      try {
        return JSON.parse(localStorage.getItem("givyansh_lead_data_v1") || "{}");
      } catch {
        return {};
      }
    })();

    const forwardedBatches = (() => {
      try {
        return JSON.parse(localStorage.getItem("givyansh_forwarded_leads_v1") || "[]");
      } catch {
        return [];
      }
    })();

    // 1. Filter candidates to only those that exist in leadData AND match the domain/title
    const matchedLeads = candidates.filter(c => {
      if (!leadData[c.id || c._id]) return false;
      const info = leadData[c.id || c._id];
      const categories: string[] = info?.categories || [];
      return categories.some(cat => isDomainMatch(cat, jobTitle));
    }).map(c => ({
      ...c,
      leadInfo: leadData[c.id || c._id]
    }));

    // 2. Classify based on role
    if (role === "tl") {
      // TL "All Leads" = TL personal + all team members' leads
      const allowedIds = new Set<string>();
      allowedIds.add(myId);
      teamMembers.forEach(m => allowedIds.add(String(m.id || "").trim()));
      
      const teamNames = teamMembers.map(m => m.name?.toLowerCase().trim());

      return matchedLeads.filter(c => {
        const isOwner = allowedIds.has(String(c.addedBy || "").trim()) || 
                        allowedIds.has(String(c.assignedTo || "").trim()) ||
                        (c.recruiterName && (c.recruiterName.toLowerCase().trim() === myName || teamNames.includes(c.recruiterName.toLowerCase().trim())));
        return isOwner;
      });
    } else {
      // Recruiter "All Leads" = Personal + Forwarded Leads
      const forwardedLeadIds = new Set<string>();
      forwardedBatches.forEach((batch: any) => {
        const isRecipient = batch.toIds?.some((id: any) => String(id).trim() === myId);
        if (isRecipient && Array.isArray(batch.candidateIds)) {
          batch.candidateIds.forEach((id: string) => forwardedLeadIds.add(id));
        }
      });

      return matchedLeads.filter(c => {
        const isAddedBy = String(c.addedBy || "").trim() === myId;
        const isAssignedTo = String(c.assignedTo || "").trim() === myId;
        const isNameMatch = c.recruiterName && c.recruiterName.toLowerCase().trim() === myName;
        const isPersonal = isAddedBy || isAssignedTo || isNameMatch;
        const isForwarded = forwardedLeadIds.has(c.id || c._id);
        return isPersonal || isForwarded;
      });
    }
  };

  const handleOpenMatchedLeads = (jobTitle: string) => {
    const event = new CustomEvent("OPEN_MATCHED_LEADS", {
      detail: { 
        jobTitle, 
        role, 
        currentUser, 
        teamMembers, 
        candidates 
      }
    });
    window.dispatchEvent(event);
  };
  
  const SearchableFilterSelect = ({ label, options, value, onChange, placeholder }: { label: string, options: string[], value: string, onChange: (v: string) => void, placeholder?: string }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handler = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false); };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, []);

    const filtered = options.filter((o: string) => o.toLowerCase().includes(search.toLowerCase()));

    return (
      <div ref={dropdownRef} className="filter-group" style={{ position: "relative" }}>
        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: "6px" }}>{label}</label>
        <div
          onClick={() => { setOpen(!open); setSearch(""); }}
          style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between", 
            padding: "10px 12px", 
            border: "1.5px solid #e2e8f0", 
            borderRadius: "10px", 
            cursor: "pointer", 
            background: "#f8fafc", 
            fontSize: "0.85rem", 
            color: value ? "#0f172a" : "#94a3b8", 
            userSelect: "none", 
            minHeight: "40px" 
          }}
        >
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value || placeholder || "Select"}</span>
          <LucideChevronDown size={14} style={{ transform: open ? "rotate(180deg)" : "none", transition: "0.2s", flexShrink: 0 }} />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", zIndex: 100, overflow: "hidden" }}
            >
              <div style={{ padding: "8px", borderBottom: "1px solid #f1f5f9" }}>
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search..."
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.8rem", outline: "none", boxSizing: "border-box" }}
                  onClick={e => e.stopPropagation()}
                />
              </div>
              <div style={{ maxHeight: "160px", overflowY: "auto" }}>
                <div
                  onClick={() => { onChange(""); setOpen(false); }}
                  style={{ padding: "8px 12px", cursor: "pointer", fontSize: "0.8rem", color: "#64748b", borderBottom: "1px solid #f8fafc" }}
                >
                  All {label}s
                </div>
                {filtered.length === 0 ? (
                  <div style={{ padding: "12px", color: "#94a3b8", textAlign: "center", fontSize: "0.8rem" }}>No matching options</div>
                ) : filtered.map((opt, i) => (
                  <div
                    key={i}
                    onClick={() => { onChange(opt); setOpen(false); setSearch(""); }}
                    style={{ padding: "8px 12px", cursor: "pointer", fontSize: "0.8rem", color: opt === value ? "#2563eb" : "#0f172a", background: opt === value ? "#eff6ff" : "transparent", fontWeight: opt === value ? 600 : 400 }}
                    onMouseEnter={e => { if (opt !== value) (e.target as HTMLElement).style.background = "#f8fafc"; }}
                    onMouseLeave={e => { if (opt !== value) (e.target as HTMLElement).style.background = "transparent"; }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const [isCustomActive, setIsCustomActive] = useState(false);
  const SearchableSelect = ({ options, value, onChange, placeholder }: { options: string[], value: string, onChange: (v: string) => void, placeholder?: string }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, []);

    const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

    return (
      <div ref={ref} style={{ position: "relative", width: "100%" }}>
        <div
          onClick={() => { setOpen(!open); setSearch(""); }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", border: "1.5px solid #e2e8f0", borderRadius: "14px", cursor: "pointer", background: "#fff", fontSize: "1rem", color: value ? "#0f172a" : "#94a3b8", userSelect: "none", minHeight: "50px" }}
        >
          <span>{value || placeholder || "Select"}</span>
          <LucideChevronDown size={18} style={{ transform: open ? "rotate(180deg)" : "none", transition: "0.2s", flexShrink: 0 }} />
        </div>
        {open && (
          <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", zIndex: 10000, overflow: "hidden" }}>
            <div style={{ padding: "8px" }}>
              <input
                autoFocus
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
                onClick={e => e.stopPropagation()}
              />
            </div>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {filtered.map((opt, i) => (
                <div
                  key={i}
                  onClick={() => { onChange(opt); setOpen(false); setSearch(""); }}
                  style={{ padding: "10px 16px", cursor: "pointer", fontSize: "0.9rem", color: opt === value ? "#2563eb" : "#334155", background: opt === value ? "#eff6ff" : "transparent", fontWeight: opt === value ? 600 : 400 }}
                  onMouseEnter={e => { if (opt !== value) (e.target as HTMLElement).style.background = "#f8fafc"; }}
                  onMouseLeave={e => { if (opt !== value) (e.target as HTMLElement).style.background = "transparent"; }}
                >
                  {opt}
                </div>
              ))}
              <div
                onClick={() => { onChange("Other"); setOpen(false); setSearch(""); }}
                style={{ padding: "12px 16px", cursor: "pointer", fontSize: "0.95rem", color: "#2563eb", background: value === "Other" ? "#eff6ff" : "transparent", fontWeight: 700, borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "8px" }}
                onMouseEnter={e => { if (value !== "Other") (e.target as HTMLElement).style.background = "#f0f7ff"; }}
                onMouseLeave={e => { if (value !== "Other") (e.target as HTMLElement).style.background = "transparent"; }}
              >
                <LucidePlus size={16} strokeWidth={3} /> Other (Specify Custom Title)
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

    const [newJob, setNewJob] = useState({
    title: "", clientId: "", clientIds: [] as string[], category: "", openings: 1, 
    jobType: "Full time", workLocationType: "Work from office",
    city: "", locality: "", gender: "Any", qualification: "Any", 
    minExp: "", maxExp: "", salaryType: "Fixed", 
    salaryMin: "", salaryMax: "", incentives: "",
    benefits: [] as string[], skills: [] as string[], assets: [] as string[], documents: [] as string[],
    startTime: "09:00", endTime: "18:00", workingDays: "6 days working", description: "",
    isContract: false, freshersOnly: false,
    interviewRounds: 1,
    round1Name: "", round2Name: "", round3Name: "", round4Name: "", round5Name: ""
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [customInputs, setCustomInputs] = useState({ benefit: "", skill: "", asset: "", doc: "" });
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const canEdit = role !== "recruiter";

  useEffect(() => {
    const initUserAndData = async () => {
      try {
        const meRes = await fetch("/api/me");
        if (meRes.ok) {
          const u = await meRes.json();
          setCurrentUser(u);
        }
        
        if (role === "tl") {
          const teamRes = await fetch("/api/tl/team-monitoring");
          if (teamRes.ok) {
            const data = await teamRes.json();
            setTeamMembers(data.teamList || []);
          }
        } else if (role === "manager" || role === "boss") {
          const teamRes = await fetch("/api/team");
          if (teamRes.ok) {
            const data = await teamRes.json();
            setTeamMembers(Array.isArray(data) ? data : []);
          }
        }
      } catch (err) {
        console.error("Error during initial data loading:", err);
      }
    };
    
    initUserAndData();
    fetchJobs();
    fetchCandidates();
    if (canEdit) fetchClients();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await fetch("/api/candidates");
      const data = await res.json();
      setCandidates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching candidates:", err);
    }
  };

  // auto-adjust max exp if min exp exceeds it
  useEffect(() => {
    const minIdx = expOptions.indexOf(newJob.minExp);
    const maxIdx = expOptions.indexOf(newJob.maxExp);
    if (maxIdx !== -1 && maxIdx <= minIdx && minIdx !== -1) {
       setNewJob(prev => ({ ...prev, maxExp: "" }));
    }
  }, [newJob.minExp]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/jobs");
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...newJob,
        benefits: newJob.benefits.join(", "),
        skills: newJob.skills.join(", "),
        assets: newJob.assets.join(", "),
        documents: newJob.documents.join(", "),
        salaryRange: `${newJob.salaryMin} to ${newJob.salaryMax}${newJob.salaryType === 'Fixed + Incentives' ? ' + ' + newJob.incentives : ''}`
      };
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setView("list");
        resetForm();
        fetchJobs();
      } else {
        const errData = await res.json();
        alert("Failed to deploy mandate: " + (errData.error || errData.message || "Unknown Error"));
      }
    } catch (err) {
        console.error("Error adding job:", err);
        alert("Network or Server error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsCustomActive(false);
    setNewJob({
      title: "", clientId: "", clientIds: [], category: "", openings: 1, jobType: "Full time", workLocationType: "Work from office",
      city: "", locality: "", gender: "Any", qualification: "Any", minExp: "", maxExp: "",
      salaryType: "Fixed", salaryMin: "", salaryMax: "", incentives: "",
      benefits: [], skills: [], assets: [], documents: [],
      startTime: "09:00", endTime: "18:00", workingDays: "6 days working", description: "",
      isContract: false, freshersOnly: false,
      interviewRounds: 1,
      round1Name: "", round2Name: "", round3Name: "", round4Name: "", round5Name: ""
    });
  };

  const startEditing = (job: Job) => {
    setIsCustomActive(job.title ? !JOB_DESIGNATIONS.includes(job.title) : false);
    setNewJob({
      title: job.title || "",
      clientId: job.client?.id ? String(job.client.id) : "",
      clientIds: job.clientIds ? job.clientIds.map(String) : [],
      category: job.category || "",
      openings: job.openings || 1,
      jobType: job.jobType || "Full time",
      workLocationType: job.workLocationType || "Work from office",
      city: job.city || "",
      locality: job.locality || "",
      gender: job.gender || "Any",
      qualification: job.qualification || "Any",
      minExp: job.minExp || "",
      maxExp: job.maxExp || "",
      salaryType: job.salaryType || "Fixed",
      salaryMin: job.salaryMin?.split(" to ")[0] || "",
      salaryMax: job.salaryMax || job.salaryRange?.split(" to ")[1]?.split(" + ")[0] || "",
      incentives: job.incentives || job.salaryRange?.split(" + ")[1] || "",
      benefits: job.benefits ? job.benefits.split(", ").filter(Boolean) : [],
      skills: job.skills ? job.skills.split(", ").filter(Boolean) : [],
      assets: job.assets ? job.assets.split(", ").filter(Boolean) : [],
      documents: job.documents ? job.documents.split(", ").filter(Boolean) : [],
      startTime: job.startTime || "09:00",
      endTime: job.endTime || "18:00",
      workingDays: job.workingDays || "6 days working",
      description: job.description || "",
      isContract: job.isContract || false,
      freshersOnly: job.freshersOnly || false,
      interviewRounds: job.interviewRounds || 1,
      round1Name: job.round1Name || "",
      round2Name: job.round2Name || "",
      round3Name: job.round3Name || "",
      round4Name: job.round4Name || "",
      round5Name: job.round5Name || ""
    });
    setView("edit");
  };

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    try {
      setSubmitting(true);
      const payload = {
        ...newJob,
        benefits: newJob.benefits.join(", "),
        skills: newJob.skills.join(", "),
        assets: newJob.assets.join(", "),
        documents: newJob.documents.join(", "),
        salaryRange: `${newJob.salaryMin} to ${newJob.salaryMax}${newJob.salaryType === 'Fixed + Incentives' ? ' + ' + newJob.incentives : ''}`
      };
      const res = await fetch(`/api/jobs/${selectedJob.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setView("list");
        setSelectedJob(null);
        resetForm();
        fetchJobs();
      } else {
        const errData = await res.json();
        alert("Failed to update mandate: " + (errData.error || errData.message || "Unknown Error"));
      }
    } catch (err) {
        console.error("Error updating job:", err);
        alert("Network or Server error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJob = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this mandate?")) return;
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      if (res.ok) fetchJobs();
    } catch (err) {
      console.error("Error deleting job:", err);
    }
  };

  const handleToggleHoldJob = async (job: any) => {
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHold: !job.isHold })
      });
      if (res.ok) {
        fetchJobs();
      } else {
        alert("Failed to toggle hold status.");
      }
    } catch (err) {
      console.error("Error toggling job hold status:", err);
    }
  };

  const toggleArrayItem = (key: 'benefits' | 'skills' | 'assets' | 'documents', val: string) => {
    if (!val || !val.trim()) return;
    setNewJob(prev => {
      const currentArray = Array.isArray(prev[key]) ? prev[key] : [];
      const trimmedVal = val.trim();
      const updatedArray = currentArray.includes(trimmedVal)
        ? currentArray.filter(i => i !== trimmedVal)
        : [...currentArray, trimmedVal];
      return {
        ...prev,
        [key]: updatedArray
      };
    });
  };

  const handleCustomTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, key: 'benefits' | 'skills' | 'assets' | 'documents', inputKey: 'benefit' | 'skill' | 'asset' | 'doc') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = customInputs[inputKey];
      if (val && val.trim()) {
        toggleArrayItem(key, val);
        setCustomInputs(prev => ({ ...prev, [inputKey]: "" }));
      }
    }
  };

  const workingDaysArr = ["5 days working", "6 days working", "Other"];
  const shiftOptions = ["Day Shift", "Night Shift", "Rotational Shift", "Split Shift"];

  const uniqueOptions = {
    titles: Array.from(new Set(jobs.map(j => j.title).filter((t): t is string => !!t))),
    jobTypes: jobTypes,
    locations: Array.from(new Set(jobs.map(j => j.city).filter((c): c is string => !!c))),
    experiences: expOptions.filter((o: string) => o !== "Select"),
    salaries: ["0-10k", "10k-20k", "20k-30k", "30k-50k", "50k-100k", "100k+"],
    workSetups: locationTypes,
    qualifications: quals.filter((o: string) => o !== "Any"),
    workingDays: workingDaysArr,
    shifts: shiftOptions,
    genders: genders.filter((o: string) => o !== "Any")
  };

  const filteredJobs = jobs.filter(j => {
    // 1. Calculate Joined Count for this specific job
    const jobJoinedCount = candidates.filter(c => {
      const isCorrectJob = (c.designation || c.jobRole) === j.title;
      if (!isCorrectJob) return false;
      
      const hasJoinedStatus = (c: any) => {
        const currentMatch = c.remarks?.toLowerCase().includes("joined");
        const historyMatch = c.InteractionNotes?.some((n: any) => n.text?.toLowerCase().includes("joined"));
        return currentMatch || historyMatch;
      };
      return hasJoinedStatus(c);
    }).length;

    // 2. Determine Auto Status
    const isActuallyClosed = jobJoinedCount >= (j.openings || 1);
    const targetStatus = isActuallyClosed ? "closed" : "opened";

    // 3. Filter by Tab
    if (jobStatusTab !== targetStatus) return false;

    // 4. Apply existing search and filters
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      !searchQuery || 
      j.title?.toLowerCase().includes(query) ||
      j.city?.toLowerCase().includes(query) ||
      j.client?.name?.toLowerCase().includes(query) ||
      j.skills?.toLowerCase().includes(query) ||
      j.category?.toLowerCase().includes(query) ||
      j.description?.toLowerCase().includes(query);

    const matchesFilters = 
      (!filters.title || j.title === filters.title) &&
      (!filters.jobType || j.jobType === filters.jobType) &&
      (!filters.location || j.city === filters.location) &&
      (!filters.experience || (j.minExp === filters.experience || j.maxExp === filters.experience)) &&
      (!filters.salary || (j.salaryRange && j.salaryRange.toLowerCase().includes(filters.salary.toLowerCase()))) &&
      (!filters.workSetup || j.workLocationType === filters.workSetup) &&
      (!filters.qualification || j.qualification === filters.qualification) &&
      (!filters.workingDays || j.workingDays === filters.workingDays) &&
      (!filters.shift || (j as any).shift === filters.shift) &&
      (!filters.gender || j.gender === filters.gender);

    return matchesSearch && matchesFilters;
  });

  const handleResetFilters = () => {
    setFilters({
      title: "",
      jobType: "",
      location: "",
      experience: "",
      salary: "",
      workSetup: "",
      qualification: "",
      workingDays: "",
      shift: "",
      gender: ""
    });
    setSearchQuery("");
  };

  const handleJDButtonClick = () => {
    setView("jdGen");
    if (selectedJob) {
      // Keep existing selected job
    }
  };

  const visibleCandidates = (() => {
    if (!currentUser) return candidates;

    if (role === "recruiter") {
      const myId = currentUser.id || currentUser.userId;
      const myName = currentUser.name;
      return candidates.filter(c => 
        c.addedBy === myId ||
        c.assignedTo === myId ||
        (c.recruiterName && c.recruiterName.toLowerCase() === myName.toLowerCase())
      );
    }

    if (role === "tl") {
      const myId = currentUser.id || currentUser.userId;
      const myName = currentUser.name;
      
      if (tlViewFilter === "personal") {
        return candidates.filter(c => 
          c.addedBy === myId ||
          c.assignedTo === myId ||
          (c.recruiterName && c.recruiterName.toLowerCase() === myName.toLowerCase())
        );
      }
      
      if (tlViewFilter === "team") {
        if (teamMembers.length === 0) return [];
        const memberIds = teamMembers.map(m => m.id);
        const memberNames = teamMembers.map(m => m.name.toLowerCase());
        return candidates.filter(c => 
          memberIds.includes(c.addedBy) ||
          memberIds.includes(c.assignedTo) ||
          (c.recruiterName && memberNames.includes(c.recruiterName.toLowerCase()))
        );
      }
      
      // Specific recruiter view
      const selectedId = Number(tlViewFilter);
      const selectedMember = teamMembers.find(m => m.id === selectedId);
      if (!selectedMember) return [];
      const memberName = selectedMember.name.toLowerCase();
      
      return candidates.filter(c => 
        c.addedBy === selectedId ||
        c.assignedTo === selectedId ||
        (c.recruiterName && c.recruiterName.toLowerCase() === memberName)
      );
    }

    if (role === "boss" || role === "manager") {
      if (tlViewFilter === "all") {
        return candidates;
      }
      
      if (tlViewFilter.startsWith("team_tl_")) {
        const tlId = Number(tlViewFilter.replace("team_tl_", ""));
        const tl = teamMembers.find(m => m.id === tlId);
        if (!tl) return [];
        
        const memberIds = teamMembers.filter(m => m.reportingTo === tlId).map(m => m.id);
        memberIds.push(tlId);
        const memberNames = teamMembers.filter(m => memberIds.includes(m.id)).map(m => m.name.toLowerCase());
        
        return candidates.filter(c => 
          memberIds.includes(c.addedBy) ||
          memberIds.includes(c.assignedTo) ||
          (c.recruiterName && memberNames.includes(c.recruiterName.toLowerCase()))
        );
      }
      
      if (tlViewFilter.startsWith("personal_tl_")) {
        const tlId = Number(tlViewFilter.replace("personal_tl_", ""));
        const tl = teamMembers.find(m => m.id === tlId);
        if (!tl) return [];
        const tlName = tl.name.toLowerCase();
        
        return candidates.filter(c => 
          c.addedBy === tlId ||
          c.assignedTo === tlId ||
          (c.recruiterName && c.recruiterName.toLowerCase() === tlName)
        );
      }
      
      if (tlViewFilter.startsWith("recruiter_")) {
        const recId = Number(tlViewFilter.replace("recruiter_", ""));
        const rec = teamMembers.find(m => m.id === recId);
        if (!rec) return [];
        const recName = rec.name.toLowerCase();
        
        return candidates.filter(c => 
          c.addedBy === recId ||
          c.assignedTo === recId ||
          (c.recruiterName && c.recruiterName.toLowerCase() === recName)
        );
      }
    }

    return candidates;
  })();

  const checkCandidateStatusHistory = (c: any, keywords: string[]) => {
    if (c.InteractionNotes && Array.isArray(c.InteractionNotes)) {
      return c.InteractionNotes.some((n: any) => {
        const txt = (n.text || "").toLowerCase();
        return keywords.some(kw => txt.includes(kw));
      });
    }
    return false;
  };

  const isCandidateMatch = (c: any, stName: string) => {
    const rmk = (c.remarks || "").toLowerCase();
    const cv = (c.cvStatus || "").toLowerCase();
    const st = stName.toLowerCase().replace(/[\s_]+/g, "");
    
    if (rmk === st || rmk.replace(/[\s_]+/g, "") === st) return true;
    
    const interviewStatuses = ["go for interview", "selected", "joined", "dropped", "process to joining", "process for joining", "hired"];
    const hasInterviewHistory = interviewStatuses.includes(rmk) || !!c.interviewDate || checkCandidateStatusHistory(c, ["go for interview", "interview scheduled", "interview rescheduled", "interviewed"]);

    if (st === "selected") {
      if (rmk === "rejected") return false;
      const selectedStatuses = ["selected", "joined", "dropped", "process to joining", "process for joining", "hired"];
      return selectedStatuses.includes(rmk) || checkCandidateStatusHistory(c, ["selected", "hired"]);
    }
    if (st === "joined" || st === "hired") {
      if (rmk === "dropped") return false;
      return rmk === "joined" || rmk === "hired";
    }
    if (st === "rejected") {
      const excludeFromRejected = ["selected", "joined", "dropped", "process to joining", "process for joining", "hired"];
      if (excludeFromRejected.includes(rmk)) return false;
      return rmk === "rejected";
    }
    if (st === "interested") {
      if (rmk === "not connected") return false;
      const interestedStatuses = ["interested", "selected", "joined", "dropped", "process to joining", "process for joining", "hired", "rejected"];
      return interestedStatuses.includes(rmk) || checkCandidateStatusHistory(c, ["interested", "select", "join", "hired", "process"]);
    }
    if (st === "joining" || st === "process to joining" || st === "process for joining") {
      const excludeFromJoining = ["joined", "dropped", "rejected", "hired"];
      if (excludeFromJoining.includes(rmk)) return false;
      return rmk === "process to joining" || rmk === "process for joining";
    }
    if (st === "connected") {
      if (hasInterviewHistory) return false;
      return rmk === "connected" || checkCandidateStatusHistory(c, ["connected"]);
    }
    if (st === "not interested") {
      return rmk === "not interested";
    }
    if (st === "go for interview") {
      return hasInterviewHistory;
    }
    return rmk === st || cv === st;
  };

  const getAnalytics = (jobTitle: string) => {
    const jobCandidates = visibleCandidates.filter(c => (c.designation || c.jobRole) === jobTitle);
    
    // Apply Date Filter
    const now = new Date();
    const filtered = jobCandidates.filter(c => {
      const date = new Date(c.createdAt);
      if (analyticsFilter === "today") {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        return date >= todayStart;
      } else if (analyticsFilter === "7day" || analyticsFilter === "7days") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        return date >= sevenDaysAgo;
      } else if (analyticsFilter === "month" || analyticsFilter === "monthly") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        return date >= thirtyDaysAgo;
      } else if (analyticsFilter === "year" || analyticsFilter === "yearly") {
        return date.getFullYear() === now.getFullYear();
      } else if (analyticsFilter === "custom") {
        const start = customDateRange.start ? new Date(customDateRange.start) : null;
        const end = customDateRange.end ? new Date(customDateRange.end) : null;
        if (start) start.setHours(0, 0, 0, 0);
        if (end) end.setHours(23, 59, 59, 999);
        return (!start || date >= start) && (!end || date <= end);
      }
      return true;
    });

    const hasStatusInHistory = (cand: any, statusKeywords: string[]) => {
      const kws = statusKeywords.map(k => k.toLowerCase());
      
      const currentRemarks = (cand.remarks || "").toLowerCase();
      const currentStatus = (cand.status || "").toLowerCase();
      
      const matchesCurrent = kws.some(kw => 
        currentRemarks.includes(kw) || currentStatus.includes(kw) || isCandidateMatch(cand, kw)
      );
      if (matchesCurrent) return true;
      
      return checkCandidateStatusHistory(cand, kws);
    };

    return {
      connected: filtered.length,
      interested: filtered.filter(c => hasStatusInHistory(c, ["Interested", "Interview", "Processing", "Process To Joining", "Selected", "Joined"])).length,
      notInterested: filtered.filter(c => hasStatusInHistory(c, ["Not Interested", "Call Not Pick"])).length,
      selected: filtered.filter(c => hasStatusInHistory(c, ["Selected", "Joined"])).length,
      rejected: filtered.filter(c => hasStatusInHistory(c, ["Rejected"])).length,
      joined: filtered.filter(c => hasStatusInHistory(c, ["Joined"])).length,
      processing: filtered.filter(c => hasStatusInHistory(c, ["Interview", "Processing", "Process To Joining", "Selected", "Joined"])).length,
      dropped: filtered.filter(c => hasStatusInHistory(c, ["Dropped"])).length,
      interviewDone: filtered.filter(c => hasStatusInHistory(c, ["interview done", "round", "all rounds done", "processing for next round", "selected", "joined", "process to joining", "process for joining", "hired"])).length,
      interviewNotDone: filtered.filter(c => (c.remarks || "").toLowerCase() === "interview not done" || checkCandidateStatusHistory(c, ["interview not done"])).length,
      processingForInterview: filtered.filter(c => hasStatusInHistory(c, ["go for interview", "interview scheduled", "processing for interview"])).length
    };
  };

  if (view === "add" || view === "edit") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="add-job-fullscreen">
        <div className="form-navbar">
           <div className="flex-center gap-medium">
             <button onClick={() => { setView(view === "edit" ? "view" : "list"); }} className="back-btn"><LucideChevronLeft size={24} /></button>
             <h2 style={{ fontWeight: 900 }}>{view === "edit" ? "Update Recruitment Mandate" : "Deploy Recruitment Mandate"}</h2>
           </div>
           <div className="flex gap-medium">
             <button onClick={() => { setView(view === "edit" ? "view" : "list"); }} className="btn-secondary-v2">Discard</button>
             <button onClick={view === "edit" ? handleUpdateJob : handleAddJob} disabled={submitting} className="btn-primary-v2">
                {submitting ? <LucideLoader2 className="animate-spin" /> : (view === "edit" ? "Update job" : "Add job")}
             </button>
           </div>
        </div>

        <div className="form-content-area">
           <div className="job-form-card">
              {/* Core Information */}
              <div className="form-group-v2">
                 <label>Job Title *</label>
                 <SearchableSelect 
                   options={JOB_DESIGNATIONS} 
                   value={isCustomActive ? "Other" : (JOB_DESIGNATIONS.includes(newJob.title) ? newJob.title : "")} 
                   onChange={v => {
                     if (v === "Other") {
                       setNewJob({...newJob, title: "Other"});
                       setIsCustomActive(true);
                     } else {
                       setNewJob({...newJob, title: v});
                       setIsCustomActive(false);
                     }
                   }} 
                   placeholder="Select Job Title" 
                 />
                 {isCustomActive && (
                    <div style={{ marginTop: "12px" }} className="animate-fade-in">
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>Enter Custom Job Title *</label>
                      <input 
                        type="text" 
                        placeholder="Type custom job title..." 
                        value={newJob.title === "Other" ? "" : newJob.title} 
                        onChange={e => {
                          setNewJob({...newJob, title: e.target.value});
                        }} 
                        style={{ width: "100%", padding: "12px 18px", borderRadius: "14px", border: "1.5px solid #cbd5e1", outline: "none", fontSize: "1rem", color: "#0f172a" }} 
                      />
                    </div>
                 )}
              </div>

              <div className="form-group-v2">
                 <label>Job Category *</label>
                 <input placeholder="e.g., IT & Software Development" value={newJob.category} onChange={e => setNewJob({...newJob, category: e.target.value})} />
              </div>

              <div className="form-group-v2">
                 <label>Number of Openings *</label>
                 <input type="number" placeholder="Enter number of positions" value={newJob.openings} onChange={e => setNewJob({...newJob, openings: parseInt(e.target.value)})} />
              </div>

              <div className="form-group-v2">
                 <label>Partner Client * <span style={{fontSize: '0.75rem', fontWeight: 500, color: '#94a3b8'}}>(Select multiple by holding Ctrl/Cmd)</span></label>
                 <select 
                    multiple
                    value={newJob.clientIds} 
                    onChange={e => {
                        const values = Array.from(e.target.selectedOptions, option => option.value);
                        setNewJob({...newJob, clientIds: values});
                    }} 
                    className="select-v2"
                    style={{ minHeight: "120px", padding: "10px" }}
                 >
                    {clients.map(c => <option key={c.id} value={c.id} style={{ padding: "8px", borderRadius: "6px", marginBottom: "4px" }}>{c.name}</option>)}
                 </select>
              </div>

              <div className="form-group-v2">
                 <label>Job Type *</label>
                 <div className="pill-selector">
                    {jobTypes.map((t: string) => (
                      <button key={t} type="button" className={newJob.jobType === t ? 'active' : ''} onClick={() => setNewJob({...newJob, jobType: t})}>{t}</button>
                    ))}
                 </div>
              </div>

              <div className="form-group-v2">
                 <label>Work Location Type *</label>
                 <div className="pill-selector">
                    {locationTypes.map((t: string) => (
                      <button key={t} type="button" className={newJob.workLocationType === t ? 'active' : ''} onClick={() => setNewJob({...newJob, workLocationType: t})}>{t}</button>
                    ))}
                 </div>
              </div>

              <div className="form-row-grid mt-medium">
                 <div className="form-group-v2">
                    <label>Choose City *</label>
                    <input placeholder="e.g., Delhi, Mumbai, Bangalore" value={newJob.city} onChange={e => setNewJob({...newJob, city: e.target.value})} />
                 </div>
                 <div className="form-group-v2">
                    <label>Job Locality *</label>
                    <input placeholder={newJob.city ? "e.g. Andheri East" : "First select a city"} value={newJob.locality} onChange={e => setNewJob({...newJob, locality: e.target.value})} />
                    <span className="sub-hint">Please select a city first to enable locality selection</span>
                 </div>
              </div>

              <div className="form-group-v2">
                 <label>Gender *</label>
                 <div className="pill-selector">
                    {genders.map((g: string) => (
                      <button key={g} type="button" className={newJob.gender === g ? 'active' : ''} onClick={() => setNewJob({...newJob, gender: g})}>{g}</button>
                    ))}
                 </div>
              </div>

              <div className="form-group-v2">
                 <label>Minimum Qualification Required *</label>
                 <div className="pill-selector wrap">
                    {quals.map((q: string) => (
                      <button key={q} type="button" className={newJob.qualification === q ? 'active' : ''} onClick={() => setNewJob({...newJob, qualification: q})}>{q}</button>
                    ))}
                 </div>
              </div>

              <div className="form-group-v2">
                 <label>Required Experience *</label>
                 <div className="exp-row">
                    <div className="exp-input">
                       <span>Min exp.</span>
                       <select value={newJob.minExp} onChange={e => setNewJob({...newJob, minExp: e.target.value})}>
                          {expOptions.map((o: string) => <option key={o} value={o === "Select" ? "" : o}>{o}</option>)}
                       </select>
                    </div>
                    <div className="exp-input">
                       <span>Max exp.</span>
                       <select value={newJob.maxExp} onChange={e => setNewJob({...newJob, maxExp: e.target.value})}>
                          {expOptions.map((o: string, idx: number) => {
                             const minIdx = expOptions.indexOf(newJob.minExp);
                             if (idx <= minIdx && idx !== 0) return null;
                             return <option key={o} value={o === "Select" ? "" : o}>{o}</option>
                          })}
                       </select>
                    </div>
                 </div>
              </div>

              <div className="form-group-v2">
                 <label>Salary & benefits *</label>
                 <div className="pill-selector no-margin">
                    {["Fixed", "Fixed + Incentives"].map((t: string) => (
                      <button key={t} type="button" className={newJob.salaryType === t ? 'active' : ''} onClick={() => setNewJob({...newJob, salaryType: t})}>{t}</button>
                    ))}
                 </div>
                 
                 <div className="salary-inputs-box">
                    <span>Salary details/ monthly</span>
                    <div className="salary-row">
                       <div className="currency-input">
                          <span className="prefix">₹</span>
                          <input type="number" placeholder="e.g. 10,000" value={newJob.salaryMin} onChange={e => setNewJob({...newJob, salaryMin: e.target.value})} />
                       </div>
                       <span className="to-text">to</span>
                       <div className="currency-input">
                          <span className="prefix">₹</span>
                          <input type="number" placeholder="e.g. 50,000" value={newJob.salaryMax} onChange={e => setNewJob({...newJob, salaryMax: e.target.value})} />
                       </div>
                       {newJob.salaryType === 'Fixed + Incentives' && (
                         <div className="incentive-wrapper">
                            <span>Incentives</span>
                            <div className="currency-input">
                               <span className="prefix">+ ₹</span>
                               <input type="number" placeholder="e.g. 10,000" value={newJob.incentives} onChange={e => setNewJob({...newJob, incentives: e.target.value})} />
                            </div>
                         </div>
                       )}
                    </div>
                    <span className="sub-hint">per month</span>
                  </div>
               </div>

               <div className="form-group-v2">
                  <label>Job Benefits (optional)</label>
                  <div className="tag-list">
                     {Array.from(new Set(["Cab", "Meal", "Insurance", "PF", "Medical Benefits", ...(Array.isArray(newJob.benefits) ? newJob.benefits : [])])).map((t: string) => (
                       <button key={t} type="button" className={`tag-pill ${(Array.isArray(newJob.benefits) ? newJob.benefits : []).includes(t) ? 'active' : ''}`} onClick={() => toggleArrayItem('benefits', t)}>
                         {t} {(Array.isArray(newJob.benefits) ? newJob.benefits : []).includes(t) ? <LucideCheckCircle2 size={14} color="#2563eb" /> : "+"}
                       </button>
                     ))}
                  </div>
                  <div className="custom-tag-add">
                     <input 
                       placeholder="e.g Breakfast, gym, childcare, etc" 
                       value={customInputs.benefit} 
                       onChange={e => setCustomInputs({...customInputs, benefit: e.target.value})} 
                       onKeyDown={e => handleCustomTagKeyDown(e, 'benefits', 'benefit')}
                     />
                     <button type="button" onClick={() => { if(customInputs.benefit) { toggleArrayItem('benefits', customInputs.benefit); setCustomInputs({...customInputs, benefit: ""}); } }}>+ Add</button>
                  </div>
               </div>

               <div className="form-group-v2">
                  <label>Job Skills (optional)</label>
                  <div className="tag-list">
                     {Array.from(new Set(["30 WPM Typing Speed", "Computer Knowledge", "Data Entry", "MS Excel", ...(Array.isArray(newJob.skills) ? newJob.skills : [])])).map((t: string) => (
                       <button key={t} type="button" className={`tag-pill ${(Array.isArray(newJob.skills) ? newJob.skills : []).includes(t) ? 'active' : ''}`} onClick={() => toggleArrayItem('skills', t)}>
                         {t} {(Array.isArray(newJob.skills) ? newJob.skills : []).includes(t) ? <LucideCheckCircle2 size={14} color="#2563eb" /> : "+"}
                       </button>
                     ))}
                  </div>
                  <div className="custom-tag-add">
                     <input 
                       placeholder="Add custom skill" 
                       value={customInputs.skill} 
                       onChange={e => setCustomInputs({...customInputs, skill: e.target.value})} 
                       onKeyDown={e => handleCustomTagKeyDown(e, 'skills', 'skill')}
                     />
                     <button type="button" onClick={() => { if(customInputs.skill) { toggleArrayItem('skills', customInputs.skill); setCustomInputs({...customInputs, skill: ""}); } }}>+ Add</button>
                  </div>
               </div>

               <div className="form-group-v2">
                  <label>Assets Required for this Job (optional)</label>
                  <div className="tag-list">
                     {Array.from(new Set(["Internet Connection", "Laptop/Desktop", "Bike", ...(Array.isArray(newJob.assets) ? newJob.assets : [])])).map((t: string) => (
                       <button key={t} type="button" className={`tag-pill ${(Array.isArray(newJob.assets) ? newJob.assets : []).includes(t) ? 'active' : ''}`} onClick={() => toggleArrayItem('assets', t)}>
                         {t} {(Array.isArray(newJob.assets) ? newJob.assets : []).includes(t) ? <LucideCheckCircle2 size={14} color="#2563eb" /> : "+"}
                       </button>
                     ))}
                  </div>
                  <div className="custom-tag-add">
                     <input 
                       placeholder="Add custom asset" 
                       value={customInputs.asset} 
                       onChange={e => setCustomInputs({...customInputs, asset: e.target.value})} 
                       onKeyDown={e => handleCustomTagKeyDown(e, 'assets', 'asset')}
                     />
                     <button type="button" onClick={() => { if(customInputs.asset) { toggleArrayItem('assets', customInputs.asset); setCustomInputs({...customInputs, asset: ""}); } }}>+ Add</button>
                  </div>
               </div>

               <div className="form-group-v2">
                  <label>Documents Required for this Job (optional)</label>
                  <div className="tag-list">
                     {Array.from(new Set(["PAN Card", "Aadhar Card", "Bank Account", "2-Wheeler Driving Licence", ...(Array.isArray(newJob.documents) ? newJob.documents : [])])).map((t: string) => (
                       <button key={t} type="button" className={`tag-pill ${(Array.isArray(newJob.documents) ? newJob.documents : []).includes(t) ? 'active' : ''}`} onClick={() => toggleArrayItem('documents', t)}>
                         {t} {(Array.isArray(newJob.documents) ? newJob.documents : []).includes(t) ? <LucideCheckCircle2 size={14} color="#2563eb" /> : "+"}
                       </button>
                     ))}
                  </div>
                  <div className="custom-tag-add">
                     <input 
                       placeholder="Add custom document" 
                       value={customInputs.doc} 
                       onChange={e => setCustomInputs({...customInputs, doc: e.target.value})} 
                       onKeyDown={e => handleCustomTagKeyDown(e, 'documents', 'doc')}
                     />
                     <button type="button" onClick={() => { if(customInputs.doc) { toggleArrayItem('documents', customInputs.doc); setCustomInputs({...customInputs, doc: ""}); } }}>+ Add</button>
                  </div>
               </div>

              <div className="form-group-v2">
                 <label>Job Timings *</label>
                 <div className="time-row">
                    <div className="time-field">
                       <input type="time" value={newJob.startTime} onChange={e => setNewJob({...newJob, startTime: e.target.value})} />
                       <LucideClockIcon size={18} />
                    </div>
                    <div className="time-field">
                       <input type="time" value={newJob.endTime} onChange={e => setNewJob({...newJob, endTime: e.target.value})} />
                       <LucideClockIcon size={18} />
                    </div>
                 </div>
              </div>

              <div className="form-group-v2">
                 <label>Working Days *</label>
                 <div className="pill-selector">
                    {workingDaysArr.map((d: string) => (
                      <button key={d} type="button" className={newJob.workingDays === d ? 'active' : ''} onClick={() => setNewJob({...newJob, workingDays: d})}>{d}</button>
                    ))}
                 </div>
              </div>

              <div className="form-group-v2">
                 <label>Detailed Description</label>
                 <textarea placeholder="Paste detailed job mandate here..." value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} />
              </div>

              <div className="form-group-v2">
                 <label>Interview Rounds *</label>
                 <select 
                    value={newJob.interviewRounds} 
                    onChange={e => {
                      const r = parseInt(e.target.value);
                      setNewJob({...newJob, interviewRounds: r});
                    }}
                    className="select-v2"
                    required
                 >
                    <option value={1}>1 Round</option>
                    <option value={2}>2 Rounds</option>
                    <option value={3}>3 Rounds</option>
                    <option value={4}>4 Rounds</option>
                    <option value={5}>5 Rounds</option>
                 </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem", background: "#f8fafc", borderRadius: "16px", border: "1.5px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#64748b" }}>Round Names (Optional - Defaults to Round 1, Round 2, etc.)</span>
                {Array.from({ length: newJob.interviewRounds || 1 }).map((_, i) => {
                  const roundNum = i + 1;
                  const fieldName = `round${roundNum}Name` as const;
                  return (
                    <div key={i} className="form-group-v2" style={{ marginBottom: "0.5rem" }}>
                      <label style={{ fontSize: "0.8rem", color: "#475569", marginBottom: "4px" }}>Round {roundNum} Name</label>
                      <input 
                        type="text" 
                        placeholder={`e.g. ${roundNum === 1 ? 'HR Round' : roundNum === 2 ? 'Technical Round' : roundNum === 3 ? 'Coding Round' : 'Manager Round'}`}
                        value={(newJob as any)[fieldName] || ""} 
                        onChange={e => setNewJob({...newJob, [fieldName]: e.target.value})} 
                      />
                    </div>
                  );
                })}
              </div>
           </div>
        </div>

        <style>{`
          .add-job-fullscreen { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #f8fafc; z-index: 1000; overflow-y: auto; }
          .form-navbar { position: sticky; top: 0; padding: 1rem 3rem; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; z-index: 10; }
          .back-btn { background: none; border: none; cursor: pointer; color: #1e293b; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 12px; transition: all 0.2s; }
          .back-btn:hover { background: #f1f5f9; }
          .btn-primary-v2 { background: #2563eb; color: white; border: none; padding: 10px 30px; border-radius: 12px; font-weight: 800; cursor: pointer; transition: all 0.2s; }
          .btn-primary-v2:disabled { opacity: 0.7; cursor: not-allowed; }
          .btn-primary-v2:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); }
          .btn-secondary-v2 { background: white; color: #64748b; border: 1px solid #e2e8f0; padding: 10px 30px; border-radius: 12px; font-weight: 800; cursor: pointer; }
          
          .form-content-area { padding: 3rem; display: flex; justify-content: center; }
          .job-form-card { background: white; border-radius: 24px; width: 100%; max-width: 800px; padding: 3rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); display: flex; flex-direction: column; gap: 2.5rem; }
          
          .form-group-v2 { width: 100%; display: flex; flex-direction: column; }
          .form-group-v2 label { display: block; font-weight: 700; color: #475569; font-size: 0.9rem; margin-bottom: 0.75rem; }
          .form-group-v2 input, .form-group-v2 select, .select-v2 { width: 100%; padding: 14px 18px; border: 1.5px solid #e2e8f0; border-radius: 14px; font-size: 1rem; outline: none; transition: all 0.2s; background: white; }
          .form-group-v2 input:focus, .form-group-v2 select:focus { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37,99,235,0.05); }
          .sub-hint { display: block; font-size: 0.75rem; color: #94a3b8; margin-top: 6px; }

          .pill-selector { display: flex; gap: 10px; }
          .pill-selector.wrap { flex-wrap: wrap; }
          .pill-selector button { padding: 10px 24px; border-radius: 30px; border: 1.5px solid #e2e8f0; background: white; color: #475569; font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 0.95rem; }
          .pill-selector button.active { background: #2563eb; border-color: #2563eb; color: white; box-shadow: 0 4px 12px rgba(37,99,235,0.2); }
          .pill-selector button:hover:not(.active) { background: #f8fafc; border-color: #cbd5e1; }

          .checkbox-container { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.9rem; color: #2563eb; font-weight: 600; }
          .exp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
          .exp-input { background: #f8fafc; padding: 15px; border-radius: 16px; border: 1.5px solid #e2e8f0; }
          .exp-input span { display: block; font-size: 0.75rem; color: #64748b; font-weight: 700; margin-bottom: 8px; }
          .exp-input select { width: 100%; border: none; background: transparent; font-size: 1rem; cursor: pointer; outline: none; padding: 0; }

          .salary-inputs-box { border: 1.5px solid #f1f5f9; border-radius: 20px; padding: 1.5rem; background: #fafafa; margin-top: 1rem; }
          .salary-inputs-box > span { display: block; font-size: 0.8rem; color: #64748b; margin-bottom: 1rem; font-weight: 700; }
          .salary-row { display: flex; align-items: flex-end; gap: 1rem; flex-wrap: wrap; }
          .currency-input { position: relative; flex: 1; }
          .currency-input .prefix { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #64748b; font-weight: 700; pointer-events: none; }
          .currency-input input { padding-left: 45px !important; }
          .incentive-wrapper .currency-input input { padding-left: 55px !important; }
          .to-text { padding-bottom: 12px; color: #94a3b8; font-weight: 600; padding: 0 5px; }
          .incentive-wrapper { display: flex; flex-direction: column; gap: 8px; border-left: 1.5px solid #e2e8f0; padding-left: 1.5rem; flex: 1; }
          .incentive-wrapper > span { font-size: 0.75rem; font-weight: 700; color: #64748b; }

          .tag-list { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
          .tag-pill { display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 30px; border: 1.5px solid #e2e8f0; background: white; color: #64748b; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
          .tag-pill.active { background: #eff6ff; border-color: #2563eb; color: #2563eb; }
          .custom-tag-add { display: flex; gap: 10px; }
          .custom-tag-add input { flex: 1; min-height: 44px; }
          .custom-tag-add button { background: none; border: none; color: #2563eb; font-weight: 800; cursor: pointer; padding: 0 10px; font-size: 0.9rem; }

          .time-row { display: flex; gap: 1rem; }
          .time-field { position: relative; flex: 1; }
          .time-field svg { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
          .time-field input { width: 100%; padding-right: 45px !important; }

          textarea { width: 100%; min-height: 120px; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 1rem; font-size: 1rem; outline: none; resize: vertical; }
          textarea:focus { border-color: #2563eb; }

          .form-row-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        `}</style>
      </motion.div>
    );
  }

  return (
    <div className="jobs-container" style={{ padding: "1.25rem", height: "100%", background: "transparent" }}>
      {/* Header Section */}
      {view !== "jdGen" && (
        <div className="jobs-header-section" style={{ marginBottom: "2rem" }}>
        <div className="flex-between" style={{ alignItems: "center", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
            <div className="header-text">
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0", letterSpacing: "-0.5px" }}>
                <span style={{ color: "#0f172a" }}>Mandate </span>
                <span style={{ color: "#2563eb" }}>Pipeline</span>
              </h1>
              <p style={{ color: "#64748b", fontSize: "0.88rem", fontWeight: 500, margin: "2px 0 0 0" }}>Global synchronization of active recruitment mandates.</p>
            </div>

            {/* Status Toggle */}
            <div style={{ display: "flex", background: "#f8fafc", padding: "4px", borderRadius: "14px", border: "1px solid #e2e8f0", gap: "2px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
              <button 
                onClick={() => setJobStatusTab("opened")}
                style={{ 
                  padding: "8px 20px", 
                  borderRadius: "10px", 
                  border: "none", 
                  background: jobStatusTab === "opened" ? "white" : "transparent",
                  color: jobStatusTab === "opened" ? "#2563eb" : "#64748b",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  boxShadow: jobStatusTab === "opened" ? "0 4px 12px rgba(37, 99, 235, 0.1)" : "none",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  whiteSpace: "nowrap"
                }}
              >
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }}></div>
                Job Opened
              </button>
              <button 
                onClick={() => setJobStatusTab("closed")}
                style={{ 
                  padding: "8px 20px", 
                  borderRadius: "10px", 
                  border: "none", 
                  background: jobStatusTab === "closed" ? "white" : "transparent",
                  color: jobStatusTab === "closed" ? "#ef4444" : "#64748b",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  boxShadow: jobStatusTab === "closed" ? "0 4px 12px rgba(239, 68, 68, 0.1)" : "none",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  whiteSpace: "nowrap"
                }}
              >
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 8px #ef4444" }}></div>
                Job Closed
              </button>
            </div>
          </div>
          
          {canEdit && (
            <button 
              className="btn-primary" 
              onClick={() => { resetForm(); setView("add"); }}
              style={{ padding: "0 20px", borderRadius: "12px", height: "42px", fontSize: "0.9rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)" }}
            >
              <LucidePlus size={18} strokeWidth={3} /> Add Job
            </button>
          )}
        </div>

        <div className="action-row" style={{ display: "flex", alignItems: "center", gap: "15px", background: "white", padding: "12px", borderRadius: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.03)", border: "1px solid #f1f5f9" }}>
          <div className="search-container" style={{ flex: 1, position: "relative" }}>
            <LucideSearch size={20} style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input 
              type="text" 
              placeholder="Search by Title, Company, Location, Skills..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", padding: "12px 12px 12px 45px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "0.95rem", outline: "none", transition: "all 0.2s" }}
              onFocus={(e) => e.target.style.borderColor = "#2563eb"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          <button 
            className={`filter-toggle-btn ${showFilterPanel ? 'active' : ''}`}
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px", 
              padding: "12px 20px", 
              borderRadius: "12px", 
              border: "1.5px solid #e2e8f0", 
              background: showFilterPanel ? "#f0f7ff" : "white", 
              color: showFilterPanel ? "#2563eb" : "#475569",
              borderColor: showFilterPanel ? "#2563eb" : "#e2e8f0",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <LucideFilter size={18} />
            Filter
            <LucideChevronDown size={16} style={{ transform: showFilterPanel ? "rotate(180deg)" : "none", transition: "0.2s" }} />
          </button>

          <button 
            className="jd-btn"
            onClick={handleJDButtonClick}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px", 
              padding: "12px 20px", 
              borderRadius: "12px", 
              border: "1.5px solid #e2e8f0", 
              background: "white", 
              color: "#475569",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
          >
            <LucideFileText size={18} />
            Job Description
          </button>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilterPanel && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="filter-panel"
              style={{ 
                marginTop: "10px", 
                background: "white", 
                borderRadius: "16px", 
                padding: "20px", 
                boxShadow: "0 15px 30px rgba(0,0,0,0.08)", 
                border: "1px solid #f1f5f9",
                zIndex: 50
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px" }}>
                <SearchableFilterSelect label="Job Title" options={uniqueOptions.titles} value={filters.title} onChange={(v) => setFilters({...filters, title: v})} placeholder="Search titles..." />
                <SearchableFilterSelect label="Job Type" options={uniqueOptions.jobTypes} value={filters.jobType} onChange={(v) => setFilters({...filters, jobType: v})} placeholder="Search types..." />
                <SearchableFilterSelect label="Location" options={uniqueOptions.locations} value={filters.location} onChange={(v) => setFilters({...filters, location: v})} placeholder="Search cities..." />
                <SearchableFilterSelect label="Experience" options={uniqueOptions.experiences} value={filters.experience} onChange={(v) => setFilters({...filters, experience: v})} placeholder="Search exp..." />
                <SearchableFilterSelect label="Salary" options={uniqueOptions.salaries} value={filters.salary} onChange={(v) => setFilters({...filters, salary: v})} placeholder="Search salary..." />
                <SearchableFilterSelect label="Work Setup" options={uniqueOptions.workSetups} value={filters.workSetup} onChange={(v) => setFilters({...filters, workSetup: v})} placeholder="Search setups..." />
                <SearchableFilterSelect label="Qualification" options={uniqueOptions.qualifications} value={filters.qualification} onChange={(v) => setFilters({...filters, qualification: v})} placeholder="Search quals..." />
                <SearchableFilterSelect label="Working Days" options={uniqueOptions.workingDays} value={filters.workingDays} onChange={(v) => setFilters({...filters, workingDays: v})} placeholder="Search days..." />
                <SearchableFilterSelect label="Shift" options={uniqueOptions.shifts} value={filters.shift} onChange={(v) => setFilters({...filters, shift: v})} placeholder="Search shifts..." />
                <SearchableFilterSelect label="Gender" options={uniqueOptions.genders} value={filters.gender} onChange={(v) => setFilters({...filters, gender: v})} placeholder="Search gender..." />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px", paddingTop: "15px", borderTop: "1px solid #f1f5f9", gap: "12px" }}>
                <button 
                  onClick={handleResetFilters}
                  style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "#64748b", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}
                >
                  <LucideRotateCcw size={14} /> Reset Filters
                </button>
                <button 
                  onClick={() => setShowFilterPanel(false)}
                  style={{ background: "#2563eb", color: "white", border: "none", padding: "10px 25px", borderRadius: "10px", fontWeight: 800, fontSize: "0.9rem", cursor: "pointer", boxShadow: "0 4px 10px rgba(37, 99, 235, 0.2)" }}
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      )}

      {view === "list" && (
        <>
          {loading ? (
            <div className="flex-center" style={{ height: "300px" }}>
              <LucideLoader2 className="animate-spin" size={32} color="#2563eb" />
            </div>
          ) : filteredJobs.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card flex-center flex-column p-large" 
              style={{ height: "300px", background: "white", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}
            >
              <LucideBriefcase size={48} color="#cbd5e1" style={{ marginBottom: "15px" }} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>Pipeline Empty</h3>
              <p style={{ color: "#64748b", fontSize: "0.85rem", textAlign: "center", marginTop: "5px" }}>Register your first mandate node to start the sequence.</p>
            </motion.div>
          ) : (
            <div className="jobs-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "1.25rem" }}>
              {filteredJobs.map((job) => {
                const matchedCandidates = getMatchedLeadsForJob(job.title);
                const matchedCount = matchedCandidates.length;
                const joined = candidates.filter(c => {
                  const isCorrectJob = (c.designation || c.jobRole) === job.title;
                  if (!isCorrectJob) return false;
                  const currentMatch = c.remarks?.toLowerCase().includes("joined");
                  const historyMatch = c.InteractionNotes?.some((n: any) => n.text?.toLowerCase().includes("joined"));
                  return currentMatch || historyMatch;
                }).length;
                const target = job.openings || 1;
                const progress = Math.min((joined / target) * 100, 100);
                const isCompleted = joined >= target;

                // Personal / Team joined count for Red line
                let contributionJoined = 0;
                if (role === "recruiter" && currentUser) {
                  const myId = currentUser.id || currentUser.userId;
                  const myName = currentUser.name;
                  contributionJoined = candidates.filter(c => {
                    const isCorrectJob = (c.designation || c.jobRole) === job.title;
                    if (!isCorrectJob) return false;
                    const currentMatch = c.remarks?.toLowerCase().includes("joined");
                    const historyMatch = c.InteractionNotes?.some((n: any) => n.text?.toLowerCase().includes("joined"));
                    if (!(currentMatch || historyMatch)) return false;
                    
                    return (
                      c.addedBy === myId ||
                      c.assignedTo === myId ||
                      (c.recruiterName && c.recruiterName.toLowerCase() === myName.toLowerCase())
                    );
                  }).length;
                } else if (role === "tl" && teamMembers.length > 0) {
                  const memberIds = teamMembers.map(m => m.id);
                  const memberNames = teamMembers.map(m => m.name.toLowerCase());
                  contributionJoined = candidates.filter(c => {
                    const isCorrectJob = (c.designation || c.jobRole) === job.title;
                    if (!isCorrectJob) return false;
                    const currentMatch = c.remarks?.toLowerCase().includes("joined");
                    const historyMatch = c.InteractionNotes?.some((n: any) => n.text?.toLowerCase().includes("joined"));
                    if (!(currentMatch || historyMatch)) return false;

                    return (
                      memberIds.includes(c.addedBy) ||
                      memberIds.includes(c.assignedTo) ||
                      (c.recruiterName && memberNames.includes(c.recruiterName.toLowerCase()))
                    );
                  }).length;
                }
                const contributionProgress = Math.min((contributionJoined / target) * 100, 100);
                
                const clientName = job.client?.name || "Premium Partner";
                
                // Color-coded letter avatar logic
                const getAvatarBg = (name: string) => {
                  const colors = [
                    "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                    "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
                    "linear-gradient(135deg, #f5f3ff 0%, #ddd6fe 100%)",
                    "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
                    "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)",
                    "linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)",
                  ];
                  let sum = 0;
                  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
                  return colors[sum % colors.length];
                };

                const getAvatarText = (name: string) => {
                  const colors = ["#2563eb", "#059669", "#7c3aed", "#ea580c", "#db2777", "#0d9488"];
                  let sum = 0;
                  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
                  return colors[sum % colors.length];
                };

                return (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="job-card-v5"
                  onClick={() => { setSelectedJob(job); setView("view"); fetchCandidates(); }}
                  style={{ 
                    cursor: "pointer", 
                    position: "relative",
                    background: "#ffffff",
                    borderRadius: "20px",
                    padding: "0",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.01)",
                    border: "1px solid #e2e8f0",
                    overflow: "hidden"
                  }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.transform = "translateY(-4px)"; 
                    e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.02)";
                    e.currentTarget.style.borderColor = "#cbd5e1";
                  }}
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.transform = "translateY(0)"; 
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.01)";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                  }}
                >
                  {/* Accent gradient bar */}
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background: isCompleted 
                      ? "linear-gradient(90deg, #10b981, #059669)" 
                      : "linear-gradient(90deg, #3b82f6, #2563eb)",
                  }} />

                  <div style={{ padding: "1.25rem 1.25rem 1.1rem" }}>
                    {/* Header Row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                      <div style={{ display: "flex", gap: "12px", flex: 1 }}>
                        <div style={{ 
                          width: "44px", 
                          height: "44px", 
                          background: getAvatarBg(clientName), 
                          borderRadius: "12px", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center", 
                          color: getAvatarText(clientName),
                          fontWeight: 800,
                          fontSize: "1.1rem",
                          flexShrink: 0,
                          border: "1px solid rgba(0,0,0,0.03)"
                        }}>
                          {clientName.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontSize: "0.95rem", fontWeight: 800, margin: "0 0 3px", color: "#0f172a", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.title}</h3>
                          <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: "5px" }}>
                            <LucideBuilding2 size={12} color="#94a3b8" /> {clientName}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {canEdit && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedJob(job); startEditing(job); }} 
                            style={{ 
                              background: "none", 
                              border: "none", 
                              color: "#cbd5e1", 
                              cursor: "pointer", 
                              padding: "6px", 
                              borderRadius: "8px",
                              transition: "all 0.2s",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }} 
                            onMouseEnter={e => { e.currentTarget.style.color = "#2563eb"; e.currentTarget.style.background = "#eff6ff"; }} 
                            onMouseLeave={e => { e.currentTarget.style.color = "#cbd5e1"; e.currentTarget.style.background = "none"; }}
                            title="Edit Job Mandate"
                          >
                            <LucideEdit size={15} />
                          </button>
                        )}
                        {(role === "manager" || role === "boss") && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleHoldJob(job); }}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: job.isHold ? "1px solid #fee2e2" : "1px solid #e2e8f0",
                              background: job.isHold ? "#fee2e2" : "white",
                              color: job.isHold ? "#ef4444" : "#475569",
                              fontWeight: 800,
                              fontSize: "0.65rem",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "3px",
                              whiteSpace: "nowrap",
                              transition: "all 0.2s ease"
                            }}
                          >
                            {job.isHold ? "⏸ On Hold" : "▶ Hold"}
                          </button>
                        )}
                        {(role === "manager" || role === "boss") && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteJob(job.id); }} 
                            style={{ 
                              background: "none", 
                              border: "none", 
                              color: "#cbd5e1", 
                              cursor: "pointer", 
                              padding: "6px", 
                              borderRadius: "8px",
                              transition: "all 0.2s",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }} 
                            onMouseEnter={e => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.background = "#fef2f2"; }} 
                            onMouseLeave={e => { e.currentTarget.style.color = "#cbd5e1"; e.currentTarget.style.background = "none"; }}
                            title="Delete Job Mandate"
                          >
                            <LucideTrash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Info Pills Row */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "1rem" }}>
                      {job.isHold && (
                        <div style={{ 
                          fontSize: "0.7rem", 
                          color: '#ef4444', 
                          fontWeight: 800, 
                          background: '#fee2e2', 
                          padding: "4px 8px", 
                          borderRadius: "6px", 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "4px",
                          border: "1px solid #fca5a5"
                        }}>
                          HOLDED
                        </div>
                      )}
                      <div style={{ 
                        fontSize: "0.7rem", 
                        color: "#475569", 
                        fontWeight: 700, 
                        background: "#f8fafc", 
                        padding: "4px 8px", 
                        borderRadius: "6px", 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "4px",
                        border: "1px solid #e2e8f0"
                      }}>
                        <LucideUser size={11} color="#94a3b8" /> {job.minExp || "0"} - {job.maxExp || "Any"} exp
                      </div>
                      <div style={{ 
                        fontSize: "0.7rem", 
                        color: "#475569", 
                        fontWeight: 700, 
                        background: "#f8fafc", 
                        padding: "4px 8px", 
                        borderRadius: "6px", 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "4px",
                        border: "1px solid #e2e8f0"
                      }}>
                        <LucideMapPin size={11} color="#94a3b8" /> {job.city || "Global"}
                      </div>
                      <div style={{ 
                        fontSize: "0.7rem", 
                        color: isCompleted ? "#059669" : "#2563eb", 
                        fontWeight: 800, 
                        background: isCompleted ? "#ecfdf5" : "#eff6ff", 
                        padding: "4px 8px", 
                        borderRadius: "6px", 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "4px",
                        border: `1px solid ${isCompleted ? "#a7f3d0" : "#bfdbfe"}`
                      }}>
                        <LucideTarget size={11} color={isCompleted ? "#059669" : "#2563eb"} /> {job.openings || 1} Openings
                      </div>
                    </div>

                    {/* Progress Section */}
                    <div style={{ marginBottom: "0.5rem", display: "flex", flexDirection: "column", gap: "8px" }}>
                      {/* Universal Tracking Line */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                          <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            {role === "recruiter" || role === "tl" ? "Universal Tracking" : "Joined Progress"}
                          </span>
                          <span style={{ fontSize: "0.72rem", fontWeight: 800, color: isCompleted ? "#059669" : "#2563eb" }}>
                            {joined} / {target} Joined
                          </span>
                        </div>
                        <div style={{ height: "5px", background: "#f1f5f9", borderRadius: "100px", overflow: "hidden" }}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            style={{ 
                              height: "100%", 
                              background: isCompleted 
                                ? "linear-gradient(90deg, #10b981, #059669)" 
                                : "linear-gradient(90deg, #3b82f6, #2563eb)",
                              borderRadius: "100px",
                            }}
                          />
                        </div>
                      </div>

                      {/* Red tracking line for recruiter/TL contribution */}
                      {(role === "recruiter" || role === "tl") && (
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                              {role === "recruiter" ? "My Contribution Tracking" : "My Team Contribution"}
                            </span>
                            <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#ef4444" }}>
                              {contributionJoined} / {target} Joined
                            </span>
                          </div>
                          <div style={{ height: "5px", background: "#f1f5f9", borderRadius: "100px", overflow: "hidden" }}>
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${contributionProgress}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              style={{ 
                                height: "100%", 
                                background: "linear-gradient(90deg, #ef4444, #dc2626)",
                                borderRadius: "100px",
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    {matchedCount > 0 && (
                      <div style={{ marginTop: "12px" }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenMatchedLeads(job.title);
                          }}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            padding: "8px 12px",
                            background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                            border: "1px solid #bfdbfe",
                            borderRadius: "10px",
                            color: "#2563eb",
                            fontWeight: 800,
                            fontSize: "0.78rem",
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.transform = "translateY(-1px)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.1)";
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <LucideUsers size={12} style={{ color: "#2563eb" }} />
                          Matched Lead Candidate's {matchedCount}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div style={{ 
                    borderTop: "1px solid #f1f5f9", 
                    padding: "0.75rem 1.25rem", 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    background: "#fafbfc"
                  }}>
                     <div>
                        <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", display: "block" }}>Compensation Scale</span>
                        <strong style={{ fontSize: "0.85rem", color: "#059669", fontWeight: 800 }}>{job.salaryRange || "Confidential"}</strong>
                     </div>
                     <div style={{ 
                       background: isCompleted ? "#10b981" : "#2563eb", 
                       color: "white", 
                       border: "none", 
                       borderRadius: "8px", 
                       padding: "6px 12px", 
                       fontSize: "0.75rem", 
                       fontWeight: 800, 
                       cursor: "pointer", 
                       transition: "all 0.2s",
                       boxShadow: isCompleted ? "0 4px 10px rgba(16,185,129,0.15)" : "0 4px 10px rgba(37,99,235,0.15)"
                     }}
                     onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                     onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                     >
                       View Pipeline
                     </div>
                  </div>
                </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {view === "view" && selectedJob && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="job-profile-v3" style={{ padding: "0", fontFamily: "'Outfit', 'Inter', sans-serif" }}>
          {/* Top Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button 
                onClick={() => { setView("list"); setSelectedJob(null); }} 
                style={{ 
                  background: "#f1f5f9", 
                  border: "none", 
                  width: "32px", 
                  height: "32px", 
                  borderRadius: "8px", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  cursor: "pointer", 
                  color: "#475569",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#e2e8f0"; e.currentTarget.style.color = "#0f172a"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#475569"; }}
              >
                <LucideChevronLeft size={18} />
              </button>
              <div>
                <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", display: "block" }}>Active Mandates Overview</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1e293b" }}>Mandate Detail View</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
               {role !== "recruiter" && (
                 <button style={{ padding: "6px 12px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", cursor: "pointer", transition: "all 0.15s" }} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "#fff"}>Export Roster</button>
               )}
               {canEdit && (
                 <button onClick={() => startEditing(selectedJob)} style={{ padding: "6px 12px", background: "#2563eb", border: "none", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 700, color: "#fff", cursor: "pointer", boxShadow: "0 4px 10px rgba(37,99,235,0.15)", transition: "all 0.15s" }} onMouseEnter={e => e.currentTarget.style.background = "#1d4ed8"} onMouseLeave={e => e.currentTarget.style.background = "#2563eb"}>Edit Details</button>
               )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "1rem", alignItems: "start" }}>
            {/* Left Column: Mandate Specs Panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {/* Profile Card */}
              <div style={{ background: "white", padding: "1rem", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                 <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", marginBottom: "0.75rem" }}>
                    <LucideBriefcase size={20} />
                 </div>
                 <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", lineHeight: "1.2" }}>{selectedJob.title}</h2>
                 <p style={{ margin: "4px 0 0.75rem", color: "#2563eb", fontWeight: 750, fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "4px" }}>
                    <LucideBuilding2 size={12} /> {selectedJob.client?.name || "Corporate Client"}
                 </p>
                 <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "8px" }}>
                    {selectedJob.isHold && (
                      <span style={{ padding: "2px 6px", background: "#fee2e2", color: "#ef4444", borderRadius: "5px", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", border: "1px solid #fca5a5" }}>
                         HOLDED
                      </span>
                    )}
                    <span style={{ padding: "2px 6px", background: selectedJob.status === 'active' ? "#ecfdf5" : "#f1f5f9", color: selectedJob.status === 'active' ? "#059669" : "#64748b", borderRadius: "5px", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", border: `1px solid ${selectedJob.status === 'active' ? "#a7f3d0" : "#cbd5e1"}` }}>
                       {selectedJob.status === 'active' ? 'Active' : 'Closed'}
                    </span>
                    <span style={{ padding: "2px 6px", background: "#f8fafc", color: "#475569", borderRadius: "5px", fontSize: "0.6rem", fontWeight: 800, border: "1px solid #e2e8f0" }}>{selectedJob.jobType}</span>
                 </div>
              </div>

              {/* Specs Card */}
              <div style={{ background: "white", padding: "1rem", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                 <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #f1f5f9", paddingBottom: "4px" }}>Specifications</h4>
                 <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    <MetaItemV3 label="Openings" val={`${selectedJob.openings || 1} Positions`} icon={<LucideUsers size={12} />} />
                    <MetaItemV3 label="Experience" val={`${selectedJob.minExp || "0"} - ${selectedJob.maxExp || "Any"}`} icon={<LucideUser size={12} />} />
                    <MetaItemV3 label="Qualification" val={selectedJob.qualification} icon={<LucideAward size={12} />} />
                    <MetaItemV3 label="Office Shift" val={`${selectedJob.startTime || "09:00"} - ${selectedJob.endTime || "18:00"}`} icon={<LucideClockIcon size={12} />} />
                    <div style={{ marginTop: "0.25rem", padding: "8px 10px", background: "#ecfdf5", borderRadius: "8px", border: "1px solid #a7f3d0" }}>
                       <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#047857", textTransform: "uppercase", display: "block" }}>Monthly Scale Budget</span>
                       <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "#059669", marginTop: "2px" }}>{selectedJob.salaryRange}</div>
                    </div>
                 </div>
              </div>

              {/* Skills and Requirements Card */}
              <div style={{ background: "white", padding: "1rem", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "1rem" }}>
                 
                 <div>
                   <h4 style={{ margin: "0 0 0.6rem", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Target Core Skills</h4>
                   {selectedJob.skills ? (
                     <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {(selectedJob.skills.split(",") || []).map((s: string, i: number) => s.trim() && (
                           <span key={`s-${i}`} style={{ padding: "3px 6px", background: "#eff6ff", color: "#2563eb", borderRadius: "5px", fontSize: "0.68rem", fontWeight: 700, border: "1px solid #bfdbfe" }}>{s.trim()}</span>
                        ))}
                     </div>
                   ) : <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>No skills specified</span>}
                 </div>

                 {selectedJob.benefits && (
                 <div>
                   <h4 style={{ margin: "0 0 0.6rem", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Job Benefits</h4>
                   <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {(selectedJob.benefits.split(",") || []).map((s: string, i: number) => s.trim() && (
                         <span key={`b-${i}`} style={{ padding: "3px 6px", background: "#f0fdf4", color: "#166534", borderRadius: "5px", fontSize: "0.68rem", fontWeight: 700, border: "1px solid #bbf7d0" }}>{s.trim()}</span>
                      ))}
                   </div>
                 </div>
                 )}

                 {selectedJob.assets && (
                 <div>
                   <h4 style={{ margin: "0 0 0.6rem", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Assets Required</h4>
                   <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {(selectedJob.assets.split(",") || []).map((s: string, i: number) => s.trim() && (
                         <span key={`a-${i}`} style={{ padding: "3px 6px", background: "#fef2f2", color: "#991b1b", borderRadius: "5px", fontSize: "0.68rem", fontWeight: 700, border: "1px solid #fecaca" }}>{s.trim()}</span>
                      ))}
                   </div>
                 </div>
                 )}

                 {selectedJob.documents && (
                 <div>
                   <h4 style={{ margin: "0 0 0.6rem", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Documents Required</h4>
                   <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {(selectedJob.documents.split(",") || []).map((s: string, i: number) => s.trim() && (
                         <span key={`d-${i}`} style={{ padding: "3px 6px", background: "#fffbeb", color: "#92400e", borderRadius: "5px", fontSize: "0.68rem", fontWeight: 700, border: "1px solid #fde68a" }}>{s.trim()}</span>
                      ))}
                   </div>
                 </div>
                 )}
              </div>

              {/* Interview Rounds Card */}
              <div style={{ background: "white", padding: "1rem", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                 <h4 style={{ margin: "0 0 0.6rem", fontSize: "0.7rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Interview Rounds: {selectedJob.interviewRounds || 1}</h4>
                 <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {Array.from({ length: selectedJob.interviewRounds || 1 }).map((_, i) => {
                       const roundNum = i + 1;
                       const fieldName = `round${roundNum}Name` as keyof typeof selectedJob;
                       const roundName = String(selectedJob[fieldName] || `Round ${roundNum}`);
                       return (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: "#334155" }}>
                             <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#e2e8f0", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.6rem" }}>{roundNum}</div>
                             <span style={{ fontWeight: 600 }}>{roundName}</span>
                          </div>
                       );
                    })}
                 </div>
              </div>

              {/* Description Card (Moved here from Right Column) */}
              <div style={{ background: "white", padding: "1rem", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                 <h3 style={{ margin: "0 0 0.75rem", fontSize: "0.78rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <LucideFileText size={14} color="#2563eb" /> Mandate Strategic Brief
                 </h3>
                 <div style={{ color: "#475569", lineHeight: "1.4", whiteSpace: "pre-wrap", fontSize: "0.78rem", background: "#f8fafc", padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                    {selectedJob.description || "No formal strategic outline has been uploaded for this mandate."}
                 </div>
              </div>
            </div>

            {/* Right Column: Performance Pulse & Candidate Roster */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
               {/* Metrics Pulse Grid */}
               <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                     <h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                        <LucideTrendingUp size={15} color="#2563eb" /> Mandate Candidate Funnel
                     </h3>
                     <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        {role === "tl" && (
                          <select
                            value={tlViewFilter}
                            onChange={(e) => setTlViewFilter(e.target.value)}
                            style={{ 
                              padding: "3px 6px", 
                              borderRadius: "6px", 
                              border: "1px solid #cbd5e1", 
                              fontSize: "0.7rem", 
                              fontWeight: 700, 
                              color: "#475569", 
                              background: "#f8fafc", 
                              outline: "none", 
                              cursor: "pointer" 
                            }}
                          >
                            <option value="team">👥 Team Total</option>
                            <option value="personal">👤 My Personal</option>
                            <optgroup label="Recruiters Breakdown">
                              {teamMembers.map(member => (
                                <option key={member.id} value={member.id}>
                                  👤 {member.name}
                                </option>
                              ))}
                            </optgroup>
                          </select>
                        )}
                        {(role === "boss" || role === "manager") && (
                          <select
                            value={tlViewFilter}
                            onChange={(e) => setTlViewFilter(e.target.value)}
                            style={{ 
                              padding: "3px 6px", 
                              borderRadius: "6px", 
                              border: "1px solid #cbd5e1", 
                              fontSize: "0.7rem", 
                              fontWeight: 700, 
                              color: "#475569", 
                              background: "#f8fafc", 
                              outline: "none", 
                              cursor: "pointer" 
                            }}
                          >
                            <option value="all">🌐 Everyone / All</option>
                            {teamMembers.filter(m => m.role === "tl").map(tl => {
                              const recruitersUnderTl = teamMembers.filter(m => m.role === "recruiter" && m.reportingTo === tl.id);
                              return (
                                <optgroup key={tl.id} label={`👑 TL: ${tl.name}`}>
                                  <option value={`team_tl_${tl.id}`}>👥 Whole Team</option>
                                  <option value={`personal_tl_${tl.id}`}>👤 TL Personal</option>
                                  {recruitersUnderTl.map(rec => (
                                    <option key={rec.id} value={`recruiter_${rec.id}`}>📝 Recruiter: {rec.name}</option>
                                  ))}
                                </optgroup>
                              );
                            })}
                            {teamMembers.filter(m => m.role === "recruiter" && !teamMembers.some(tl => tl.role === "tl" && tl.id === m.reportingTo)).length > 0 && (
                              <optgroup label="💼 Direct Recruiters">
                                {teamMembers.filter(m => m.role === "recruiter" && !teamMembers.some(tl => tl.role === "tl" && tl.id === m.reportingTo)).map(rec => (
                                  <option key={rec.id} value={`recruiter_${rec.id}`}>📝 Recruiter: {rec.name}</option>
                                ))}
                              </optgroup>
                            )}
                          </select>
                        )}
                        <select 
                           value={analyticsFilter} 
                           onChange={(e) => setAnalyticsFilter(e.target.value as any)}
                           style={{ padding: "3px 6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.7rem", fontWeight: 700, color: "#475569", background: "#f8fafc", outline: "none", cursor: "pointer" }}
                        >
                           {role === "recruiter" ? (
                             <>
                               <option value="today">Today</option>
                               <option value="7day">7 Day</option>
                               <option value="month">Month</option>
                               <option value="year">Year</option>
                               <option value="custom">Custom</option>
                             </>
                           ) : (
                             <>
                               <option value="7days">7 Days</option>
                               <option value="monthly">30 Days</option>
                               <option value="yearly">Yearly</option>
                             </>
                           )}
                        </select>
                        {role === "recruiter" && analyticsFilter === "custom" && (
                          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                            <input 
                              type="date" 
                              value={customDateRange.start} 
                              onChange={e => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                              style={{ padding: "3px 6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.7rem", fontWeight: 700, color: "#475569", background: "#f8fafc", outline: "none" }}
                            />
                            <span style={{ fontSize: "0.7rem", color: "#64748b" }}>to</span>
                            <input 
                              type="date" 
                              value={customDateRange.end} 
                              onChange={e => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                              style={{ padding: "3px 6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.7rem", fontWeight: 700, color: "#475569", background: "#f8fafc", outline: "none" }}
                            />
                          </div>
                        )}
                        {role !== "recruiter" && (
                          <button onClick={fetchCandidates} style={{ display: "flex", alignItems: "center", gap: "4px", background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", padding: "3px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}>Sync Funnel</button>
                        )}
                     </div>
                  </div>

                  {(() => {
                     const stats = getAnalytics(selectedJob.title);
                     const statusConfig: any = {
                        "Connected": { color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
                        "Interested": { color: "#06b6d4", bg: "#ecfeff", border: "#a5f3fc" },
                        "Processing": { color: "#d97706", bg: "#fffbeb", border: "#fef3c7" },
                        "Selected": { color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0" },
                        "Joined": { color: "#059669", bg: "#f0fdf4", border: "#bbf7d0" },
                        "Dropped": { color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" },
                        "Rejected": { color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
                        "Not Interested": { color: "#e11d48", bg: "#fff1f2", border: "#ffe4e6" },
                        "Interview Done": { color: "#10b981", bg: "#ecfdf5", border: "#6ee7b7" },
                        "Interview Not Done": { color: "#ef4444", bg: "#fef2f2", border: "#fca5a5" },
                        "Processing for Interview": { color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" }
                     };

                     const statuses = ["Connected", "Interested", "Processing", "Selected", "Joined", "Dropped", "Rejected", "Not Interested", "Interview Done", "Interview Not Done", "Processing for Interview"];
                     const activeConfig = statusConfig[selectedAnalyticsStatus] || statusConfig["Connected"];
                     
                     // Roster logic
                     const jobCandidates = visibleCandidates.filter(c => (c.designation || c.jobRole) === selectedJob.title);
                     
                     const hasStatusInHistory = (cand: any, statusKeywords: string[]) => {
                        const kws = statusKeywords.map(k => k.toLowerCase());
                        
                        const currentRemarks = (cand.remarks || "").toLowerCase();
                        const currentStatus = (cand.status || "").toLowerCase();
                        
                        const matchesCurrent = kws.some(kw => 
                          currentRemarks.includes(kw) || currentStatus.includes(kw) || isCandidateMatch(cand, kw)
                        );
                        if (matchesCurrent) return true;
                        
                        return checkCandidateStatusHistory(cand, kws);
                      };

                     const statusKeywordsMap: Record<string, string[]> = {
                       "Connected": ["Connected"],
                       "Interested": ["Interested", "Interview", "Processing", "Process To Joining", "Selected", "Joined"],
                       "Processing": ["Interview", "Processing", "Process To Joining", "Selected", "Joined"],
                       "Selected": ["Selected", "Joined"],
                       "Joined": ["Joined"],
                       "Dropped": ["Dropped"],
                       "Rejected": ["Rejected"],
                       "Not Interested": ["Not Interested", "Call Not Pick"],
                       "Interview Done": ["interview done", "round", "all rounds done", "processing for next round", "selected", "joined", "process to joining", "process for joining", "hired"],
                       "Interview Not Done": ["interview not done"],
                       "Processing for Interview": ["go for interview", "interview scheduled", "processing for interview"]
                     };

                     const matchedCandidates = jobCandidates.filter(c => {
                       if (selectedAnalyticsStatus === "Connected") return true;
                       const kws = statusKeywordsMap[selectedAnalyticsStatus] || [selectedAnalyticsStatus];
                       return hasStatusInHistory(c, kws);
                     });

                     return (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                           {/* 4x2 Grid */}
                           <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                              {statuses.map(statusName => {
                                 const config = statusConfig[statusName];
                                 const toCamel = (s: string) => s.replace(/\s+(.)/g, (_: string, c: string) => c.toUpperCase()).replace(/^./, (c: string) => c.toLowerCase());
                                 const key = toCamel(statusName);
                                 const count = (stats as any)[key] || 0;
                                 const isSelected = selectedAnalyticsStatus === statusName;

                                 return (
                                    <div 
                                       key={statusName}
                                       onClick={() => setSelectedAnalyticsStatus(statusName)}
                                       style={{ 
                                          padding: "8px 10px", 
                                          borderRadius: "10px", 
                                          background: isSelected ? config.bg : "#ffffff", 
                                          border: `1.5px solid ${isSelected ? config.color : "#e2e8f0"}`, 
                                          boxShadow: isSelected ? `0 4px 10px ${config.color}10` : "none",
                                          cursor: "pointer",
                                          transition: "all 0.15s"
                                       }}
                                       onMouseEnter={e => {
                                          if (!isSelected) {
                                             e.currentTarget.style.borderColor = config.color;
                                             e.currentTarget.style.background = `${config.bg}20`;
                                          }
                                       }}
                                       onMouseLeave={e => {
                                          if (!isSelected) {
                                             e.currentTarget.style.borderColor = "#e2e8f0";
                                             e.currentTarget.style.background = "#ffffff";
                                          }
                                       }}
                                    >
                                       <div style={{ fontSize: "0.62rem", fontWeight: 800, color: isSelected ? config.color : "#64748b", textTransform: "uppercase", letterSpacing: "0.3px" }}>{statusName}</div>
                                       <div style={{ display: "flex", alignItems: "baseline", gap: "2px", marginTop: "2px" }}>
                                          <span style={{ fontSize: "1.2rem", fontWeight: 800, color: isSelected ? config.color : "#0f172a", lineHeight: 1 }}>{count}</span>
                                          <span style={{ fontSize: "0.6rem", fontWeight: 600, color: "#94a3b8", marginLeft: "2px" }}>profiles</span>
                                       </div>
                                    </div>
                                 );
                              })}
                           </div>

                           {/* Interactive Synchronized Candidate Table under Funnel Card */}
                           <div style={{ marginTop: "0.5rem", background: "#fafbfc", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "0.75rem" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", borderBottom: "1px solid #e8ecf1", paddingBottom: "6px" }}>
                                 <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: activeConfig.color }} />
                                    <h4 style={{ margin: 0, fontSize: "0.75rem", fontWeight: 800, color: "#1e293b" }}>
                                       Roster: {selectedAnalyticsStatus} candidates ({matchedCandidates.length})
                                    </h4>
                                 </div>
                                 <span style={{ fontSize: "0.62rem", color: "#94a3b8", fontWeight: 700 }}>Realtime Sync</span>
                              </div>

                              {matchedCandidates.length === 0 ? (
                                 <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem 1rem", color: "#94a3b8", background: "#ffffff", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
                                    <LucideUsers size={24} style={{ marginBottom: "6px", opacity: 0.5 }} />
                                    <span style={{ fontSize: "0.72rem", fontWeight: 700 }}>No candidates currently matching this status</span>
                                 </div>
                              ) : (
                                 <div style={{ overflowX: "auto" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.72rem", userSelect: "text", WebkitUserSelect: "text", MozUserSelect: "text", msUserSelect: "text" }}>
                                       <thead>
                                          <tr style={{ borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                                             <th style={{ padding: "6px 8px", color: "#64748b", fontWeight: 800, textTransform: "uppercase", fontSize: "0.6rem" }}>Candidate Name</th>
                                             <th style={{ padding: "6px 8px", color: "#64748b", fontWeight: 800, textTransform: "uppercase", fontSize: "0.6rem" }}>Phone</th>
                                             <th style={{ padding: "6px 8px", color: "#64748b", fontWeight: 800, textTransform: "uppercase", fontSize: "0.6rem" }}>Current Remark</th>
                                             <th style={{ padding: "6px 8px", color: "#64748b", fontWeight: 800, textTransform: "uppercase", fontSize: "0.6rem", textAlign: "right" }}>Log Date</th>
                                          </tr>
                                       </thead>
                                       <tbody>
                                          {matchedCandidates.map((c: any, idx: number) => (
                                             <tr key={c.id || idx} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                                                <td style={{ padding: "8px 8px", fontWeight: 700, color: "#0f172a" }}>{c.name || "Unnamed"}</td>
                                                <td style={{ padding: "8px 8px", color: "#475569", fontFamily: "monospace" }}>{c.phone || "---"}</td>
                                                <td style={{ padding: "8px 8px" }}>
                                                   <div style={{ display: "inline-block", background: activeConfig.bg, color: activeConfig.color, border: `1px solid ${activeConfig.border}`, padding: "2px 6px", borderRadius: "5px", fontSize: "0.65rem", fontWeight: 700 }}>
                                                      {c.remarks || selectedAnalyticsStatus}
                                                   </div>
                                                </td>
                                                <td style={{ padding: "8px 8px", color: "#94a3b8", textAlign: "right", fontSize: "0.65rem" }}>
                                                   {new Date(c.createdAt || Date.now()).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                                                </td>
                                             </tr>
                                          ))}
                                       </tbody>
                                    </table>
                                 </div>
                              )}
                           </div>
                        </div>
                     );
                  })()}
               </div>

               {/* Description Card moved to left column */}
            </div>
          </div>
        </motion.div>
      )}

      <style>{`
        .status-tag-v2.active { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
        .status-tag-v2.closed { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }
      `}</style>
      {view === "jdGen" && (
        <JDGeneratorView 
          jobs={jobs} 
          selectedJob={selectedJob} 
          onSelectJob={setSelectedJob} 
          onBack={() => setView("list")} 
        />
      )}
    </div>
  );
}

// --- JD GENERATOR MODULE ---
function JDGeneratorView({ jobs, selectedJob, onSelectJob, onBack }: any) {
  const [activeTab, setActiveTab] = useState<"prof" | "eng" | "manual">("prof");
  const [profJDs, setProfJDs] = useState<any[]>([]);
  const [engJDs, setEngJDs] = useState<any[]>([]);
  const [jdHistory, setJdHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lockTimeLeft, setLockTimeLeft] = useState<string | null>(null);
  const [manualCount, setManualCount] = useState(0);

  // Daily Fresh JD Logic
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("jd_history") || "[]");
    setJdHistory(history);

    const lockData = JSON.parse(localStorage.getItem("jd_lock_data") || '{"count": 0, "lockUntil": 0}');
    setManualCount(lockData.count);

    if (selectedJob) {
      const today = new Date().toLocaleDateString();
      const jobHistory = history.filter((h: any) => h.jobId === selectedJob.id);
      
      const todaysProf = jobHistory.filter((h: any) => h.date === today && h.category === "prof");
      const todaysEng = jobHistory.filter((h: any) => h.date === today && h.category === "eng");
      
      // If we have very few JDs (less than 5), it means we need to populate the new templates
      if (todaysProf.length >= 5 && todaysEng.length >= 5) {
        setProfJDs(todaysProf);
        setEngJDs(todaysEng);
      } else {
        generateDailyJDs(selectedJob, history);
      }
    }
  }, [selectedJob]);

  // Countdown Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      const lockData = JSON.parse(localStorage.getItem("jd_lock_data") || '{"count": 0, "lockUntil": 0}');
      const now = Date.now();
      
      if (lockData.lockUntil > now) {
        const diff = lockData.lockUntil - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setLockTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        if (lockData.lockUntil !== 0) {
            // Unlock if time passed
            localStorage.setItem("jd_lock_data", JSON.stringify({ count: 0, lockUntil: 0 }));
            setManualCount(0);
        }
        setLockTimeLeft(null);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleManualGenerate = () => {
    if (lockTimeLeft) return;
    if (!selectedJob) return;

    const lockData = JSON.parse(localStorage.getItem("jd_lock_data") || '{"count": 0, "lockUntil": 0}');
    const newCount = lockData.count + 1;
    let newLockUntil = 0;

    if (newCount >= 5) {
      newLockUntil = Date.now() + 6 * 60 * 60 * 1000;
    }

    localStorage.setItem("jd_lock_data", JSON.stringify({ count: newCount, lockUntil: newLockUntil }));
    setManualCount(newCount);

    // Generate 1 Single New JD
    setLoading(true);
    setTimeout(() => {
      const { professional, engaging } = getJDTemplates(selectedJob);
      const isProf = Math.random() > 0.5;
      const tplList = isProf ? professional : engaging;
      const randomTpl = tplList[Math.floor(Math.random() * tplList.length)];
      const today = new Date().toLocaleDateString();
      
      const newJD = {
        id: `jd-manual-${selectedJob.id}-${Date.now()}`,
        jobId: selectedJob.id,
        category: isProf ? "prof" : "eng",
        style: randomTpl.style + " (Custom)",
        content: randomTpl.content,
        date: today,
        timestamp: Date.now()
      };

      if (isProf) setProfJDs(prev => [newJD, ...prev]);
      else setEngJDs(prev => [newJD, ...prev]);
      
      const history = JSON.parse(localStorage.getItem("jd_history") || "[]");
      const updatedHistory = [newJD, ...history];
      localStorage.setItem("jd_history", JSON.stringify(updatedHistory));
      setJdHistory(updatedHistory);
      setLoading(false);
    }, 600);
  };

  const generateDailyJDs = (job: any, history: any[]) => {
    setLoading(true);
    setTimeout(() => {
      const { professional, engaging } = getJDTemplates(job);
      const today = new Date().toLocaleDateString();
      
      // Shuffle helper to vary the order every 24hrs
      const shuffle = (array: any[]) => array.sort(() => Math.random() - 0.5);

      const shuffledProf = shuffle([...professional]);
      const shuffledEng = shuffle([...engaging]);

      const newProf = shuffledProf.map((t: any, i: number) => ({
        id: `jd-prof-${job.id}-${Date.now()}-${i}`,
        jobId: job.id,
        category: "prof",
        style: t.style,
        content: t.content + `\n\n[Daily Verification: ${today}]`, // Dynamic suffix to mark daily uniqueness
        date: today,
        timestamp: Date.now()
      }));

      const newEng = shuffledEng.map((t: any, i: number) => ({
        id: `jd-eng-${job.id}-${Date.now()}-${i}`,
        jobId: job.id,
        category: "eng",
        style: t.style,
        content: t.content + `\n\n[Refined on: ${today}]`, // Dynamic suffix
        date: today,
        timestamp: Date.now()
      }));

      setProfJDs(newProf);
      setEngJDs(newEng);
      
      // HARD REFRESH: Remove old daily JDs for this specific job and date to ensure full 10+10 set
      const otherHistory = history.filter((h: any) => !(h.jobId === job.id && h.date === today && !h.id.startsWith("jd-manual-")));
      const updatedHistory = [...newProf, ...newEng, ...otherHistory];
      
      localStorage.setItem("jd_history", JSON.stringify(updatedHistory));
      setJdHistory(updatedHistory);
      setLoading(false);
    }, 800);
  };

  const getJDTemplates = (job: any) => {
    const { title, minExp, maxExp, salaryRange, city, workLocationType, skills, openings } = job;
    
    return {
      professional: [
        {
          style: "Executive Strategic Mandate",
          content: `🌟 POSITION OVERVIEW: ${title.toUpperCase()} 🌟\n\nOrganization: Confidential / Global Client\nLocation: ${city} (${workLocationType})\nRemuneration: ${salaryRange}\n\nCORE OBJECTIVE:\nWe are spearheading a mission-critical search for a ${title} who will act as a pivotal node in our client's growth architecture. This is not just a job; it's a leadership mandate requiring a blend of strategic vision and tactical execution.\n\nPRIMARY RESPONSIBILITIES:\n• Orchestrate complex workflows within the ${title} domain, ensuring 100% operational efficiency.\n• Leverage deep-domain expertise in ${skills} to drive innovation and team benchmarks.\n• Direct stakeholder management across cross-functional departments.\n• Monitor and optimize departmental health metrics.\n\nTECHNICAL PREREQUISITES:\n• Minimum ${minExp} to ${maxExp} years of verified experience in high-velocity environments.\n• Mastery of ${skills} is an absolute requirement.\n• Proven ability to work in a ${workLocationType} setup with zero supervision.\n\nTHE REWARDS:\n🚀 Direct path to leadership hierarchy.\n💼 Premium compensation package of ${salaryRange}.\n📈 Participation in high-impact global projects.\n\nApply now to redefine the future of this domain.`
        },
        {
          style: "Detailed Corporate Brief",
          content: `OFFICIAL VACANCY: ${title.toUpperCase()}\n\nMandate Details:\n- Role: ${title}\n- Experience: ${minExp} - ${maxExp} Years\n- Location: ${city}\n- Type: ${workLocationType}\n\nABOUT THE OPPORTUNITY:\nOur client, a Tier-1 organization, is looking for a ${title} with a track record of excellence. The role demands a professional who understands the nuances of ${title} operations and can deliver high-quality outcomes consistently.\n\nKEY ACCOUNTABILITIES:\n1. Technical Leadership: Own the ${title} lifecycle from ideation to delivery.\n2. Skill Mastery: Apply advanced ${skills} methodologies to solve complex problems.\n3. Team Synergy: Collaborate with internal and external stakeholders to maintain workflow integrity.\n\nREQUIREMENTS:\n- Graduate/Post-Graduate background with ${minExp}+ years of relevant history.\n- Expertise in ${skills} is mandatory.\n- Strong communication and analytical skills.\n\nPACKAGE: ${salaryRange} + Benefits\n\nQualified candidates are invited to submit their credentials for a 3-stage neural evaluation.`
        },
        {
          style: "Senior Operations Framework",
          content: `MANDATE SPECIFICATION: ${title.toUpperCase()}\n\nPOSITION SUMMARY:\nWe are seeking a senior-level ${title} to oversee critical operations in ${city}. This role is central to the organization's regional success and requires a high degree of technical proficiency in ${skills}.\n\nCORE RESPONSIBILITIES:\n- Management of ${title} lifecycles and resource allocation.\n- Strategic implementation of ${skills} across multiple project nodes.\n- Developing standard operating procedures for the ${title} department.\n- Regular reporting to the executive committee on KPIs and operational health.\n\nCANDIDATE QUALIFICATIONS:\n- Extensive experience (${minExp}-${maxExp} years) in ${title} management.\n- Proven track record of handling ${openings} or more simultaneous projects.\n- Deep understanding of market trends in ${city}.\n\nREWARDS & RECOGNITION:\n- Annual/Monthly Compensation: ${salaryRange}.\n- Comprehensive health and wellness benefits.\n- Accelerated career path for top performers.`
        },
        {
          style: "Tier-1 Enterprise Search",
          content: `GLOBAL TALENT REQUISITION\nRole: ${title} | Location: ${city}\n\nOur client, a leading global enterprise, is expanding its ${title} division. We are looking for an expert in ${skills} to lead this expansion and ensure global standards are met.\n\nEXPECTATIONS:\n1. Lead the ${title} strategy for the ${city} region.\n2. Implement ${skills} driven solutions for complex business challenges.\n3. Manage a high-performance team to achieve monthly and quarterly targets.\n\nPROFESSIONAL BACKGROUND:\n- ${minExp} to ${maxExp} years of relevant industry experience.\n- Expertise in ${skills} is essential for this role.\n- Ability to thrive in a ${workLocationType} work environment.\n\nOFFER DETAILS:\n- Package: ${salaryRange}\n- Location: ${city}\n- Setup: ${workLocationType}\n\nInterested professionals may apply with their detailed dossier.`
        },
        {
          style: "Institutional Growth Mandate",
          content: `STRATEGIC HIRE: ${title.toUpperCase()}\n\nAs our client enters a phase of rapid institutional growth, we are looking for a ${title} to anchor their ${title} operations in ${city}. This role is designed for a professional who thrives on building scalable systems.\n\nKEY TASKS:\n• Designing and executing ${title} frameworks using ${skills}.\n• Overseeing the development of junior talent within the department.\n• Ensuring all ${title} activities align with the company's 5-year growth plan.\n\nIDEAL PROFILE:\n• ${minExp}+ years of experience in a similar growth-oriented role.\n• Mastery of ${skills}.\n• Resident of or willing to relocate to ${city}.\n\nCOMPENSATION:\n${salaryRange} + Performance Bonuses.`
        },
        {
          style: "Premium Retained Search",
          content: `CONFIDENTIAL SEARCH: ${title.toUpperCase()}\n\nWe have been retained by a premium brand to identify a ${title} for their ${city} headquarters. This is a high-visibility role with significant decision-making power.\n\nCORE FOCUS:\n- Elevating the ${title} standards across the organization.\n- Utilizing ${skills} to create a competitive advantage in the market.\n- Strategic alignment of ${title} goals with global business objectives.\n\nREQUIREMENTS:\n- Exceptional professional standing with ${minExp}-${maxExp} years of experience.\n- Expert-level knowledge in ${skills}.\n- Strong leadership presence and communication skills.\n\nREWARDS:\n- Competitive salary of ${salaryRange}.\n- Equity/Profit-sharing options.\n- Direct reporting to the Board.`
        },
        {
          style: "Strategic Engineering Lead",
          content: `TECHNICAL MANDATE: ${title.toUpperCase()}\n\nWe are looking for a technical powerhouse to join our client's ${title} team as a Lead. The role focuses on the architecture and execution of high-end ${title} solutions.\n\nRESPONSIBILITIES:\n1. Architecting ${title} solutions using ${skills}.\n2. Leading a team of developers/specialists in ${city}.\n3. Maintaining code/workflow quality and ensuring best practices.\n\nQUALIFICATIONS:\n- ${minExp} to ${maxExp} years of hardcore technical experience.\n- Advanced proficiency in ${skills}.\n- Experience in ${workLocationType} environments.\n\nPACKAGE: ${salaryRange}\n\nApply now to lead technical excellence.`
        },
        {
          style: "Global Talent Requisition",
          content: `MANDATE BRIEF: ${title.toUpperCase()}\n\nPosition: ${title}\nLocation: ${city}\nExperience: ${minExp} - ${maxExp} Years\n\nOVERVIEW:\nOur client is a global leader looking for a ${title} to join their international team. The role offers the opportunity to work on large-scale projects and collaborate with experts from around the world.\n\nREQUIREMENTS:\n- Deep understanding of ${skills}.\n- Ability to work across different time zones in a ${workLocationType} setup.\n- Excellent problem-solving and analytical skills.\n\nOFFER:\n- Competitive salary of ${salaryRange}.\n- International exposure and growth opportunities.`
        },
        {
          style: "Leadership Blueprint",
          content: `LEADERSHIP ROLE: ${title.toUpperCase()}\n\nWe are looking for a ${title} who can define the future of our client's ${title} department. This is a role for a leader who is also a doer.\n\nKEY DELIVERABLES:\n- A 12-month roadmap for ${title} excellence.\n- Implementation of ${skills} across all departmental nodes.\n- Achievement of key growth targets in ${city}.\n\nCANDIDATE PROFILE:\n- ${minExp}+ years of leadership experience.\n- Expert in ${skills}.\n- Strong vision for the ${title} industry.\n\nREWARDS: ${salaryRange} + Executive Perks.`
        },
        {
          style: "Core Performance Mandate",
          content: `PERFORMANCE SEARCH: ${title.toUpperCase()}\n\nOur client is looking for a result-oriented ${title} to drive performance in their ${city} branch. The role is focused on high-speed delivery and quality control.\n\nTASKS:\n- Managing the daily ${title} operations.\n- Ensuring ${skills} are utilized for maximum efficiency.\n- Meeting strict deadlines and quality benchmarks.\n\nREQUIREMENTS:\n- ${minExp}-${maxExp} years of high-pressure experience.\n- Mastery of ${skills}.\n\nSALARY: ${salaryRange}.`
        }
      ],
      engaging: [
        {
          style: "Hook-Driven Storytelling",
          content: `Stop scrolling. Let's talk about your career. 🛑\n\nIf you've been waiting for a sign to make your next big move as a ${title}, this is it. We're looking for a rockstar in ${city} who knows ${skills} like the back of their hand.\n\nImagine this: You wake up, work on projects that actually matter, get paid ${salaryRange}, and grow faster than you ever thought possible.\n\nWhy us?\n✨ No boring bureaucracy.\n✨ High-impact ${title} tasks.\n✨ Work from ${city} or ${workLocationType}.\n\nRequirements? Just ${minExp}-${maxExp} years of experience and a passion for ${skills}.\n\nReady to change the game? Apply now. 🚀`
        },
        {
          style: "Short-Burst Attention Grabber",
          content: `We need a ${title}. You need a growth-first role. Match? 🤝\n\nLocation: ${city}\nSalary: ${salaryRange}\nSkills: ${skills}\n\nWe don't care about fancy degrees. We care about what you can build. If you have ${minExp}+ years in the trenches and eat ${skills} for breakfast, let's talk about your future.\n\nDM me or apply below! ⚡\n\n#Hiring #Jobs #${title.replace(/\s+/g, '')}`
        },
        {
          style: "Question-First Hook",
          content: `Do you want to build the future of ${title}? 🏗️\n\nWe're searching for an elite ${title} in ${city}. \n\nPackage: ${salaryRange}\nExperience: ${minExp}-${maxExp} Years\nCore Skill: ${skills}\n\nIf you're tired of the same old corporate grind and want a ${workLocationType} role where your expertise in ${skills} is actually valued, we want YOU.\n\nLet's chat! ☕`
        },
        {
          style: "Day in the Life Narrative",
          content: `What does a Tuesday look like for our ${title}? ☕\n\nFirst, you're architecting ${title} strategies. Then, you're using ${skills} to solve a problem no one else could. Finally, you're wrapping up a high-impact day in ${city} knowing you're getting paid ${salaryRange} for your genius.\n\nSound like a dream? It's our reality.\n\nIf you have ${minExp}-${maxExp} years of experience and a love for ${skills}, come live the dream with us.\n\nApply today! 🌟`
        },
        {
          style: "Why Join Us Listicle",
          content: `5 Reasons to join us as our next ${title}: 📝\n\n1. You'll lead ${title} operations in ${city}.\n2. You'll master ${skills} with a world-class team.\n3. You'll earn ${salaryRange} + bonuses.\n4. You'll work in a flexible ${workLocationType} setup.\n5. You'll actually enjoy coming to work.\n\nGot ${minExp}+ years of experience? Let's make it happen.\n\n#CareerGrowth #Hiring #Jobs`
        },
        {
          style: "The Rockstar Call",
          content: `Are you a ${title} Rockstar? 🎸\n\nWe are looking for a high-energy ${title} to join our band in ${city}. If you can shred ${skills} and have ${minExp}-${maxExp} years of experience, we have a stage for you.\n\nSalary: ${salaryRange}\nVenue: ${city} / ${workLocationType}\n\nApply now and let's make some noise! 🤘`
        },
        {
          style: "Career Transformation Pitch",
          content: `Go from ${title} to Legend. 🏆\n\nWe don't just want a ${title}; we want a future industry leader. Join us in ${city} and use ${skills} to transform how we work.\n\nWe offer ${salaryRange}, ${workLocationType} flexibility, and a path to the top. All we need is ${minExp}+ years of your expertise.\n\nReady for the transformation? Apply now. ✨`
        },
        {
          style: "The Future Builder Invite",
          content: `Help us build the next big thing in ${city}. 🛠️\n\nWe're hiring a ${title} who is obsessed with ${skills}. If you have ${minExp}-${maxExp} years of experience and want to leave a legacy, this is the role for you.\n\nSalary: ${salaryRange}\nSetup: ${workLocationType}\n\nLet's build together. 🤝`
        },
        {
          style: "Rocketship Alert",
          content: `🚀 WE ARE HITTING ORBIT - JOIN THE CREW! 🚀\n\nWe need a ${title} to help us scale in ${city}. If you have ${minExp}+ years of experience and mastery in ${skills}, your seat is waiting.\n\nFuel: ${salaryRange}\nOrbit: ${city} / ${workLocationType}\n\nDon't miss the launch. Apply today! ☄️`
        },
        {
          style: "The Impact Challenge",
          content: `Can you handle the impact? 💥\n\nWe're looking for a ${title} who can take our ${title} operations in ${city} to the next level. If you have ${minExp}-${maxExp} years of experience and are an expert in ${skills}, we have a challenge for you.\n\nReward: ${salaryRange}\nEnvironment: ${workLocationType}\n\nAre you up for it? 🥊`
        }
      ]
    };
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1.5rem", height: "calc(100vh - 140px)", overflow: "hidden", paddingBottom: "2rem" }}>
      {/* Sidebar: Job Selector */}
      <div style={{ background: "white", borderRadius: "24px", border: "1.5px solid #f1f5f9", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", overflow: "hidden", height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
          <button onClick={onBack} style={{ background: "#f8fafc", border: "none", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <LucideChevronLeft size={18} />
          </button>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900 }}>Select Mandate</h3>
        </div>
        
        <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", paddingRight: "4px" }}>
          {jobs.map((job: any) => (
            <div 
              key={job.id} 
              onClick={() => onSelectJob(job)}
              style={{ 
                padding: "12px 16px", 
                borderRadius: "14px", 
                border: "1.5px solid", 
                borderColor: selectedJob?.id === job.id ? "#2563eb" : "#f1f5f9",
                background: selectedJob?.id === job.id ? "#eff6ff" : "white",
                cursor: "pointer",
                transition: "0.2s"
              }}
            >
              <div style={{ fontSize: "0.85rem", fontWeight: 800, color: selectedJob?.id === job.id ? "#2563eb" : "#1e293b" }}>{job.title}</div>
              <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "4px" }}>{job.client?.name || "Global Client"} • {job.city}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content: JD Results */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", overflow: "hidden" }}>
         <div style={{ background: "white", padding: "1rem 1.5rem", borderRadius: "24px", border: "1.5px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "nowrap" }}>
            <div style={{ display: "flex", gap: "1.25rem", flexShrink: 0 }}>
               <div 
                 onClick={() => setActiveTab("prof")}
                 style={{ cursor: "pointer", position: "relative", padding: "8px 0", whiteSpace: "nowrap" }}
               >
                  <span style={{ fontSize: "0.95rem", fontWeight: 800, color: activeTab === "prof" ? "#2563eb" : "#64748b" }}>Professional JD</span>
                  {activeTab === "prof" && <motion.div layoutId="tab-underline" style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: "#2563eb", borderRadius: "10px" }} />}
               </div>
               <div 
                 onClick={() => setActiveTab("eng")}
                 style={{ cursor: "pointer", position: "relative", padding: "8px 0", whiteSpace: "nowrap" }}
               >
                  <span style={{ fontSize: "0.95rem", fontWeight: 800, color: activeTab === "eng" ? "#2563eb" : "#64748b" }}>Engaging JD</span>
                  {activeTab === "eng" && <motion.div layoutId="tab-underline" style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: "#2563eb", borderRadius: "10px" }} />}
               </div>
               <div 
                 onClick={() => setActiveTab("manual")}
                 style={{ cursor: "pointer", position: "relative", padding: "8px 0", whiteSpace: "nowrap" }}
               >
                  <span style={{ fontSize: "0.95rem", fontWeight: 800, color: activeTab === "manual" ? "#2563eb" : "#64748b" }}>Generated Archive</span>
                  {activeTab === "manual" && <motion.div layoutId="tab-underline" style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: "#2563eb", borderRadius: "10px" }} />}
               </div>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0, whiteSpace: "nowrap" }}>
               {selectedJob && (
                 <button 
                   onClick={handleManualGenerate}
                   disabled={!!lockTimeLeft}
                   style={{ 
                     padding: "10px 18px", 
                     borderRadius: "12px", 
                     border: "none", 
                     background: lockTimeLeft ? "#f1f5f9" : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", 
                     color: lockTimeLeft ? "#94a3b8" : "white", 
                     fontSize: "0.82rem", 
                     fontWeight: 800, 
                     cursor: lockTimeLeft ? "not-allowed" : "pointer",
                     display: "flex",
                     alignItems: "center",
                     gap: "6px",
                     boxShadow: lockTimeLeft ? "none" : "0 4px 12px rgba(37,99,235,0.2)",
                     whiteSpace: "nowrap"
                   }}
                 >
                    {lockTimeLeft ? (
                      <>
                         <LucideClockIcon size={16} /> {lockTimeLeft}
                      </>
                    ) : (
                      <>
                         <LucideSparkles size={16} /> Generate New JD ({5 - manualCount} left)
                      </>
                    )}
                 </button>
               )}
               <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#94a3b8", fontSize: "0.78rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                 <LucideSparkles size={14} color="#f59e0b" />
                 AI Powered Intelligence
               </div>
            </div>
         </div>

        {!selectedJob ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "white", borderRadius: "24px", border: "1.5px dashed #e2e8f0", color: "#94a3b8" }}>
             <LucideFileText size={60} style={{ marginBottom: "1rem", opacity: 0.2 }} />
             <p style={{ fontWeight: 800 }}>Please select a job from the left to generate descriptions</p>
          </div>
        ) : loading ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "white", borderRadius: "24px", border: "1.5px solid #f1f5f9" }}>
             <LucideLoader2 size={40} className="animate-spin" color="#2563eb" />
             <p style={{ fontWeight: 800, marginTop: "1rem", color: "#64748b" }}>Analyzing mandate requirements...</p>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: "auto", paddingRight: "8px", paddingBottom: "2rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: "1.5rem" }}>
              {(() => {
                let list = [];
                if (activeTab === "prof") list = profJDs;
                else if (activeTab === "eng") list = engJDs;
                else if (activeTab === "manual") list = jdHistory.filter((h: any) => h.jobId === selectedJob.id && h.id.startsWith("jd-manual-"));
                
                return list.length > 0 ? list.map((jd: any) => (
                  <JDCard key={jd.id} jd={jd} />
                )) : (
                  <div style={{ gridColumn: "1 / -1", padding: "4rem", textAlign: "center", background: "#f8fafc", borderRadius: "20px", border: "1.5px dashed #e2e8f0", color: "#94a3b8" }}>
                    <LucideHistory size={40} style={{ marginBottom: "1rem", opacity: 0.3 }} />
                    <p style={{ fontWeight: 800 }}>No descriptions found in this category.</p>
                  </div>
                );
              })()}
            </div>
            <div style={{ height: "40px" }}></div>
          </div>
        )}
      </div>
    </div>
  );
}

function JDCard({ jd }: any) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(jd.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      layout
      style={{ 
        background: "white", 
        borderRadius: "20px", 
        border: "1.5px solid #f1f5f9", 
        padding: "1.5rem",
        boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
        display: "flex",
        flexDirection: "column",
        gap: "1rem"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "0.7rem", fontWeight: 900, color: "#2563eb", textTransform: "uppercase", letterSpacing: "1px" }}>{jd.style}</div>
          <div style={{ fontSize: "0.95rem", fontWeight: 850, color: "#1e293b", marginTop: "4px" }}>LinkedIn-Ready Posting</div>
        </div>
        <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 700 }}>{jd.date}</div>
      </div>

      <div style={{ 
        background: "#f8fafc", 
        padding: "1rem", 
        borderRadius: "14px", 
        fontSize: "0.85rem", 
        color: "#475569", 
        lineHeight: "1.5",
        whiteSpace: "pre-wrap",
        maxHeight: expanded ? "none" : "200px",
        overflow: "hidden",
        position: "relative"
      }}>
        {jd.content}
        {!expanded && jd.content.length > 200 && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60px", background: "linear-gradient(transparent, #f8fafc)", pointerEvents: "none" }} />
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {jd.content.length > 200 && (
          <button 
            onClick={() => setExpanded(!expanded)}
            style={{ background: "none", border: "none", color: "#2563eb", fontSize: "0.8rem", fontWeight: 800, cursor: "pointer" }}
          >
            {expanded ? "Read Less" : "Read More..."}
          </button>
        )}
        <div style={{ display: "flex", gap: "10px", marginLeft: "auto" }}>
           <button 
            onClick={handleCopy}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "6px", 
              padding: "8px 16px", 
              borderRadius: "10px", 
              border: "1.5px solid #e2e8f0", 
              background: copied ? "#f0fdf4" : "white",
              color: copied ? "#16a34a" : "#475569",
              fontSize: "0.8rem",
              fontWeight: 800,
              cursor: "pointer",
              transition: "0.2s"
            }}
           >
             {copied ? <LucideCheckCircle2 size={14} /> : <LucideCopy size={14} />}
             {copied ? "Copied!" : "Copy JD"}
           </button>
           <button 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "10px", 
              border: "1.5px solid #e2e8f0", 
              background: "white",
              color: "#475569",
              cursor: "pointer"
            }}
           >
             <LucideShare2 size={16} />
           </button>
        </div>
      </div>
    </motion.div>
  );
}

function MetaItemV3({ label, val, icon }: any) {
  return (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span style={{ color: "#94a3b8", display: "flex" }}>{icon}</span>
      <span style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 700 }}>{label}</span>
    </div>
    <span style={{ fontWeight: 800, color: "#1e293b", fontSize: "0.85rem" }}>{val || "---"}</span>
  </div>
  );
}
