const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const modelsDir = path.join(__dirname, 'client', 'models');
const SUPABASE_PROJECT_URL = process.env.SUPABASE_URL || 'https://ojzxpvpthyplyjlhksrg.supabase.co';

const pool = new Pool({
    connectionString: process.env.SUPABASE_URL_CONNECTION,
    ssl: { rejectUnauthorized: false }
});

async function syncModelsToCloudUrl() {
    try {
        if (!fs.existsSync(modelsDir)) {
            console.log('Thư mục client/models không tồn tại.');
            return;
        }

        const files = fs.readdirSync(modelsDir);
        let updatedCount = 0;

        for (const file of files) {
            const match = file.match(/^product_(\d+)\.glb$/i);
            
            if (match) {
                const productId = parseInt(match[1]);
                
                // Trỏ thẳng đến link Bucket Public của Supabase
                const cloudUrl = `${SUPABASE_PROJECT_URL}/storage/v1/object/public/models/${file}`;
                
                console.log(`Đang gán Cloud URL cho sản phẩm ID = ${productId}...`);
                
                const result = await pool.query(
                    "UPDATE products SET model_3d = $1 WHERE product_id = $2 RETURNING product_id",
                    [cloudUrl, productId]
                );
                
                if (result.rowCount > 0) {
                    console.log(` => Thành công! Đã link: ${cloudUrl}`);
                    updatedCount++;
                } else {
                    console.log(` => Thất bại: Không tìm thấy sản phẩm ID ${productId} trong DB.`);
                }
            }
        }
        
        console.log(`\nHoàn tất! Đã cập nhật thành công ${updatedCount} mô hình 3D sang link Cloud.`);
        
    } catch (e) {
        console.error('Lỗi trong quá trình đồng bộ:', e);
    } finally {
        pool.end();
    }
}

syncModelsToCloudUrl();
