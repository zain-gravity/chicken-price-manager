// ============================================================
// Single Price List API Routes (Get / Update / Delete)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import PriceList from '@/models/PriceList';

// GET /api/price-lists/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const { id } = await params;

    await dbConnect();

    const priceList = await PriceList.findOne({ _id: id, userId }).lean();

    if (!priceList) {
      return NextResponse.json(
        { success: false, error: 'Price list not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: priceList });
  } catch (error) {
    console.error('Get price list error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch price list' },
      { status: 500 }
    );
  }
}

// PUT /api/price-lists/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const { id } = await params;
    const body = await req.json();

    await dbConnect();

    const priceList = await PriceList.findOneAndUpdate(
      { _id: id, userId },
      {
        shopName: body.shopName,
        date: body.date,
        items: body.items,
      },
      { new: true }
    );

    if (!priceList) {
      return NextResponse.json(
        { success: false, error: 'Price list not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: priceList });
  } catch (error) {
    console.error('Update price list error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update price list' },
      { status: 500 }
    );
  }
}

// DELETE /api/price-lists/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const { id } = await params;

    await dbConnect();

    const result = await PriceList.findOneAndDelete({ _id: id, userId });

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Price list not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Price list deleted',
    });
  } catch (error) {
    console.error('Delete price list error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete price list' },
      { status: 500 }
    );
  }
}
