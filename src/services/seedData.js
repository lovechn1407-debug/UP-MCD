import { db } from '../firebase/config';
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { DIVISIONS_DATA } from '../utils/seedDistricts';
import { generateAdminId, generateAdminPassword, makeEmailFromId } from '../utils/helpers';
import { getSettings } from './firestore';

export async function seedDatabase(force = false) {
  // Check if already seeded unless forced
  if (!force) {
    const settings = await getSettings();
    if (settings && settings.seeded) {
      console.log('Database already seeded.');
      return { success: true, message: 'Already seeded', credentials: [] };
    }
  }

  const credentials = [];

  try {
    const batch = writeBatch(db);

    // 1. Create Master account
    const masterEmail = makeEmailFromId('UP_MCD');
    const masterPassword = '12345678';
    const masterRef = doc(db, 'users', 'master_uid');

    batch.set(masterRef, {
      uid: 'master_uid',
      role: 'master',
      userId: 'UP_MCD',
      name: 'Master Admin',
      email: masterEmail,
      phone: '1800-180-0000',
      address: 'Lucknow, UP',
      profilePic: '',
      districtId: '',
      divisionId: '',
      adminId: '',
      password: masterPassword,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    credentials.push({ role: 'Master', userId: 'UP_MCD', password: masterPassword });

    // 2. Create divisions and districts
    for (const div of DIVISIONS_DATA) {
      const divRef = doc(db, 'divisions', div.id);
      batch.set(divRef, {
        nameHindi: div.nameHindi,
        nameEnglish: div.nameEnglish,
        commissionerName: div.commissionerName,
        commissionerPhone: div.commissionerPhone,
        commissionerEmail: div.commissionerEmail
      });

      for (const dist of div.districts) {
        const distId = dist.nameEnglish.toLowerCase().replace(/\s+/g, '_');
        const adminId = generateAdminId(dist.nameEnglish, dist.representative);
        const adminPassword = generateAdminPassword();
        const adminEmail = makeEmailFromId(adminId);
        const adminUid = `admin_${distId}`;

        // Create district doc
        const distRef = doc(db, 'districts', distId);
        batch.set(distRef, {
          divisionId: div.id,
          nameHindi: dist.nameHindi,
          nameEnglish: dist.nameEnglish,
          representativeName: dist.representative,
          phone: dist.phone,
          email: dist.email,
          adminUserId: adminUid,
          honorScore: 0,
          totalIssues: 0,
          resolvedIssues: 0,
          unfulfilledIssues: 0
        });

        // Create admin user doc
        const adminUserRef = doc(db, 'users', adminUid);
        batch.set(adminUserRef, {
          uid: adminUid,
          role: 'admin',
          userId: adminId,
          name: dist.representative,
          email: adminEmail,
          phone: dist.phone,
          address: `${dist.nameEnglish}, Uttar Pradesh`,
          profilePic: '',
          districtId: distId,
          divisionId: div.id,
          adminId: '',
          password: adminPassword,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        credentials.push({
          role: 'Admin',
          district: dist.nameEnglish,
          name: dist.representative,
          userId: adminId,
          password: adminPassword
        });
      }
    }

    // 3. Set default site settings
    const settingsRef = doc(db, 'settings', 'site');
    batch.set(settingsRef, {
      siteTitle: 'UP Municipal Civic Desk',
      siteLogo: '',
      marqueeText: 'Welcome to UP Municipal Civic Desk — Report civic issues in your district for quick resolution!',
      seeded: true,
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Commit all records in 1 single network request!
    await batch.commit();

    console.log('=== SEEDING COMPLETE ===');
    console.table(credentials);
    return { success: true, message: 'Database seeded successfully in < 1 second!', credentials };

  } catch (error) {
    console.error('Seeding error:', error);
    return { success: false, message: error.message, credentials };
  }
}
