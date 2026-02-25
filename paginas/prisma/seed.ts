import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const city = await prisma.city.upsert({
        where: { cnpj: '00.000.000/0001-00' },
        update: {},
        create: {
            name: 'Ijuí / RS',
            cnpj: '00.000.000/0001-00',
            address: 'Rua Principal, 123',
        },
    })

    const passwordHash = await bcrypt.hash('admin123', 10)

    const owner = await prisma.user.upsert({
        where: { email: 'admin@lfaluguel.com' },
        update: {},
        create: {
            email: 'admin@lfaluguel.com',
            name: 'Dono (Admin)',
            passwordHash,
            role: 'DONO',
            cityId: city.id,
        },
    })

    console.log({ city, owner })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
