// ============================================================
// Price Lists API Routes (List all / Create new)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import PriceList from '@/models/PriceList';

// GET /api/price-lists - Get all price lists for the current user
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '30');
    const skip = parseInt(searchParams.get('skip') || '0');

    const priceLists = await PriceList.find({ userId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await PriceList.countDocuments({ userId });

    return NextResponse.json({
      success: true,
      data: priceLists,
      total,
    });
  } catch (error) {
    console.error('Get price lists error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch price lists' },
      { status: 500 }
    );
  }
}

// POST /api/price-lists - Create or update a price list (upsert by date)
export async function POST(req: NextRequest) {
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

    const { shopName, date, items } = body;

    if (!date || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: 'Date and items are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Upsert: update if exists for this date, create if not
    const priceList = await PriceList.findOneAndUpdate(
      { userId, date },
      {
        userId,
        shopName: shopName || 'My Chicken Shop',
        date,
        items: items.map((item: Record<string, unknown>, index: number) => ({
          itemName: item.itemName || '',
          price: Number(item.price) || 0,
          unit: item.unit || 'per kg',
          note: item.note || '',
          orderIndex: item.orderIndex ?? index,
        })),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      data: priceList,
    });
  } catch (error) {
    console.error('Save price list error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save price list' },
      { status: 500 }
    );
  }
}
