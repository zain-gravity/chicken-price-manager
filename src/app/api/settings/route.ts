// ============================================================
// Settings API Routes
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

// GET /api/settings - Get current user settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userId = (session.user as Record<string, unknown>).id as string;

    await dbConnect();

    const user = await User.findById(userId).select('shopName settings').lean();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        shopName: user.shopName,
        settings: user.settings,
      },
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update user settings
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const body = await req.json();

    await dbConnect();

    const updateData: Record<string, unknown> = {};

    if (body.shopName !== undefined) {
      updateData.shopName = body.shopName;
    }

    if (body.settings) {
      const allowedSettings = [
        'currency',
        'defaultUnit',
        'showFooter',
        'footerText',
        'defaultExportFormat',
        'imageTheme',
      ];

      for (const key of allowedSettings) {
        if (body.settings[key] !== undefined) {
          updateData[`settings.${key}`] = body.settings[key];
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('shopName settings');

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        shopName: user.shopName,
        settings: user.settings,
      },
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
