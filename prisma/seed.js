require("dotenv").config();
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    const roles = [
        "ADMIN",
        "COUNSELOR",
        "QUESTION_DESIGNER",
        "STUDENT"
    ];

    // ساخت Roleها
    for (const roleName of roles) {
        await prisma.role.upsert({
            where: { name: roleName },
            update: {},
            create: { name: roleName }
        });
    }

    // گرفتن نقش ADMIN
    const adminRole = await prisma.role.findUnique({
        where: {
            name: "ADMIN"
        }
    });

    const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
    const seedAdminPhone = process.env.SEED_ADMIN_PHONE || "09120000000";
    const seedAdminEmail = process.env.SEED_ADMIN_EMAIL || "admin@griffin.local";
    const hashedPassword = await bcrypt.hash(seedAdminPassword, 12);

    // ساخت ادمین
    await prisma.user.upsert({
        where: { phoneNumber: seedAdminPhone },
        update: { email: seedAdminEmail },
        create: {
            firstName: "Yasin",
            lastName: "Masrour",
            phoneNumber: seedAdminPhone,
            phoneVerifiedAt: new Date(),
            email: seedAdminEmail,
            password: hashedPassword,
            roleId: adminRole.id
        }
    });

    console.log("Roles and admin user seeded successfully");
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });