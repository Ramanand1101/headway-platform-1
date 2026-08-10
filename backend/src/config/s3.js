const { S3Client } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKET = process.env.AWS_S3_BUCKET;
const PUBLIC_BASE_URL = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`;

module.exports = { s3Client, BUCKET, PUBLIC_BASE_URL };
