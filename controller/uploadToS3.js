const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid');
require("dotenv").config();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,   // from your IAM user
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
})
exports.uploadToS3 = async (dataBuffer, filename) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${uuidv4()}-${filename}`,
        Body: dataBuffer,
        ACL: 'public-read',
        ContentType: 'application/pdf'
    };

    const upload = await s3.upload(params).promise();
    return upload.Location; // Returns public URL
};