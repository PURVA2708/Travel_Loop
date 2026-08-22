import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/error.middleware';
import { hashPassword, comparePassword } from '../../utils/password';
import { UpdateProfileInput } from './users.schema';

export class UsersService {
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        languagePref: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            savedDestinations: true,
            trips: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  static async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const dataToUpdate: Record<string, unknown> = {};

    if (input.name) dataToUpdate.name = input.name;
    if (input.avatarUrl !== undefined) dataToUpdate.avatarUrl = input.avatarUrl || null;
    if (input.languagePref) dataToUpdate.languagePref = input.languagePref;

    if (input.newPassword) {
      if (!input.currentPassword) {
        throw new AppError('Current password is required to change password', 400);
      }
      const isMatch = await comparePassword(input.currentPassword, user.passwordHash);
      if (!isMatch) {
        throw new AppError('Current password is incorrect', 400);
      }
      dataToUpdate.passwordHash = await hashPassword(input.newPassword);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        languagePref: true,
        role: true,
        createdAt: true,
      },
    });

    return updatedUser;
  }

  static async deleteAccount(userId: string) {
    await prisma.user.delete({
      where: { id: userId },
    });
    return true;
  }

  static async getSavedDestinations(userId: string) {
    const saved = await prisma.savedDestination.findMany({
      where: { userId },
      include: {
        city: {
          include: {
            _count: {
              select: {
                activities: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return saved.map((s) => ({
      savedId: s.id,
      savedAt: s.createdAt,
      city: {
        ...s.city,
        costIndex: Number(s.city.costIndex),
        lat: s.city.lat ? Number(s.city.lat) : null,
        lng: s.city.lng ? Number(s.city.lng) : null,
        activityCount: s.city._count.activities,
      },
    }));
  }

  static async addSavedDestination(userId: string, cityId: string) {
    const city = await prisma.city.findUnique({
      where: { id: cityId },
    });

    if (!city) {
      throw new AppError('City not found', 404);
    }

    const existing = await prisma.savedDestination.findUnique({
      where: {
        userId_cityId: {
          userId,
          cityId,
        },
      },
    });

    if (existing) {
      return existing;
    }

    return prisma.savedDestination.create({
      data: {
        userId,
        cityId,
      },
    });
  }

  static async removeSavedDestination(userId: string, cityId: string) {
    const existing = await prisma.savedDestination.findUnique({
      where: {
        userId_cityId: {
          userId,
          cityId,
        },
      },
    });

    if (!existing) {
      throw new AppError('Destination was not saved', 404);
    }

    await prisma.savedDestination.delete({
      where: {
        userId_cityId: {
          userId,
          cityId,
        },
      },
    });

    return true;
  }
}
