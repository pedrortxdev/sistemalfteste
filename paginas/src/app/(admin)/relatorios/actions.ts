"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isDono } from "@/lib/permissions";

export async function getRevenueReport(startDate?: Date, endDate?: Date) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado");

  const where: any = {};
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = startDate;
    if (endDate) where.date.lte = endDate;
  }

  // Se não for dono, filtra apenas pela cidade dele
  if (!isDono(session.user.role)) {
    where.cityId = session.user.cityId;
  }

  const revenue = await prisma.cashFlow.groupBy({
    by: ['cityId', 'category'],
    where: {
      ...where,
      type: 'ENTRADA',
    },
    _sum: {
      amount: true,
    },
  });

  const cities = await prisma.city.findMany({
    select: { id: true, name: true }
  });

  // Mapear resultados para um formato amigável
  const report = cities.map(city => {
    const cityRevenue = revenue.filter(r => r.cityId === city.id);
    const aluguel = cityRevenue.find(r => r.category === 'ALUGUEL')?._sum.amount || 0;
    const frete = cityRevenue.find(r => r.category === 'FRETE')?._sum.amount || 0;
    const outros = cityRevenue.filter(r => r.category !== 'ALUGUEL' && r.category !== 'FRETE')
                              .reduce((acc, curr) => acc + (curr._sum.amount || 0), 0);

    return {
      cityName: city.name,
      aluguel,
      frete,
      outros,
      total: aluguel + frete + outros
    };
  }).filter(r => isDono(session.user.role) || r.cityName === session.user.cityName);

  return report;
}

export async function getMachineReport() {
  const session = await auth();
  if (!session) throw new Error("Não autenticado");

  const where: any = {};
  if (!isDono(session.user.role)) {
    where.cityId = session.user.cityId;
  }

  const machines = await prisma.machine.findMany({
    where,
    select: {
      id: true,
      name: true,
      model: true,
      totalRentals: true,
      city: { select: { name: true } },
      maintenanceLogs: {
        select: { cost: true }
      }
    },
    orderBy: {
      totalRentals: 'desc'
    }
  });

  return machines.map(m => ({
    name: m.name,
    model: m.model,
    cityName: m.city.name,
    totalRentals: m.totalRentals,
    maintenanceCost: m.maintenanceLogs.reduce((acc, curr) => acc + curr.cost, 0)
  }));
}

export async function getDetailedCashFlowReport(startDate?: Date, endDate?: Date) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado");

  const where: any = {};
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = startDate;
    if (endDate) where.date.lte = endDate;
  }

  if (!isDono(session.user.role)) {
    where.cityId = session.user.cityId;
  }

  return await prisma.cashFlow.findMany({
    where,
    include: {
      city: { select: { name: true } }
    },
    orderBy: {
      date: 'desc'
    }
  });
}

export async function getAuditLogs() {
  const session = await auth();
  if (!session || !isDono(session.user.role)) {
    throw new Error("Acesso restrito ao Dono");
  }

  return await prisma.auditLog.findMany({
    include: {
      user: {
        select: { name: true, email: true }
      }
    },
    orderBy: {
      timestamp: 'desc'
    },
    take: 100 // Limitar aos últimos 100 logs para performance
  });
}
