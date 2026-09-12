import { DIVISIONS_DATA } from '../utils/seedDistricts';
import { generateAdminId, generateAdminPassword, makeEmailFromId } from '../utils/helpers';
import { createAuthAccount } from './auth';
import {
  createDivision, createDistrict, createUser, getSettings, updateSettings
} from './firestore';
import { FIREBASE_API_KEY } from '../utils/constants';

export async function seedDatabase() {
  // Check if already seeded
  const settings = await getSettings();
  if (settings && settings.seeded) {
    console.log('Database already seeded.');
    return { success: true, message: 'Already seeded', credentials: [] };
  }

  const credentials = [];

  try {
    // 1. Create Master account
    const masterEmail = makeEmailFromId('UP_MCD');
    const masterPassword = '12345678';
    let masterUid;
    try {
      const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: masterEmail, password: masterPassword, returnSecureToken: true })
        }
      );
      const data = await res.json();
      masterUid = data.localId || 'master_uid';
    } catch (e) {
      masterUid = 'master_uid';
    }

    await createUser(masterUid, {
      uid: masterUid,
      role: 'master',
      userId: 'UP_MCD',
      name: 'Master Admin',
      email: masterEmail,
      phone: '',
      address: 'Lucknow, UP',
      profilePic: '',
      districtId: '',
      divisionId: '',
      adminId: '',
      password: masterPassword
    });

    credentials.push({ role: 'Master', userId: 'UP_MCD', password: masterPassword });

    // 2. Create divisions and districts
    for (const div of DIVISIONS_DATA) {
      await createDivision(div.id, {
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

        // Create admin auth account via REST
        let adminUid;
        try {
          const res = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: adminEmail, password: adminPassword, returnSecureToken: false })
            }
          );
          const data = await res.json();
          adminUid = data.localId || `admin_${distId}`;
        } catch (e) {
          adminUid = `admin_${distId}`;
        }

        // Create district
        await createDistrict(distId, {
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
        await createUser(adminUid, {
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
          password: adminPassword
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
    await updateSettings({
      siteTitle: 'UP Municipal Civic Desk',
      siteLogo: '',
      marqueeText: 'Welcome to UP Municipal Civic Desk — Report civic issues in your district for quick resolution!',
      seeded: true
    });

    console.log('=== SEEDING COMPLETE ===');
    console.table(credentials);
    return { success: true, message: 'Database seeded successfully!', credentials };

  } catch (error) {
    console.error('Seeding error:', error);
    return { success: false, message: error.message, credentials };
  }
}
