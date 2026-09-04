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

    const hashedPassword = await bcrypt.hash(seedAdminPassword, 12);

    // ساخت ادمین
    await prisma.user.upsert({
        where: {
            email: "yasinmasrour01@gmail.com"
        },
        update: {},
        create: {
            firstName: "Yasin",
            lastName: "Masrour",
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