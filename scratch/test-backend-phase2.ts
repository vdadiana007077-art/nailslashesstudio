import { PrismaClient, ApptStatus, PaymentMethod, StaffTransactionType, CommissionStatus, LoginType, WorkModel, ApptSource } from '@prisma/client';

// Mock Next.js cache and headers FIRST
const modCache = require('module');
const originalRequire = modCache.prototype.require;
modCache.prototype.require = function(request: string) {
  if (request === 'next/cache') {
    return { revalidatePath: () => {} };
  }
  if (request === 'next/headers') {
    return {
      cookies: () => ({
        get: () => undefined,
        set: () => {}
      })
    };
  }
  return originalRequire.apply(this, arguments);
};

const { collectAppointmentPayment, receiveStaffCashDrop, payStaffPayout } = require('../src/app/actions/staffFinance');
const { markArrived, markStarted, markCompleted } = require('../src/app/actions/staffAppointment');
const { requireStaff } = require('../src/app/actions/staffAuth');
import { prisma } from '../src/lib/prisma';

async function runTests() {
  console.log("--- BACTEND PHASE 2 TESTS BAŞLIYOR ---");
  let allPass = true;

  try {
    // 1. requireStaff Test
    try {
      await requireStaff();
      console.log("❌ FAIL: requireStaff engellemedi!");
      allPass = false;
    } catch (e: any) {
      if (e.message.includes('Yetkisiz erişim')) {
        console.log("✅ PASS: requireStaff yetkisiz erişimi engelledi.");
      } else {
        console.log("❌ FAIL: requireStaff beklenmeyen hata:", e.message);
        allPass = false;
      }
    }
    // 1.5 Cleanup previous runs
    console.log("Önceki kalıntılar temizleniyor...");
    // 1.5 Cleanup previous runs
    console.log("Önceki kalıntılar temizleniyor...");
    await prisma.appointment.deleteMany({ where: { customer: { email: 'test_cust_p2@test.com' } }});
    // Can't easily delete service by slug. Just delete by category we created if possible.
    await prisma.staffPayout.deleteMany({ where: { staff: { user: { email: 'test_staff_p2@test.com' } } }});
    await prisma.staffTransaction.deleteMany({ where: { staff: { user: { email: 'test_staff_p2@test.com' } } }});
    await prisma.staffCommission.deleteMany({ where: { staff: { user: { email: 'test_staff_p2@test.com' } } }});
    await prisma.staff.deleteMany({ where: { user: { email: 'test_staff_p2@test.com' } }});
    await prisma.user.deleteMany({ where: { email: { in: ['test_admin_p2@test.com', 'test_staff_p2@test.com', 'test_cust_p2@test.com'] } }});
    await prisma.transaction.deleteMany({ where: { description: { contains: 'Personel Kasa' } }});
    await prisma.transactionCategory.deleteMany({ where: { name: 'Personel Kasa Teslimatı' }});

    // 2. Setup Seed Data
    // Admin User
    const adminUser = await prisma.user.upsert({
      where: { email: 'test_admin_p2@test.com' },
      update: {},
      create: { email: 'test_admin_p2@test.com', name: 'Admin Test', password: 'xyz', role: 'ADMIN', loginType: 'MANUAL' as any }
    });

    // Staff User
    const staffUser = await prisma.user.upsert({
      where: { email: 'test_staff_p2@test.com' },
      update: {},
      create: { email: 'test_staff_p2@test.com', name: 'Staff Test', password: 'xyz', role: 'STAFF', loginType: 'MANUAL' as any }
    });

    const staff = await prisma.staff.upsert({
      where: { userId: staffUser.id },
      update: {},
      create: { 
        userId: staffUser.id, 
        name: 'Staff Test', 
        generalCommissionRate: 10,
        workModel: WorkModel.PERCENTAGE
      }
    });

    // Customer User
    const customerUser = await prisma.user.upsert({
      where: { email: 'test_cust_p2@test.com' },
      update: {},
      create: { email: 'test_cust_p2@test.com', name: 'Cust Test', password: 'xyz', role: 'CUSTOMER', loginType: 'MANUAL' as any }
    });

    // Category
    const category = await prisma.serviceCategory.create({
      data: {
        translations: { create: [{ language: 'TR', name: 'Test Cat', slug: 'test-cat-' + Date.now(), description: 'desc' }] }
      }
    });

    const service = await prisma.service.create({
      data: {
        price: 100, duration: 60, isActive: true, categoryId: category.id,
        translations: { create: [{ language: 'TR', name: 'Test Service', slug: 'test-service-' + Date.now(), description: 'desc' }] }
      }
    });

    const appointment = await prisma.appointment.create({
      data: {
        serviceId: service.id,
        customerId: customerUser.id,
        customerName: 'Cust Test',
        customerPhone: '1234567890',
        date: new Date(),
        startTime: '10:00',
        endTime: '11:00',
        durationAtBooking: 60,
        priceAtBooking: 100,
        status: ApptStatus.PENDING,
        staffId: staff.id,
        staffPreference: 'ANY' as any,
        source: ApptSource.WEBSITE,
        customerEmail: 'test_cust_p2@test.com'
      }
    });

    console.log("✅ Seed Data oluşturuldu.");

    // 3. markArrived / markStarted / markCompleted Test
    await markArrived(appointment.id);
    let appt = await prisma.appointment.findUnique({ where: { id: appointment.id }});
    if (appt?.status === ApptStatus.ARRIVED) {
      console.log("✅ PASS: markArrived durumu güncelledi.");
    } else {
      console.log("❌ FAIL: markArrived durumu güncelleyemedi.", appt?.status);
      allPass = false;
    }

    // 4 & 5. collectAppointmentPayment Test
    const collectRes = await collectAppointmentPayment({
      appointmentId: appointment.id,
      staffId: staff.id,
      amount: 100,
      paymentMethod: PaymentMethod.CARD,
      slipNumber: 'SLP-1234',
      posInfo: 'POS-01'
    });

    if (!collectRes.success) {
      console.log("❌ FAIL: collectAppointmentPayment başarısız:", collectRes.error);
      allPass = false;
    } else {
      // Doğrulamalar
      const updatedAppt = await prisma.appointment.findUnique({ where: { id: appointment.id }, include: { payment: true, staffCommission: true }});
      const staffTx = await prisma.staffTransaction.findFirst({ where: { staffId: staff.id, type: StaffTransactionType.COLLECTION }});
      
      if (updatedAppt?.paymentCollectedByStaffId === staff.id) {
        console.log("✅ PASS: paymentCollectedByStaffId yazıldı.");
      } else {
        console.log("❌ FAIL: paymentCollectedByStaffId yazılamadı.");
        allPass = false;
      }

      if (updatedAppt?.payment) {
        console.log("✅ PASS: Payment kaydı oluştu.");
      } else {
        console.log("❌ FAIL: Payment kaydı oluşmadı.");
        allPass = false;
      }

      if (staffTx && staffTx.balanceAfter.toNumber() === 100) {
        console.log("✅ PASS: StaffTransaction oluşturuldu ve balanceAfter arttı.");
      } else {
        console.log("❌ FAIL: StaffTransaction hatalı.", staffTx);
        allPass = false;
      }

      const commission = updatedAppt?.staffCommission;
      if (commission && commission.commissionAmount.toNumber() === 10) { // %10 of 100
        console.log("✅ PASS: Komisyon (10) doğru hesaplandı.");
      } else {
        console.log("❌ FAIL: Komisyon hesaplanamadı.", commission);
        allPass = false;
      }
    }

    // 6. receiveStaffCashDrop Test
    const dropRes = await receiveStaffCashDrop({
      staffId: staff.id,
      amount: 40,
      paymentMethod: PaymentMethod.CASH,
      adminId: adminUser.id
    });

    if (!dropRes.success) {
      console.log("❌ FAIL: receiveStaffCashDrop başarısız:", dropRes.error);
      allPass = false;
    } else {
      const dropTx = await prisma.staffTransaction.findFirst({ where: { staffId: staff.id, type: StaffTransactionType.CASH_DROP }});
      const globalTx = await prisma.transaction.findFirst({ where: { description: { contains: 'Personel Kasa Teslimi' } }});

      if (dropTx && dropTx.balanceAfter.toNumber() === 60) {
        console.log("✅ PASS: CASH_DROP oluşturuldu ve balanceAfter (100-40=60) düştü.");
      } else {
        console.log("❌ FAIL: CASH_DROP hatalı.", dropTx);
        allPass = false;
      }

      if (globalTx && globalTx.amount.toNumber() === 40) {
        console.log("✅ PASS: Ana kasaya income işlendi.");
      } else {
        console.log("❌ FAIL: Ana kasa işlemi hatalı.");
        allPass = false;
      }
    }

    // 7. payStaffPayout Test
    const payoutRes = await payStaffPayout({
      staffId: staff.id,
      amount: 5, // Kısmi ödeme
      paymentMethod: PaymentMethod.TRANSFER,
      adminId: adminUser.id
    });

    if (!payoutRes.success) {
      console.log("❌ FAIL: payStaffPayout başarısız:", payoutRes.error);
      allPass = false;
    } else {
      const payout = await prisma.staffPayout.findFirst({ where: { staffId: staff.id }});
      const commission = await prisma.staffCommission.findFirst({ where: { staffId: staff.id }}); // Amount is 10

      if (payout && payout.amount.toNumber() === 5) {
        console.log("✅ PASS: StaffPayout oluşturuldu ve kısmi ödeme (5) desteklendi.");
      } else {
        console.log("❌ FAIL: StaffPayout hatalı.");
        allPass = false;
      }

      // Kısmi ödemede PENDING olarak bırakacaktık
      if (commission?.status === CommissionStatus.PENDING) {
        console.log("✅ PASS: İlgili komisyonlar doğru statüyü aldı (Kısmi ödendiği için PENDING kaldı).");
      } else {
        console.log("❌ FAIL: Komisyon statüsü hatalı.", commission?.status);
        allPass = false;
      }
    }

    // Cleanup Seed Data
    console.log("Temizlik yapılıyor...");
    await prisma.appointment.delete({ where: { id: appointment.id }});
    await prisma.service.delete({ where: { id: service.id }});
    await prisma.staffPayout.deleteMany({ where: { staffId: staff.id }});
    await prisma.staffTransaction.deleteMany({ where: { staffId: staff.id }});
    await prisma.staff.delete({ where: { id: staff.id }});
    await prisma.user.delete({ where: { id: staffUser.id }});
    await prisma.user.delete({ where: { id: adminUser.id }});
    await prisma.user.delete({ where: { id: customerUser.id }});
    await prisma.transaction.deleteMany({ where: { description: { contains: 'Personel Kasa' } }});
    await prisma.transactionCategory.deleteMany({ where: { name: 'Personel Kasa Teslimatı' }});
    
    console.log("✅ Temizlik tamamlandı.");

  } catch (error) {
    console.error("TEST ERROR:", error);
    allPass = false;
  }

  if (allPass) {
    console.log("🎯 TÜM TESTLER BAŞARIYLA GEÇTİ (PASS)");
  } else {
    console.log("🚨 BAZI TESTLER BAŞARISIZ OLDU (FAIL)");
  }
}

runTests().then(() => prisma.$disconnect());
