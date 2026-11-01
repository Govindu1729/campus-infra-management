// prisma/fic-seed-data.ts
// IIT Gandhinagar — Faculty In-Charge Contact Database
// Hybrid Role Model: Hierarchical Position × Operational Scope

export interface FicEntry {
  officialTitle: string
  primaryEmail: string
  secondaryEmail?: string
  systemRole: 'SUPER_ADMIN' | 'DEAN_ADMIN' | 'ASSOCIATE_DEAN' | 'COMMITTEE_CHAIR' | 'FIC_COORDINATOR' | 'CO_COORDINATOR' | 'HOD'
  category: 'ACADEMIC' | 'STUDENT_WELFARE' | 'INFRASTRUCTURE' | 'RESEARCH_ADVANCEMENT'
  parentTitle?: string // Links secondary contacts to their primary
}

export const ficContacts: FicEntry[] = [
  // ============================================================
  // GOVERNANCE — Super Admin
  // ============================================================
  {
    officialTitle: 'Director, IIT Gandhinagar',
    primaryEmail: 'director@iitgn.ac.in',
    systemRole: 'SUPER_ADMIN',
    category: 'ACADEMIC',
  },
  {
    officialTitle: 'Deputy Director',
    primaryEmail: 'deputy.director@iitgn.ac.in',
    systemRole: 'DEAN_ADMIN',
    category: 'ACADEMIC',
  },

  // ============================================================
  // DEAN / ADMIN LEVEL
  // ============================================================
  {
    officialTitle: 'Dean, Academic Affairs',
    primaryEmail: 'dean.academic@iitgn.ac.in',
    systemRole: 'DEAN_ADMIN',
    category: 'ACADEMIC',
  },
  {
    officialTitle: 'Dean, Student Affairs',
    primaryEmail: 'dean.student@iitgn.ac.in',
    systemRole: 'DEAN_ADMIN',
    category: 'STUDENT_WELFARE',
  },
  {
    officialTitle: 'Dean, General Administration & Registrar-in-charge',
    primaryEmail: 'dean.admin@iitgn.ac.in',
    systemRole: 'DEAN_ADMIN',
    category: 'INFRASTRUCTURE',
  },
  {
    officialTitle: 'Dean, Research and Development',
    primaryEmail: 'dean.research@iitgn.ac.in',
    systemRole: 'DEAN_ADMIN',
    category: 'RESEARCH_ADVANCEMENT',
  },
  {
    officialTitle: 'Dean, Campus Development',
    primaryEmail: 'dean.campus@iitgn.ac.in',
    systemRole: 'DEAN_ADMIN',
    category: 'INFRASTRUCTURE',
  },
  {
    officialTitle: 'Dean, Faculty Affairs',
    primaryEmail: 'dean.faculty@iitgn.ac.in',
    systemRole: 'DEAN_ADMIN',
    category: 'ACADEMIC',
  },
  {
    officialTitle: 'Dean, Institutional Advancement',
    primaryEmail: 'dean.advancement@iitgn.ac.in',
    systemRole: 'DEAN_ADMIN',
    category: 'RESEARCH_ADVANCEMENT',
  },
  {
    officialTitle: 'Dean, External Relations',
    primaryEmail: 'dean.external@iitgn.ac.in',
    systemRole: 'DEAN_ADMIN',
    category: 'RESEARCH_ADVANCEMENT',
  },

  // ============================================================
  // ASSOCIATE DEANS
  // ============================================================
  {
    officialTitle: 'Associate Dean Academics (UG)',
    primaryEmail: 'assoc.dean.ug@iitgn.ac.in',
    systemRole: 'ASSOCIATE_DEAN',
    category: 'ACADEMIC',
  },
  {
    officialTitle: 'Associate Dean Academics (PG)',
    primaryEmail: 'assoc.dean.pg@iitgn.ac.in',
    systemRole: 'ASSOCIATE_DEAN',
    category: 'ACADEMIC',
  },
  {
    officialTitle: 'Associate Dean, Student Welfare',
    primaryEmail: 'assoc.dean.welfare@iitgn.ac.in',
    systemRole: 'ASSOCIATE_DEAN',
    category: 'STUDENT_WELFARE',
  },
  {
    officialTitle: 'Associate Dean, Student Development',
    primaryEmail: 'assoc.dean.development@iitgn.ac.in',
    systemRole: 'ASSOCIATE_DEAN',
    category: 'STUDENT_WELFARE',
  },
  {
    officialTitle: 'Associate Dean, General Administration',
    primaryEmail: 'assoc.dean.admin@iitgn.ac.in',
    systemRole: 'ASSOCIATE_DEAN',
    category: 'INFRASTRUCTURE',
  },
  {
    officialTitle: 'Associate Dean, External Projects',
    primaryEmail: 'assoc.dean.projects@iitgn.ac.in',
    systemRole: 'ASSOCIATE_DEAN',
    category: 'RESEARCH_ADVANCEMENT',
  },
  {
    officialTitle: 'Associate Dean, Campus and Space Management',
    primaryEmail: 'assoc.dean.space@iitgn.ac.in',
    systemRole: 'ASSOCIATE_DEAN',
    category: 'INFRASTRUCTURE',
  },
  {
    officialTitle: 'Associate Dean, Faculty Relations',
    primaryEmail: 'assoc.dean.faculty.relations@iitgn.ac.in',
    systemRole: 'ASSOCIATE_DEAN',
    category: 'ACADEMIC',
  },
  {
    officialTitle: 'Associate Dean, Faculty Outreach and Recruitment',
    primaryEmail: 'assoc.dean.faculty.outreach@iitgn.ac.in',
    systemRole: 'ASSOCIATE_DEAN',
    category: 'ACADEMIC',
  },
  {
    officialTitle: 'Associate Dean, Institutional Engagements',
    primaryEmail: 'assoc.dean.engagements@iitgn.ac.in',
    systemRole: 'ASSOCIATE_DEAN',
    category: 'RESEARCH_ADVANCEMENT',
  },

  // ============================================================
  // STUDENT WELFARE — FIC / Coordinators
  // ============================================================
  {
    officialTitle: 'Faculty in-charge, Counseling Service',
    primaryEmail: 'counseling@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'STUDENT_WELFARE',
  },
  {
    officialTitle: 'Faculty in-charge, Medical Centre',
    primaryEmail: 'medical@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'STUDENT_WELFARE',
  },
  {
    officialTitle: 'Faculty in-charge, Sports',
    primaryEmail: 'sports@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'STUDENT_WELFARE',
  },
  {
    officialTitle: 'Faculty in-charge, Nyasa',
    primaryEmail: 'nyasa@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'STUDENT_WELFARE',
  },
  {
    officialTitle: 'Faculty in-charge, NEEV',
    primaryEmail: 'neev@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'STUDENT_WELFARE',
  },
  {
    officialTitle: 'Faculty in-charge, Student Wellbeing Initiative',
    primaryEmail: 'wellbeing@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'STUDENT_WELFARE',
  },
  {
    officialTitle: 'Faculty in-charge, LDI',
    primaryEmail: 'ldi@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'STUDENT_WELFARE',
  },
  {
    officialTitle: 'Chair, Career Development Services (CDS) Committee',
    primaryEmail: 'cds@iitgn.ac.in',
    systemRole: 'COMMITTEE_CHAIR',
    category: 'STUDENT_WELFARE',
  },
  {
    officialTitle: 'Chair, CHARMS (Holistic Association and Relationship Management)',
    primaryEmail: 'charms@iitgn.ac.in',
    systemRole: 'COMMITTEE_CHAIR',
    category: 'STUDENT_WELFARE',
  },
  {
    officialTitle: 'Chair, Day Care Committee',
    primaryEmail: 'daycare@iitgn.ac.in',
    systemRole: 'COMMITTEE_CHAIR',
    category: 'STUDENT_WELFARE',
  },
  {
    officialTitle: 'Chair, Internal Complaints Committee (ICC)',
    primaryEmail: 'icc@iitgn.ac.in',
    systemRole: 'COMMITTEE_CHAIR',
    category: 'STUDENT_WELFARE',
  },
  {
    officialTitle: 'Faculty in-charge, GPS and PAL',
    primaryEmail: 'gps.pal@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'STUDENT_WELFARE',
  },

  // ============================================================
  // INFRASTRUCTURE — FIC / Coordinators
  // ============================================================
  {
    officialTitle: 'In-charge, ISTF (Primary)',
    primaryEmail: 'istf@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'INFRASTRUCTURE',
  },
  {
    officialTitle: 'In-charge, ISTF (Secondary)',
    primaryEmail: 'istf.secondary@iitgn.ac.in',
    systemRole: 'CO_COORDINATOR',
    category: 'INFRASTRUCTURE',
    parentTitle: 'In-charge, ISTF (Primary)',
  },
  {
    officialTitle: 'Faculty in-charge, Central Instrumentation Facility (CIF)',
    primaryEmail: 'cif@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'INFRASTRUCTURE',
  },
  {
    officialTitle: 'Faculty in-charge, CEMC (Commercial Establishment Management)',
    primaryEmail: 'cemc@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'INFRASTRUCTURE',
  },
  {
    officialTitle: 'Faculty in-charge, Hospitality',
    primaryEmail: 'hospitality@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'INFRASTRUCTURE',
  },
  {
    officialTitle: 'Chair, House Allotment Committee (HAC)',
    primaryEmail: 'hac@iitgn.ac.in',
    systemRole: 'COMMITTEE_CHAIR',
    category: 'INFRASTRUCTURE',
  },
  {
    officialTitle: 'Chair, Green Campus Committee',
    primaryEmail: 'green.campus@iitgn.ac.in',
    systemRole: 'COMMITTEE_CHAIR',
    category: 'INFRASTRUCTURE',
  },
  {
    officialTitle: 'Chair, Housing Management Committee (HMC)',
    primaryEmail: 'hmc@iitgn.ac.in',
    systemRole: 'COMMITTEE_CHAIR',
    category: 'INFRASTRUCTURE',
  },
  {
    officialTitle: 'Chair, Animal Management Committee',
    primaryEmail: 'animal.management@iitgn.ac.in',
    systemRole: 'COMMITTEE_CHAIR',
    category: 'INFRASTRUCTURE',
  },
  {
    officialTitle: 'Convenor, Campus Safety Committee',
    primaryEmail: 'campus.safety@iitgn.ac.in',
    systemRole: 'COMMITTEE_CHAIR',
    category: 'INFRASTRUCTURE',
  },

  // ============================================================
  // ACADEMIC — FIC / Coordinators
  // ============================================================
  {
    officialTitle: 'JEE Chairman',
    primaryEmail: 'jee@iitgn.ac.in',
    systemRole: 'COMMITTEE_CHAIR',
    category: 'ACADEMIC',
  },
  {
    officialTitle: 'JAM and GATE Chairman',
    primaryEmail: 'jam.gate@iitgn.ac.in',
    systemRole: 'COMMITTEE_CHAIR',
    category: 'ACADEMIC',
  },
  {
    officialTitle: 'Chair, Senate Library Committee (SLC)',
    primaryEmail: 'library@iitgn.ac.in',
    systemRole: 'COMMITTEE_CHAIR',
    category: 'ACADEMIC',
  },
  {
    officialTitle: 'Institute Ombudsman',
    primaryEmail: 'ombudsman@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'ACADEMIC',
  },
  {
    officialTitle: 'Faculty in-charge, Time Table',
    primaryEmail: 'timetable@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'ACADEMIC',
  },
  {
    officialTitle: 'Faculty in-charge, Class Rooms and Short-term courses',
    primaryEmail: 'classrooms@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'ACADEMIC',
  },
  {
    officialTitle: 'Faculty in-charge, PMRF',
    primaryEmail: 'pmrf@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'ACADEMIC',
  },
  {
    officialTitle: 'Faculty in-charge, Writing Studio',
    primaryEmail: 'writing.studio@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'ACADEMIC',
  },
  {
    officialTitle: 'Faculty in-charge, Scientific Writing Certification',
    primaryEmail: 'scientific.writing@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'ACADEMIC',
  },
  {
    officialTitle: 'Faculty in-charge, PRL Program',
    primaryEmail: 'prl@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'ACADEMIC',
  },
  {
    officialTitle: 'Faculty in-charge, Management Minor',
    primaryEmail: 'management.minor@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'ACADEMIC',
  },
  {
    officialTitle: 'Faculty in-charge, IITGNX',
    primaryEmail: 'iitgnx@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'ACADEMIC',
  },

  // ============================================================
  // RESEARCH & ADVANCEMENT — FIC / Coordinators
  // ============================================================
  {
    officialTitle: 'Faculty in-charge, Alumni Relations',
    primaryEmail: 'alumni@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'RESEARCH_ADVANCEMENT',
  },
  {
    officialTitle: 'Faculty in-charge, Grant Opportunity (Primary)',
    primaryEmail: 'grants@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'RESEARCH_ADVANCEMENT',
  },
  {
    officialTitle: 'Faculty in-charge, Grant Opportunity (Secondary)',
    primaryEmail: 'grants.secondary@iitgn.ac.in',
    systemRole: 'CO_COORDINATOR',
    category: 'RESEARCH_ADVANCEMENT',
    parentTitle: 'Faculty in-charge, Grant Opportunity (Primary)',
  },
  {
    officialTitle: 'Faculty in-charge, Industry Connect (Primary)',
    primaryEmail: 'industry@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'RESEARCH_ADVANCEMENT',
  },
  {
    officialTitle: 'Faculty in-charge, Industry Connect (Secondary)',
    primaryEmail: 'industry.secondary@iitgn.ac.in',
    systemRole: 'CO_COORDINATOR',
    category: 'RESEARCH_ADVANCEMENT',
    parentTitle: 'Faculty in-charge, Industry Connect (Primary)',
  },
  {
    officialTitle: 'Faculty in-charge, External Fellowship and Entrepreneurship',
    primaryEmail: 'fellowship@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'RESEARCH_ADVANCEMENT',
  },
  {
    officialTitle: 'Faculty in-charge, International Relations',
    primaryEmail: 'international@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'RESEARCH_ADVANCEMENT',
  },
  {
    officialTitle: 'Chair, Media and Communication',
    primaryEmail: 'media@iitgn.ac.in',
    systemRole: 'COMMITTEE_CHAIR',
    category: 'RESEARCH_ADVANCEMENT',
  },
  {
    officialTitle: 'Faculty in-charge, R&D Communications',
    primaryEmail: 'rd.comm@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'RESEARCH_ADVANCEMENT',
  },
  {
    officialTitle: 'Advisor, Institutional Advancement',
    primaryEmail: 'advisor.advancement@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'RESEARCH_ADVANCEMENT',
  },
  {
    officialTitle: 'Advisor, Research Park',
    primaryEmail: 'research.park@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'RESEARCH_ADVANCEMENT',
  },

  // ============================================================
  // HEADS OF DEPARTMENTS
  // ============================================================
  { officialTitle: 'HoD, Biological Sciences and Engineering', primaryEmail: 'hod.bse@iitgn.ac.in', systemRole: 'HOD', category: 'ACADEMIC' },
  { officialTitle: 'HoD, Chemical Engineering', primaryEmail: 'hod.chem@iitgn.ac.in', systemRole: 'HOD', category: 'ACADEMIC' },
  { officialTitle: 'HoD, Chemistry', primaryEmail: 'hod.chemistry@iitgn.ac.in', systemRole: 'HOD', category: 'ACADEMIC' },
  { officialTitle: 'HoD, Civil Engineering', primaryEmail: 'hod.civil@iitgn.ac.in', systemRole: 'HOD', category: 'ACADEMIC' },
  { officialTitle: 'HoD, Cognitive and Brain Sciences', primaryEmail: 'hod.cbs@iitgn.ac.in', systemRole: 'HOD', category: 'ACADEMIC' },
  { officialTitle: 'HoD, Computer Science and Engineering', primaryEmail: 'hod.cse@iitgn.ac.in', systemRole: 'HOD', category: 'ACADEMIC' },
  { officialTitle: 'HoD, Design', primaryEmail: 'hod.design@iitgn.ac.in', systemRole: 'HOD', category: 'ACADEMIC' },
  { officialTitle: 'HoD, Earth Sciences', primaryEmail: 'hod.earth@iitgn.ac.in', systemRole: 'HOD', category: 'ACADEMIC' },
  { officialTitle: 'HoD, Electrical Engineering', primaryEmail: 'hod.ee@iitgn.ac.in', systemRole: 'HOD', category: 'ACADEMIC' },
  { officialTitle: 'HoD, Humanities and Social Sciences', primaryEmail: 'hod.hss@iitgn.ac.in', systemRole: 'HOD', category: 'ACADEMIC' },
  { officialTitle: 'HoD, Maritime Engineering', primaryEmail: 'hod.maritime@iitgn.ac.in', systemRole: 'HOD', category: 'ACADEMIC' },
  { officialTitle: 'HoD, Materials Engineering', primaryEmail: 'hod.materials@iitgn.ac.in', systemRole: 'HOD', category: 'ACADEMIC' },
  { officialTitle: 'HoD, Mathematics', primaryEmail: 'hod.math@iitgn.ac.in', systemRole: 'HOD', category: 'ACADEMIC' },
  { officialTitle: 'HoD, Mechanical Engineering', primaryEmail: 'hod.mech@iitgn.ac.in', systemRole: 'HOD', category: 'ACADEMIC' },
  { officialTitle: 'HoD, Physics', primaryEmail: 'hod.physics@iitgn.ac.in', systemRole: 'HOD', category: 'ACADEMIC' },

  // ============================================================
  // INSTITUTIONAL COMMITTEES & SECURITY
  // ============================================================
  {
    officialTitle: 'Chairman, Endowment Management Committee',
    primaryEmail: 'endowment@iitgn.ac.in',
    systemRole: 'COMMITTEE_CHAIR',
    category: 'RESEARCH_ADVANCEMENT',
  },
  {
    officialTitle: 'Chair, Institutional Ranking Committee',
    primaryEmail: 'ranking@iitgn.ac.in',
    systemRole: 'COMMITTEE_CHAIR',
    category: 'ACADEMIC',
  },
  {
    officialTitle: 'Chief Information Security Officer',
    primaryEmail: 'ciso@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'INFRASTRUCTURE',
  },
  {
    officialTitle: 'Deputy Chief Information Security Officer',
    primaryEmail: 'dciso@iitgn.ac.in',
    systemRole: 'CO_COORDINATOR',
    category: 'INFRASTRUCTURE',
    parentTitle: 'Chief Information Security Officer',
  },
  {
    officialTitle: 'Chief Vigilance Officer',
    primaryEmail: 'vigilance@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'INFRASTRUCTURE',
  },
  {
    officialTitle: 'Public Grievance Officer',
    primaryEmail: 'grievance@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'STUDENT_WELFARE',
  },
  {
    officialTitle: 'Chair, Anti-Ragging Committee',
    primaryEmail: 'anti.ragging@iitgn.ac.in',
    systemRole: 'COMMITTEE_CHAIR',
    category: 'STUDENT_WELFARE',
  },
  {
    officialTitle: 'Member Secretary, Institutional Ethics Committee (IEC)',
    primaryEmail: 'iec@iitgn.ac.in',
    systemRole: 'COMMITTEE_CHAIR',
    category: 'RESEARCH_ADVANCEMENT',
  },
  {
    officialTitle: 'Convener, Reservation Cell (Liaison Officer-OBC)',
    primaryEmail: 'reservation@iitgn.ac.in',
    systemRole: 'FIC_COORDINATOR',
    category: 'STUDENT_WELFARE',
  },
]

// Centre and Facility Coordinators
export const centreCoordinators: FicEntry[] = [
  { officialTitle: 'Coordinator, Centre for Archaeological Sciences', primaryEmail: 'cas@iitgn.ac.in', systemRole: 'FIC_COORDINATOR', category: 'RESEARCH_ADVANCEMENT' },
  { officialTitle: 'Co-coordinator, Centre for Archaeological Sciences', primaryEmail: 'cas.co@iitgn.ac.in', systemRole: 'CO_COORDINATOR', category: 'RESEARCH_ADVANCEMENT', parentTitle: 'Coordinator, Centre for Archaeological Sciences' },
  { officialTitle: 'Coordinator, Centre for Biomedical Engineering', primaryEmail: 'cbme@iitgn.ac.in', systemRole: 'FIC_COORDINATOR', category: 'RESEARCH_ADVANCEMENT' },
  { officialTitle: 'Co-coordinator, Centre for Biomedical Engineering', primaryEmail: 'cbme.co@iitgn.ac.in', systemRole: 'CO_COORDINATOR', category: 'RESEARCH_ADVANCEMENT', parentTitle: 'Coordinator, Centre for Biomedical Engineering' },
  { officialTitle: 'Coordinator, Centre for Cognitive and Brain Sciences', primaryEmail: 'ccbs@iitgn.ac.in', systemRole: 'FIC_COORDINATOR', category: 'RESEARCH_ADVANCEMENT' },
  { officialTitle: 'Co-coordinator, Centre for Cognitive and Brain Sciences', primaryEmail: 'ccbs.co@iitgn.ac.in', systemRole: 'CO_COORDINATOR', category: 'RESEARCH_ADVANCEMENT', parentTitle: 'Coordinator, Centre for Cognitive and Brain Sciences' },
  { officialTitle: 'Coordinator, Centre for Design and Innovation', primaryEmail: 'cdi@iitgn.ac.in', systemRole: 'FIC_COORDINATOR', category: 'RESEARCH_ADVANCEMENT' },
  { officialTitle: 'Co-coordinator, Centre for Design and Innovation', primaryEmail: 'cdi.co@iitgn.ac.in', systemRole: 'CO_COORDINATOR', category: 'RESEARCH_ADVANCEMENT', parentTitle: 'Coordinator, Centre for Design and Innovation' },
  { officialTitle: 'Coordinator, Centre for Safety Engineering', primaryEmail: 'cse.safety@iitgn.ac.in', systemRole: 'FIC_COORDINATOR', category: 'INFRASTRUCTURE' },
  { officialTitle: 'Co-coordinator, Centre for Safety Engineering', primaryEmail: 'cse.safety.co@iitgn.ac.in', systemRole: 'CO_COORDINATOR', category: 'INFRASTRUCTURE', parentTitle: 'Coordinator, Centre for Safety Engineering' },
  { officialTitle: 'Coordinator, Centre for Sustainable Development', primaryEmail: 'csd@iitgn.ac.in', systemRole: 'FIC_COORDINATOR', category: 'INFRASTRUCTURE' },
  { officialTitle: 'Co-coordinator, Centre for Sustainable Development', primaryEmail: 'csd.co@iitgn.ac.in', systemRole: 'CO_COORDINATOR', category: 'INFRASTRUCTURE', parentTitle: 'Coordinator, Centre for Sustainable Development' },
  { officialTitle: 'Coordinator, Centre for Creative Learning', primaryEmail: 'ccl@iitgn.ac.in', systemRole: 'FIC_COORDINATOR', category: 'ACADEMIC' },
  { officialTitle: 'Co-coordinator, Centre for Creative Learning', primaryEmail: 'ccl.co@iitgn.ac.in', systemRole: 'CO_COORDINATOR', category: 'ACADEMIC', parentTitle: 'Coordinator, Centre for Creative Learning' },
  { officialTitle: 'Coordinator, Centre for AI-Driven Innovations', primaryEmail: 'cai@iitgn.ac.in', systemRole: 'FIC_COORDINATOR', category: 'RESEARCH_ADVANCEMENT' },
  { officialTitle: 'Co-coordinator, Centre for AI-Driven Innovations', primaryEmail: 'cai.co@iitgn.ac.in', systemRole: 'CO_COORDINATOR', category: 'RESEARCH_ADVANCEMENT', parentTitle: 'Coordinator, Centre for AI-Driven Innovations' },
  { officialTitle: 'Coordinator, Centre for Research Commercialization', primaryEmail: 'crc@iitgn.ac.in', systemRole: 'FIC_COORDINATOR', category: 'RESEARCH_ADVANCEMENT' },
  { officialTitle: 'Coordinator, Fire Lab', primaryEmail: 'fire.lab@iitgn.ac.in', systemRole: 'FIC_COORDINATOR', category: 'INFRASTRUCTURE' },
  { officialTitle: 'Co-coordinator, Fire Lab', primaryEmail: 'fire.lab.co@iitgn.ac.in', systemRole: 'CO_COORDINATOR', category: 'INFRASTRUCTURE', parentTitle: 'Coordinator, Fire Lab' },
]
