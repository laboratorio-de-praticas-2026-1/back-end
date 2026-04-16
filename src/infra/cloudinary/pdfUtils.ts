// src/infra/cloudinary/pdfUtils.ts
import puppeteer from 'puppeteer';
import { v2 as cloudinary } from 'cloudinary';

export const generateFromUrlAndUpload = async (targetUrl: string, fileName: string) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(targetUrl, { waitUntil: 'networkidle0' });

  
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
  });

  await browser.close();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'raw', folder: 'reports', public_id: fileName },
      (err, res) => err ? reject(err) : resolve(res?.secure_url)
    );
    stream.end(pdfBuffer);
  });
};