Cloudinary setup

Add one of the following to your backend `.env` file:

Option 1 – single variable (from Cloudinary Dashboard):
- CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

Option 2 – separate variables:
- CLOUDINARY_CLOUD_NAME=your_cloud_name
- CLOUDINARY_API_KEY=your_api_key
- CLOUDINARY_API_SECRET=your_api_secret

Notes:
- We use multer memory storage and upload via Cloudinary SDK (data URI). Files are limited to 5MB per file.
- Uploaded images are stored under `wedding-vendors/<vendorId>` in Cloudinary.
- Only the vendor owner or an admin can upload images for a vendor.
- If Cloudinary is not configured, the upload API returns 503 with a clear message.
