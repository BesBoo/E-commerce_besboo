// Mock catalog used when the API/database is unavailable.
(function () {
    const categories = [
        {
            category_id: 1,
            name: 'Áo thun',
            description: 'Áo thun basic, form rộng và chất liệu thoáng mát',
            image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80'
        },
        {
            category_id: 2,
            name: 'Áo khoác',
            description: 'Áo khoác nhẹ, bomber và jacket dùng hằng ngày',
            image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80'
        },
        {
            category_id: 3,
            name: 'Quần',
            description: 'Jeans, jogger và quần kaki dễ phối đồ',
            image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80'
        },
        {
            category_id: 4,
            name: 'Giày',
            description: 'Sneaker năng động cho đi học, đi làm và dạo phố',
            image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'
        },
        {
            category_id: 5,
            name: 'Phụ kiện',
            description: 'Túi, mũ và phụ kiện hoàn thiện outfit',
            image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80'
        }
    ];

    const products = [
        {
            product_id: 1,
            name: 'Áo thun BesBoo Essential',
            description: 'Áo thun cotton mềm, form regular dễ mặc trong mọi lịch trình. Đường may gọn, cổ áo giữ phom tốt sau nhiều lần giặt.',
            price: 249000,
            stock: 42,
            category_id: 1,
            image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80'
            ]),
            colors: JSON.stringify(['Trắng', 'Đen', 'Xanh']),
            sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
            brand: 'BesBoo',
            is_featured: true,
            is_new: true,
            discount_percent: 10,
            avg_rating: 4.8,
            review_count: 32,
            created_at: '2026-05-28T08:30:00.000Z'
        },
        {
            product_id: 2,
            name: 'Áo polo Urban Fit',
            description: 'Polo vải pique co giãn nhẹ, cổ dệt chắc và phom vừa vặn. Phù hợp đi làm, gặp bạn bè hoặc phối smart casual.',
            price: 329000,
            stock: 26,
            category_id: 1,
            image_url: 'https://images.unsplash.com/photo-1583851859714-4a81d5e72f4d?auto=format&fit=crop&w=900&q=80',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1583851859714-4a81d5e72f4d?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=900&q=80'
            ]),
            colors: JSON.stringify(['Đen', 'Trắng', 'Vàng']),
            sizes: JSON.stringify(['M', 'L', 'XL']),
            brand: 'Routine',
            is_featured: false,
            is_new: true,
            discount_percent: 0,
            avg_rating: 4.5,
            review_count: 14,
            created_at: '2026-05-23T10:00:00.000Z'
        },
        {
            product_id: 3,
            name: 'Áo khoác bomber Minimal',
            description: 'Bomber nhẹ, lớp lót thoáng và bo tay chắc. Dễ phối với áo thun, jeans hoặc jogger cho phong cách đường phố.',
            price: 689000,
            stock: 18,
            category_id: 2,
            image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80'
            ]),
            colors: JSON.stringify(['Đen', 'Xanh', 'Nâu']),
            sizes: JSON.stringify(['M', 'L', 'XL']),
            brand: 'BesBoo',
            is_featured: true,
            is_new: false,
            discount_percent: 15,
            avg_rating: 4.7,
            review_count: 21,
            created_at: '2026-05-10T09:20:00.000Z'
        },
        {
            product_id: 4,
            name: 'Áo khoác denim Classic',
            description: 'Denim wash xanh cổ điển, chất vải đứng phom và túi ngực tiện dụng. Một lớp khoác bền bỉ cho nhiều mùa.',
            price: 749000,
            stock: 13,
            category_id: 2,
            image_url: 'https://images.unsplash.com/photo-1601333144130-8cbb312386b6?auto=format&fit=crop&w=900&q=80',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1601333144130-8cbb312386b6?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80'
            ]),
            colors: JSON.stringify(['Xanh', 'Đen']),
            sizes: JSON.stringify(['S', 'M', 'L']),
            brand: 'Levi\'s',
            is_featured: false,
            is_new: false,
            discount_percent: 8,
            avg_rating: 4.4,
            review_count: 11,
            created_at: '2026-04-30T15:10:00.000Z'
        },
        {
            product_id: 5,
            name: 'Quần jeans Straight Blue',
            description: 'Jeans ống đứng, wash xanh dễ phối và chất denim co giãn vừa đủ. Thiết kế cân bằng giữa thoải mái và gọn gàng.',
            price: 529000,
            stock: 37,
            category_id: 3,
            image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80'
            ]),
            colors: JSON.stringify(['Xanh', 'Đen']),
            sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
            brand: 'Levi\'s',
            is_featured: true,
            is_new: false,
            discount_percent: 0,
            avg_rating: 4.6,
            review_count: 27,
            created_at: '2026-04-26T12:00:00.000Z'
        },
        {
            product_id: 6,
            name: 'Quần jogger Daily Move',
            description: 'Jogger lưng thun, vải mềm và túi sâu. Dành cho ngày cần di chuyển nhiều nhưng vẫn muốn outfit gọn đẹp.',
            price: 399000,
            stock: 31,
            category_id: 3,
            image_url: 'https://images.unsplash.com/photo-1506629905607-d1bb30a0c44b?auto=format&fit=crop&w=900&q=80',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1506629905607-d1bb30a0c44b?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=900&q=80'
            ]),
            colors: JSON.stringify(['Đen', 'Xám', 'Nâu']),
            sizes: JSON.stringify(['M', 'L', 'XL', 'XXL']),
            brand: 'Puma',
            is_featured: false,
            is_new: true,
            discount_percent: 12,
            avg_rating: 4.3,
            review_count: 9,
            created_at: '2026-05-29T11:45:00.000Z'
        },
        {
            product_id: 7,
            name: 'Nike Air Runner White',
            description: 'Sneaker trắng đế êm, trọng lượng nhẹ và dễ phối với nhiều phong cách. Phù hợp đi học, đi làm và đi chơi.',
            price: 1590000,
            stock: 20,
            category_id: 4,
            image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'
            ]),
            colors: JSON.stringify(['Trắng', 'Đen']),
            sizes: JSON.stringify(['39', '40', '41', '42', '43']),
            brand: 'Nike',
            is_featured: true,
            is_new: true,
            discount_percent: 5,
            avg_rating: 4.9,
            review_count: 45,
            created_at: '2026-05-31T07:00:00.000Z'
        },
        {
            product_id: 8,
            name: 'Adidas Court Street',
            description: 'Giày court cổ thấp, bề mặt da tổng hợp dễ vệ sinh và đế cao su bám tốt. Thiết kế tối giản cho outfit hằng ngày.',
            price: 1390000,
            stock: 16,
            category_id: 4,
            image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=80',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1605408499391-6368c628ef42?auto=format&fit=crop&w=900&q=80'
            ]),
            colors: JSON.stringify(['Trắng', 'Xanh']),
            sizes: JSON.stringify(['38', '39', '40', '41', '42']),
            brand: 'Adidas',
            is_featured: false,
            is_new: false,
            discount_percent: 18,
            avg_rating: 4.5,
            review_count: 18,
            created_at: '2026-04-18T14:30:00.000Z'
        },
        {
            product_id: 9,
            name: 'Vans Old Skool Black',
            description: 'Sneaker vải canvas đen, viền cổ điển và đế waffle đặc trưng. Một lựa chọn bền chất cho phong cách casual.',
            price: 1250000,
            stock: 24,
            category_id: 4,
            image_url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80'
            ]),
            colors: JSON.stringify(['Đen', 'Trắng']),
            sizes: JSON.stringify(['39', '40', '41', '42', '43']),
            brand: 'Vans',
            is_featured: true,
            is_new: false,
            discount_percent: 0,
            avg_rating: 4.7,
            review_count: 39,
            created_at: '2026-04-08T13:00:00.000Z'
        },
        {
            product_id: 10,
            name: 'Converse Chuck Taylor High',
            description: 'Giày cổ cao kinh điển, canvas thoáng và mũi cao su bền. Hợp với jeans, short hoặc váy casual.',
            price: 1190000,
            stock: 19,
            category_id: 4,
            image_url: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=900&q=80',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1624006389438-c03488175975?auto=format&fit=crop&w=900&q=80'
            ]),
            colors: JSON.stringify(['Đen', 'Đỏ', 'Trắng']),
            sizes: JSON.stringify(['38', '39', '40', '41', '42']),
            brand: 'Converse',
            is_featured: false,
            is_new: true,
            discount_percent: 7,
            avg_rating: 4.6,
            review_count: 25,
            created_at: '2026-05-20T09:00:00.000Z'
        },
        {
            product_id: 11,
            name: 'Balo City Backpack',
            description: 'Balo đô thị có ngăn laptop, quai đệm và khóa kéo chắc chắn. Dung tích vừa đủ cho đi học, đi làm hoặc du lịch ngắn.',
            price: 459000,
            stock: 28,
            category_id: 5,
            image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=900&q=80'
            ]),
            colors: JSON.stringify(['Đen', 'Xám', 'Nâu']),
            sizes: JSON.stringify(['Free size']),
            brand: 'BesBoo',
            is_featured: true,
            is_new: false,
            discount_percent: 20,
            avg_rating: 4.8,
            review_count: 30,
            created_at: '2026-05-12T12:30:00.000Z'
        },
        {
            product_id: 12,
            name: 'Mũ lưỡi trai Logo Cap',
            description: 'Mũ cotton twill, khóa điều chỉnh phía sau và logo thêu nhỏ. Gọn nhẹ cho ngày nắng hoặc outfit thể thao.',
            price: 199000,
            stock: 35,
            category_id: 5,
            image_url: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=80',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1596455607563-ad6193f76b17?auto=format&fit=crop&w=900&q=80'
            ]),
            colors: JSON.stringify(['Đen', 'Trắng', 'Xanh']),
            sizes: JSON.stringify(['Free size']),
            brand: 'BesBoo',
            is_featured: false,
            is_new: true,
            discount_percent: 0,
            avg_rating: 4.2,
            review_count: 8,
            created_at: '2026-05-30T16:10:00.000Z'
        },
        {
            product_id: 13,
            name: 'Áo hoodie Cozy Oversize',
            description: 'Hoodie nỉ mềm, phom oversize và túi kangaroo rộng. Lý tưởng cho ngày se lạnh hoặc outfit streetwear.',
            price: 599000,
            stock: 22,
            category_id: 2,
            image_url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=80',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=80'
            ]),
            colors: JSON.stringify(['Xám', 'Đen', 'Hồng']),
            sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
            brand: 'Puma',
            is_featured: true,
            is_new: true,
            discount_percent: 10,
            avg_rating: 4.6,
            review_count: 16,
            created_at: '2026-05-27T08:00:00.000Z'
        },
        {
            product_id: 14,
            name: 'Quần kaki Tapered Sand',
            description: 'Quần kaki ống tapered, vải đứng vừa phải và màu trung tính. Dễ phối với sơ mi, áo thun hoặc polo.',
            price: 469000,
            stock: 17,
            category_id: 3,
            image_url: 'https://images.unsplash.com/photo-1506629905607-d1bb30a0c44b?auto=format&fit=crop&w=900&q=80',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1506629905607-d1bb30a0c44b?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=80'
            ]),
            colors: JSON.stringify(['Nâu', 'Đen', 'Xám']),
            sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
            brand: 'Routine',
            is_featured: false,
            is_new: false,
            discount_percent: 6,
            avg_rating: 4.3,
            review_count: 12,
            created_at: '2026-04-20T08:10:00.000Z'
        },
        {
            product_id: 15,
            name: 'Túi tote Canvas Daily',
            description: 'Túi tote canvas dày, quai chịu lực và khoang rộng. Một phụ kiện đơn giản nhưng hữu dụng cho mọi ngày.',
            price: 229000,
            stock: 48,
            category_id: 5,
            image_url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=900&q=80'
            ]),
            colors: JSON.stringify(['Trắng', 'Đen', 'Nâu']),
            sizes: JSON.stringify(['Free size']),
            brand: 'BesBoo',
            is_featured: false,
            is_new: true,
            discount_percent: 0,
            avg_rating: 4.4,
            review_count: 10,
            created_at: '2026-05-25T15:00:00.000Z'
        },
        {
            product_id: 16,
            name: 'Áo sơ mi Linen Breeze',
            description: 'Sơ mi linen pha cotton, thoáng nhẹ và có độ nhăn tự nhiên. Hợp với ngày nóng hoặc phong cách nghỉ dưỡng.',
            price: 429000,
            stock: 21,
            category_id: 1,
            image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80',
                'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80'
            ]),
            colors: JSON.stringify(['Trắng', 'Xanh', 'Nâu']),
            sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
            brand: 'Routine',
            is_featured: true,
            is_new: true,
            discount_percent: 0,
            avg_rating: 4.7,
            review_count: 19,
            created_at: '2026-05-26T07:30:00.000Z'
        }
    ];

    // ── Additional categories ──
    categories.push(
        { category_id: 6, name: 'Áo sơ mi', description: 'Sơ mi công sở và casual', image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80' },
        { category_id: 7, name: 'Đồ thể thao', description: 'Trang phục thể thao năng động', image_url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=900&q=80' },
        { category_id: 8, name: 'Váy & Đầm', description: 'Váy đầm thanh lịch cho mọi dịp', image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80' },
        { category_id: 9, name: 'Sandal & Dép', description: 'Sandal và dép đi hàng ngày', image_url: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=900&q=80' },
        { category_id: 10, name: 'Đồ đông', description: 'Áo len, áo nỉ và đồ mùa đông', image_url: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=900&q=80' }
    );

    // ── Product generator: creates additional products to reach 100+ ──
    const templates = [
        // Áo thun (cat 1)
        { cat: 1, names: ['Áo thun Oversize Cloud', 'Áo thun cổ tròn Daily', 'Áo thun in họa tiết Wave', 'Áo thun cotton Breeze', 'Áo thun raglan Sport', 'Áo thun tie-dye Festival', 'Áo thun henley Classic', 'Áo thun stripe Marine', 'Áo thun pocket Minimal', 'Áo thun v-neck Soft'], brands: ['BesBoo', 'Uniqlo', 'H&M', 'Zara', 'Local Brand'], imgs: ['photo-1521572163474-6864f9cf17ab', 'photo-1523381210434-271e8be1f52b', 'photo-1576566588028-4147f3842f27', 'photo-1583743814966-8936f5b7be1a', 'photo-1562157873-818bc0726f68'] },
        // Áo khoác (cat 2)
        { cat: 2, names: ['Áo khoác gió Ultralight', 'Áo khoác cardigan Knit', 'Áo khoác coach Retro', 'Áo khoác parka Urban', 'Áo khoác varsity College', 'Áo khoác zip-up Track', 'Áo khoác fleece Warm', 'Áo khoác MA-1 Flight'], brands: ['BesBoo', 'Nike', 'The North Face', 'Puma', 'Adidas'], imgs: ['photo-1591047139829-d91aecb6caea', 'photo-1551028719-00167b16eac5', 'photo-1544022613-e87ca75a784a', 'photo-1548126032-079a0fb0099d', 'photo-1559551409-dadc959f76b8'] },
        // Quần (cat 3)
        { cat: 3, names: ['Quần short chino Summer', 'Quần jeans skinny Dark', 'Quần cargo Utility', 'Quần linen Comfort', 'Quần baggy Street', 'Quần nỉ Jogger Pro', 'Quần kaki slim City', 'Quần short thể thao Run'], brands: ['Levi\'s', 'Routine', 'Puma', 'BesBoo', 'Zara'], imgs: ['photo-1542272604-787c3835535d', 'photo-1473966968600-fa801b869a1a', 'photo-1506629905607-d1bb30a0c44b', 'photo-1552374196-1ab2a1c593e8', 'photo-1519238263530-99bdd11df2ea'] },
        // Giày (cat 4)
        { cat: 4, names: ['New Balance 574 Grey', 'Nike Dunk Low Panda', 'Adidas Ultraboost Light', 'Puma RS-X Pop', 'FILA Disruptor White', 'MLB Chunky Liner', 'Converse Run Star Hike', 'New Balance 550 Green'], brands: ['New Balance', 'Nike', 'Adidas', 'Puma', 'FILA', 'MLB', 'Converse'], imgs: ['photo-1549298916-b41d501d3772', 'photo-1542291026-7eec264c27ff', 'photo-1608231387042-66d1773070a5', 'photo-1525966222134-fcfa99b8ae77', 'photo-1607522370275-f14206abe5d3'] },
        // Phụ kiện (cat 5)
        { cat: 5, names: ['Ví da gấp Mini', 'Thắt lưng da Classic', 'Kính mát aviator Ray', 'Đồng hồ dây mesh Titan', 'Vòng tay bead Stone', 'Túi đeo chéo Compact', 'Khăn quàng len Winter', 'Ốp điện thoại Premium'], brands: ['BesBoo', 'Local Brand', 'Routine', 'Zara'], imgs: ['photo-1553062407-98eeb64c6a62', 'photo-1622560480605-d83c853bc5c3', 'photo-1590874103328-eac38a683ce7', 'photo-1591561954557-26941169b49e', 'photo-1521369909029-2afed882baee'] },
        // Áo sơ mi (cat 6)
        { cat: 6, names: ['Sơ mi Oxford Button-down', 'Sơ mi flannel Check', 'Sơ mi Cuban collar Resort', 'Sơ mi oversized Linen', 'Sơ mi denim Wash', 'Sơ mi slim fit Office', 'Sơ mi họa tiết Floral', 'Sơ mi cổ trụ Mandarin'], brands: ['Routine', 'Zara', 'H&M', 'Uniqlo', 'BesBoo'], imgs: ['photo-1596755094514-f87e34085b2c', 'photo-1602810318383-e386cc2a3ccf', 'photo-1598032895455-1cead748d116', 'photo-1589310621855-3f0a6a684e21', 'photo-1604695573706-53170668f6a6'] },
        // Đồ thể thao (cat 7)
        { cat: 7, names: ['Áo tank top Gym Power', 'Quần legging Flex', 'Bộ đồ tập Dri-Fit', 'Áo thun thể thao Dry', 'Short chạy bộ Aero', 'Áo hoodie thể thao Chill', 'Bra thể thao Support', 'Windbreaker Trail'], brands: ['Nike', 'Adidas', 'Puma', 'Under Armour', 'FILA'], imgs: ['photo-1571902943202-507ec2618e8f', 'photo-1518459031867-a89b944bffe4', 'photo-1556906781-9a412961c28c', 'photo-1576633587382-13ddf37b1fc1', 'photo-1517836357463-d25dfeac3438'] },
        // Váy & Đầm (cat 8)
        { cat: 8, names: ['Đầm midi hoa nhí Spring', 'Váy chữ A Basic', 'Đầm maxi bohemian Sun', 'Váy jean ngắn Casual', 'Đầm wrap satin Evening', 'Chân váy pleated Chic', 'Đầm babydoll Sweet', 'Váy bút chì Office Lady'], brands: ['Zara', 'H&M', 'Local Brand', 'BesBoo', 'Uniqlo'], imgs: ['photo-1595777457583-95e059d581b8', 'photo-1585487000160-6ebcfceb0d44', 'photo-1572804013427-4d7ca7268217', 'photo-1583496661160-fb5886a0aaaa', 'photo-1515886657613-9f3515b0c78f'] },
        // Sandal & Dép (cat 9)
        { cat: 9, names: ['Sandal quai ngang Beach', 'Dép lê slide Logo', 'Sandal đế xuồng Summer', 'Dép Birkenstock Arizona', 'Sandal sport Outdoor', 'Dép đi trong nhà Cloud'], brands: ['Nike', 'Adidas', 'Birkenstock', 'BesBoo', 'Vans'], imgs: ['photo-1603487742131-4160ec999306', 'photo-1603487742131-4160ec999306', 'photo-1562273138-f46be4ebdf33', 'photo-1543163521-1bf539c55dd2', 'photo-1575537302964-96cd47c06b1b'] },
        // Đồ đông (cat 10)
        { cat: 10, names: ['Áo len cổ lọ Turtleneck', 'Áo nỉ crewneck Heritage', 'Áo sweater cable knit', 'Áo gilet lông cừu Vest', 'Khăn choàng cashmere Luxe', 'Áo len cardigan Chunky', 'Áo phao nhẹ Puffer', 'Áo len V-neck Classic'], brands: ['Uniqlo', 'The North Face', 'H&M', 'Zara', 'BesBoo'], imgs: ['photo-1576871337632-b9aef4c17ab9', 'photo-1620799140408-edc6dcb6d633', 'photo-1618354691373-d851c5c3a990', 'photo-1544022613-e87ca75a784a', 'photo-1548126032-079a0fb0099d'] }
    ];

    const allColors = ['Đen', 'Trắng', 'Xám', 'Xanh', 'Nâu', 'Đỏ', 'Hồng', 'Vàng', 'Cam', 'Tím'];
    const clothingSizes = ['S', 'M', 'L', 'XL', 'XXL'];
    const shoeSizes = ['38', '39', '40', '41', '42', '43', '44'];
    const freeSize = ['Free size'];

    let nextId = 17;
    const baseDate = new Date('2026-04-01T00:00:00.000Z');

    templates.forEach((tmpl) => {
        const isShoeCat = [4, 9].includes(tmpl.cat);
        const isAccCat = [5].includes(tmpl.cat);
        const sizes = isShoeCat ? shoeSizes : isAccCat ? freeSize : clothingSizes;

        tmpl.names.forEach((name, idx) => {
            const brand = tmpl.brands[idx % tmpl.brands.length];
            const imgKey = tmpl.imgs[idx % tmpl.imgs.length];
            const imgUrl = `https://images.unsplash.com/${imgKey}?auto=format&fit=crop&w=900&q=80`;
            const price = isShoeCat
                ? 800000 + Math.round((idx * 137000) % 2200000 / 1000) * 1000
                : isAccCat
                    ? 100000 + Math.round((idx * 73000) % 800000 / 1000) * 1000
                    : 200000 + Math.round((idx * 97000) % 600000 / 1000) * 1000;
            const discount = [0, 0, 5, 10, 15, 20, 0, 8, 12, 0][idx % 10];
            const rating = (4.0 + (idx * 0.13) % 1).toFixed(1);
            const reviews = 3 + (idx * 7) % 40;
            const stock = 5 + (idx * 11) % 50;
            const dayOffset = (idx * 3) % 60;
            const created = new Date(baseDate.getTime() + dayOffset * 86400000).toISOString();
            const colorSet = allColors.slice(idx % 4, (idx % 4) + 3);

            products.push({
                product_id: nextId++,
                name,
                description: `${name} — thiết kế hiện đại, chất liệu cao cấp từ ${brand}. Phù hợp cho nhiều dịp, dễ phối đồ và thoải mái khi mặc cả ngày.`,
                price,
                stock,
                category_id: tmpl.cat,
                image_url: imgUrl,
                images: JSON.stringify([imgUrl]),
                colors: JSON.stringify(colorSet),
                sizes: JSON.stringify(sizes.slice(0, 3 + idx % 3)),
                brand,
                is_featured: idx % 4 === 0,
                is_new: idx % 3 === 0,
                discount_percent: discount,
                avg_rating: parseFloat(rating),
                review_count: reviews,
                created_at: created
            });
        });
    });

    const reviews = [
        { review_id: 1, username: 'minhtran', full_name: 'Minh Trần', rating: 5, comment: 'Chất liệu đẹp, đóng gói cẩn thận và giao nhanh.', created_at: '2026-05-30T10:15:00.000Z' },
        { review_id: 2, username: 'linhpham', full_name: 'Linh Phạm', rating: 4, comment: 'Form đúng mô tả, màu bên ngoài nhìn rất dễ phối.', created_at: '2026-05-22T14:20:00.000Z' },
        { review_id: 3, username: 'hoangvu', full_name: 'Hoàng Vũ', rating: 5, comment: 'Đặt lần 2 rồi, chất lượng vẫn ổn định. Sẽ ủng hộ tiếp.', created_at: '2026-05-18T09:00:00.000Z' },
        { review_id: 4, username: 'thanhnga', full_name: 'Thanh Nga', rating: 4, comment: 'Giao hàng nhanh, sản phẩm đúng hình. Chỉ hơi rộng 1 chút.', created_at: '2026-05-15T16:30:00.000Z' },
        { review_id: 5, username: 'ducnguyen', full_name: 'Đức Nguyễn', rating: 5, comment: 'Mua tặng bạn, bạn rất thích. Chất vải mềm mịn.', created_at: '2026-05-12T11:00:00.000Z' },
        { review_id: 6, username: 'myle', full_name: 'My Lê', rating: 3, comment: 'Sản phẩm OK, nhưng đường may chưa thật sự đều.', created_at: '2026-05-08T08:45:00.000Z' },
        { review_id: 7, username: 'khanhtran', full_name: 'Khánh Trần', rating: 5, comment: 'Thiết kế tối giản đúng gu, mặc đi làm hay đi chơi đều hợp.', created_at: '2026-05-05T14:15:00.000Z' },
        { review_id: 8, username: 'ngochan', full_name: 'Ngọc Hân', rating: 4, comment: 'Màu đẹp hơn hình, chất co giãn tốt.', created_at: '2026-05-02T10:30:00.000Z' }
    ];

    const promotions = [
        { code: 'BESBOO10', title: 'Giảm 10% cho đơn đầu tiên', description: 'Áp dụng cho đơn hàng từ 500.000đ', discount_percent: 10, icon: 'fas fa-ticket-alt' },
        { code: 'FREESHIP', title: 'Miễn phí vận chuyển', description: 'Miễn phí vận chuyển cho đơn từ 500.000đ', discount_percent: 0, icon: 'fas fa-truck' },
        { code: 'SUMMER25', title: 'Sale hè giảm 25%', description: 'Áp dụng cho đồ hè, đơn từ 300.000đ', discount_percent: 25, icon: 'fas fa-sun' },
        { code: 'NEWMEMBER', title: 'Giảm 50k cho thành viên mới', description: 'Đăng ký tài khoản và nhận ưu đãi ngay', discount_percent: 0, icon: 'fas fa-user-plus' }
    ];

    const parseList = (value) => {
        if (Array.isArray(value)) return value;
        if (!value) return [];
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return String(value).split(',').map((item) => item.trim()).filter(Boolean);
        }
    };

    const categoryById = (id) => categories.find((category) => category.category_id === Number(id));

    const withCategory = (product) => ({
        ...product,
        category_name: product.category_name || categoryById(product.category_id)?.name || 'Sản phẩm'
    });

    const normalize = (text) => String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const getSelectedValues = (value) => String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

    function filterProducts(params = {}) {
        const minPrice = Number(params.minPrice || params.min_price || 0);
        const maxPrice = Number(params.maxPrice || params.max_price || 0);
        const search = normalize(params.search);
        const brands = getSelectedValues(params.brand).map(normalize);
        const colors = getSelectedValues(params.color).map(normalize);
        const sizes = getSelectedValues(params.size).map(normalize);
        const category = params.category;

        return products.map(withCategory).filter((product) => {
            const finalPrice = product.price * (1 - (product.discount_percent || 0) / 100);

            if (category) {
                const categoryText = normalize(category);
                const matchCategory = String(product.category_id) === String(category)
                    || normalize(product.category_name) === categoryText;
                if (!matchCategory) return false;
            }

            if (search) {
                const haystack = normalize(`${product.name} ${product.brand} ${product.category_name} ${product.description}`);
                if (!haystack.includes(search)) return false;
            }

            if (minPrice && finalPrice < minPrice) return false;
            if (maxPrice && finalPrice > maxPrice) return false;
            if (brands.length && !brands.includes(normalize(product.brand))) return false;

            if (colors.length) {
                const productColors = parseList(product.colors).map(normalize);
                if (!colors.some((color) => productColors.includes(color))) return false;
            }

            if (sizes.length) {
                const productSizes = parseList(product.sizes).map(normalize);
                if (!sizes.some((size) => productSizes.includes(size))) return false;
            }

            if ((params.is_featured || params.featured) && !product.is_featured) return false;
            if ((params.is_new || params.new) && !product.is_new) return false;
            if ((params.has_discount || params.discount) && !(product.discount_percent > 0)) return false;

            return product.stock > 0;
        });
    }

    function sortProducts(items, params = {}) {
        const sortBy = params.sortBy || params.sort_by || (params.sort || '').split('-')[0] || 'created_at';
        const sortOrder = (params.sortOrder || params.sort_order || (params.sort || '').split('-')[1] || 'DESC').toUpperCase();
        const direction = sortOrder === 'ASC' ? 1 : -1;

        return [...items].sort((first, second) => {
            if (sortBy === 'price') {
                const firstPrice = first.price * (1 - (first.discount_percent || 0) / 100);
                const secondPrice = second.price * (1 - (second.discount_percent || 0) / 100);
                return (firstPrice - secondPrice) * direction;
            }

            if (sortBy === 'name') {
                return first.name.localeCompare(second.name, 'vi') * direction;
            }

            return (new Date(first.created_at) - new Date(second.created_at)) * direction;
        });
    }

    function getProducts(params = {}) {
        const page = Math.max(1, Number(params.page || 1));
        const limit = Math.max(1, Number(params.limit || 12));
        const sorted = sortProducts(filterProducts(params), params);
        const start = (page - 1) * limit;
        const paged = sorted.slice(start, start + limit);
        const totalPages = Math.max(1, Math.ceil(sorted.length / limit));

        return {
            products: paged,
            pagination: {
                current_page: page,
                total_pages: totalPages,
                total_items: sorted.length,
                items_per_page: limit,
                has_next: page < totalPages,
                has_prev: page > 1
            }
        };
    }

    function getProduct(productId) {
        const product = products.map(withCategory).find((item) => String(item.product_id) === String(productId));
        if (!product) {
            return { success: false, product: null };
        }

        return {
            success: true,
            product: {
                ...product,
                reviews
            }
        };
    }

    function getCategories() {
        return {
            success: true,
            categories: categories.map((category) => ({
                ...category,
                product_count: products.filter((product) => product.category_id === category.category_id && product.stock > 0).length
            }))
        };
    }

    function getFilterOptions() {
        const source = products.map(withCategory);
        const unique = (items) => [...new Set(items.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi'));

        return {
            brands: unique(source.map((product) => product.brand)),
            colors: unique(source.flatMap((product) => parseList(product.colors))),
            sizes: unique(source.flatMap((product) => parseList(product.sizes)))
        };
    }

    function getPromotions() {
        return { promotions };
    }

    window.BesBooData = {
        products: products.map(withCategory),
        categories,
        parseList,
        getProducts,
        getProduct,
        getCategories,
        getFilterOptions,
        getPromotions,
        getFeaturedProducts: () => ({
            products: products.map(withCategory)
                .filter((product) => product.is_featured)
                .sort((first, second) => (second.avg_rating || 0) - (first.avg_rating || 0))
                .slice(0, 8)
        }),
        getNewProducts: () => ({
            products: sortProducts(products.map(withCategory), { sortBy: 'created_at', sortOrder: 'DESC' }).slice(0, 8)
        })
    };
})();
