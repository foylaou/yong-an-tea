// // src/services/productsService.ts
// import { db } from '@/db/client';
// import { products, categories, productAttributes, productsTags, tags } from '@/db/schema';
// import { eq, and ,gt, } from 'drizzle-orm';
//
//
//
// // ✅ Drizzle ORM 常用比較運算符大全
// // 函數	說明	範例用法
// // eq(a, b)	等於（=）	eq(users.id, 1)
// // ne(a, b)	不等於（≠）	ne(users.email, 'admin@test.com')
// // gt(a, b)	大於（>）	gt(products.stock, 0)
// // lt(a, b)	小於（<）	lt(products.price, 100)
// // gte(a, b)	大於等於（≥）	gte(users.id, 10)
// // lte(a, b)	小於等於（≤）	lte(users.createdAt, new Date())
// // isNull(a)	為空（IS NULL）	isNull(products.salePrice)
// // isNotNull(a)	不為空（IS NOT NULL）	isNotNull(users.avatarUrl)
// // inArray(a, [v])	在陣列中（IN (...)）	inArray(users.id, [1, 2, 3])
// // notInArray(a, [v])	不在陣列中（NOT IN (...)）	notInArray(products.categoryId, [5, 6])
// // like(a, b)	模糊比對（LIKE）	like(users.name, '%小明%')
// // ilike(a, b)	不區分大小寫模糊比對（ILIKE）	ilike(users.email, '%@gmail.com')（Postgres）
// // not(a)	否定條件（NOT）	not(eq(users.isAdmin, true))
// // ✅ 邏輯運算函數（用在 where 裡）
// // 函數	說明	範例
// // and(...args)	多個條件 全部成立	and(eq(a, 1), gt(b, 2))
// // or(...args)	多個條件 至少一個成立	or(eq(a, 1), eq(b, 2))
// // not(expr)	否定條件	not(eq(users.isAdmin, true))
//
//
// export const productsService = {
//     /** 新增產品 */
//     async add(data: typeof products.$inferInsert) {
//         return await db.insert(products).values(data).returning();
//     },
//
//     /** 更新產品 */
//     async update(id: number, data: Partial<typeof products.$inferInsert>) {
//         return await db.update(products).set(data).where(eq(products.id, id)).returning();
//     },
//
//     /** 刪除產品 */
//     async remove(id: number) {
//         return await db.delete(products).where(eq(products.id, id)).returning();
//     },
//
//     /** 查詢單一產品（含類別與屬性） */
//     async findById(id: number) {
//         const product = await db.select().from(products).where(eq(products.id, id)).limit(1);
//         // @ts-ignore
//         const category = await db.select().from(categories).where(eq(categories.id, product[0]?.categoryId));
//         const attributes = await db.select().from(productAttributes).where(eq(productAttributes.productId, id));
//         return {
//             ...product[0],
//             category: category[0],
//             attributes,
//         };
//     },
//
//     /** 查詢全部產品 */
//     async list() {
//         return await db.select().from(products);
//     },
//
//     /** 根據類別 ID 查詢產品 */
//     async findByCategoryId(categoryId: number) {
//         return await db.select().from(products).where(eq(products.categoryId, categoryId));
//     },
//
//     /** 查詢產品與其標籤（多對多） */
//     async findWithTags(id: number) {
//         const product = await db.select().from(products).where(eq(products.id, id)).limit(1);
//         const tagRelations = await db.select().from(productsTags).where(eq(productsTags.productId, id));
//         const tagIds = tagRelations.map(r => r.tagId);
//         const tagList = await db.select().from(tags).where(tags.id.in(tagIds));
//         return {
//             ...product[0],
//             tags: tagList
//         };
//     },
//     /** 查詢啟用且庫存大於 0 的產品 */
//     async findActiveInStock() {
//         return db
//             .select()
//             .from(products)
//             .where(
//                 and(
//                     eq(products.isActive, true),
//                     gt(products.stock, 0)
//                 )
//             );
//     }
// };
