const crypto = require('crypto');
const { PutObjectCommand, DeleteObjectCommand, HeadObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client, BUCKET, PUBLIC_BASE_URL } = require('../config/s3');

function sanitizeFilename(name) {
  return (name || 'file').replace(/[^a-zA-Z0-9._-]/g, '-').slice(-80);
}

// `folder` is whatever the caller passes (e.g. `creatives/reel/life`,
// `advisor-photos/${advisorId}`, `blog-images`) — there's no fixed prefix
// list, every upload site picks its own folder and S3 creates it on the fly
// as part of the object key (S3 has no real directories, a key with slashes
// just *looks* like a path).
async function uploadBuffer(buffer, { folder, filename, contentType }) {
  const key = `${folder}/${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${sanitizeFilename(filename)}`;
  await s3Client.send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: contentType })
  );
  return `${PUBLIC_BASE_URL}/${key}`;
}

function keyFromUrl(url) {
  if (!url || !url.startsWith(PUBLIC_BASE_URL)) return null;
  return decodeURIComponent(url.slice(PUBLIC_BASE_URL.length + 1));
}

async function deleteByUrl(url) {
  const key = keyFromUrl(url);
  if (!key) return;
  await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

async function objectExists(key) {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

// Mirrors Cloudinary's fl_attachment — forces a browser download instead of
// opening the raw file, without proxying the bytes through our own server.
async function getPresignedDownloadUrl(url, downloadFilename) {
  const key = keyFromUrl(url);
  if (!key) return url;
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${sanitizeFilename(downloadFilename || 'insuranceadvise-content')}"`
  });
  return getSignedUrl(s3Client, command, { expiresIn: 300 });
}

module.exports = { uploadBuffer, keyFromUrl, deleteByUrl, objectExists, getPresignedDownloadUrl, PUBLIC_BASE_URL };
