import { NextRequest, NextResponse } from 'next/server';
import { warehouseOutgoingChecklist } from '@/drizzle/migrations/schema';
import { s3 } from '@/utils/s3-config';
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { eq, or, like } from 'drizzle-orm';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/db';

if (!process.env.S3_BUCKET_NAME) {
  throw new Error("S3_BUCKET_NAME not set in environment variables");
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    let objectKey = null;
    const file = formData.get('attachments') as File | null;
    
    if (file) {
      const fileBuffer = await file.arrayBuffer();
      
      // Resize and compress the image
      const resizedImage = await sharp(Buffer.from(fileBuffer))
        .resize({ width: 1200, height: 1200, fit: 'inside' })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Generate a unique filename
      const fileExtension = file.name.split('.').pop();
      objectKey = `${Date.now()}-${uuidv4()}.${fileExtension}`;
      
      const putCommand = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: objectKey,
        Body: resizedImage,
        ContentType: 'image/jpeg',
      });

      await s3.send(putCommand);
    }

    const result = await db.insert(warehouseOutgoingChecklist).values({
      clientName: formData.get('clientName') as string,
      datePerformed: formData.get('datePerformed') as string,
      invoiceNumber: formData.get('invoiceNumber') as string,
      orderType: formData.get('orderType') as string,
      inspector: formData.get('inspector') as string,
      lotNumbers: formData.get('lotNumbers') as string,
      preparedBy: formData.get('preparedBy') as string,
      packingSlip: formData.getAll('packingSlip').join(','),
      cofAs: formData.getAll('cofAs').join(','),
      inspectProducts: formData.getAll('inspectProducts').join(','),
      billOfLading: formData.getAll('billOfLading').join(','),
      mistakes: formData.get('mistakes') as string,
      actionTaken: formData.get('actionTaken') as string || null,
      comments: formData.get('comments') as string || null,
      attachmentUrl: objectKey, // Store only the object key
    }).returning();

    return NextResponse.json({ message: 'Form submitted successfully', data: result });
  } catch (error) {
    console.error('Error submitting form:', error);
    return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const objectKey = searchParams.get('key');
  const searchTerm = searchParams.get('search');

  if (objectKey) {
    try {
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: objectKey,
      });

      const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

      return NextResponse.json({ signedUrl });
    } catch (error) {
      console.error('Error generating signed URL:', error);
      return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
    }
  } else if (searchTerm) {
    try {
      const results = await db.select()
        .from(warehouseOutgoingChecklist)
        .where(or(
          like(warehouseOutgoingChecklist.clientName, `%${searchTerm}%`),
          like(warehouseOutgoingChecklist.invoiceNumber, `%${searchTerm}%`),
          like(warehouseOutgoingChecklist.lotNumbers, `%${searchTerm}%`)
        ))
        .limit(20);

      console.log('Search results from database:', results);

      return NextResponse.json({ results });
    } catch (error) {
      console.error('Error searching orders:', error);
      return NextResponse.json({ error: 'Failed to search orders' }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}