import * as Minio from 'minio'

// MinIO configuration
const minioClient = new Minio.Client({
  endPoint: 'minio.sudheerbhuvana.in',
  port: 443,
  useSSL: true,
  accessKey: 'BEHiz0NbUZeKHEeJ',
  secretKey: '2Dse54KWpeH496lWpSEMhXbUVtytYLRH'
})

const BUCKET_NAME = 'sih'

// Ensure bucket exists and is public
export async function ensureBucketExists() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME)
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1')
      console.log(`Bucket ${BUCKET_NAME} created successfully`)
    }
    
    // Set bucket policy to public read
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`]
        }
      ]
    }
    
    await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(bucketPolicy))
    console.log(`Bucket ${BUCKET_NAME} set to public read`)
  } catch (error) {
    console.error('Error ensuring bucket exists:', error)
    throw error
  }
}

// Upload image to MinIO
export async function uploadImage(
  file: Buffer, 
  fileName: string, 
  contentType: string = 'image/jpeg'
): Promise<string> {
  try {
    await ensureBucketExists()
    
    const objectName = `task-images/${Date.now()}-${fileName}`
    
    await minioClient.putObject(BUCKET_NAME, objectName, file, file.length, {
      'Content-Type': contentType,
      'Cache-Control': 'max-age=31536000'
    })
    
    // Return the public URL
    return `https://minio.sudheerbhuvana.in/${BUCKET_NAME}/${objectName}`
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

// Delete image from MinIO
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    const objectName = imageUrl.replace(`https://minio.sudheerbhuvana.in/${BUCKET_NAME}/`, '')
    await minioClient.removeObject(BUCKET_NAME, objectName)
  } catch (error) {
    console.error('Error deleting image:', error)
    throw error
  }
}

// Get all images from a specific folder
export async function listImages(folder: string = 'task-images'): Promise<string[]> {
  try {
    const objectsList: string[] = []
    const stream = minioClient.listObjects(BUCKET_NAME, folder, true)
    
    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => {
        if (obj.name) {
          objectsList.push(`https://minio.sudheerbhuvana.in/${BUCKET_NAME}/${obj.name}`)
        }
      })
      
      stream.on('error', (err) => {
        reject(err)
      })
      
      stream.on('end', () => {
        resolve(objectsList)
      })
    })
  } catch (error) {
    console.error('Error listing images:', error)
    return []
  }
}

// Get presigned URL for direct upload (optional)
export async function getPresignedUploadUrl(
  fileName: string, 
  contentType: string = 'image/jpeg'
): Promise<string> {
  try {
    await ensureBucketExists()
    const objectName = `task-images/${Date.now()}-${fileName}`
    
    return await minioClient.presignedPutObject(BUCKET_NAME, objectName, 24 * 60 * 60) // 24 hours
  } catch (error) {
    console.error('Error getting presigned URL:', error)
    throw error
  }
}
